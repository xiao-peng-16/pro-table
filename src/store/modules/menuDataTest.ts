
import { menuRouterItem } from '@/types/menuRouterItem'
 export const menuDataTest: menuRouterItem[] = [
  {
    title: '测试目录',
    icon: 'ep:menu',
    children: [
      {
        title: '列表',
        path: '/test',
      },
      {
        title: '列表-Filter复用',
        path: '/test2',
      },
    ]
  },
  {
    title: '系统管理',
    icon: 'ep:menu',
    children: [
      {
        title: '菜单管理',
        path: '/system/menu',
      },
      {
        title: '资源管理',
        path: '/system/permission',
      },
    ]
  },

]