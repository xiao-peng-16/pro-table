import { defineStore } from 'pinia'
import { store } from '../index'


interface AppState {
  // 系统主题
  systemTheme: 'system-theme-default' | 'system-theme-light' | 'system-theme-dark'
  // fixed固定头部工具栏和tag标签页
  fixedHeader: boolean
  // 折叠菜单
  collapse: boolean
  // 折叠菜单Icon
  collapseIcon: boolean
   // 面包屑
  breadcrumb: boolean,
  // 面包屑Icon
  breadcrumbIcon: boolean, 
  // 标签页
  tagsView: boolean
  // 标签页Icon
  tagsViewIcon: boolean

}

export const useAppStore = defineStore('app', {
  state: (): AppState => {
    return {
      systemTheme: 'system-theme-default',
      fixedHeader: true,
      collapse: false, 
      collapseIcon: true,
      breadcrumb: true,
      breadcrumbIcon: true,
      tagsView: true,
      tagsViewIcon: true,
    }
  },
  getters: {
    getSystemTheme(): 'system-theme-default' | 'system-theme-light' | 'system-theme-dark' {
      return this.systemTheme
    },
    getFixedHeader(): boolean {
      return this.fixedHeader
    },
    getCollapse(): boolean {
      return this.collapse
    },
    getCollapseIcon(): boolean {
      return this.collapseIcon
    },
    getBreadcrumb(): boolean {
      return this.breadcrumb
    },
    getBreadcrumbIcon(): boolean {
      return this.breadcrumbIcon
    },
    getTagsView(): boolean {
      return this.tagsView
    },
    getTagsViewIcon(): boolean {
      return this.tagsViewIcon
    },
  },
  actions: {
    setSystemTheme(systemTheme: 'system-theme-default' | 'system-theme-light' | 'system-theme-dark') {
      this.systemTheme = systemTheme
    },
    setFixedHeader(fixedHeader: boolean) {
      this.fixedHeader = fixedHeader
    },
    setBreadcrumb(breadcrumb: boolean) {
      this.breadcrumb = breadcrumb
    },
    setCollapse(collapse: boolean) {
      this.collapse = collapse
    },
    setCollapseIcon(collapseIcon: boolean) {
      this.collapseIcon = collapseIcon
    },
    setBreadcrumbIcon(breadcrumbIcon: boolean) {
      this.breadcrumbIcon = breadcrumbIcon
    },
    setTagsView(tagsView: boolean) {
      this.tagsView = tagsView
    },
    setTagsViewIcon(tagsViewIcon: boolean) {
      this.tagsViewIcon = tagsViewIcon
    },
  },
  persist: true
})

export const useAppStoreWithOut = () => {
  return useAppStore(store)
}
