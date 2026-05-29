import type { Review, ReviewStats, PageResult, PageQuery } from '@/types'
import { fetchWithTimeout, assertOk } from '@/utils/http'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api'

/**
 * 获取评价列表（公开）
 */
export async function fetchReviewList(query: PageQuery): Promise<PageResult<Review>> {
  const params = new URLSearchParams({
    page: String(query.page),
    pageSize: String(query.pageSize),
  })
  const res = await fetchWithTimeout(`${API_BASE}/reviews?${params}`)
  await assertOk(res, '查询评价列表失败')
  const json = await res.json()
  return json.data as PageResult<Review>
}

/**
 * 获取我的评价列表（需登录）
 */
export async function fetchMyReviewList(
  query: PageQuery,
  token: string
): Promise<PageResult<Review>> {
  const params = new URLSearchParams({
    page: String(query.page),
    pageSize: String(query.pageSize),
  })
  const res = await fetchWithTimeout(`${API_BASE}/reviews/my?${params}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  })
  await assertOk(res, '查询我的评价失败')
  const json = await res.json()
  return json.data as PageResult<Review>
}

/**
 * 创建评价（需登录）
 */
export async function createReview(
  data: { serviceName: string; rating: number; content: string; images?: string[]; petType?: string },
  token: string
): Promise<Review> {
  const res = await fetchWithTimeout(`${API_BASE}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  await assertOk(res, '创建评价失败')
  const json = await res.json()
  return json.data as Review
}

/**
 * 删除评价（需登录，只能删除自己的）
 */
export async function deleteReview(id: string, token: string): Promise<boolean> {
  const res = await fetchWithTimeout(`${API_BASE}/reviews/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  })
  await assertOk(res, '删除评价失败')
  const json = await res.json()
  return json.code === 200
}

/**
 * 获取评价统计（公开）
 */
export async function fetchReviewStats(): Promise<ReviewStats> {
  const res = await fetchWithTimeout(`${API_BASE}/reviews/stats`)
  await assertOk(res, '查询评价统计失败')
  const json = await res.json()
  return json.data as ReviewStats
}
