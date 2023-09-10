import { createRouter, createWebHistory } from 'vue-router'
const routes = [
  {
    path: '/',
    component: () => import('@/components/pages/MainPage.vue'),
    name: 'MainPage'
  },
  {
    path: '/chat/:chatId',
    component: () => import('@/components/pages/ChatPage.vue'),
    name: 'ChatPage'
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
