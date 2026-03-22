import { cloneDeep } from 'lodash'
import type { TableColumnItem } from '@/components/base/ProTable'
import { setLocal, getLocal, removeLocal } from '@/components/base/ProTable/components/CustomView/utils/local'

// ========================= 列配置持久化基础常量 =========================
// localStorage 前缀：用于隔离 ProTable 的列配置缓存命名空间。
const TABLE_ORDER_STORAGE_PREFIX = 'table-custom-column-order'
// 缓存版本号：当缓存结构升级时，通过版本号触发自动失效。
// v2: 列唯一键改为“prop 优先”，降低仅文案变更带来的缓存失效概率。
const TABLE_ORDER_STORAGE_VERSION = 2
// 根层级路径标识：用于多级表头递归分组时标记根节点。
const TABLE_ORDER_ROOT_PATH = '__root__'

// 表格中不允许用户自定义排序/固定的功能列类型。
export const TABLE_CUSTOM_LOCK_TYPES: string[] = ['index', 'selection', 'expand']

// 每一层列分组里的最小持久化快照。
// 只记录恢复顺序必须的信息：唯一 key + fixed + visible。
type TableOrderEntry = {
  key: string
  fixed: TableColumnItem['fixed'] | null
  visible: boolean | null
}

// 持久化配置结构：
// - version: 缓存版本
// - schemaSignature: 当前前端列结构签名
// - orderGroups: 分层顺序快照（支持多级表头）
type TableOrderConfig = {
  version: number
  schemaSignature: string
  orderGroups: Record<string, TableOrderEntry[]>
}

// 读取缓存时允许更宽松的“历史/脏数据”形态，再归一化到 TableOrderConfig。
type TableOrderEntryLike = {
  key: string
  fixed?: TableColumnItem['fixed'] | null
  visible?: boolean | null
}

// 宽松配置模型：用于承接历史缓存/人工改写缓存（字段允许缺省）。
type TableOrderConfigLike = {
  version: number
  schemaSignature: string
  orderGroups: Record<string, TableOrderEntryLike[]>
}

// 本地缓存加载失败原因（仅开发环境日志使用）。
type TableOrderLoadFailReason =
  | 'malformed_payload'
  | 'version_mismatch'
  | 'schema_mismatch'
  | 'invalid_groups'
  | 'unexpected_error'

const TABLE_ORDER_LOG_PREFIX = '[ProTable][表格列配置]'

// 失败原因文案映射：统一日志语义，避免在调用点散落硬编码文案。
const TABLE_ORDER_REASON_TEXT: Record<TableOrderLoadFailReason, string> = {
  malformed_payload: '缓存内容异常，已回退默认配置',
  version_mismatch: '缓存版本已过期，已回退默认配置',
  schema_mismatch: '字段配置已变更，已回退默认配置',
  invalid_groups: '缓存校验未通过，已回退默认配置',
  unexpected_error: '加载配置时发生异常，已回退默认配置',
}

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

// 运行时校验 fixed 可接受值（宽松模式允许缺省，后续归一化补 null）。
const isTableOrderEntryFixed = (value: unknown): value is TableOrderEntryLike['fixed'] => {
  return (
    value === undefined ||
    value === null ||
    value === true ||
    value === false ||
    value === 'left' ||
    value === 'right'
  )
}

// 运行时校验单条列缓存项（宽松模式）。
const isTableOrderEntryLike = (value: unknown): value is TableOrderEntryLike => {
  if (!isPlainObject(value)) {
    return false
  }
  if (typeof value.key !== 'string') {
    return false
  }
  if (!isTableOrderEntryFixed(value.fixed)) {
    return false
  }
  return value.visible === undefined || value.visible === null || typeof value.visible === 'boolean'
}

// 运行时校验分组结构：每个分组都应是条目数组。
const isTableOrderGroupsLike = (value: unknown): value is Record<string, TableOrderEntryLike[]> => {
  if (!isPlainObject(value)) {
    return false
  }
  return Object.values(value).every((group) => {
    return Array.isArray(group) && group.every(isTableOrderEntryLike)
  })
}

// 运行时校验缓存主结构（宽松模式）：仅校验恢复流程必需字段与类型。
const isTableOrderConfigLike = (value: unknown): value is TableOrderConfigLike => {
  if (!isPlainObject(value)) {
    return false
  }
  if (typeof value.version !== 'number') {
    return false
  }
  if (typeof value.schemaSignature !== 'string') {
    return false
  }
  return isTableOrderGroupsLike(value.orderGroups)
}

// 归一化缓存模型：把可选字段收敛为严格模型，减少下游判空分支。
const toTableOrderConfig = (value: TableOrderConfigLike): TableOrderConfig => {
  const normalizedGroups: Record<string, TableOrderEntry[]> = {}
  Object.keys(value.orderGroups).forEach((groupPath) => {
    normalizedGroups[groupPath] = value.orderGroups[groupPath].map((entry) => ({
      key: entry.key,
      fixed: entry.fixed ?? null,
      visible: entry.visible ?? null,
    }))
  })

  return {
    version: value.version,
    schemaSignature: value.schemaSignature,
    orderGroups: normalizedGroups,
  }
}

// 开发环境诊断日志：线上不打印，避免污染生产控制台。
const logTableOrderLoadFailure = (
  reason: TableOrderLoadFailReason,
  storageId: string,
  detail?: string
): void => {
  if (!import.meta.env.DEV) {
    return
  }
  const suffix = detail ? `，详情：${detail}` : ''
  console.warn(
    `${TABLE_ORDER_LOG_PREFIX} 加载失败：${TABLE_ORDER_REASON_TEXT[reason]}，存储键：${getTableOrderStorageKey(storageId)}${suffix}`
  )
}

// 将 undefined 统一转为 null，保证序列化稳定（JSON 中能明确表达“无值”）。
const normalizeFixed = (fixed: TableColumnItem['fixed'] | undefined): TableColumnItem['fixed'] | null => {
  if (fixed === undefined) {
    return null
  }
  return fixed
}

// 将 undefined 统一转为 null，保证序列化稳定（JSON 中能明确表达“无值”）。
const normalizeVisible = (visible: boolean | undefined): boolean | null => {
  if (visible === undefined) {
    return null
  }
  return visible
}

// 列唯一键策略：prop(字符串) -> label -> slot -> type。
const getColumnKey = (item: TableColumnItem): string => {
  const propKey = typeof item.prop === 'string' ? item.prop : undefined
  return String(propKey ?? item.label ?? item.slot ?? item.type ?? '')
}

// 构建“结构树”用于生成 schema 签名：
// - 仅保留结构相关字段；
// - 不包含顺序/fixed/visible 等可变内容；
// - 对同层按 key 排序，避免用户排序影响结构签名。
const buildSchemaTree = (list: TableColumnItem[]): Array<Record<string, unknown>> => {
  const sortedList = [...list].sort((a, b) => getColumnKey(a).localeCompare(getColumnKey(b)))
  return sortedList.map((item) => ({
    key: getColumnKey(item),
    prop: item.prop ?? null,
    label: item.label ?? null,
    type: item.type ?? null,
    slot: item.slot ?? null,
    children: item.children ? buildSchemaTree(item.children as TableColumnItem[]) : []
  }))
}

// 将结构树序列化为签名字符串，用于判断缓存是否可复用。
const buildSchemaSignature = (list: TableColumnItem[]): string => {
  return JSON.stringify(buildSchemaTree(list))
}

// 递归构建分层顺序快照：
// key 为父路径，value 为该层级的列顺序与可恢复字段快照。
const buildOrderGroups = (
  list: TableColumnItem[],
  parentPath = TABLE_ORDER_ROOT_PATH,
  groups: Record<string, TableOrderEntry[]> = {}
): Record<string, TableOrderEntry[]> => {
  groups[parentPath] = list.map((item) => ({
    key: getColumnKey(item),
    fixed: normalizeFixed(item.fixed),
    visible: normalizeVisible(item.visible),
  }))

  list.forEach((item) => {
    const children = item.children as TableColumnItem[] | undefined
    if (!children || !children.length) {
      return
    }
    const childPath = `${parentPath}/${getColumnKey(item)}`
    buildOrderGroups(children, childPath, groups)
  })

  return groups
}

// 判定同层 key 是否重复，重复会导致恢复映射不唯一。
const hasDuplicateKeys = (keys: string[]): boolean => {
  return new Set(keys).size !== keys.length
}

// 校验当前列分组与缓存分组是否可安全匹配：
// 1) 层级路径集合一致；
// 2) 每层数量一致；
// 3) 每层 key 集合一致且无重复。
const validateOrderGroups = (
  currentGroups: Record<string, TableOrderEntry[]>,
  savedGroups: Record<string, TableOrderEntry[]>
): boolean => {
  const currentPaths = Object.keys(currentGroups).sort()
  const savedPaths = Object.keys(savedGroups).sort()

  if (currentPaths.length !== savedPaths.length) {
    return false
  }
  for (let i = 0; i < currentPaths.length; i++) {
    if (currentPaths[i] !== savedPaths[i]) {
      return false
    }
  }

  for (const path of currentPaths) {
    const currentEntries = currentGroups[path] || []
    const savedEntries = savedGroups[path] || []

    if (currentEntries.length !== savedEntries.length) {
      return false
    }

    const currentKeys = currentEntries.map((entry) => entry.key)
    const savedKeys = savedEntries.map((entry) => entry.key)
    if (hasDuplicateKeys(currentKeys) || hasDuplicateKeys(savedKeys)) {
      return false
    }

    const currentMap = new Map<string, TableOrderEntry>()
    currentEntries.forEach((entry) => {
      currentMap.set(entry.key, entry)
    })

    for (const entry of savedEntries) {
      if (!currentMap.has(entry.key)) {
        return false
      }
    }
  }

  return true
}

// 按缓存快照恢复列顺序与字段：
// - 仅覆盖允许恢复字段（fixed、visible）；
// - 其余字段始终以代码里 sourceColumns 为准；
// - 递归处理 children，支持多级表头逐层恢复。
const applyOrderGroups = (
  list: TableColumnItem[],
  savedGroups: Record<string, TableOrderEntry[]>,
  parentPath = TABLE_ORDER_ROOT_PATH
): TableColumnItem[] => {
  const savedEntries = savedGroups[parentPath] || []
  const itemMap = new Map<string, TableColumnItem>()
  list.forEach((item) => {
    itemMap.set(getColumnKey(item), item)
  })

  const reordered = savedEntries
    .map((entry) => {
      const item = itemMap.get(entry.key)
      if (!item) {
        return undefined
      }
      item.fixed = entry.fixed == null ? undefined : entry.fixed
      item.visible = entry.visible == null ? undefined : entry.visible
      return item
    })
    .filter(Boolean) as TableColumnItem[]

  reordered.forEach((item) => {
    const children = item.children as TableColumnItem[] | undefined
    if (!children || !children.length) {
      return
    }
    const childPath = `${parentPath}/${getColumnKey(item)}`
    item.children = applyOrderGroups(children, savedGroups, childPath)
  })

  return reordered
}

// 拆分锁定列和可配置列：
// 锁定列始终保持框架默认行为，不参与用户配置持久化。
export const splitTableColumnsByLock = (
  sourceColumns: TableColumnItem[] = [],
  lockTypes: string[] = TABLE_CUSTOM_LOCK_TYPES
): { lockColumns: TableColumnItem[]; customColumns: TableColumnItem[] } => {
  const lockColumns: TableColumnItem[] = []
  const customColumns: TableColumnItem[] = []
  sourceColumns.forEach((item) => {
    if (lockTypes.includes(item.type as string)) {
      lockColumns.push(item)
    } else {
      customColumns.push(item)
    }
  })
  return {
    lockColumns,
    customColumns
  }
}

// 合并列：固定保持“锁定列在前 + 可配置列在后”。
export const mergeTableColumns = (
  lockColumns: TableColumnItem[] = [],
  customColumns: TableColumnItem[] = []
): TableColumnItem[] => {
  return [...lockColumns, ...customColumns]
}

// 统一生成 storageId：customId 优先，未传时回退 routePath。
// 保持该函数为纯函数，避免在工具层直接依赖 vue-router。
export const buildTableStorageId = (customId?: string, routePath?: string): string => {
  return String(customId || routePath || '')
}

// 计算当前表格实例对应的 localStorage key。
export const getTableOrderStorageKey = (storageId: string): string => {
  return `${TABLE_ORDER_STORAGE_PREFIX}:${storageId}`
}

// 清空当前表格实例对应的列配置缓存。
export const clearTableOrderConfig = (storageId: string): void => {
  removeLocal(getTableOrderStorageKey(storageId))
}

// 保存列配置：只保存“顺序 + fixed + visible”最小快照。
export const saveTableOrderConfig = (storageId: string, columns: TableColumnItem[]): void => {
  if (!storageId) {
    return
  }
  const payload: TableOrderConfig = {
    version: TABLE_ORDER_STORAGE_VERSION,
    schemaSignature: buildSchemaSignature(columns),
    orderGroups: buildOrderGroups(columns)
  }
  setLocal(getTableOrderStorageKey(storageId), payload)
}

// 读取并恢复列配置：
// - 先做版本和结构校验；
// - 再校验分层路径和 key 集合；
// - 任何异常都按失效处理并回退默认。
export const loadTableOrderConfig = (storageId: string, columns: TableColumnItem[]): TableColumnItem[] | null => {
  if (!storageId) {
    return null
  }

  // Step1: 读取原始缓存，null/undefined 视为未命中。
  const rawConfig = getLocal(getTableOrderStorageKey(storageId)) as unknown
  if (rawConfig == null) {
    return null
  }

  // Step2: 结构不合法直接判定脏缓存并清理。
  if (!isTableOrderConfigLike(rawConfig)) {
    logTableOrderLoadFailure('malformed_payload', storageId, `原始值类型=${typeof rawConfig}`)
    clearTableOrderConfig(storageId)
    return null
  }

  // Step3: 归一化为严格模型，后续逻辑按统一结构处理。
  const config = toTableOrderConfig(rawConfig)

  try {
    // 版本变化：缓存结构可能不兼容，直接失效。
    if (config.version !== TABLE_ORDER_STORAGE_VERSION) {
      logTableOrderLoadFailure('version_mismatch', storageId, `缓存版本=${String(config.version)}`)
      clearTableOrderConfig(storageId)
      return null
    }

    // 结构签名变化：列定义已变化，旧缓存不可直接套用。
    // 主动清理旧缓存，避免后续重复命中过期配置。
    if (config.schemaSignature !== buildSchemaSignature(columns)) {
      logTableOrderLoadFailure('schema_mismatch', storageId)
      clearTableOrderConfig(storageId)
      return null
    }

    // 分层路径或 key 集合不一致，判定为脏缓存。
    const currentGroups = buildOrderGroups(columns)
    if (!validateOrderGroups(currentGroups, config.orderGroups)) {
      logTableOrderLoadFailure(
        'invalid_groups',
        storageId,
        `缓存分组数=${Object.keys(config.orderGroups).length}，当前分组数=${Object.keys(currentGroups).length}`
      )
      clearTableOrderConfig(storageId)
      return null
    }

    // 校验通过后，按缓存快照恢复顺序和可覆盖字段。
    return applyOrderGroups(columns, config.orderGroups)
  } catch (error) {
    const errorDetail = error instanceof Error ? error.message : String(error)
    logTableOrderLoadFailure('unexpected_error', storageId, errorDetail)
    // 任意异常都不影响页面渲染，兜底回退默认并清理缓存。
    clearTableOrderConfig(storageId)
    return null
  }
}

// 统一解析入口：
// 1) 以最新 sourceColumns 为基准；
// 2) 拆分锁定列和可配置列；
// 3) 按需恢复本地缓存；
// 4) 产出可直接渲染的 mergedColumns。
export const resolveTableColumns = (
  sourceColumns: TableColumnItem[] = [],
  options?: {
    // 当前表格实例的缓存标识；有值时才会尝试读写 localStorage。
    // 建议使用 buildTableStorageId(customId, routePath) 统一生成。
    storageId?: string
    // 锁定列类型白名单（默认 index/selection/expand）。
    // 命中该列表的列不参与用户排序/固定/显示配置恢复。
    lockTypes?: string[]
    // true(默认): 尝试恢复本地缓存；false: 忽略缓存，强制以代码列定义为准。
    // 典型场景：重置配置后需要立即回到默认列，避免再次读到旧缓存。
    usePersisted?: boolean
  }
): { lockColumns: TableColumnItem[]; customColumns: TableColumnItem[]; mergedColumns: TableColumnItem[] } => {
  // 第一步：按 lockTypes 拆分列。
  // - lockColumns: 功能型锁定列（如 index/selection/expand），始终不参与用户配置恢复；
  // - customColumns: 可配置列（排序/fixed/visible），后续才会尝试应用本地缓存。
  const { lockColumns, customColumns } = splitTableColumnsByLock(sourceColumns, options?.lockTypes)

  // lockColumns 一般不会在恢复流程里被修改，但返回独立副本可避免外部误改入参。
  // 相比整表 cloneDeep，这里只复制锁定列子集，开销更低。
  const nextLockColumns = cloneDeep(lockColumns)

  // customColumns 在恢复流程中会被重排并回写 fixed/visible，
  // 这里统一做一次深拷贝作为可变工作副本，避免二次 cloneDeep。
  const nextCustomColumnsBase = cloneDeep(customColumns)

  // 默认先使用“代码当前定义”的可配置列，
  // 只有当缓存恢复成功时才用缓存结果覆盖。
  let nextCustomColumns = nextCustomColumnsBase

  // 默认开启缓存恢复；仅当显式传入 usePersisted=false 时跳过。
  // 这样同一个入口即可同时覆盖“按用户配置恢复”和“按默认配置重建”两类流程。
  if (options?.usePersisted !== false && options?.storageId) {
    // 传入上面已准备好的可变副本：
    // - 恢复过程中会对列进行重排并回写 fixed/visible；
    // - 复用同一副本避免重复 deep clone。
    const persistedColumns = loadTableOrderConfig(options.storageId, nextCustomColumnsBase)

    // 仅在缓存“存在且校验通过”时采用恢复结果；
    // 若缓存无效/结构不匹配/异常，则保持默认 customColumns。
    if (persistedColumns) {
      nextCustomColumns = persistedColumns
    }
  }

  return {
    lockColumns: nextLockColumns,
    customColumns: nextCustomColumns,
    mergedColumns: mergeTableColumns(nextLockColumns, nextCustomColumns)
  }
}
