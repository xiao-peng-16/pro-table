import { Ref, nextTick } from 'vue'
import { swapIndex } from '@/components/base/ProTable/utils'
import { FilterItem } from '@/components/base/ProTable/types/index'
import {
  createAnimationGuardRunner,
  waitForRowTransitionEnd as waitForTransitionEnd,
  getTableRowElList as getTableRowElListFromRef,
  moveRowElement,
  clearRowAnimationStyle as clearStyle,
} from './rowAnimation'

/**
 * 自定义Table设置 
 * @param Table_ref Table Dom引用 用于获取Dom元素进行动画
 * @param sourceList_ref  原始数据（包含children树形结构）
 * @returns 
 */
export const useFilterCustom = (Table_ref: Ref, sourceList_ref: Ref<FilterItem[]>) => {

  // Table Dom引用
  const TableRef: Ref = Table_ref
  // 原始数据
  const sourceListRef: Ref<FilterItem[]> = sourceList_ref

  // 复用 rowAnimation 的串行守卫：保证连续操作按顺序执行，不丢动作。
  const runWithAnimationGuard = createAnimationGuardRunner()

  // 获取当前表格所有行 Dom
  const getTableRowElList = (): HTMLElement[] => {
    return getTableRowElListFromRef(TableRef)
  }

  /**
   * 是否禁用 [ 上移 | 下移 | 置顶 | 置底 ] 操作
   * @param item 
   * @returns 
   */
  const isDisabledMove = (index:number) => {
    const list = sourceListRef.value

    // 禁用的操作集合
    const disabledMap = {
      up: false,      // 上移
      down: false,    // 下移
      top: false,     // 置顶
      bottom: false,  // 置底
    }

    if (index === 0) {
      // 第一行不能继续上移/置顶。
      disabledMap.top = true
      disabledMap.up = true
    } else if (index === list.length - 1) {
      // 最后一行不能继续下移/置底。
      disabledMap.bottom = true
      disabledMap.down = true
    }

    return disabledMap
  }

  /**
   * 上移
   * @param item 
   * @param rowIndex 页面视图Dom元素数组下标（扁平化后的数组）
   * @param 步长移动几行 默认1 
   */
  const moveUp = async (rowIndex: number, step=1) => {
    return runWithAnimationGuard(async () => {
      const list = sourceListRef.value
      if (rowIndex - step < 0) {
        // 目标越界，忽略本次操作。
        return
      }
      // 获取DOM 用于动画
      const tableRowElList = getTableRowElList()
      if (!tableRowElList.length || !tableRowElList[rowIndex]) {
        return
      }
      const currentElList = [ tableRowElList[rowIndex] ]
      const targetElList = [...tableRowElList].slice(rowIndex - step, rowIndex)
      moveRowElement(currentElList, targetElList, 'up')

      await waitForTransitionEnd([...currentElList, ...targetElList])
      // 动画完成后再交换数据，保证视觉与数据一致。
      if (rowIndex - step >= 0) {
        swapIndex(list, rowIndex, rowIndex - step)
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
  const moveDown = async (rowIndex: number, step=1) => {
    return runWithAnimationGuard(async () => {
      const list = sourceListRef.value
      if (rowIndex + step > list.length - 1) {
        // 目标越界，忽略本次操作。
        return
      }
      // 获取DOM 用于动画
      const tableRowElList = getTableRowElList()
      if (!tableRowElList.length || !tableRowElList[rowIndex]) {
        return
      }
      const currentElList = [ tableRowElList[rowIndex] ]
      // 下移目标区间从下一行开始，避免把当前行误包含在目标集里。
      const targetElList = [...tableRowElList].slice(rowIndex + 1, rowIndex + 1 + step)
      moveRowElement(currentElList, targetElList, 'down')

      await waitForTransitionEnd([...currentElList, ...targetElList])
      // 动画完成后再交换数据，保证视觉与数据一致。
      if (rowIndex + step <= list.length - 1) {
        swapIndex(list, rowIndex, rowIndex + step)
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
  const moveTop = async (rowIndex: number) => {
    return runWithAnimationGuard(async () => {
      const list = sourceListRef.value
      if (rowIndex <= 0 || rowIndex > list.length - 1) {
        // 已在顶部或索引非法，无需处理。
        return
      }
      // 获取DOM 用于动画
      const tableRowElList = getTableRowElList()
      if (!tableRowElList.length || !tableRowElList[rowIndex]) {
        return
      }
      const currentElList = [ tableRowElList[rowIndex] ]
      // 动画策略：与“上移”保持一致，当前行上移、被跨越区间整体下移。
      // 相比只移动当前行，双向位移动画更平滑，也更接近固定列切换时的观感。
      const targetElList = [...tableRowElList].slice(0, rowIndex)
      moveRowElement(currentElList, targetElList, 'up')

      await waitForTransitionEnd([...currentElList, ...targetElList])
      // 动画结束后调整数组顺序，并在 nextTick 后清理样式。
      const [temp] = list.splice(rowIndex, 1)
      list.splice(0, 0, temp)
      await nextTick()
      clearStyle(tableRowElList)
    })
  }


  /**
   * 移动到底部
   * @param item 
   * @param rowIndex 页面视图Dom元素数组下标（扁平化后的数组）
   */
  const moveBottom = async (rowIndex: number) => {
    return runWithAnimationGuard(async () => {
      const list = sourceListRef.value
      if (rowIndex < 0 || rowIndex >= list.length - 1) {
        // 已在底部或索引非法，无需处理。
        return
      }
      // 获取DOM 用于动画
      const tableRowElList = getTableRowElList()
      if (!tableRowElList.length || !tableRowElList[rowIndex]) {
        return
      }
      const currentElList = [ tableRowElList[rowIndex] ]
      // 动画策略：与“下移”保持一致，当前行下移、被跨越区间整体上移。
      // 这样置底过程不会出现“只看见当前行跳动，其他行突然重排”的割裂感。
      const targetElList = [...tableRowElList].slice(rowIndex + 1)
      moveRowElement(currentElList, targetElList, 'down')

      await waitForTransitionEnd([...currentElList, ...targetElList])
      // 动画结束后调整数组顺序，并在 nextTick 后清理样式。
      const [temp] = list.splice(rowIndex, 1)
      list.push(temp)
      await nextTick()
      clearStyle(tableRowElList)
    })
  }

  return {
    isDisabledMove,
    moveUp,
    moveDown,
    moveTop,
    moveBottom
  }
}
