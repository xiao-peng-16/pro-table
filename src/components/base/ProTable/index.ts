export * from './types';
export * from "./components/Filter";
export * from "./components/Table";
export * from './components/Pagination';
export * from "./components/CustomView";
import ProTable from './src/ProTable.vue'
import withInstall from '@/utils/withInstall.ts'
withInstall(ProTable)
export { ProTable }

