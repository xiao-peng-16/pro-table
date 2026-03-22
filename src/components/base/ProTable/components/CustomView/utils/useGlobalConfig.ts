import { type PageParam, ProTableGlobalConfig, DEFAULT_PRO_TABLE_GLOBAL_CONFIG } from '@/components/base/ProTable/types'
import { getLocal, removeLocal, setLocal } from './local'

// 全局配置固定存储 key：
// - 只保留一份配置，不按页面/路由/customId 做隔离；
// - 满足“全局共享”的使用场景。
const GLOBAL_CONFIG_STORAGE_KEY = 'pro-table-global-config'

// 获取全局配置 localStorage key。
export const getGlobalConfigStorageKey = (): string => {
  return GLOBAL_CONFIG_STORAGE_KEY
}

// 获取默认配置
export const getDefaultProTalbeGolbalConfig = (): ProTableGlobalConfig => {
  return DEFAULT_PRO_TABLE_GLOBAL_CONFIG
}

// 保存全局配置：
// - 先做归一化校验；
// - 与当前缓存合并后再落盘（同字段新值覆盖旧值）；
// - 否则写入 localStorage。
export const saveGlobalConfig = (config: ProTableGlobalConfig): void => {
  const currentConfig = loadGlobalConfig()
  const mergedConfig = mergeGlobalConfig(currentConfig, config)
  const nextConfig = normalizeGlobalConfig(mergedConfig)
  setLocal(getGlobalConfigStorageKey(), nextConfig)
}

// 读取全局配置：
// - 从 localStorage 获取原始数据；
// - 归一化后返回；
export const loadGlobalConfig = (): ProTableGlobalConfig => {
  const config = getLocal(getGlobalConfigStorageKey())
  return normalizeGlobalConfig(config)
}


// 获取分页参数初始值
export const getInitPageParam = ():PageParam => {
  const globalConfig: ProTableGlobalConfig = loadGlobalConfig()
  return {
    pageNum: 1,
    pageSize: globalConfig?.pageDefaultSize ?? 10
  }
}


// 清空全局配置缓存。
export const clearGlobalConfig = (): void => {
  removeLocal(getGlobalConfigStorageKey())
}


// 归一化全局配置对象：
// - 先剔除值为 undefined 的字段；
// - 仅保留 ProTableGlobalConfig 定义字段；
// - 值类型不合法时回退默认值；
// - 缺失字段用默认值补齐。
const normalizeGlobalConfig = (config: unknown): ProTableGlobalConfig => {
  if (!isPlainObject(config)) {
    return DEFAULT_PRO_TABLE_GLOBAL_CONFIG
  }

  const configRecord = stripUndefined(config)
  const knownFields = pickKnownGlobalConfigFields(configRecord)
  return mergeGlobalConfig(DEFAULT_PRO_TABLE_GLOBAL_CONFIG, knownFields)
}


// 移除对象中值为 undefined 的字段：
// - 让“显式传 undefined”退化为“未传该字段”；
// - 配合对象展开合并，避免把旧值覆盖成 undefined。
const stripUndefined = <T extends Record<string, unknown>>(obj: T): Partial<T> => {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined)
  ) as Partial<T>
}

// 合并全局配置：
// - 先剔除 undefined 字段；
// - 再通过展开语法合并（同字段新值覆盖旧值）。
const mergeGlobalConfig = (oldConfig: ProTableGlobalConfig, newConfig: ProTableGlobalConfig): ProTableGlobalConfig => {
  const merged: ProTableGlobalConfig = {
    ...stripUndefined(oldConfig),
    ...stripUndefined(newConfig),
  }
  return merged
}








// 判断是否为可迭代普通对象（不含 null/数组）。
const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

// 判断值类型是否与默认值同类：
// - 基础类型直接比较 typeof；
// - 数组要求同为数组；
// - 对象要求同为普通对象。
const isSameTypeAsDefault = (defaultValue: unknown, value: unknown): boolean => {
  if (Array.isArray(defaultValue)) {
    return Array.isArray(value)
  }
  if (isPlainObject(defaultValue)) {
    return isPlainObject(value)
  }
  return typeof value === typeof defaultValue
}

// 按默认配置提取合法字段：
// - 仅保留 DEFAULT_PRO_TABLE_GLOBAL_CONFIG 中定义的 key；
// - 值类型需与默认值一致，不一致则忽略（回退默认值）。
const pickKnownGlobalConfigFields = (input: Record<string, unknown>): Partial<ProTableGlobalConfig> => {
  const picked: Partial<ProTableGlobalConfig> = {}

  const defaultKeys = Object.keys(DEFAULT_PRO_TABLE_GLOBAL_CONFIG) as Array<keyof ProTableGlobalConfig>
  defaultKeys.forEach((key) => {
    const defaultValue = DEFAULT_PRO_TABLE_GLOBAL_CONFIG[key]
    const value = input[key]
    if (value === undefined) {
      return
    }
    if (isSameTypeAsDefault(defaultValue, value)) {
      ;(picked as Record<keyof ProTableGlobalConfig, unknown>)[key] = value
    }
  })

  return picked
}
