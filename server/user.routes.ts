/**
 * 用户 API 路由
 * 提供登录、获取当前用户信息接口
 */

import { Router, type Request, type Response } from 'express'
import * as userDao from './user.dao'

const router = Router()

/**
 * POST /api/auth/login
 * 用户登录接口
 * 请求体：{ username: string, password: string (SM4加密后的密文) }
 * 响应：{ code, message, data: { id, username, nickname, avatar, phone, role, token } }
 */
router.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body

    // 参数校验
    if (!username || !password) {
      res.status(400).json({
        code: 400,
        message: '用户名和密码不能为空',
        data: null,
      })
      return
    }

    // 查找用户
    const user = await userDao.findUserByUsername(username)
    if (!user) {
      res.status(401).json({
        code: 401,
        message: '用户名或密码错误',
        data: null,
      })
      return
    }

    // 验证密码（前端传来的是SM4加密后的密文，与数据库比对）
    // 注意：前端对明文密码做了SM4加密后传输，后端直接比对密文
    if (password !== user.password) {
      res.status(401).json({
        code: 401,
        message: '用户名或密码错误',
        data: null,
      })
      return
    }

    // 登录成功，返回用户信息和 token
    const userDTO = userDao.toUserDTO(user)
    res.json({
      code: 200,
      message: '登录成功',
      data: userDTO,
    })
  } catch (error) {
    console.error('登录失败:', error)
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null,
    })
  }
})

/**
 * GET /api/auth/me
 * 获取当前登录用户信息
 * 请求头：Authorization: Bearer <token>
 * 响应：{ code, message, data: { id, username, nickname, avatar, phone, role } }
 */
router.get('/auth/me', async (req: Request, res: Response) => {
  try {
    // 从请求头中提取 token
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        code: 401,
        message: '未提供有效的认证信息',
        data: null,
      })
      return
    }

    const token = authHeader.substring(7)
    const userId = userDao.parseToken(token)
    if (!userId) {
      res.status(401).json({
        code: 401,
        message: 'Token 无效或已过期',
        data: null,
      })
      return
    }

    const user = await userDao.findUserById(userId)
    if (!user) {
      res.status(401).json({
        code: 401,
        message: '用户不存在或已被禁用',
        data: null,
      })
      return
    }

    // 返回用户信息（重新生成 token 以续期）
    const userDTO = userDao.toUserDTO(user)
    res.json({
      code: 200,
      message: '查询成功',
      data: userDTO,
    })
  } catch (error) {
    console.error('获取用户信息失败:', error)
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null,
    })
  }
})

export default router
