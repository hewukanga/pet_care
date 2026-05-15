/**
 * 日期格式化工具函数
 */

/**
 * 格式化日期为 yyyy-MM-dd
 * @param date 日期对象或时间戳
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date | string | number): string {
  const d = new Date(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * 格式化日期时间为 yyyy-MM-dd HH:mm
 * @param date 日期对象或时间戳
 * @returns 格式化后的日期时间字符串
 */
export function formatDateTime(date: Date | string | number): string {
  const d = new Date(date)
  const dateStr = formatDate(d)
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${dateStr} ${h}:${min}`
}

/**
 * 获取相对时间描述（如"刚刚"、"5分钟前"）
 * @param date 日期
 * @returns 相对时间描述
 */
export function getRelativeTime(date: Date | string | number): string {
  const now = Date.now()
  const past = new Date(date).getTime()
  const diff = now - past
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}小时前`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}天前`
  return formatDate(date)
}
