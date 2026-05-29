/**
 * 预约 API 路由
 * 所有操作需认证，从 token 中解析当前用户ID
 */

import { Router, type Request, type Response } from 'express'
import type { BookingRecord } from './booking.dao'
import * as bookingDao from './booking.dao'
import { parseToken } from './user.dao'

const router = Router()

/**
 * 从请求头中提取并验证当前登录用户ID
 * @param req Express 请求对象
 * @returns 用户ID，未认证返回 null
 */
function getCurrentUserId(req: Request): string | null {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return parseToken(authHeader.substring(7))
}

/**
 * 将数据库预约记录转换为 API 响应格式
 * @param b 数据库原始记录
 * @returns API 友好的预约对象
 */
function toBookingDTO(b: BookingRecord) {
  return {
    id: b.id,
    orderNo: b.order_no,
    serviceId: b.service_id,
    serviceName: b.service_name,
    bookingDate: b.booking_date,
    timeSlot: b.time_slot,
    petName: b.pet_name,
    petType: b.pet_type,
    petBreed: b.pet_breed,
    remark: b.remark,
    status: b.status,
    price: Number(b.price),
    createdAt: b.created_at,
  }
}

/**
 * POST /api/bookings
 * 创建预约（需登录）
 */
router.post('/bookings', async (req: Request, res: Response) => {
  try {
    const userId = getCurrentUserId(req)
    if (!userId) {
      res.status(401).json({ code: 401, message: '请先登录', data: null })
      return
    }

    const {
      serviceId, serviceName, bookingDate, timeSlot,
      petName, petType, petBreed, remark, price,
    } = req.body

    if (!serviceId || !serviceName || !bookingDate || !timeSlot || !petName || !petBreed) {
      res.status(400).json({
        code: 400,
        message: '缺少必填字段',
        data: null,
      })
      return
    }

    const booking = await bookingDao.createBooking({
      serviceId,
      serviceName,
      bookingDate,
      timeSlot,
      petName,
      petType: petType || 'DOG_SMALL',
      petBreed,
      remark: remark || '',
      price: price || 0,
      userId,
    })

    res.status(201).json({
      code: 201,
      message: '预约创建成功',
      data: toBookingDTO(booking),
    })
  } catch (error) {
    console.error('创建预约失败:', error)
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null,
    })
  }
})

/**
 * GET /api/bookings
 * 查询预约列表（需登录，仅返回当前用户的预约）
 */
router.get('/bookings', async (req: Request, res: Response) => {
  try {
    const userId = getCurrentUserId(req)
    if (!userId) {
      res.status(401).json({ code: 401, message: '请先登录', data: null })
      return
    }

    const page = Math.max(1, parseInt((req.query.page as string) || '1'))
    const pageSize = Math.min(50, Math.max(1, parseInt((req.query.pageSize as string) || '20')))
    const orderNo = (req.query.orderNo as string) || undefined

    const { records, total } = await bookingDao.fetchBookingList(
      page, pageSize, userId, orderNo
    )

    res.json({
      code: 200,
      message: '查询成功',
      data: {
        records: records.map(toBookingDTO),
        total,
        page,
        pageSize,
      },
    })
  } catch (error) {
    console.error('查询预约列表失败:', error)
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null,
    })
  }
})

/**
 * PUT /api/bookings/:id/cancel
 * 取消预约（需登录，只能取消自己的预约）
 */
router.put('/bookings/:id/cancel', async (req: Request, res: Response) => {
  try {
    const userId = getCurrentUserId(req)
    if (!userId) {
      res.status(401).json({ code: 401, message: '请先登录', data: null })
      return
    }

    const id = req.params.id as string
    const { orderNo } = req.body

    const success = await bookingDao.cancelBooking(id, userId, orderNo)

    if (success) {
      res.json({ code: 200, message: '取消成功', data: null })
    } else {
      res.status(400).json({ code: 400, message: '取消失败：预约不存在、不属于您或状态不允许取消', data: null })
    }
  } catch (error) {
    console.error('取消预约失败:', error)
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null,
    })
  }
})

export default router
