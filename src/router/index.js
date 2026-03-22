import { createRouter, createWebHashHistory } from 'vue-router';
const Layout = () => import('@/layout/index.vue');
const routers = [
    {
        path: '/',
        component: Layout,
        name: 'Root',
        redirect: '/test',
        children: [
            {
                path: '/test',
                component: () => import('@/views/table-test.vue'),
                name: 'test',
                meta: {
                    hidden: true,
                    canTo: true
                }
            },
        ]
    },
];

const allRouters = [...routers];
export const router = createRouter({
    history: createWebHashHistory(),
    strict: true,
    routes: allRouters,
    scrollBehavior: () => ({ left: 0, top: 0 })
});
