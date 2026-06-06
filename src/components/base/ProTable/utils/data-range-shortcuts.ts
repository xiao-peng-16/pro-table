import { ShortcutType, ShortcutsItem } from '@/components/base'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
dayjs.locale('zh-cn')


// 将任意时间归一化到当天 00:00:00
const toDayStart = (date:Date):Date => {
  return dayjs(date).startOf('day').toDate()
}
// 将任意时间归一化到当天 23:59:59.999
const toDayEnd = (date:Date):Date => {
  return dayjs(date).endOf('day').toDate()
}

// 获取最近 N 天范围（起始日 00:00:00 ~ 当前日 23:59:59.999）
const getLastDayRange = (days:number): Date[] => {
  const start = new Date()
  const end = new Date()
  // 基于当前时间向前回退 N 天
  start.setTime(start.getTime() - 3600 * 1000 * 24 * days)
  return [toDayStart(start), toDayEnd(end)]
}

// 快捷时间成为范围选择
const shortcuts:ShortcutsItem[] = [
  {
    type: 'currentWeek',
    text: '本周',
    value: () => {
      const start = dayjs(new Date()).startOf('week').toDate()
      const end = dayjs(new Date()).endOf('week').toDate()
      return [start, end]
    },
  },
  {
    type: 'currentMonth',
    text: '本月',
    value: () => {
      const start = dayjs(new Date()).startOf('month').toDate()
      const end = dayjs(new Date()).endOf('month').toDate()
      return [start, end]
    },
  },
  {
    type: 'lastMonth',
    text: '上个月',
    value: () => {
      const start = dayjs(new Date()).subtract(1, 'month').startOf('month').toDate()
      const end = dayjs(new Date()).subtract(1, 'month').endOf('month').toDate()
      return [start, end]
    },
  },
  {
    type: 'currentYear',
    text: '今年',
    value: () => {
      const start = dayjs(new Date()).startOf('year').toDate()
      const end = dayjs(new Date()).endOf('year').toDate()
      return [start, end]
    },
  },
  {
    type: 'lastDay_7',
    text: '最近7天',
    value: () => {
      return getLastDayRange(7)
    },
  },
  {
    type: 'lastDay_30',
    text: '最近30天',
    value: () => {
      return getLastDayRange(30)
    },
  },
  {
    type: 'lastDay_60',
    text: '最近60天',
    value: () => {
      return getLastDayRange(60)
    },
  },
  {
    type: 'lastDay_90',
    text: '最近90天',
    value: () => {
      return getLastDayRange(90)
    },
  },
]

/**
 * 获取element-plus ElDatePicker日期选择器 快捷选项
 * @param typeList 
 * @returns 
 */
export const getShortcuts = (typeList?: ShortcutType[]): ShortcutsItem[] => {
  if (!typeList) {
    return shortcuts ?? []
  }
  return shortcuts.filter(item=>typeList.includes(item.type)) ?? []
}


/**
 * 获取Date日期范围数组
 * 规则：
 * 1) 当 type 为 lastDay_xx（xx 为任意数字）时，按“最近 xx 天”动态计算
 * 2) 其他类型走预置 shortcuts（如 currentWeek / currentMonth / lastMonth）
 * @param type 快捷类型
 * @returns 日期范围 [start, end]
 */
export const getDateRangeList = (type: ShortcutType): Date[] => {
  // 支持 lastDay_xx 动态天数（例如：lastDay_15）
  const lastDayMatch = type.match(/^lastDay_(\d+)$/)
  if (lastDayMatch) {
    const days = Number(lastDayMatch[1])
    // 兜底校验：仅处理非负且有限数值，避免异常入参
    if (Number.isFinite(days) && days >= 0) {
      return getLastDayRange(days)
    }
  }
  // 其余固定快捷项按既有配置返回
  return shortcuts.find(item=>item.type === type)?.value?.()
}
