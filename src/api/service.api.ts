/**
 * 服务模块 API
 * 封装服务相关的后端接口调用
 */

import type { ServiceItem, PageResult, PageQuery } from '@/types'
import { MOCK_SERVICES } from '@/constants/service.mock'

/**
 * 模拟网络延迟
 * @param ms 延迟毫秒数
 */
async function mockDelay(ms = 250): Promise<void> {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

/**
 * 获取服务列表
 * @param query 分页查询参数
 * @param category 可选分类筛选
 * @returns 分页服务列表
 */
export async function fetchServiceList(
  query: PageQuery,
  category?: string
): Promise<PageResult<ServiceItem>> {
  await mockDelay(300)
  let list = MOCK_SERVICES.filter((s) => s.active)
  if (category) {
    list = list.filter((s) => s.category === category)
  }
  const start = (query.page - 1) * query.pageSize
  return {
    records: list.slice(start, start + query.pageSize),
    total: list.length,
    page: query.page,
    pageSize: query.pageSize,
  }
}

/**
 * 获取服务详情
 * @param id 服务ID
 * @returns 服务信息，不存在则返回 null
 */
export async function fetchServiceDetail(id: string): Promise<ServiceItem | null> {
  await mockDelay(200)
  return MOCK_SERVICES.find((s) => s.id === id) ?? null
}

/**
 * 获取热门服务
 * @param limit 返回数量上限
 * @returns 热门服务列表
 */
export async function fetchHotServices(limit = 4): Promise<ServiceItem[]> {
  await mockDelay(200)
  return MOCK_SERVICES.filter((s) => s.hot && s.active).slice(0, limit)
}