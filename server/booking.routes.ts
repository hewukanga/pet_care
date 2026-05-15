/**
 * 预约 API 路由
 * 提供预约的增删查接口
 */

import { Router, type Request, type Response } from 'express'
import * as bookingDao from './booking.dao'

const router = Router()

/**
 * POST /api/bookings
 * 创建预约
 */
router.post('/bookings', async (req: Request, res: Response) => {
  try {
    const {
      serviceId, serviceName, bookingDate, timeSlot,
      petName, petType, petBreed, remark, price, userId,
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
      userId: userId || null,
    })

    res.status(201).json({
      code: 201,
      message: '预约创建成功',
      data: {
        id: booking.id,
        orderNo: booking.order_no,
        serviceId: booking.service_id,
        serviceName: booking.service_name,
        bookingDate: booking.booking_date,
        timeSlot: booking.time_slot,
        petName: booking.pet_name,
        petType: booking.pet_type,
        petBreed: booking.pet_breed,
        remark: booking.remark,
        status: booking.status,
        price: Number(booking.price),
        createdAt: booking.created_at,
      },
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
 * 查询预约列表
 */
router.get('/bookings', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt((req.query.page as string) || '1'))
    const pageSize = Math.min(50, Math.max(1, parseInt((req.query.pageSize as string) || '20')))
    const userId = (req.query.userId as string) || undefined
    const orderNo = (req.query.orderNo as string) || undefined

    const { records, total } = await bookingDao.fetchBookingList(
      page, pageSize, userId, orderNo
    )

    res.json({
      code: 200,
      message: '查询成功',
      data: {
        records: records.map((b) => ({
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
        })),
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
 * 取消预约
 */
router.put('/bookings/:id/cancel', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const { orderNo } = req.body

    const success = await bookingDao.cancelBooking(id, orderNo)

    if (success) {
      res.json({ code: 200, message: '取消成功', data: null })
    } else {
      res.status(400).json({ code: 400, message: '取消失败：预约不存在或状态不允许取消', data: null })
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
