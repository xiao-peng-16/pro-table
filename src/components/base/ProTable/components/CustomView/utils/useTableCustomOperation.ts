import { Ref, nextTick } from 'vue'
import { useTableDrag, Item, swapIndex } from '@/components/base/ProTable/utils'
import {
  createAnimationGuardRunner,
  waitForRowTransitionEnd as waitForTransitionEnd,
  getTableRowElList as getTableRowElListFromRef,
  moveRowElement,
  clearRowAnimationStyle as clearStyle,
} from './rowAnimation'

// fixed 在历史数据里可能是 true/'left'/'right'，这里统一判定逻辑。
const isFixedLeft = (fixed: Item['fixed']) => fixed === 'left' || fixed === true
const isFixedRight = (fixed: Item['fixed']) => fixed === 'right'

/**
 * 自定义Table设置 
 * @param Table_ref Table Dom引用 用于获取Dom元素进行动画
 * @param sourceList_ref  原始数据（包含children树形结构）
 * @returns 
 */
export const useTableCustomOperation = (Table_ref: Ref, sourceList_ref: Ref<Item[]>) => {

  // Table Dom引用
  const TableRef: Ref = Table_ref
  // 原始数据
  const sourceListRef: Ref<Item[]> = sourceList_ref
  const tableDragHandler = useTableDrag(sourceListRef)
  tableDragHandler.init()

  // 复用 rowAnimation 的串行守卫：保证连续操作按顺序执行，不丢动作。
  const runWithAnimationGuard = createAnimationGuardRunner()

  /**
   * 是否禁用 [ 上移 | 下移 | 置顶 | 置底 ] 操作
   * @param item 
   * @returns 
   */
  const isDisabledMove = (item: Item) => {
    const { fixed } = item
    
    // 获取nodeId节点所在的数组
    const list: Item[] = tableDragHandler.getSameNodeList(item)
    // 获取下标
    let index = tableDragHandler.getNodeIndex(list, item)

    const leftNum = list.filter((item) => isFixedLeft(item.fixed)).length
    const middleNum = list.filter((item) => !item.fixed).length
    const rightNum = list.filter((item) => isFixedRight(item.fixed)).length

    // 禁用的操作集合
    const disabledMap = {
      up: false,      // 上移
      down: false,    // 下移
      top: false,     // 置顶
      bottom: false,  // 置底
    }

    if (index === 0) {
      disabledMap.top = true
      disabledMap.up = true
    } else if (index === list.length - 1) {
      disabledMap.bottom = true
      disabledMap.down = true
    }

    // 固定在右边的 不能置顶和移动到中间区域
    if (isFixedRight(fixed)) {
      disabledMap.top = true
      if (leftNum + middleNum === index) {
        disabledMap.up = true
      }
    }
    // 固定在左边的 不能置底和移动到中间区域
    else if (isFixedLeft(fixed)) {
      disabledMap.bottom = true
      if (leftNum === index + 1) {
        disabledMap.down = true
      }
    }
    // 中间的元素 
    else {
      if (leftNum === index) {
        disabledMap.up = true
        disabledMap.top = true
      }
      if (leftNum + middleNum === index + 1) {
        disabledMap.down = true
        disabledMap.bottom = true
      }
    }

    return disabledMap
  }


  /**
   * 根据fixed顺序排列
   * @param list 
   */
  const sortByFixed = () => {
    const list = sourceListRef.value
    // fixed 排序规则：left(true) 在前，未固定在中，right 在后。
    list.sort((prev, next) => {
      let prevFlag = 0
      if (prev.fixed === 'right') {
        prevFlag = 1
      } else if (prev.fixed) {
        prevFlag = -1
      }
      let nextFlag = 0
      if (next.fixed === 'right') {
        nextFlag = 1
      } else if (next.fixed) {
        nextFlag = -1
      }
      return prevFlag - nextFlag
    })
  }
  // 获取当前表格所有行 Dom（统一复用 rowAnimation 中的探测实现）。
  const getTableRowElList = (): HTMLElement[] => {
    return getTableRowElListFromRef(TableRef)
  }


  /**
   * 上移
   * @param item 
   * @param rowIndex 页面视图Dom元素数组下标（扁平化后的数组）
   * @param 步长移动几行 默认1 
   */
  const moveUp = async (item: Item, rowIndex: number, step=1) => {
    return runWithAnimationGuard(async () => {
      // 防御性校验：步长必须为正数，避免无效循环或反向越界。
      if (step <= 0) {
        return
      }
      const list: Item[] = tableDragHandler.getSameNodeList(item)
      const index = tableDragHandler.getNodeIndex(list, item)
      // 边界前置校验：
      // 1) 节点不存在；
      // 2) 目标上移位置越界。
      if (index < 0 || index - step < 0) {
        return
      }
      // 当前节点和所包含子级加起来数量
      const currentItemCount = 1 + tableDragHandler.getChildrenCount(item)
      // 目标节点和所包含子级加起来数量
      let targetItemCount = 0
      for(let curStep = 1; curStep <= step; curStep++) {
        const targetItem: Item = list[index - curStep]
        // 兜底保护：理论上边界校验后不应命中，保留防御逻辑避免异常数据导致崩溃。
        if (!targetItem) {
          return
        }
        // 上移多步时需要累加每个目标块的高度（含其 children）。
        targetItemCount += 1 + tableDragHandler.getChildrenCount(targetItem)
      }
      // 获取DOM 用于动画
      const tableRowElList = getTableRowElList()
      if (!tableRowElList.length || !tableRowElList[rowIndex]) {
        return
      }
      const currentElList = [...tableRowElList].slice(rowIndex, rowIndex + currentItemCount)
      const targetElList = [...tableRowElList].slice(rowIndex - targetItemCount, rowIndex)
      moveRowElement(currentElList, targetElList, 'up')

      await waitForTransitionEnd([...currentElList, ...targetElList])
      // 等动画结束后再交换数据，避免视觉位置与数据位置不同步。
      if (index - step >= 0) {
        swapIndex(list, index, index - step)
      }
      await nextTick()
      clearStyle(tableRowElList)
    })
  }


  /**
   * 下移
   * @param item 
   * @param rowIndex 页面视图Dom元素数组下标（扁平化后的数组）
   * @param 步长移动几行 默认1 
   */
  const moveDown = async (item: Item, rowIndex: number, step=1) => {
    return runWithAnimationGuard(async () => {
      // 防御性校验：步长必须为正数，避免无效循环或反向越界。
      if (step <= 0) {
        return
      }
      const list: Item[] = tableDragHandler.getSameNodeList(item)
      const index = tableDragHandler.getNodeIndex(list, item)
      // 边界前置校验：
      // 1) 节点不存在；
      // 2) 目标下移位置越界。
      if (index < 0 || index + step > list.length - 1) {
        return
      }
      // 当前节点和所包含子级加起来数量
      const currentItemCount = 1 + tableDragHandler.getChildrenCount(item)
      // 目标节点和所包含子级加起来数量
      let targetItemCount = 0
      for(let curStep = 1; curStep <= step; curStep++) {
        const targetItem: Item = list[index + curStep]
        // 兜底保护：理论上边界校验后不应命中，保留防御逻辑避免异常数据导致崩溃。
        if (!targetItem) {
          return
        }
        targetItemCount += 1 + tableDragHandler.getChildrenCount(targetItem)
      }
      // 获取DOM 用于动画
      const tableRowElList = getTableRowElList()
      if (!tableRowElList.length || !tableRowElList[rowIndex]) {
        return
      }
      const currentElList = [...tableRowElList].slice(rowIndex, rowIndex + currentItemCount)
      const targetElList = [...tableRowElList].slice(rowIndex + currentItemCount, rowIndex + currentItemCount + targetItemCount)
      moveRowElement(currentElList, targetElList, 'down')

      await waitForTransitionEnd([...currentElList, ...targetElList])
      // 等动画结束后再交换数据，避免视觉位置与数据位置不同步。
      if (index + step <= list.length - 1) {
        swapIndex(list, index, index + step)
      }
      await nextTick()
      clearStyle(tableRowElList)
    })
  }


  /**
   * 移动到顶部
   * @param item 
   * @param rowIndex 页面视图Dom元素数组下标（扁平化后的数组）
   */
  const moveTop = async (item: Item, rowIndex: number) => {
    return runWithAnimationGuard(async () => {
      const list: Item[] = tableDragHandler.getSameNodeList(item)
      const leftNum = list.filter((item) => isFixedLeft(item.fixed)).length
      const currentIsFixed = isFixedLeft(item.fixed)
      const index = tableDragHandler.getNodeIndex(list, item)
      // 当前节点和所包含子级加起来数量
      const currentItemCount = 1 + tableDragHandler.getChildrenCount(item)
      const targetItem: Item = list[0]
      const flatList = tableDragHandler.getFlatList()
      const topIndex = tableDragHandler.getNodeIndex(flatList, targetItem)
      // 获取DOM 用于动画
      const tableRowElList = getTableRowElList()
      if (!tableRowElList.length || !tableRowElList[rowIndex]) {
        return
      }
      const currentElList = [...tableRowElList].slice(rowIndex, rowIndex + currentItemCount)
      const targetStartIndex = currentIsFixed ? 0 : Math.max(leftNum, topIndex)
      // 动画策略：置顶也走“双向位移”，当前块上移、被跨越区间整体下移。
      // 这样视觉上与上下移/固定切换保持一致，不会出现“当前块单独跳动”。
      if (targetStartIndex < 0 || rowIndex <= targetStartIndex) {
        return
      }
      const targetElList = [...tableRowElList].slice(targetStartIndex, rowIndex)
      moveRowElement(currentElList, targetElList, 'up')

      await waitForTransitionEnd([...currentElList, ...targetElList])
      // 先移除再插入到目标位置，保持同级列表顺序正确。
      const [temp] = list.splice(index, 1)
      list.splice(currentIsFixed ? 0 : leftNum, 0, temp)
      await nextTick()
      clearStyle(tableRowElList)
    })
  }


  /**
   * 移动到底部
   * @param item 
   * @param rowIndex 页面视图Dom元素数组下标（扁平化后的数组）
   */
  const moveBottom = async (item: Item, rowIndex: number) => {
    return runWithAnimationGuard(async () => {
      const list: Item[] = tableDragHandler.getSameNodeList(item)
      const index = tableDragHandler.getNodeIndex(list, item)
      const rightNum = list.filter((item) => isFixedRight(item.fixed)).length
      const currentIsFixed = isFixedRight(item.fixed)
      // 当前节点和所包含子级加起来数量
      const currentItemCount = 1 + tableDragHandler.getChildrenCount(item)
      const targetItem: Item = list[list.length-1]
      const flatList = tableDragHandler.getFlatList()
      const bottomIndex = tableDragHandler.getNodeIndex(flatList, targetItem)
      // 获取DOM 用于动画
      const tableRowElList = getTableRowElList()
      if (!tableRowElList.length || !tableRowElList[rowIndex]) {
        return
      }
      const currentElList = [...tableRowElList].slice(rowIndex, rowIndex + currentItemCount)
      const targetEndIndex = currentIsFixed
        ? tableRowElList.length - 1
        : Math.min(tableRowElList.length - 1 - rightNum, bottomIndex)
      const targetStartIndex = rowIndex + currentItemCount
      // 动画策略：置底也走“双向位移”，当前块下移、被跨越区间整体上移。
      if (targetEndIndex < targetStartIndex) {
        return
      }
      const targetElList = [...tableRowElList].slice(targetStartIndex, targetEndIndex + 1)
      moveRowElement(currentElList, targetElList, 'down')

      await waitForTransitionEnd([...currentElList, ...targetElList])
      // 先移除再插入到目标位置，保持同级列表顺序正确。
      const [temp] = list.splice(index, 1)
      list.splice(currentIsFixed ? list.length : list.length -  rightNum, 0, temp)
      await nextTick()
      clearStyle(tableRowElList)
    })
  }


  /**
   * 切换固定列
   * @param item  
   * @param rowIndex 页面视图Dom元素数组下标（扁平化后的数组）
   * @param fixed 固定左侧|右侧
   * @param flag  确认固定|取消固定
   */
  const switchFixed = async (item: Item, rowIndex: number, fixed: 'left' | 'right', flag: boolean) => {
    const oldFixed = item.fixed
    if(flag) {
      // 开启固定：固定左侧走置顶，固定右侧走置底。
      const moved = fixed === 'left' ? await moveTop(item, rowIndex) : await moveBottom(item, rowIndex)
      // 动画被并发守卫拦截时，不继续修改 fixed，避免状态与位置不一致。
      if (!moved) {
        return
      }
      item.fixed = fixed
    } else  {
      // 取消固定：先置为中间列，再回退到中间区域边界位置。
      // 注意：这里与“开启固定”分支保持一致，也要关注动画守卫执行结果。
      item.fixed = false
      // 获取nodeId节点所在的数组
      const list: Item[] = tableDragHandler.getSameNodeList(item)
      const index = tableDragHandler.getNodeIndex(list, item)
      const leftNum = list.filter((item) => isFixedLeft(item.fixed)).length
      const rightNum = list.filter((item) => isFixedRight(item.fixed)).length
      let moved = true
      if (isFixedLeft(oldFixed)) {
        moved = await moveDown(item, rowIndex, leftNum - index)
      } else if (isFixedRight(oldFixed)) {
        moved = await moveUp(item, rowIndex, rightNum - (list.length -1 - index))
      }

      // 动画守卫拒绝或执行失败时，回滚 fixed，避免“固定状态”和“展示顺序”不一致。
      if (!moved) {
        item.fixed = oldFixed
      }
    }
  }

  // 兼容旧命名，避免外部仍调用 swicthFixed 时报错。
  const swicthFixed = switchFixed



  // --------------------   拖拽相关特殊处理不能Fixed后不能越界   --------------------

  // ------------------------------ 拖拽校验逻辑开始 ------------------------------
  // 说明：从这里往下（FixedZone / getFixedZone / canDropByZoneBoundary / dragMove）
  // 都是给「拖拽 onMove 校验」使用的；不影响上面的“上移/下移/置顶/置底/固定切换”按钮逻辑。

  // 固定区域标识：左固定 / 中间 / 右固定。
  type FixedZone = 'left' | 'middle' | 'right'

  // 基于 fixed 字段统一映射拖拽分区，避免依赖脆弱的 DOM class。
  const getFixedZone = (item?: Item): FixedZone => {
    if (!item) {
      return 'middle'
    }
    if (isFixedLeft(item.fixed)) {
      return 'left'
    }
    if (isFixedRight(item.fixed)) {
      return 'right'
    }
    return 'middle'
  }

  /**
   * 按“目标行所在分区 + 插入方向”判断是否允许放置：
   * - 左固定项：只能与左固定区内部交换；
   * - 右固定项：只能与右固定区内部交换；
   * - 中间项：
   *   1) 不可插入左固定区内部，仅允许在“最后一个左固定”之后；
   *   2) 不可插入右固定区内部，仅允许在“第一个右固定”之前；
   *   3) 中间区内部自由交换。
   */
  const canDropByZoneBoundary = (
    draggedZone: FixedZone,
    relatedZone: FixedZone,
    relatedIndex: number,
    willInsertAfter: boolean,
    leftCount: number,
    rightStart: number
  ): boolean => {
    if (draggedZone === 'left') {
      return relatedZone === 'left'
    }

    if (draggedZone === 'right') {
      return relatedZone === 'right'
    }

    // draggedZone === 'middle'
    if (relatedZone === 'middle') {
      return true
    }

    if (relatedZone === 'left') {
      // 只允许落在左固定区之后（边界位）：最后一个左固定 + after。
      const lastLeftIndex = leftCount - 1
      return leftCount > 0 && relatedIndex === lastLeftIndex && willInsertAfter
    }

    // relatedZone === 'right'
    // 只允许落在右固定区之前（边界位）：第一个右固定 + before。
    return rightStart >= 0 && relatedIndex === rightStart && !willInsertAfter
  }

  // 拖动事件：非法目标直接返回 false，阻止交换。
  // 该函数由 TableCustomView.vue -> drag.onMove 调用，是拖拽过程的实时闸门。
  const dragMove = (event: any) => {
    // Sortable onMove 关键字段：
    // - dragged: 当前被拖拽行元素
    // - related: 当前悬停参考行元素
    // - willInsertAfter: 是否计划插入到 related 之后（true=after, false=before）
    const { dragged, related, willInsertAfter } = event || {}

    // 缺少关键节点时不拦截，交给 Sortable 默认行为处理。
    if (!dragged || !related) {
      return true
    }

    const tableRowElList = getTableRowElList()
    if (!tableRowElList.length) {
      return true
    }

    // 第一步：DOM 行索引定位（拖拽库给的是 DOM，我们需要映射到业务数据）。
    // 这样可以保证“拖拽校验”和“最终 swap”使用同一份数据语义。
    const draggedRowIndex = tableRowElList.indexOf(dragged as HTMLElement)
    const relatedRowIndex = tableRowElList.indexOf(related as HTMLElement)
    if (draggedRowIndex < 0 || relatedRowIndex < 0) {
      return true
    }

    // 第二步：DOM -> 扁平数据项（flatList）映射，拿到真实 fixed 信息。
    const flatList = tableDragHandler.getFlatList()
    const draggedItem = flatList[draggedRowIndex]
    const relatedItem = flatList[relatedRowIndex]
    if (!draggedItem || !relatedItem) {
      return true
    }

    // 第三步：限制同层级交换。
    // 如果 related 不在 dragged 的同级列表里，直接阻止，避免跨层级错乱。
    const sameNodeList = tableDragHandler.getSameNodeList(draggedItem)
    const draggedNodeIndex = tableDragHandler.getNodeIndex(sameNodeList, draggedItem)
    const relatedNodeIndex = tableDragHandler.getNodeIndex(sameNodeList, relatedItem)
    if (draggedNodeIndex < 0 || relatedNodeIndex < 0) {
      return false
    }

    // 第四步：基于同级列表计算左右固定区边界：
    // [0, leftCount-1] 左固定区；[leftCount, rightStart-1] 中间区；[rightStart, end] 右固定区。
    const leftCount = sameNodeList.filter((item) => isFixedLeft(item.fixed)).length
    const rightCount = sameNodeList.filter((item) => isFixedRight(item.fixed)).length
    const rightStart = sameNodeList.length - rightCount

    // 第五步：将 dragged / related 映射为分区后，交给边界规则函数做最终放置判定。
    // 规则函数内部已覆盖：左固定只能在左区、右固定只能在右区、中间只能在中间及合法边界位。
    const draggedZone = getFixedZone(draggedItem)
    const relatedZone = getFixedZone(relatedItem)
    return canDropByZoneBoundary(
      draggedZone,
      relatedZone,
      relatedNodeIndex,
      Boolean(willInsertAfter),
      leftCount,
      rightStart
    )
  }
  // ------------------------------ 拖拽校验逻辑结束 ------------------------------

  return {
    isDisabledMove,
    sortByFixed,
    moveUp,
    moveDown,
    moveTop,
    moveBottom,
    switchFixed,
    swicthFixed,
    dragMove,
    isChildren: tableDragHandler.isChildren
  }
}
