
import { query, closePool } from './server/db';

// 先删除旧的reviews表
await query('DROP TABLE IF EXISTS reviews CASCADE');
console.log('old reviews dropped');

// 重新创建
await query(`CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_name VARCHAR(50) DEFAULT '',
  avatar VARCHAR(500) DEFAULT '',
  service_name VARCHAR(200) DEFAULT '',
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  content TEXT DEFAULT '',
  images TEXT[] DEFAULT '{}',
  pet_type VARCHAR(20) DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
)`);
console.log('reviews table created');

// 创建索引
await query('CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id)');
await query('CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC)');
console.log('indexes created');

await closePool();
console.log('done');
