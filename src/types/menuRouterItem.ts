
export type menuRouterItem = {
  // 页面标题
  title: string
  // 图标
  icon?: string
  // 路径
  path?: string
  // 子级
  children?: menuRouterItem[]
}