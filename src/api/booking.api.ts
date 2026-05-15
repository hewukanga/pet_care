/**
 * 预约模块 API
 * 封装预约相关的后端接口调用
 */

import type { Booking, BookingFormData, PageResult, PageQuery } from '@/types'
import { BookingStatus, PetType } from '@/types'

/** 模拟预约数据存储 */
const mockBookings: Booking[] = [
  {
    id: 'b1',
    orderNo: 'PC202605150001',
    serviceId: 's1',
    serviceName: '精致洗护套餐（小型犬）',
    bookingDate: '2026-05-20',
    timeSlot: '10:00-11:00',
    petName: '豆豆',
    petType: PetType.DOG_SMALL,
    petBreed: '泰迪',
    remark: '比较胆小，请温柔对待',
    status: BookingStatus.CONFIRMED,
    price: 128,
    createdAt: '2026-05-14 15:30:00',
  },
  {
    id: 'b2',
    orderNo: 'PC202605140002',
    serviceId: 's4',
    serviceName: '猫咪安心洗护',
    bookingDate: '2026-05-18',
    timeSlot: '14:00-15:00',
    petName: '咪咪',
    petType: PetType.CAT,
    petBreed: '英短',
    remark: '',
    status: BookingStatus.PENDING,
    price: 158,
    createdAt: '2026-05-14 10:00:00',
  },
  {
    id: 'b3',
    orderNo: 'PC202605100003',
    serviceId: 's2',
    serviceName: '精致洗护套餐（中型犬）',
    bookingDate: '2026-05-12',
    timeSlot: '09:00-10:00',
    petName: '旺财',
    petType: PetType.DOG_MEDIUM,
    petBreed: '柯基',
    remark: '屁股需要多洗洗',
    status: BookingStatus.COMPLETED,
    price: 168,
    createdAt: '2026-05-10 08:30:00',
  },
]

/**
 * 提交预约
 * @param data 预约表单数据
 * @returns 创建成功的预约信息
 */
export async function submitBooking(data: BookingFormData): Promise<Booking> {
  await new Promise((r) => setTimeout(r, 500))
  const booking: Booking = {
    id: `b${Date.now()}`,
    orderNo: `PC${new Date().toISOString().replace(/\D/g, '').slice(0, 14)}`,
    serviceId: data.serviceId,
    serviceName: '',
    bookingDate: data.bookingDate,
    timeSlot: data.timeSlot,
    petName: data.petName,
    petType: data.petType,
    petBreed: data.petBreed,
    remark: data.remark,
    status: BookingStatus.PENDING,
    price: 0,
    createdAt: new Date().toISOString(),
  }
  mockBookings.unshift(booking)
  return booking
}

/**
 * 获取用户预约列表
 * @param query 分页查询参数
 * @returns 分页预约列表
 */
export async function fetchBookingList(query: PageQuery): Promise<PageResult<Booking>> {
  await new Promise((r) => setTimeout(r, 300))
  const start = (query.page - 1) * query.pageSize
  return {
    records: mockBookings.slice(start, start + query.pageSize),
    total: mockBookings.length,
    page: query.page,
    pageSize: query.pageSize,
  }
}

/**
 * 取消预约
 * @param id 预约ID
 * @returns 是否取消成功
 */
export async function cancelBooking(id: string): Promise<boolean> {
  await new Promise((r) => setTimeout(r, 300))
  const booking = mockBookings.find((b) => b.id === id)
  if (booking && booking.status === BookingStatus.PENDING) {
    booking.status = BookingStatus.CANCELLED
    return true
  }
  return false
}
