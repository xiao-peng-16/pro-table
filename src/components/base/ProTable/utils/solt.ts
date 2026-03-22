import { TableColumnItem } from '@/components/base'

// 保留的插槽名称
export const RESERVE_SLOTS = ['table-botom']

export const SLOT = 'slot'
export const HEADER_SLOT = 'slotHeader'
// TableColumn 插槽字段: TableColumnItem.slot | TableColumnItem.slotHeader
export const TABLE_COLUMN_SLOTS = [SLOT, HEADER_SLOT]

 

/**
 * 获取pro-table组件中Filter组件插槽名称
 * @param target 目标对象
 * @return 插槽字段对应所有属性值
 */
export const getProTableFilterSlots = (target: any[]): string[] => {
  return getSlots(target, [ SLOT ], RESERVE_SLOTS, 'pro-table')
}

/**
 * 获取pro-table组件中TableColumn组件插槽名称
 * @param target 目标对象
 * @return 插槽字段对应所有属性值
 */
export const getProTableColumnSlots = (target: any[]): string[] => {
  return getSlots(target, TABLE_COLUMN_SLOTS, RESERVE_SLOTS, 'pro-table')
}


/**
 * 获取TableColumn插槽名称
 * @param target 目标对象
 * @return 插槽字段对应所有属性值
 */
export const getTableColumnSlots = (target: any): string[] => {
  return getSlots(target, TABLE_COLUMN_SLOTS)
}

/**
 * 获取TableColumn表头插槽名称
 * @param target 目标对象
 * @return 插槽字段对应所有属性值
 */
export const getTableColumnHeaderSlot = (target: any): string[] => {
  return getSlots(target, [ HEADER_SLOT ])
}


/**
 * 获取配置数组总所有
 * @param target 目标对象
 * @param slotFields 插槽字段名
 * @param reserveSlots 保留插槽名称
 * @param compName 因哪个组件而保留插槽
 * @return 插槽字段对应所有属性值
 */
export const getSlots = (target: any, slotFields = ['slot'], reserveSlots = [], compName = ''): string[] => {
  const list = []
  recursion(target, (key:string, val) => {
    if (slotFields.includes(key)) {
      if (reserveSlots.includes(val)) {
        throw new Error(`[${compName}] ${val} 为组件内部预留插槽，请修改插槽名称`)
      }
      list.push(val)
    }
  })
  return list
}


/**
 * 递归TableColumnItems数组, 并通过回调函数进行处理
 * @param list TableColumnItems数组
 * @param callback  回调函数
 */
export function recursionTableColumnList(list: TableColumnItem[] = [], callback: (item: TableColumnItem) => void) {
  list.forEach(item =>{
    callback(item)
    if (item.children) {
      recursionTableColumnList(item.children, callback)
    }
  })
}


/**
 * 递归所有字段名和值, 并通过回调函数进行处理
 * @param obj 对象
 * @param callback  回调函数
 */
export function recursion(obj, callback: (key:string, val:any) => void) {
  for (let key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      recursion(obj[key], callback);
    } else {
      callback(key, obj[key]);
    }
  }
}
