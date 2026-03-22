import type { Ref, VNode, StyleValue } from "vue";
import type { VueDraggable } from 'vue-draggable-plus'
import type { ElDialog, ElTable, ElTableColumn, TableColumnCtx, ElCascader, ElDatePicker, ElImage, ElTag
    , FormItemProps, InputProps, InputNumberProps, ISelectProps, CascaderProps, DatePickerProps, ImageProps
 } from "element-plus";

// 移除字段的只读属性
type Mutable<T> = {
    -readonly [P in keyof T]: T[P]
}

// 获取VueDraggable组件的props入参的类型
export interface VueDraggableProps extends  Partial< InstanceType<typeof VueDraggable>['$props'] > {
    // 对VueDraggable的onUpdate进行扩展， 新增参数newList新的list数据
    onUpdateList: (newList: any[], event: any) => void
}

// 获取ElDialog组件的props入参的类型
export type ElDialogProps =  Mutable<InstanceType<typeof ElDialog>['$props']>


// 获取ElDatePicker日期选择器组件的props入参的类型
export type ElDatePickerPropsType = InstanceType<typeof ElDatePicker>['$props']['type']
export const dateTypes = ['year' , 'years' , 'month' , 'months' , 'date' , 'dates' , 'week' , 'datetime']
export const dateRangeTypes = ['yearrange', 'monthrange', 'daterange' , 'datetimerange' ]
// 日期格式化类型
export type dateFormatType = 'YY' | 'YY-MM' | 'YYYY' | 'YYYY-MM' | 'YYYYMM' | 'YYYY-MM-DD' | 'YYYY-MM-DD HH' | 'YYYY-MM-DD HH:mm' | 'YYYY-MM-DD HH:mm:ss' | 'HH' | 'HH:mm' | 'HH:mm:ss' | any
// ElDatePicker日期选择器 Shortcuts 参数
export type ShortcutType = 'currentWeek' | 'currentMonth' | 'currentYear' | 'lastDay_7' | 'lastDay_30' | 'lastDay_60' | 'lastDay_90'
export interface ShortcutsItem {
  type: ShortcutType    // 类型：自定义字段
  text: string          // 展示内容
  value: ()=> Date[]    // 获取时间
}


// ----------   [搜索條件] FilterItem   ----------
// type FilterItemType = ElFormItemProps & ElInputProps & ElInputNumberProps & ElSelectProps & ElCascaderProps & Omit<ElDatePickerProps, "type">
type FilterItemType = Mutable<Partial<FormItemProps>> &  Mutable<Partial<InputProps>> &  Mutable<Partial<InputNumberProps>> &  Mutable<Partial<ISelectProps>>  
& Mutable<Partial<CascaderProps>> & Mutable<Omit<Partial<DatePickerProps>, "type">> 
// ProTable 搜索
export interface FilterItem extends FilterItemType {
    // 类型 element-plus 【select 选择器， cascader 级联选择器， ['date' | 'daterange' | 'datetime' | 'datetimerange'] 日期选择器 】
    type?: 'input' | 'input-number' | 'select' | 'cascader' | ElDatePickerPropsType
    // 显示的标题
    label?: string
    // 字段名 必填
    prop: string | string[]
    // 初始默认值
    value?: ShortcutType| any,
    // 是否展示该搜索条件
    visible?: boolean
    // 【不需要传】仅组件内部使用，valueTooltip为value区Tooltip提示内容 为防止value区 width不够内容展示不全 如日期范围选择器
    valueTooltip?: any
    // 日期格式化
    dateFormat?: dateFormatType
    // 当type = daterange | datetimerange 日期范围选择器， 根据ShortcutType初始化value默认值
    defaultShortcut?: ShortcutType
    // 当type = select | cascader 选择器时 下拉框的选项（枚举项）
    enumItems?: EnumItem[]
    // 当type = select 远程调用接口获取下拉框的选项（枚举项），适用于后端枚举项来源于数据库 数据量过大需要搜索词过滤匹配场景（如下拉框选择用户表信息）
    getSelectEnumItems?: (searchKey: string) => EnumItem[] | Promise<EnumItem[]>
    // 搜索条件插槽名称
    slot?: string
}





// 获取ElTag组件的props入参的类型
export type ElTagProps = InstanceType<typeof ElTag>['$props']
export type TagTypes = 'primary' | 'success' | 'info' | 'warning' | 'danger'
// tag映射器 key:值 val:使用什么类型tag展示
export type TagMapType = {
    [key:string]: TagTypes, // 该值对应的tag类型
    [key:number]: TagTypes, // 该值对应的tag类型
    true?: TagTypes         // 值为false的tag类型
    false?: TagTypes        // 值为false的tag类型
}

// 枚举下拉框/列表选项类型 枚举值
export type EnumItem = {
    value?: any         // 数据值
    label?: any         // 展示内容
    tagType?: TagTypes // 列表中枚举对应tag
    // 扩展
    [key:string]: any
}

// 获取字段值函数
export type getFieldValueFn = (row: any) => any

/**
 * 获取字段值
 * @param row 寒行数据
 * @param fieldSource 
 */
export const getFieldValue = (row: any, fieldSource: string | getFieldValueFn) => {
    if (fieldSource) {
        if(typeof fieldSource === 'string') {
            return row[fieldSource]
        } else if(typeof fieldSource === 'function') {
            return fieldSource(row)
        }
    }
}


// 获取ElTableColumn组件的props入参的类型
export type ElTableColumnProps = InstanceType<typeof ElTableColumn>['$props']
// ElTableColumn.type原生类型
export const ElTableColumnTypes: string[] = ['index', 'selection', 'expand']


// ----------   [列表字段] TableColumn   ----------
// TableColumn组件props继承ElTableColumnProps对其进行扩展
type TableColumnItemType = any & ElTableColumnProps & Omit<ElTagProps, "type"> & Mutable<Partial<ImageProps>>
export interface TableColumnItem extends TableColumnItemType {
    // 对应列的类型 来源 ElTableColumn.type， 可在 element-plus 基础上进行扩展， 在table-column 中判断type
    // element-plus【index 展示当行索引， selection 展示多选框 ， expand 展开按钮】, drag 拖拽按钮，image el-image图片预览
    type?: 'index' | 'selection' | 'expand' | 'drag' | 'image'
    // 显示的标题 来源 ElTableColumn.label
    label?: string
    // 标题 的[el-tooltip]组件弹框提示
    labelTooltip?: string
    // 数据来源 来源 ElTableColumn.prop 字段名， 在原基础上继续扩展 获取字段值函数
    prop?: string | getFieldValueFn
    // 是否展示该字段
    visible?: boolean
    // 对齐方式 来源 ElTableColumn.align
    align?: 'left' | 'center' | 'right'
    // 固定左侧右侧
    fixed?: 'left' | 'right' | true | false
    // 单元格渲染函数 来源 ElTableColumn.formatter , 返回VNode
    render?: (row: any, column: TableColumnCtx<any>, cellValue: any, index: number) => VNode | any
    // 表头渲染函数 来源 ElTableColumn.renderHeader , 返回VNode
    renderHeader?: (data: { column: TableColumnCtx<any>, $index: number }) => VNode | any
    // 单元格插槽名称
    slot?: string
    // 表头插槽名称
    slotHeader?: string
    // 日期格式化
    dateFormat?: dateFormatType
    // 枚举值转换
    enumItems?: EnumItem[]
    // 使用element-plus tag 对应原值进行展示
    tagTypeMap?: TagMapType
    // 当type=image图片类型时 图片预览链接list的 字段名 | 获取方法 ， 对应 ElImage.preview-src-list
    srcList?: string | getFieldValueFn
    // 点击
    clickProps?: {
        // 是否可点击 默认是
        clickable?: (row) => boolean
        // 点击事件 row:行数据 event:点击Dom event
        onclick: (row, event) => any
        // 可点击时候的样式
        style?: StyleValue
    }
    // 子集用于多级表头树形结构
    children?: TableColumnItem[]
    // 扩展
    // [key:string]: any
}


// 获取ElTable组件的props入参的类型
export type ElTableProps = InstanceType<typeof ElTable>['$props']
// Table组件props继承ElTableProps对其进行扩展
export interface TableProps extends /* @vue-ignore */ ElTableProps {
    // 列表字段
    columns?: TableColumnItem[]
    // 是否开启列表字段设置工具
    tableCustom?: boolean
    // 列表数据
    data?: any[]
    // vue-draggable-plus 组件参数与配置
    drag?: VueDraggableProps
}



// ----------   [分页设置] 分页配置pagination   ----------
// 分页请求 [第几页]参数key   前后端保持一致
export const PAGE_REQUEST_NUM_KEY = 'pageNum'
// 分页请求 [分页大小]参数key 前后端保持一致
export const PAGE_REQUEST_SIZE_KEY = 'pageSize'
// 分页请求 [列表数据]参数key 前后端保持一致
export const PAGE_RESPONSE_DATA_KEY = 'root'
// 分页请求 [多少行]参数key   前后端保持一致
export const PAGE_RESPONSE_TOTAL_KEY = 'totalRows'

// 分页参数类型（前端内部用）
export type PageParam = {
  pageNum: number     // 第几页
  pageSize: number    // 每页size
}


// 分页响应体
export type  PageResponse<T = any> = {
  [PAGE_RESPONSE_DATA_KEY]: T[]      // 分页列表数据
  [PAGE_RESPONSE_TOTAL_KEY]: number  // 总行数
}


// ----------   [全局配置] 自定义配置ProTableGlobalConfig   ----------
export type ProTableGlobalConfig = {
  // [ProTable] 高度是否自适应 
  // false-高度随数量内容增多而变高 表格内部无滚动条  
  // true-默认继续用视口可用高度，若检测到外层存在可计算高度边界，则取 min(视口可用, 外层可用)  --作用: 数据多时滚动条在表格body内部 滚动数据时候表头位置固定方便查看
  proTableAutoMaxHeight?: boolean
  // [ProTable] Table/Page等[大小尺寸]
  proTableSize?: 'large' | 'default' | 'small'
  // [Filter] Filter是否默认展开展示所有搜索条件 默认值
  filterIsShowAll?: boolean
  // [Filter] Filter默认展示行数 默认值
  filterShowRow?: number
  // [Table] Table是否[纵向边框]
  tableIsBorder?: boolean
  // [Table] Table是否[斑马纹]
  tableIsStripe?: boolean
  // [Page] Page分页默认大小
  pageDefaultSize?: number
  // [Page] Page分页elementPlus 每页显示个数选择器的选项设置
  pageSizes?: number[]
}

// ProTableGlobalConfig 默认值
export const DEFAULT_PRO_TABLE_GLOBAL_CONFIG: ProTableGlobalConfig = {
  proTableAutoMaxHeight: true,
  proTableSize: 'default',
  filterIsShowAll: false,
  filterShowRow: 1,
  tableIsBorder: true,
  tableIsStripe: true,
  pageDefaultSize: 10,
  pageSizes:  [10, 20, 30, 50, 100, 150, 200, 300]
}
