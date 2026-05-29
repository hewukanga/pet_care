/**
 * 评价数据访问层
 * 封装评价相关的数据库操作
 * 使用参数化查询防止 SQL 注入
 * 支持按用户过滤（仅查询当前用户的评价）
 */

import { query } from './db'

/** 评价记录类型 */
export interface ReviewRecord {
  id: string
  user_id: string
  user_name: string
  avatar: string
  service_name: string
  rating: number
  content: string
  images: string[]
  pet_type: string | null
  created_at: string
}

/**
 * 分页查询评价列表
 * 按创建时间倒序排列
 * 可指定 userId 仅查询该用户的评价；不指定则查全部
 *
 * @param page 页码
 * @param pageSize 每页数量
 * @param userId 可选，仅查询指定用户的评价
 * @returns 评价列表和总数
 */
export async function fetchReviewList(
  page: number,
  pageSize: number,
  userId?: string
): Promise<{ records: ReviewRecord[]; total: number }> {
  let whereClause = ''
  const params: unknown[] = []
  let paramIndex = 1

  if (userId) {
    whereClause = `WHERE user_id = $${paramIndex++}`
    params.push(userId)
  }

  const countResult = await query(
    `SELECT COUNT(*) AS total FROM reviews ${whereClause}`,
    params
  )
  const total = parseInt(countResult.rows[0].total, 10)

  const offset = (page - 1) * pageSize
  // 需要重新复制params因为count查询已经消耗了一次
  const listParams = [...params, pageSize, offset]
  const listParamIdx = paramIndex
  const listResult = await query(
    `SELECT * FROM reviews ${whereClause} ORDER BY created_at DESC LIMIT $${listParamIdx} OFFSET $${listParamIdx + 1}`,
    listParams
  )

  return {
    records: listResult.rows as ReviewRecord[],
    total,
  }
}

/**
 * 创建评价
 * @param params 评价参数
 * @returns 创建的评价记录
 */
export async function createReview(params: {
  userId: string
  userName: string
  avatar: string
  serviceName: string
  rating: number
  content: string
  images: string[]
  petType?: string
}): Promise<ReviewRecord> {
  const result = await query(
    `INSERT INTO reviews (user_id, user_name, avatar, service_name, rating, content, images, pet_type)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      params.userId,
      params.userName,
      params.avatar,
      params.serviceName,
      params.rating,
      params.content,
      params.images,
      params.petType || '',
    ]
  )
  return result.rows[0] as ReviewRecord
}

/**
 * 删除评价（仅允许删除自己的评价）
 * @param reviewId 评价ID
 * @param userId 当前用户ID
 * @returns 是否删除成功
 */
export async function deleteReview(reviewId: string, userId: string): Promise<boolean> {
  const result = await query(
    'DELETE FROM reviews WHERE id = $1 AND user_id = $2',
    [reviewId, userId]
  )
  return (result.rowCount ?? 0) > 0
}

/**
 * 获取评价统计信息
 * @returns 平均分、总评价数、各星级分布
 */
export async function fetchReviewStats(): Promise<{
  averageRating: number
  totalCount: number
  distribution: Record<number, number>
}> {
  const result = await query(
    'SELECT AVG(rating)::numeric(2,1) AS average_rating, COUNT(*) AS total_count FROM reviews'
  )
  const { average_rating, total_count } = result.rows[0]

  const distResult = await query(
    'SELECT rating, COUNT(*) AS count FROM reviews GROUP BY rating ORDER BY rating DESC'
  )
  const distribution: Record<number, number> = {}
  for (const row of distResult.rows) {
    distribution[row.rating] = parseInt(row.count, 10)
  }

  return {
    averageRating: parseFloat(average_rating) || 0,
    totalCount: parseInt(total_count, 10),
    distribution,
  }
}
