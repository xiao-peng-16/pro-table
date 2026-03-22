import { nextTick } from "vue";

/**
 * 根据数组下标交换元素位置
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
