import { Ref } from "vue";
import { TableColumnItem } from "@/components"
import { swapIndex } from './listUtil'

// 唯一标识字段名
const nodeIdkey = 'nodeId'
// 子集list字段名
const childrenKey = 'children'
export type Item = {
  [nodeIdkey]?: string
  [childrenKey]?: Item[]
  [key:string]: any,
} & TableColumnItem



/**
 * 生成nodeId
 * @param parentNodeId 父级nodeId
 * @param index 当前元素下标
 * @returns 当前元素nodeId
 */
const getNodeId = (parentNodeId: string, index: number): string => {
  return parentNodeId ?  parentNodeId + '-' + index : String(index)
}


/**
 * 判断是否子集
 * @param item 元素
 * @returns
 */
const isChildren = (item:Item): boolean => {
  return  item[nodeIdkey]?.includes("-") ?? false
}


/**
 * 获取nodeId节点所在的数组下标
 * @param list 数组
 * @param nodeId 唯一标识
 * @returns
 */
const getNodeIndex = (list: Item[], item:Item): number => {
  let nodeId = item[nodeIdkey]
  for (let index = 0; index < list.length; index++) {
    if (list[index][nodeIdkey] === nodeId) {
      return index
    }
  }
  return -1
}





export const useTableDrag = (sourceList_ref: Ref<Item[]>) => {

  // 原始数据
  const sourceListRef: Ref<Item[]> = sourceList_ref


  /**
   * 扁平化list 并设置唯一标识
   * @param sourceList 原始数据（tree）
   * @returns
   */
  const getFlatList = (): Item[] => {
    const flatList:Item[] = []

    // 递归调用
    const recursion = (list: Item[], parentnodeId='') => {
      let i = 0
      list.forEach(item =>{
        let nodeId = getNodeId(parentnodeId, i++)
        item[nodeIdkey] = nodeId
        flatList.push(item)
        if (item.children) {
          recursion(item.children, nodeId)
        }
      })
    }
    recursion(sourceListRef.value)
    return flatList
  }


    /**
   * 获取nodeId节点所在的数组
   * @param list 数组
   * @param nodeId 唯一标识
   * @returns
   */
  const getSameNodeList = (item:Item): Item[] => {
    const recursion = (list: Item[], nodeId=''): Item[] => {
      for (let index in list) {
        let item:Item = list[index]
        if (item[nodeIdkey] === nodeId) {
          return list
        }
        let noteList = item?.children && recursion(item.children, nodeId)
        if (noteList && noteList.length > 0) {
          return noteList
        }
      }
      return []
    }
    return recursion(sourceListRef.value, item[nodeIdkey])
  }


  /**
   * 交换item
   * @param item_1 互相交换的第一个item
   * @param item_2 互相交换的第二个item
   * @returns
   */
  const swapItem = (item_1: Item, item_2: Item): void => {

    // 获取nodeId节点所在的数组
    let nodeList: Item[] = getSameNodeList(item_1)

    // 定位在目标数组中的下标
    let nodeListIndex_1 = getNodeIndex(nodeList, item_1)
    let nodeListIndex_2 = getNodeIndex(nodeList, item_2)
    if (nodeListIndex_1 === -1 || nodeListIndex_2 === -1) {
      throw new Error("不同层 不允许交换位置")
    }

    // 交换位置
    swapIndex(nodeList, nodeListIndex_1, nodeListIndex_2)
  }


  /**
   * 获取子级总数
   * @param item_1 互相交换的第一个item
   * @param item_2 互相交换的第二个item
   * @returns
   */
  const getChildrenCount = (item: Item): number => {
    let childrenCount = 0
    const recursion = (list: Item[]): void => {
      for (let index in list) {
        let item:Item = list[index]
        childrenCount++
        item?.children && recursion(item.children)
      }
    }
    recursion(item.children)
    return childrenCount
  }

  return {
    init: getFlatList ,
    getFlatList,
    swapItem,
    getSameNodeList,
    isChildren,
    getChildrenCount,
    getNodeIndex
  }

}






