/**
 * 校验工具函数
 * 提供常用的表单校验方法
 */

/**
 * 校验手机号格式
 * @param phone 手机号
 * @returns 是否有效
 */
export function isValidPhone(phone: string): boolean {
  return /^1[3-9]\d{9}$/.test(phone)
}

/**
 * 校验非空字符串
 * @param value 输入值
 * @returns 是否非空
 */
export function isNotEmpty(value: string | null | undefined): boolean {
  return value !== null && value !== undefined && value.trim().length > 0
}
