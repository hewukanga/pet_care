/**
 * 预约数据访问层
 * 封装所有预约相关的数据库操作
 * 使用参数化查询防止 SQL 注入
 * 所有操作需绑定登录用户ID
 */

import { query, getClient } from './db'

/** 预约记录类型 */
export interface BookingRecord {
  id: string
  order_no: string
  service_id: string
  service_name: string
  booking_date: string
  time_slot: string
  pet_name: string
  pet_type: string
  pet_breed: string
  remark: string
  status: string
  price: number
  user_id: string
  created_at: string
  updated_at: string
}

/** 创建预约参数 */
export interface CreateBookingParams {
  serviceId: string
  serviceName: string
  bookingDate: string
  timeSlot: string
  petName: string
  petType: string
  petBreed: string
  remark?: string
  price: number
  userId: string
}

/**
 * 创建预约
 * @param params 预约参数（含登录用户ID）
 * @returns 创建的预约记录
 */
export async function createBooking(params: CreateBookingParams): Promise<BookingRecord> {
  const sql = `
    INSERT INTO bookings (
      order_no, service_id, service_name, booking_date, time_slot,
      pet_name, pet_type, pet_breed, remark, status, price, user_id
    ) VALUES (
      generate_order_no(), $1, $2, $3, $4,
      $5, $6, $7, $8, 'PENDING', $9, $10
    )
    RETURNING *
  `

  const result = await query(sql, [
    params.serviceId,
    params.serviceName,
    params.bookingDate,
    params.timeSlot,
    params.petName,
    params.petType,
    params.petBreed,
    params.remark || '',
    params.price,
    params.userId,
  ])

  return result.rows[0] as BookingRecord
}

/**
 * 分页查询预约列表
 * 默认只查询当前登录用户的预约
 * @param page 页码
 * @param pageSize 每页数量
 * @param userId 当前登录用户ID（必填）
 * @param orderNo 可选订单号
 * @returns 预约列表和总数
 */
export async function fetchBookingList(
  page: number,
  pageSize: number,
  userId: string,
  orderNo?: string
): Promise<{ records: BookingRecord[]; total: number }> {
  const conditions: string[] = []
  const params: unknown[] = []
  let paramIndex = 1

  conditions.push(`user_id = $${paramIndex++}`)
  params.push(userId)

  if (orderNo) {
    conditions.push(`order_no = $${paramIndex++}`)
    params.push(orderNo)
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`

  const countSql = `SELECT COUNT(*) AS total FROM bookings ${whereClause}`
  const countResult = await query(countSql, params)
  const total = parseInt(countResult.rows[0].total, 10)

  const offset = (page - 1) * pageSize
  const listSql = `
    SELECT * FROM bookings
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${paramIndex++} OFFSET $${paramIndex++}
  `
  params.push(pageSize, offset)
  const listResult = await query(listSql, params)

  return {
    records: listResult.rows as BookingRecord[],
    total,
  }
}

/**
 * 取消预约
 * @param id 预约ID
 * @param userId 当前登录用户ID
 * @param orderNo 订单编号
 * @returns 是否取消成功
 */
export async function cancelBooking(id: string, userId: string, orderNo?: string): Promise<boolean> {
  const client = await getClient()

  try {
    await client.query('BEGIN')

    const conditions = ['id = $1', 'user_id = $2']
    const lockParams: unknown[] = [id, userId]
    if (orderNo) {
      conditions.push('order_no = $3')
      lockParams.push(orderNo)
    }

    const lockSql = `
      SELECT status FROM bookings
      WHERE ${conditions.join(' AND ')}
      FOR UPDATE
    `
    const lockResult = await client.query(lockSql, lockParams)

    if (lockResult.rowCount === 0) {
      await client.query('ROLLBACK')
      return false
    }

    const currentStatus = lockResult.rows[0].status
    if (currentStatus !== 'PENDING') {
      await client.query('ROLLBACK')
      return false
    }

    const updateSql = `
      UPDATE bookings SET status = 'CANCELLED'
      WHERE ${conditions.join(' AND ')}
    `
    await client.query(updateSql, lockParams)
    await client.query('COMMIT')
    return true
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('取消预约失败:', error)
    throw error
  } finally {
    client.release()
  }
}
