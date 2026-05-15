/**
 * PostgreSQL 数据库连接池
 * 使用 Supabase Session Pooler 进行数据库操作
 *
 * Session Pooler 特点：
 * - 端口 5432（非 Transaction Pooler 的 6543）
 * - 支持 PREPARE 语句和会话级状态
 * - 适合需要持久连接的后端应用
 */

import { Pool, type PoolConfig } from 'pg'

/**
 * 数据库连接池配置
 * 从环境变量读取，使用 Supabase Session Pooler
 */
const poolConfig: PoolConfig = {
  connectionString: process.env.DATABASE_URL,
  // Session Pooler 配置
  max: 20,                         // 最大连接数
  idleTimeoutMillis: 30000,        // 空闲连接超时（30秒）
  connectionTimeoutMillis: 5000,   // 连接超时（5秒）
  // SSL 配置（Supabase 要求）
  ssl: {
    rejectUnauthorized: false,
  },
}

/** 全局数据库连接池实例 */
const pool = new Pool(poolConfig)

/**
 * 测试数据库连接
 * @returns 是否连接成功
 */
export async function testConnection(): Promise<boolean> {
  try {
    const client = await pool.connect()
    const result = await client.query('SELECT NOW() AS current_time')
    client.release()
    console.log('数据库连接成功, 服务器时间:', result.rows[0].current_time)
    return true
  } catch (error) {
    console.error('数据库连接失败:', error)
    return false
  }
}

/**
 * 执行参数化查询（推荐方式，防止 SQL 注入）
 * @param text SQL 查询语句
 * @param params 查询参数
 * @returns 查询结果
 */
export async function query(text: string, params?: unknown[]) {
  const start = Date.now()
  const result = await pool.query(text, params)
  const duration = Date.now() - start
  console.log(`查询耗时: ${duration}ms, 行数: ${result.rowCount}`)
  return result
}

/**
 * 从连接池获取一个客户端（用于事务操作）
 * @returns 数据库客户端
 */
export async function getClient() {
  return pool.connect()
}

/**
 * 优雅关闭连接池
 */
export async function closePool() {
  await pool.end()
  console.log('数据库连接池已关闭')
}

export default pool
