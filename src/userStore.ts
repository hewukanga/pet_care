/**
 * 用户状态管理 Store（新版本）
 * 对接真实后端登录 API，使用 SM4 加密传输密码
 * 注意：此文件为 src/stores/user.ts 的替代版本
 * 由于 sandbox 限制无法修改原文件，请手动将此内容替换 src/stores/user.ts
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo } from '@/types'
import { login as loginApi, fetchCurrentUser } from '@/auth.api'

/** localStorage 中存储 token 的键名 */
const TOKEN_KEY = 'petcare_token'

export const useUserStore = defineStore('user', () => {
  // ===== state =====
  const userInfo = ref<UserInfo | null>(null)
  const isLoggedIn = ref(false)
  const token = ref<string>('')

  // ===== getters =====
  const displayName = computed(() => userInfo.value?.nickname ?? '游客')
  const avatarUrl = computed(() => userInfo.value?.avatar || '')
  const userId = computed(() => userInfo.value?.id || '')

  // ===== actions =====
  function restoreSession() {
    const savedToken = localStorage.getItem(TOKEN_KEY)
    if (savedToken) {
      token.value = savedToken
    }
  }

  async function validateSession(): Promise<boolean> {
    if (!token.value) return false
    try {
      const user = await fetchCurrentUser(token.value)
      userInfo.value = user
      isLoggedIn.value = true
      token.value = user.token
      localStorage.setItem(TOKEN_KEY, user.token)
      return true
    } catch {
      clearSession()
      return false
    }
  }

  async function loginAction(username: string, encryptedPassword: string) {
    const user = await loginApi({ username, password: encryptedPassword })
    userInfo.value = user
    isLoggedIn.value = true
    token.value = user.token
    localStorage.setItem(TOKEN_KEY, user.token)
  }

  function logout() {
    clearSession()
  }

  function clearSession() {
    userInfo.value = null
    isLoggedIn.value = false
    token.value = ''
    localStorage.removeItem(TOKEN_KEY)
  }

  function updateUserInfo(info: Partial<UserInfo>) {
    if (userInfo.value) {
      Object.assign(userInfo.value, info)
    }
  }

  return {
    userInfo,
    isLoggedIn,
    token,
    displayName,
    avatarUrl,
    userId,
    restoreSession,
    validateSession,
    loginAction,
    logout,
    updateUserInfo,
  }
})
