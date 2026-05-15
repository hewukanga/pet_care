/**
 * 预约模块 API
 * 所有请求走真实后端 API，不再保留模拟数据降级
 */

import type { Booking, BookingFormData, PageResult, PageQuery } from '@/types'

/** 后端 API 基础路径，可通过环境变量 VITE_API_BASE 覆盖 */
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api'

/**
 * 带超时的 fetch 封装
 * @param url 请求地址
 * @param options fetch 选项
 * @param timeoutMs 超时毫秒数
 * @returns Response
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 8000
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { ...options, signal: controller.signal })
    return res
  } finally {
    clearTimeout(timer)
  }
}

/**
 * 提交预约
 * @param data 预约表单数据（含 serviceName 和 price）
 * @returns 创建成功的预约信息
 * @throws 请求失败或后端返回错误时抛出异常
 */
export async function submitBooking(
  data: BookingFormData & { serviceName?: string; price?: number }
): Promise<Booking> {
  const res = await fetchWithTimeout(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      serviceId: data.serviceId,
      serviceName: data.serviceName || '',
      bookingDate: data.bookingDate,
      timeSlot: data.timeSlot,
      petName: data.petName,
      petType: data.petType,
      petBreed: data.petBreed,
      remark: data.remark || '',
      price: data.price || 0,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }))
    throw new Error(err.message || `请求失败 (${res.status})`)
  }

  const json = await res.json()
  return json.data as Booking
}

/**
 * 获取预约列表
 * @param query 分页查询参数
 * @returns 分页预约列表
 */
export async function fetchBookingList(query: PageQuery): Promise<PageResult<Booking>> {
  const params = new URLSearchParams({
    page: String(query.page),
    pageSize: String(query.pageSize),
  })

  const res = await fetchWithTimeout(`${API_BASE}/bookings?${params}`)

  if (!res.ok) {
    throw new Error(`查询预约列表失败 (${res.status})`)
  }

  const json = await res.json()
  return json.data as PageResult<Booking>
}

/**
 * 取消预约（仅 PENDING 状态可取消）
 * @param id 预约ID
 * @param orderNo 订单编号（用于匿名用户校验）
 * @returns 是否取消成功
 */
export async function cancelBooking(id: string, orderNo?: string): Promise<boolean> {
  const res = await fetchWithTimeout(`${API_BASE}/bookings/${id}/cancel`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderNo }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }))
    throw new Error(err.message || `取消失败 (${res.status})`)
  }

  const json = await res.json()
  return json.code === 200
}
