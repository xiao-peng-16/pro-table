import { createRouter, createWebHashHistory, RouteRecordRaw, Router } from 'vue-router'

const Layout = () => import('@/layout/index.vue')



const routers:RouteRecordRaw[] = [

  {
    path: '/',
    component: Layout,
    name: 'Root',
    redirect: '/test',
    children: [
      {
        path: '/test',
        component: () => import('@/views/test/table-test.vue'),
        name: 'test',
        meta: {
          hidden: true,
          canTo: true
        }
      },
      {
        path: '/test2',
        component: () => import('@/views/test/table-test2.vue'),
        name: 'test2',
        meta: {
          hidden: true,
          canTo: true
        }
      },
      {
        path: '/test3',
        component: () => import('@/views/test/table-test3.vue'),
        name: 'test3',
        meta: {
          hidden: true,
          canTo: true
        }
      },
    ]
  },

]


const allRouters:RouteRecordRaw[] = [...routers]

export const router = createRouter({
  history: createWebHashHistory(),
  strict: true,
  routes: allRouters,
  scrollBehavior: () => ({ left: 0, top: 0 })
})
