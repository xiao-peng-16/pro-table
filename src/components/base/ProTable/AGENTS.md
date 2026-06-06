# AGENTS.md

## 作用范围

- 适用于 `src/components/base/ProTable/` 及其所有子目录。
- 先遵守仓库上层指令，再遵守本文件。以后如果子目录新增更深层的 `AGENTS.md`，子目录文件优先。
- 这里是可复用的 Vue 3 + TypeScript 表格组件体系。除非用户明确要求大范围重构，否则改动应限制在组件边界内。

## 组件定位

- `ProTable` 组合了搜索筛选、Element Plus 表格渲染、分页、全屏、本地自定义视图和用户偏好持久化。
- 把 `ProTable` 当作公共基础组件处理。很小的行为变化也可能影响多个业务页面。
- 除非任务明确要求破坏性 API 变更，否则保持 `FilterItem`、`TableColumnItem`、`ProTableGlobalConfig`、分页常量、插槽、事件和暴露方法的对外形态稳定。

## 目录结构

- `index.ts`：公共出口文件。新增公开类型、常量、工具或子组件时，要同步从这里导出。
- `types/index.ts`：筛选项、表格列、分页、全局配置和拖拽配置的共享类型与常量。
- `src/ProTable.vue`：顶层编排组件，负责 Filter、Table、Pagination、全屏、数据查询和自定义配置联动。
- `components/Filter/`：可独立使用的筛选表单，也可被 `ProTable` 内部托管。
- `components/Table/`：Element Plus 表格封装，负责列渲染、图片/tag/日期处理、行拖拽排序和 `ElTable` 方法暴露。
- `components/Pagination/`：分页状态和查询事件封装。
- `components/CustomView/`：全局配置、筛选配置、表格列配置和 localStorage 持久化相关弹窗与工具。
- `utils/`：插槽收集、列表递归、日期快捷项、Element Plus 表格方法桥接和树形拖拽工具。
- `style/` 及各子组件下的 `style/`：仅服务本组件体系的 SCSS。

## 公共 API 规则

- 新增或修改 props、events、types 时，先更新 `types/index.ts`，再更新消费这些类型的 Vue 组件。
- 新增公开能力时，保持 `index.ts` 导出同步。
- `ProTable.vue` 暴露 `getQueryParam`、`filterQuery`、`refreshData`、Element Plus table 方法和 `getSelectionRowIds`。这些 ref 方法名要保持稳定。
- `Filter.vue` 暴露 `getQueryParam`、`onUpdateCustomGlobal` 和 `onUpdateCustomFilter`。
- `Table.vue` 暴露 Element Plus table 方法和 `getTableRootEl`；`ProTable.vue` 的高度计算依赖这个 DOM 入口。
- 优先做兼容性新增。若必须做破坏性变更，要在变更说明里写清楚迁移影响。

## 数据流

- `ProTable.vue` 持有查询状态：
  - `filterParam` 来自 `Filter.getQueryParam()`。
  - `pageParam` 来自 `Pagination`。
  - 请求调用 `props.getTableData({ ...filterParam, pageNum, pageSize })`。
  - 返回数组时隐藏分页；返回分页对象时读取 `PAGE_RESPONSE_DATA_KEY` 和 `PAGE_RESPONSE_TOTAL_KEY`。
- 保留异步查询的 `latestQueryToken` 防护，避免旧请求响应覆盖新请求结果。
- 筛选查询要先重置分页，再发起数据查询。
- 分页变化时，使用当前筛选条件重新查询。
- 刷新数据时，如果存在分页组件，走 `Pagination.queryPage()`；否则直接调用 `queryData()`。

### 分页字段常量

- 以下常量定义在 `types/index.ts`，是 `ProTable` 与后端分页接口保持一致的字段协议：
  - `PAGE_REQUEST_NUM_KEY = 'pageNum'`：分页请求中的当前页字段。
  - `PAGE_REQUEST_SIZE_KEY = 'pageSize'`：分页请求中的每页数量字段。
  - `PAGE_RESPONSE_DATA_KEY = 'root'`：分页响应中的列表数据字段。
  - `PAGE_RESPONSE_TOTAL_KEY = 'totalRows'`：分页响应中的总行数字段。
- 不要单方面修改这些值。若后端分页协议调整，要同步更新常量、`ProTable.vue` 查询解析逻辑、相关接口调用和迁移说明。

## 自定义配置与持久化

- 全局配置优先级是：显式 `props.config` > localStorage 保存配置 > `DEFAULT_PRO_TABLE_GLOBAL_CONFIG`。
- 表格列配置持久化逻辑在 `components/CustomView/utils/useTableColumnConfig.ts`。
- 筛选项配置持久化逻辑在 `components/CustomView/utils/useFilterColumnConfig.ts`。
- 全局配置持久化逻辑在 `components/CustomView/utils/useGlobalConfig.ts`。
- 存储隔离标识优先使用 `customId`，没有时回退到 `route.path`。保持这个规则，避免不同页面之间污染用户保存的配置。
- 表格列持久化只保存顺序、`fixed` 和 `visible`，并在应用缓存前校验版本和 schema。不要为了省事绕过这些校验。
- `index`、`selection`、`expand` 等锁定列类型默认不应变成用户可排序列，除非有明确产品决策。

## Filter 规则

- 普通筛选项的 `FilterItem.field` 可以是字符串。
- 日期范围筛选项的 `field` 必须是两个字符串组成的数组；非范围筛选项不要使用数组字段。
- `Filter.vue` 同时支持受控和非受控表单状态。不要直接修改 `props.modelValue`，应通过 `update:modelValue` 通知外部。
- 远程 select 要兼容同步返回和 Promise 返回的 `getSelectOptions`。
- 筛选项布局依赖 `ResizeObserver` 和 SCSS 变量。修改筛选项间距或最小宽度时，要同步调整 TS 常量和 SCSS。

### 日期范围筛选

- `dateRangeTypes` 定义在 `types/index.ts`，当前包含 `yearrange`、`monthrange`、`daterange`、`datetimerange`。
- 只要 `FilterItem.type` 属于 `dateRangeTypes`，`FilterItem.field` 就必须是 `[startField, endField]` 两个字段，用于把一个日期范围拆成开始值和结束值传给接口。
- 非日期范围类型不要使用数组形式的 `field`，否则会破坏 `Filter.vue` 的校验和 `getFilterParam` 的参数生成逻辑。
- 日期范围类型会走 `daterangeHandle`，默认补充 `defaultTime` 和 `shortcuts`。修改范围类型时，要同步检查 `dateRangeTypes`、`Filter.vue` 的校验逻辑、`getDateFormatByType`、`getFilterParam` 和日期快捷项。
- 日期范围相关能力应保持兼容，尤其是：
  - `defaultShortcut`：日期范围默认快捷值，常用于当前周、当前月、最近 N 天等初始化场景。
  - `dateFormat`：日期值格式化规则，影响筛选参数生成和日期展示格式。
  - `valueTooltip`：内部 tooltip 提示内容，用于范围值较长时展示完整日期范围，通常不需要业务侧手动设置。
- 修改这些能力时，要避免影响已有搜索表单的默认值、查询参数、展示格式和 tooltip。

## options 枚举配置

- `options` 的元素类型是 `EnumItem`，常用字段包括 `value`、`label` 和 `tagType`。
- 在 `FilterItem` 中，`options` 用于 `select` 和 `cascader` 的可选项数据；如果 `select` 需要远程搜索，优先使用 `getSelectOptions`，不要把远程加载逻辑散落到业务插槽里。
- 在 `TableColumnItem` 中，`options` 用于把行数据原始值映射成展示文案；当 `EnumItem.tagType` 存在时，表格会按对应类型渲染 `el-tag`。
- `value` 比对会按字符串兼容不同后端返回类型。修改枚举匹配逻辑时，要注意数字、字符串、布尔值等历史数据兼容。
- `tagTypeMap` 的优先级高于 `options[].tagType`，用于按原始值定制表格 tag 类型。改动 tag 逻辑时要同时验证这两条路径。

## Table 规则

- `Table.vue` 会克隆外部传入的列配置后再注入 render 函数。不要直接修改 `props.columns`。
- `TableColumnItem.field` 可以是字符串，也可以是取值函数。字段取值统一走 `getFieldValue`。
- `type: 'image'` 使用 Element Plus 图片预览，并保持 preview teleport，避免被容器裁剪。
- `tagTypeMap`、`options[].tagType`、`dateFormat`、`render`、`renderHeader`、`slot`、`slotHeader` 都是受支持的渲染路径，修改时不要让它们互相失效。
- 多级表头依赖递归列遍历。改动列解析或插槽收集时，要验证带 `children` 的嵌套列场景。

## 拖拽排序

- 只要处理后的列中存在 `type: 'drag'`，就会启用行拖拽。
- `Table.vue` 只在拖拽模式下使用 `VueDraggable` 包裹 `el-table`。
- 拖拽数据通过 `useTableDrag` 扁平化，保证树形数据行能正确映射到 Element Plus table 的 DOM 行。
- 拖拽更新语义是“移动并插入”，不是交换位置。保持 `emit('update:data', dataList.value)` 以及可选的 `drag.onUpdateList` / `drag.onUpdate` 回调可用。
- 拖拽手柄 class 必须和 `DragBtn.vue`、`tableWrapperProps.handle` 保持一致。

## 插槽

- Filter 插槽来自 `FilterItem.slot`。
- Table 单元格和表头插槽来自 `TableColumnItem.slot` 和 `TableColumnItem.slotHeader`。
- `ProTable.vue` 会把筛选、表格列和表头插槽继续透传给子组件和 `CustomView`。
- `utils/solt.ts` 是现有文件名。不要随意重命名，除非同步处理所有 import 和兼容影响。
- 谨慎修改 `utils/solt.ts` 中的保留插槽名，变更可能破坏已有页面插槽。

## 布局与全屏

- 全屏同时使用组件状态和浏览器 fullscreen API，并把表格容器 teleport 到 `body`。
- 保留 `fullscreenchange`、`ResizeObserver`、`window.resize` 和 `pro-table-fullscreen-lock` 的清理逻辑。
- 表格高度计算依赖 `getTableRootEl`、`tableContainerRef`、`tableBottomContentRef`、视口高度和受限父容器检测。
- 修改高度逻辑时，要验证普通模式、受限容器模式、全屏模式，以及有分页和无分页的页面。
- 触发 `doLayout()` 前应等待 Vue DOM 更新和下一帧，减少宽高计算时机不稳定的问题。

## 样式

- 保持 ProTable 样式限定在本组件体系内，沿用现有 BEM 风格 class。
- 子组件样式优先放在对应子组件的 `style/index.scss`，确实共享时才放到上层样式。
- 不要新增宽泛的全局样式，除非是明确需要的全屏 body 锁定。
- 保持与 Element Plus 的集成细节，包括表格尺寸、边框、斑马纹、分页布局和图片预览行为。

## 编辑约定

- 从 `src` 导入时使用 `@` 别名。
- 优先复用 `types/`、`utils/` 和 `components/CustomView/utils/` 中已有 helper，不要重复造逻辑。
- 注释要短且有用。本目录现有注释以中文为主，新增注释也可以使用中文。
- 除非任务明确要求格式化，不要进行大范围纯格式化改动。
- 新增功能如果跨越多个边界，要同步更新类型、运行时处理、插槽透传、持久化规则和样式。
