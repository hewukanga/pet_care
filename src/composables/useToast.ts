/**
 * Toast 轻提示 Composable
 * 提供全局消息提示能力
 */

import { ref } from 'vue'

/** Toast 类型 */
type ToastType = 'success' | 'error' | 'info'

/** Toast 消息项 */
interface ToastItem {
  id: number
  message: string
  type: ToastType
}

/** Toast 全局状态（模块级单例） */
const toasts = ref<ToastItem[]>([])
let nextId = 0

/**
 * 显示一条 Toast 消息
 * @param message 消息内容
 * @param type 消息类型，默认 'info'
 * @param duration 显示时长（ms），默认 2000
 */
function showToast(message: string, type: ToastType = 'info', duration = 2000) {
  const id = nextId++
  toasts.value.push({ id, message, type })
  setTimeout(() => {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }, duration)
}

export function useToast() {
  return {
    toasts,
    /** 成功提示 */
    success: (msg: string) => showToast(msg, 'success'),
    /** 错误提示 */
    error: (msg: string) => showToast(msg, 'error'),
    /** 普通提示 */
    info: (msg: string) => showToast(msg, 'info'),
  }
}
