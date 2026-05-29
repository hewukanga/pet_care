/**
 * 评价 API 路由
 * 提供评价的增删查和统计接口
 * 创建和删除操作需登录认证
 */

import { Router, type Request, type Response } from 'express'
import type { ReviewRecord } from './review.dao'
import * as reviewDao from './review.dao'
import { parseToken, findUserById } from './user.dao'

const router = Router()

/**
 * 从请求头中提取当前登录用户ID
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
 * 将数据库评价记录转换为 API 响应格式
 * @param r 数据库原始记录
 * @returns API 友好的评价对象
 */
function toReviewDTO(r: ReviewRecord) {
  return {
    id: r.id,
    userId: r.user_id,
    userName: r.user_name,
    avatar: r.avatar,
    serviceName: r.service_name,
    rating: r.rating,
    content: r.content,
    images: r.images || [],
    petType: r.pet_type || '',
    createdAt: r.created_at,
  }
}

/**
 * GET /api/reviews
 * 查询评价列表（公开接口，无需登录）
 */
router.get('/reviews', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt((req.query.page as string) || '1'))
    const pageSize = Math.min(50, Math.max(1, parseInt((req.query.pageSize as string) || '20')))

    const { records, total } = await reviewDao.fetchReviewList(page, pageSize)

    res.json({
      code: 200,
      message: '查询成功',
      data: {
        records: records.map(toReviewDTO),
        total,
        page,
        pageSize,
      },
    })
  } catch (error) {
    console.error('查询评价列表失败:', error)
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null,
    })
  }
})

/**
 * GET /api/reviews/my
 * 查询当前登录用户的评价列表
 */
router.get('/reviews/my', async (req: Request, res: Response) => {
  try {
    const userId = getCurrentUserId(req)
    if (!userId) {
      res.status(401).json({ code: 401, message: '请先登录', data: null })
      return
    }

    const page = Math.max(1, parseInt((req.query.page as string) || '1'))
    const pageSize = Math.min(50, Math.max(1, parseInt((req.query.pageSize as string) || '20')))

    const { records, total } = await reviewDao.fetchReviewList(page, pageSize, userId)

    res.json({
      code: 200,
      message: '查询成功',
      data: {
        records: records.map(toReviewDTO),
        total,
        page,
        pageSize,
      },
    })
  } catch (error) {
    console.error('查询我的评价失败:', error)
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null,
    })
  }
})

/**
 * POST /api/reviews
 * 创建评价（需登录）
 */
router.post('/reviews', async (req: Request, res: Response) => {
  try {
    const userId = getCurrentUserId(req)
    if (!userId) {
      res.status(401).json({ code: 401, message: '请先登录', data: null })
      return
    }

    // 获取用户信息用于评价展示
    const user = await findUserById(userId)
    if (!user) {
      res.status(401).json({ code: 401, message: '用户不存在', data: null })
      return
    }

    const { serviceName, rating, content, images, petType } = req.body

    if (!serviceName || !rating || !content) {
      res.status(400).json({ code: 400, message: '缺少必填字段：serviceName, rating, content', data: null })
      return
    }

    const review = await reviewDao.createReview({
      userId,
      userName: user.nickname || user.username,
      avatar: user.avatar || '',
      serviceName,
      rating: Math.max(1, Math.min(5, rating)),
      content,
      images: images || [],
      petType: petType || '',
    })

    res.status(201).json({
      code: 201,
      message: '评价创建成功',
      data: toReviewDTO(review),
    })
  } catch (error) {
    console.error('创建评价失败:', error)
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null,
    })
  }
})

/**
 * DELETE /api/reviews/:id
 * 删除评价（需登录，只能删除自己的评价）
 */
router.delete('/reviews/:id', async (req: Request, res: Response) => {
  try {
    const userId = getCurrentUserId(req)
    if (!userId) {
      res.status(401).json({ code: 401, message: '请先登录', data: null })
      return
    }

    const reviewId = req.params.id
    const success = await reviewDao.deleteReview(reviewId, userId)

    if (success) {
      res.json({ code: 200, message: '删除成功', data: null })
    } else {
      res.status(404).json({ code: 404, message: '评价不存在或不属于您', data: null })
    }
  } catch (error) {
    console.error('删除评价失败:', error)
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null,
    })
  }
})

/**
 * GET /api/reviews/stats
 * 获取评价统计（公开接口）
 */
router.get('/reviews/stats', async (_req: Request, res: Response) => {
  try {
    const stats = await reviewDao.fetchReviewStats()
    res.json({
      code: 200,
      message: '查询成功',
      data: stats,
    })
  } catch (error) {
    console.error('查询评价统计失败:', error)
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null,
    })
  }
})

export default router
