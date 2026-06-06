import { nextTick } from "vue";

/**
 * 根据数组下标交换两个元素位置。
 * 注意：这是“互换”语义，只适用于明确需要 A/B 对调的场景；
 * 拖拽排序应该使用 moveIndex，避免拖到新位置时只和目标行交换。
 * @param list 数组
 * @param index_1 第一个下标
 * @param index_2 第二个下标
 */
export const swapIndex = (list: any[], index_1: number, index_2: number): void => {
  const [temp] = list.splice(index_2, 1, list[index_1]);
  nextTick(() => {
    list[index_1] = temp;
  })
}

/**
 * 将数组中的一个元素移动到目标下标，并让中间元素自然顺移。
 * 这是“拖拽排序/插入排序”语义：先从原位置移除，再插入到新位置，
 * 例如 [A, B, C, D] 中 0 -> 2 的结果是 [B, C, A, D]。
 * @param list 数组
 * @param fromIndex 被移动元素的原始下标
 * @param toIndex 被移动元素最终要插入的目标下标
 */
export const moveIndex = <T>(list: T[], fromIndex: number, toIndex: number): void => {
  // 下标非法或没有实际移动时直接返回，避免 splice 误删数据。
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= list.length ||
    toIndex >= list.length ||
    fromIndex === toIndex
  ) {
    return
  }

  // 先删除原位置，再插入目标位置；删除后数组长度会变化，
  // 但目标下标表示的是“最终位置”，直接插入即可得到拖拽排序的结果。
  const [movedItem] = list.splice(fromIndex, 1)
  list.splice(toIndex, 0, movedItem)
}
