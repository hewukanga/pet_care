/**
 * 格式化工具函数
 * 提供金额、电话等格式化能力
 */

/**
 * 格式化金额为人民币显示
 * @param amount 金额（分或元，根据 isFen 判断）
 * @param isFen 是否为分单位，默认 false（元）
 * @returns 格式化后的金额字符串，如 ¥128.00
 */
export function formatPrice(amount: number, isFen = false): string {
  const yuan = isFen ? amount / 100 : amount
  return `¥${yuan.toFixed(2)}`
}

/**
 * 格式化手机号为 138****1234 形式
 * @param phone 手机号
 * @returns 脱敏后的手机号
 */
export function maskPhone(phone: string): string {
  if (phone.length !== 11) return phone
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

/**
 * 获取订单编号简短展示
 * @param orderNo 完整订单编号
 * @returns 截短后的订单编号（取后8位）
 */
export function shortOrderNo(orderNo: string): string {
  if (orderNo.length <= 8) return orderNo
  return '…' + orderNo.slice(-8)
}
