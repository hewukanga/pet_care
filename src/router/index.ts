/**
 * Vue Router 路由配置
 * 定义应用的页面路由和导航守卫
 */

import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  // 使用 hash 模式，方便部署到静态服务器
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/home/index.vue'),
      meta: { title: 'PetCare - 宠物洗护专家' },
    },
    {
      path: '/services',
      name: 'service-list',
      component: () => import('@/views/service/list.vue'),
      meta: { title: '服务项目' },
    },
    {
      path: '/service/:id',
      name: 'service-detail',
      component: () => import('@/views/service/detail.vue'),
      meta: { title: '服务详情' },
    },
    {
      path: '/booking',
      name: 'booking',
      component: () => import('@/views/booking/index.vue'),
      meta: { title: '预约服务' },
    },
    {
      path: '/orders',
      name: 'orders',
      component: () => import('@/views/order/list.vue'),
      meta: { title: '我的预约' },
    },
    {
      path: '/user',
      name: 'user',
      component: () => import('@/views/user/index.vue'),
      meta: { title: '个人中心' },
    },
    {
      // 404 兜底
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
  // 页面切换时滚动到顶部
  scrollBehavior() {
    return { top: 0 }
  },
})

/** 全局前置守卫：设置页面标题 */
router.beforeEach((to) => {
  if (to.meta.title) {
    document.title = to.meta.title as string
  }
})

export default router
