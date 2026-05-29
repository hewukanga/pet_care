/**
 * 用户认证模块 API
 * 封装登录、获取用户信息等认证相关接口
 */

import type { UserInfo, Result } from '@/types'
import { fetchWithTimeout, assertOk } from '@/utils/http'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api'

/** 登录请求参数 */
export interface LoginParams {
  username: string
  password: string
}

/**
 * 用户登录
 * 密码在调用前已由调用方使用 SM4 加密
 *
 * @param params 登录参数（密码已加密）
 * @returns 用户信息（含token）
 * @throws 登录失败时抛出异常
 */
export async function login(params: LoginParams): Promise<UserInfo> {
  const res = await fetchWithTimeout(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: params.username,
      password: params.password,
    }),
  })

  await assertOk(res, '登录失败')
  const json: Result<UserInfo> = await res.json()
  if (json.code !== 200) {
    throw new Error(json.message || '登录失败')
  }
  return json.data
}

/**
 * 获取当前登录用户信息（用于 token 续期和验证）
 * @param token 认证 token
 * @returns 用户信息
 */
export async function fetchCurrentUser(token: string): Promise<UserInfo> {
  const res = await fetchWithTimeout(`${API_BASE}/auth/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  })

  await assertOk(res, '获取用户信息失败')
  const json: Result<UserInfo> = await res.json()
  if (json.code !== 200) {
    throw new Error(json.message || '获取用户信息失败')
  }
  return json.data
}
