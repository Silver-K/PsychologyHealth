import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('~/pages/home.vue'),
    redirect: '/list',
    children: [],
  },
  {
    path: '/auth',
    component: () => import('~/pages/authorization.vue'),
  },
  {
    path: '/home',
    component: () => import('~/pages/home.vue'),
    children: [
      /**
       * 参与者信息
       */
      {
        path: '/list',
        component: () => import('~/components/MinorsList.vue'),
      },
      {
        path: '/detail/:id',
        component: () => import('~/components/MinorDetail.vue'),
      },
      {
        path: '/psychology/:id',
        component: () => import('~/components/PsyView.vue'),
      },
      /**
       * 问卷量表页
       */
      {
        path: '/qa',
        component: () => import('~/components/QaList.vue'),
      },
      /**
       * 数据统计
       */
      {
        path: '/statics',
        component: () => import('~/components/Statics.vue'),
      }
    ],
  },
  {
    path: '/demo',
    component: () => import('~/pages/demo.vue'),
  },
  {
    path: '/preview',
    component: () => import('~/pages/preview.vue'),
  }
]

export default createRouter({
  routes,
  history: createWebHistory(),
})