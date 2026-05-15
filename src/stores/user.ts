/**
 * 用户状态管理 Store
 * 管理用户登录状态和个人信息
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo } from '@/types'

/** 模拟当前用户数据 */
const mockUser: UserInfo = {
  id: 'u1',
  nickname: '宠物达人小王',
  avatar: '',
  phone: '138****5678',
}

export const useUserStore = defineStore('user', () => {
  // ===== state =====
  /** 当前用户信息 */
  const userInfo = ref<UserInfo | null>(null)
  /** 是否已登录 */
  const isLoggedIn = ref(false)

  // ===== getters =====
  /** 用户昵称（未登录时显示默认值） */
  const displayName = computed(() => userInfo.value?.nickname ?? '游客')
  /** 用户头像 */
  const avatarUrl = computed(
    () => userInfo.value?.avatar || ''
  )

  // ===== actions =====
  /**
   * 模拟登录
   * 在实际项目中应调用后端登录接口
   */
  function login() {
    userInfo.value = { ...mockUser }
    isLoggedIn.value = true
  }

  /**
   * 退出登录
   */
  function logout() {
    userInfo.value = null
    isLoggedIn.value = false
  }

  /**
   * 更新用户信息
   * @param info 新的用户信息
   */
  function updateUserInfo(info: Partial<UserInfo>) {
    if (userInfo.value) {
      Object.assign(userInfo.value, info)
    }
  }

  return {
    userInfo,
    isLoggedIn,
    displayName,
    avatarUrl,
    login,
    logout,
    updateUserInfo,
  }
})
