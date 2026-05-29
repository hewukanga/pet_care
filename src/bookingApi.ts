import type { Booking, BookingFormData, PageResult, PageQuery } from '@/types'
import { fetchWithTimeout, assertOk } from '@/utils/http'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api'

/**
 * 提交预约
 * @param data 预约表单数据
 * @param token 认证 token
 * @returns 创建成功的预约信息
 */
export async function submitBooking(
  data: BookingFormData & { serviceName?: string; price?: number },
  token: string
): Promise<Booking> {
  const res = await fetchWithTimeout(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
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

  await assertOk(res, '预约提交失败')
  const json = await res.json()
  return json.data as Booking
}

/**
 * 获取预约列表
 * @param query 分页查询参数
 * @param token 认证 token
 * @returns 分页预约列表
 */
export async function fetchBookingList(
  query: PageQuery,
  token: string
): Promise<PageResult<Booking>> {
  const params = new URLSearchParams({
    page: String(query.page),
    pageSize: String(query.pageSize),
  })

  const res = await fetchWithTimeout(`${API_BASE}/bookings?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  await assertOk(res, '查询预约列表失败')
  const json = await res.json()
  return json.data as PageResult<Booking>
}

/**
 * 取消预约
 * @param id 预约ID
 * @param token 认证 token
 * @param orderNo 订单编号
 * @returns 是否取消成功
 */
export async function cancelBooking(
  id: string,
  token: string,
  orderNo?: string
): Promise<boolean> {
  const res = await fetchWithTimeout(`${API_BASE}/bookings/${id}/cancel`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ orderNo }),
  })

  await assertOk(res, '取消预约失败')
  const json = await res.json()
  return json.code === 200
}
