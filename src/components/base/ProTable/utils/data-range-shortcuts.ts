import { ShortcutType, ShortcutsItem } from '@/components/base'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
dayjs.locale('zh-cn')


const toDayStart = (date:Date):Date => {
  return dayjs(date).startOf('day').toDate()
}
const toDayEnd = (date:Date):Date => {
  return dayjs(date).endOf('day').toDate()
}

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
      const start = new Date()
      const end = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [toDayStart(start), toDayEnd(end)]
    },
  },
  {
    type: 'lastDay_30',
    text: '最近30天',
    value: () => {
      const start = new Date()
      const end = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [toDayStart(start), toDayEnd(end)]
    },
  },
  {
    type: 'lastDay_60',
    text: '最近60天',
    value: () => {
      const start = new Date()
      const end = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 60)
      return [toDayStart(start), toDayEnd(end)]
    },
  },
  {
    type: 'lastDay_90',
    text: '最近90天',
    value: () => {
      const start = new Date()
      const end = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [toDayStart(start), toDayEnd(end)]
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
    return shortcuts
  }
  return shortcuts.filter(item=>typeList.includes(item.type))
}


/**
 * 获取Date日期范围数组
 * @param type 
 * @returns 
 */
export const getDateRangeList = (type: ShortcutType): Date[] => {
  return shortcuts.find(item=>item.type === type)?.value?.() ?? []
}
