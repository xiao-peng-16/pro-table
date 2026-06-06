import { AppRouteRecord } from '@/types/router'

export const test: AppRouteRecord = {
  path: '/test',
  name: 'Test',
  component: '/index/index',
  meta: {
    title: '测试',
    icon: 'ri:checkbox-circle-line'
  },
  children: [
    {
      path: 'test',
      name: 'TestTable',
      component: '/test/table-test',
      meta: { title: 'test' }
    },
    {
      path: 'test2',
      name: 'TestTable2',
      component: '/test/table-test2',
      meta: { title: 'test2' }
    },
    {
      path: 'test3',
      name: 'TestTable3',
      component: '/test/table-test3',
      meta: { title: 'test3' }
    }
  ]
}
