import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
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
      meta: { title: '预约服务', requiresAuth: true },
    },
    {
      path: '/orders',
      name: 'orders',
      component: () => import('@/views/order/list.vue'),
      meta: { title: '我的预约', requiresAuth: true },
    },
    {
      path: '/reviews',
      name: 'reviews',
      component: () => import('@/views/review/index.vue'),
      meta: { title: '客户评价' },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginPage.vue'),
      meta: { title: '登录 - PetCare' },
    },
    {
      path: '/user',
      name: 'user',
      component: () => import('@/views/user/index.vue'),
      meta: { title: '个人中心' },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach(async (to, _from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title as string
  }
  if (to.meta.requiresAuth) {
    const { useUserStore } = await import('@/stores/user')
    const userStore = useUserStore()
    if (!userStore.isLoggedIn) {
      next({ path: '/login', query: { redirect: to.fullPath } })
      return
    }
  }
  next()
})

export default router
