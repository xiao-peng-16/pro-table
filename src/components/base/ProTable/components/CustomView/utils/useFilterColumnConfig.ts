import { cloneDeep } from 'lodash'
import type { FilterItem } from '@/components/base/ProTable'
import { getLocal, removeLocal, setLocal } from './local'

// ========================= Filter 持久化基础常量 =========================
// localStorage 前缀：用于隔离 ProTable 筛选项缓存命名空间。
const FILTER_ORDER_STORAGE_PREFIX = 'filter-custom-order'
// 缓存版本号：当缓存结构升级时，通过版本号触发自动失效。
const FILTER_ORDER_STORAGE_VERSION = 1

// 单个筛选项最小快照：只保存恢复顺序与显示状态必须字段。
type FilterOrderEntry = {
  key: string
  visible: boolean | null
}

// 持久化配置结构：
// - version: 缓存版本
// - schemaSignature: 当前筛选结构签名
// - entries: 筛选项顺序与 visible 快照
type FilterOrderConfig = {
  version: number
  schemaSignature: string
  entries: FilterOrderEntry[]
}

// 读取缓存时允许更宽松的“历史/脏数据”形态，再归一化到 FilterOrderConfig。
type FilterOrderEntryLike = {
  key: string
  visible?: boolean | null
}

// 宽松配置模型：用于承接历史缓存/人工改写缓存（字段允许缺省）。
type FilterOrderConfigLike = {
  version: number
  schemaSignature: string
  entries: FilterOrderEntryLike[]
}

// 本地缓存加载失败原因（仅开发环境日志使用）。
type FilterOrderLoadFailReason =
  | 'malformed_payload'
  | 'version_mismatch'
  | 'schema_mismatch'
  | 'invalid_entries'
  | 'unexpected_error'

const FILTER_ORDER_LOG_PREFIX = '[ProTable][筛选项配置]'

// 失败原因文案映射：统一日志语义，避免在调用点散落硬编码文案。
const FILTER_ORDER_REASON_TEXT: Record<FilterOrderLoadFailReason, string> = {
  malformed_payload: '缓存内容异常，已回退默认配置',
  version_mismatch: '缓存版本已过期，已回退默认配置',
  schema_mismatch: '字段配置已变更，已回退默认配置',
  invalid_entries: '缓存校验未通过，已回退默认配置',
  unexpected_error: '加载配置时发生异常，已回退默认配置',
}

// 轻量运行时对象判定：用于校验 localStorage 反序列化后的 unknown 值。
const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

// 运行时校验单条缓存项（宽松模式）：允许 visible 缺失，后续归一化补 null。
const isFilterOrderEntryLike = (value: unknown): value is FilterOrderEntryLike => {
  if (!isPlainObject(value)) {
    return false
  }
  if (typeof value.key !== 'string') {
    return false
  }
  return value.visible === undefined || value.visible === null || typeof value.visible === 'boolean'
}

// 运行时校验缓存主结构（宽松模式）：仅校验恢复流程必需字段与类型。
const isFilterOrderConfigLike = (value: unknown): value is FilterOrderConfigLike => {
  if (!isPlainObject(value)) {
    return false
  }
  if (typeof value.version !== 'number') {
    return false
  }
  if (typeof value.schemaSignature !== 'string') {
    return false
  }
  if (!Array.isArray(value.entries)) {
    return false
  }
  return value.entries.every(isFilterOrderEntryLike)
}

// 归一化缓存模型：把可选字段收敛为严格模型，减少下游判空分支。
const toFilterOrderConfig = (value: FilterOrderConfigLike): FilterOrderConfig => {
  return {
    version: value.version,
    schemaSignature: value.schemaSignature,
    entries: value.entries.map((entry) => ({
      key: entry.key,
      visible: entry.visible ?? null,
    })),
  }
}

// 开发环境诊断日志：线上不打印，避免污染生产控制台。
const logFilterOrderLoadFailure = (
  reason: FilterOrderLoadFailReason,
  storageId: string,
  detail?: string
): void => {
  if (!import.meta.env.DEV) {
    return
  }
  const suffix = detail ? `，详情：${detail}` : ''
  console.warn(
    `${FILTER_ORDER_LOG_PREFIX} 加载失败：${FILTER_ORDER_REASON_TEXT[reason]}，存储键：${getFilterOrderStorageKey(storageId)}${suffix}`
  )
}

// 将 undefined 统一转为 null，保证序列化稳定（JSON 可明确表示“无值”）。
const normalizeVisible = (visible: boolean | undefined): boolean | null => {
  if (visible === undefined) {
    return null
  }
  return visible
}

// Filter 唯一键策略：prop + label。
// 说明：
// 1) 单看 prop 在日期范围等场景可能重复（如同 prop 不同文案的起止项）；
// 2) 叠加 label 后能稳定区分同 prop 的不同筛选项；
// 3) 保持与当前业务诉求一致（不引入 type 参与 key）。
const getFilterKey = (item: FilterItem): string => {
  const propKey = Array.isArray(item.prop) ? item.prop.join('|') : item.prop
  const labelKey = item.label ?? ''
  return `${String(propKey ?? '')}::${String(labelKey)}`
}

// 构建结构签名：
// - 仅包含结构相关字段（key/prop/type）；
// - 不包含顺序与 visible 等可变内容；
// - 按 key 排序，避免用户排序变更影响签名。
const buildSchemaSignature = (filters: FilterItem[]): string => {
  const signatures = filters
    .map((item) => ({
      key: getFilterKey(item),
      prop: Array.isArray(item.prop) ? item.prop.join('|') : item.prop,
      type: item.type ?? null,
    }))
    .sort((a, b) => a.key.localeCompare(b.key))
  return JSON.stringify(signatures)
}

// 判定 key 是否重复，重复会导致恢复映射不唯一。
const hasDuplicateKeys = (keys: string[]): boolean => {
  return new Set(keys).size !== keys.length
}

// 将当前筛选项转换为可持久化快照。
const buildOrderEntries = (filters: FilterItem[]): FilterOrderEntry[] => {
  return filters.map((item) => ({
    key: getFilterKey(item),
    visible: normalizeVisible(item.visible),
  }))
}

// 校验当前筛选项与缓存快照是否可安全匹配：
// 1) 数量一致；
// 2) 双方 key 集合一致；
// 3) 双方都不存在重复 key。
const validateOrderEntries = (currentEntries: FilterOrderEntry[], savedEntries: FilterOrderEntry[]): boolean => {
  if (currentEntries.length !== savedEntries.length) {
    return false
  }

  const currentKeys = currentEntries.map((entry) => entry.key)
  const savedKeys = savedEntries.map((entry) => entry.key)
  if (hasDuplicateKeys(currentKeys) || hasDuplicateKeys(savedKeys)) {
    return false
  }

  const currentKeySet = new Set(currentKeys)
  for (const entry of savedEntries) {
    if (!currentKeySet.has(entry.key)) {
      return false
    }
  }

  return true
}

// 按缓存快照恢复顺序与 visible：
// - 仅覆盖允许恢复字段（visible）；
// - 其他字段保持代码侧 sourceFilters 最新定义。
const applyOrderEntries = (filters: FilterItem[], savedEntries: FilterOrderEntry[]): FilterItem[] => {
  const itemMap = new Map<string, FilterItem>()
  filters.forEach((item) => {
    itemMap.set(getFilterKey(item), item)
  })

  return savedEntries
    .map((entry) => {
      const item = itemMap.get(entry.key)
      if (!item) {
        return undefined
      }
      item.visible = entry.visible == null ? undefined : entry.visible
      return item
    })
    .filter(Boolean) as FilterItem[]
}

// 计算当前筛选配置对应的 localStorage key。
export const getFilterOrderStorageKey = (storageId: string): string => {
  return `${FILTER_ORDER_STORAGE_PREFIX}:${storageId}`
}

// 清空当前Filter浏览器保存配置
export const clearFilterOrderConfig = (storageId: string): void => {
  removeLocal(getFilterOrderStorageKey(storageId))
}

// 保存筛选项配置：只保存“顺序 + visible”最小快照。
export const saveFilterOrderConfig = (storageId: string, filters: FilterItem[]): void => {
  // 没有 storageId 时不执行持久化：避免把不同页面/不同实例写入同一份匿名缓存。
  if (!storageId) {
    return
  }

  // 组装最小可恢复快照：
  // - version: 用于后续结构升级时做兼容/失效控制；
  // - schemaSignature: 用于校验“当前筛选结构”是否和保存时一致；
  // - entries: 仅保存顺序与 visible，不保存其他业务属性。
  const payload: FilterOrderConfig = {
    version: FILTER_ORDER_STORAGE_VERSION,
    schemaSignature: buildSchemaSignature(filters),
    entries: buildOrderEntries(filters),
  }

  // 写入本地缓存。
  setLocal(getFilterOrderStorageKey(storageId), payload)
}

// 读取并恢复筛选项配置：
// - 先做版本和结构签名校验；
// - 再校验 key 集合一致性；
// - 任一校验失败都回退默认，并在必要时清理脏缓存。
export const loadFilterOrderConfig = (storageId: string, filters: FilterItem[]): FilterItem[] | null => {
  if (!storageId) {
    return null
  }

  // Step1: 读取原始缓存，null/undefined 视为未命中。
  const rawConfig = getLocal(getFilterOrderStorageKey(storageId)) as unknown
  if (rawConfig == null) {
    return null
  }

  // Step2: 结构不合法直接判定脏缓存并清理。
  if (!isFilterOrderConfigLike(rawConfig)) {
    logFilterOrderLoadFailure('malformed_payload', storageId, `原始值类型=${typeof rawConfig}`)
    clearFilterOrderConfig(storageId)
    return null
  }

  // Step3: 归一化为严格模型，后续逻辑按统一结构处理。
  const config = toFilterOrderConfig(rawConfig)

  try {
    if (config.version !== FILTER_ORDER_STORAGE_VERSION) {
      logFilterOrderLoadFailure('version_mismatch', storageId, `缓存版本=${String(config.version)}`)
      clearFilterOrderConfig(storageId)
      return null
    }

    // 字段结构签名不一致：说明代码定义已变化，旧缓存不再可复用。
    // 这里主动清理缓存，避免后续仍反复读取到同一份过期数据。
    if (config.schemaSignature !== buildSchemaSignature(filters)) {
      logFilterOrderLoadFailure('schema_mismatch', storageId)
      clearFilterOrderConfig(storageId)
      return null
    }

    const currentEntries = buildOrderEntries(filters)
    const savedEntries = config.entries
    if (!validateOrderEntries(currentEntries, savedEntries)) {
      logFilterOrderLoadFailure(
        'invalid_entries',
        storageId,
        `缓存条目数=${savedEntries.length}，当前条目数=${currentEntries.length}`
      )
      clearFilterOrderConfig(storageId)
      return null
    }

    return applyOrderEntries(filters, savedEntries)
  } catch (error) {
    const errorDetail = error instanceof Error ? error.message : String(error)
    logFilterOrderLoadFailure('unexpected_error', storageId, errorDetail)
    clearFilterOrderConfig(storageId)
    return null
  }
}

// 统一解析入口：
// 1) 以 sourceFilters 为基准深拷贝；
// 2) 按需应用本地缓存（默认开启）；
// 3) 缓存失效时自动回退默认筛选项。
export const resolveFilterItems = (
  sourceFilters: FilterItem[] = [],
  options?: {
    storageId?: string
    usePersisted?: boolean
  }
): FilterItem[] => {
  // 先深拷贝代码侧源配置，避免持久化恢复过程直接污染上游引用。
  const nextFilters = cloneDeep(sourceFilters)

  // 默认尝试使用持久化配置（仅当显式设置 usePersisted=false 才跳过）。
  // 典型场景：
  // - 正常初始化：usePersisted=true（默认），优先恢复用户历史设置；
  // - 点击“重置”：usePersisted=false，强制回到代码默认配置。
  if (options?.usePersisted !== false && options?.storageId) {
    const persistedFilters = loadFilterOrderConfig(options.storageId, nextFilters)
    if (persistedFilters) {
      // 成功命中并通过校验，返回恢复后的筛选项顺序与 visible 状态。
      return persistedFilters
    }
  }

  // 未命中缓存或缓存校验失败时，返回默认筛选配置。
  return nextFilters
}
