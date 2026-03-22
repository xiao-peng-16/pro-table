export * from '../../utils/useTableDrag'
import Table from './src/Table.vue'
import TableColumn from './src/TableColumn.vue'
import withInstall from '@/utils/withInstall.ts'
withInstall(Table)
export { Table, TableColumn }
