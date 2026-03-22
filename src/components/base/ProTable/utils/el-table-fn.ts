import { ElTable } from "element-plus";
type ElTableType = InstanceType<typeof ElTable>

export interface ElTableFns {
  // element-plus table 方法
  clearSelection: ElTableType['clearSelection'],
  getSelectionRows: ElTableType['getSelectionRows'],
  doLayout: ElTableType['doLayout'],
  toggleRowSelection: ElTableType['toggleRowSelection'],
  toggleAllSelection: ElTableType['toggleAllSelection'],
  toggleRowExpansion: ElTableType['toggleRowExpansion'],
  setCurrentRow: ElTableType['setCurrentRow'],
  // 暴露 Table 根节点，供自定义列动画逻辑稳定获取行 Dom。
  getTableRootEl: () => HTMLElement | null,
}

export const getElTableFns = (tatget: ElTableFns) => {
  return {
    clearSelection: tatget?.clearSelection,
    getSelectionRows: tatget?.getSelectionRows,
    doLayout: tatget?.doLayout,
    toggleRowSelection: tatget?.toggleRowSelection,
    toggleAllSelection: tatget?.toggleAllSelection,
    toggleRowExpansion: tatget?.toggleRowExpansion,
    setCurrentRow: tatget?.setCurrentRow,
  }
}
