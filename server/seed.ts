/**
 * 数据库种子脚本
 */

import 'dotenv/config'
import { query, closePool, testConnection } from './db'
import { encryptPassword, findUserByUsername } from './user.dao'

async function seed() {
  console.log('=== PetCare DB Init ===')

  const dbOk = await testConnection()
  if (!dbOk) {
    console.error('DB connection failed')
    process.exit(1)
  }

  console.log('Initializing admin password...')
  const encryptedPwd = encryptPassword('admin123')

  const adminUser = await findUserByUsername('admin')
  if (adminUser) {
    await query('UPDATE users SET password = $1 WHERE username = $2', [encryptedPwd, 'admin'])
    console.log('Admin password updated')
  } else {
    console.log('Admin user not found, please run migrations first')
  }

  console.log('')
  console.log('Default admin account:')
  console.log('  Username: admin')
  console.log('  Password: admin123')
  console.log('  SM4 Key: a3f7b2c9d1e8f4567890abcdef123456')
  console.log('')

  await closePool()
  console.log('Done')
}

seed().catch((error) => {
  console.error('Seed failed:', error)
  process.exit(1)
})
