/**
 * 预约数据访问层
 * 封装所有预约相关的数据库操作
 * 使用参数化查询防止 SQL 注入
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
  user_id: string | null
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
  userId?: string | null
}

/**
 * 创建预约
 * 使用数据库函数生成订单编号，一条 SQL 完成插入并返回完整记录
 *
 * @param params 预约参数
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
    params.userId || null,
  ])

  return result.rows[0] as BookingRecord
}

/**
 * 分页查询预约列表
 * （匿名用户可按订单号查询自己的预约）
 *
 * @param page 页码
 * @param pageSize 每页数量
 * @param userId 可选用户ID
 * @param orderNo 可选订单号（匿名查询）
 * @returns 预约列表和总数
 */
export async function fetchBookingList(
  page: number,
  pageSize: number,
  userId?: string | null,
  orderNo?: string
): Promise<{ records: BookingRecord[]; total: number }> {
  const conditions: string[] = []
  const params: unknown[] = []
  let paramIndex = 1

  if (userId) {
    conditions.push(`user_id = $${paramIndex++}`)
    params.push(userId)
  }

  if (orderNo) {
    conditions.push(`order_no = $${paramIndex++}`)
    params.push(orderNo)
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  // 查询总数
  const countSql = `SELECT COUNT(*) AS total FROM bookings ${whereClause}`
  const countResult = await query(countSql, params)
  const total = parseInt(countResult.rows[0].total, 10)

  // 分页查询列表
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
 * 取消预约（仅限 PENDING 状态）
 * 使用事务确保原子性：先检查状态再更新
 *
 * @param id 预约ID
 * @param orderNo 订单编号（用于匿名用户校验）
 * @returns 是否取消成功
 */
export async function cancelBooking(id: string, orderNo?: string): Promise<boolean> {
  const client = await getClient()

  try {
    await client.query('BEGIN')

    // 锁定行并检查状态
    const conditions = ['id = $1']
    const lockParams: unknown[] = [id]
    if (orderNo) {
      conditions.push('order_no = $2')
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

    // 更新状态
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
