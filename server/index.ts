/**
 * PetCare 后端服务入口
 * Express 服务器，连接 Supabase PostgreSQL
 */

import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { testConnection, closePool } from './db'
import bookingRoutes from './booking.routes'

const app = express()
const PORT = process.env.PORT || 3001

// ============ 中间件 ============

/** JSON 请求体解析 */
app.use(express.json())

/** CORS 跨域配置（开发环境允许前端 Vite 开发服务器） */
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// ============ 路由 ============

/** 预约相关接口 */
app.use('/api', bookingRoutes)

/** 健康检查 */
app.get('/api/health', async (_req, res) => {
  const dbOk = await testConnection()
  res.json({
    status: dbOk ? 'healthy' : 'degraded',
    database: dbOk ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  })
})

// ============ 全局错误处理 ============

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('未捕获的异常:', err)
  res.status(500).json({
    code: 500,
    message: process.env.NODE_ENV === 'development' ? err.message : '服务器内部错误',
    data: null,
  })
})

// ============ 启动服务 ============

async function start() {
  console.log('正在连接数据库…')
  const dbOk = await testConnection()

  app.listen(PORT, () => {
    console.log(`\n🐾 PetCare API 服务已启动: http://localhost:${PORT}`)
    console.log(`📋 数据库状态: ${dbOk ? '已连接' : '未连接（请检查 DATABASE_URL）'}`)
    console.log(`🌐 环境: ${process.env.NODE_ENV || 'development'}\n`)
  })
}

// 优雅关闭
process.on('SIGINT', async () => {
  console.log('\n正在关闭服务…')
  await closePool()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('\n正在关闭服务…')
  await closePool()
  process.exit(0)
})

start()
