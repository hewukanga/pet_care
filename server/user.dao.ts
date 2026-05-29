/**
 * 用户数据访问层
 * 封装用户相关的数据库操作
 * 使用参数化查询防止 SQL 注入
 */

import { query } from './db'
import smCrypto from 'sm-crypto'
const { sm4 } = smCrypto

/** SM4 加密密钥（128位十六进制字符串） */
const SM4_KEY = 'a3f7b2c9d1e8f4567890abcdef123456'

/** 用户记录类型 */
export interface UserRecord {
  id: string
  username: string
  password: string
  nickname: string
  avatar: string
  phone: string
  role: string
  active: boolean
  created_at: string
  updated_at: string
}

/** 用户登录响应类型（不包含密码） */
export interface UserDTO {
  id: string
  username: string
  nickname: string
  avatar: string
  phone: string
  role: string
  token: string
}

/**
 * 使用 SM4 加密明文密码
 * @param plainPassword 明文密码
 * @returns 加密后的十六进制密文
 */
export function encryptPassword(plainPassword: string): string {
  return sm4.encrypt(plainPassword, SM4_KEY)
}

/**
 * 验证密码是否匹配
 * @param plainPassword 明文密码
 * @param encryptedPassword 数据库中存储的加密密码
 * @returns 是否匹配
 */
export function verifyPassword(plainPassword: string, encryptedPassword: string): boolean {
  const encrypted = sm4.encrypt(plainPassword, SM4_KEY)
  return encrypted === encryptedPassword
}

/**
 * 生成简易认证 Token
 * 格式：sm4(userId:timestamp)
 * @param userId 用户ID
 * @returns Base64 编码的 token
 */
export function generateToken(userId: string): string {
  const payload = userId + ':' + Date.now().toString()
  const encrypted = sm4.encrypt(payload, SM4_KEY)
  return Buffer.from(encrypted).toString('base64')
}

/**
 * 从 Token 中解析出用户ID
 * @param token 认证 token
 * @returns 用户ID，无效 token 返回 null
 */
export function parseToken(token: string): string | null {
  try {
    const encrypted = Buffer.from(token, 'base64').toString('utf-8')
    const decrypted = sm4.decrypt(encrypted, SM4_KEY)
    // 格式：userId:timestamp
    const parts = decrypted.split(':')
    if (parts.length >= 1 && parts[0]) {
      return parts[0]
    }
    return null
  } catch {
    return null
  }
}

/**
 * 根据用户名查找用户
 * @param username 用户名
 * @returns 用户记录或 null
 */
export async function findUserByUsername(username: string): Promise<UserRecord | null> {
  const result = await query(
    'SELECT * FROM users WHERE username = $1 AND active = true',
    [username]
  )
  return result.rows[0] as UserRecord || null
}

/**
 * 根据用户ID查找用户
 * @param id 用户ID
 * @returns 用户记录或 null
 */
export async function findUserById(id: string): Promise<UserRecord | null> {
  const result = await query(
    'SELECT * FROM users WHERE id = $1 AND active = true',
    [id]
  )
  return result.rows[0] as UserRecord || null
}

/**
 * 将用户记录转换为安全的 DTO（去除密码）
 * @param user 用户数据库记录
 * @returns 安全的前端用户对象
 */
export function toUserDTO(user: UserRecord): UserDTO {
  return {
    id: user.id,
    username: user.username,
    nickname: user.nickname,
    avatar: user.avatar,
    phone: user.phone,
    role: user.role,
    token: generateToken(user.id),
  }
}

/**
 * 初始化种子数据：更新默认管理员密码为SM4加密密文
 * 在服务启动时调用，确保默认账号密码正确加密
 */
export async function seedDefaultAdmin(): Promise<void> {
  const encryptedPwd = encryptPassword('admin123')
  await query(
    'UPDATE users SET password = $1 WHERE username = $2 AND password LIKE $3',
    [encryptedPwd, 'admin', 'PLACEHOLDER%']
  )
  console.log('默认管理员账号已初始化')
}
