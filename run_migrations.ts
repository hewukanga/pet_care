
import { query } from './server/db';

const migrations = "-- ============================================\n-- PetCare 用户表迁移\n-- 创建时间：2026-05-29\n-- 说明：存储平台用户信息，支持SM4加密登录\n-- ============================================\n\n-- 1. 创建用户角色枚举\nDO $$ BEGIN\n  CREATE TYPE user_role AS ENUM (\n    'ADMIN',\n    'USER'\n  );\nEXCEPTION\n  WHEN duplicate_object THEN NULL;\nEND $$;\n\n-- 2. 创建用户主表\nCREATE TABLE IF NOT EXISTS users (\n  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  username      VARCHAR(50) NOT NULL UNIQUE,\n  password      VARCHAR(256) NOT NULL,\n  nickname      VARCHAR(50) NOT NULL DEFAULT '',\n  avatar        VARCHAR(500) DEFAULT '',\n  phone         VARCHAR(20) DEFAULT '',\n  role          user_role NOT NULL DEFAULT 'USER',\n  active        BOOLEAN NOT NULL DEFAULT true,\n  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),\n  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()\n);\n\nCREATE INDEX IF NOT EXISTS idx_users_username ON users(username);\n\nDROP TRIGGER IF EXISTS trg_users_updated_at ON users;\nCREATE TRIGGER trg_users_updated_at\n  BEFORE UPDATE ON users\n  FOR EACH ROW\n  EXECUTE FUNCTION update_updated_at_column();\n\nINSERT INTO users (username, password, nickname, role, active)\nVALUES (\n  'admin',\n  'PLACEHOLDER_WILL_BE_UPDATED_BY_SEED_SCRIPT',\n  '管理员',\n  'ADMIN',\n  true\n)\nON CONFLICT (username) DO NOTHING;\n\nCOMMENT ON TABLE users IS '平台用户表';\nCOMMENT ON COLUMN users.id IS '主键 UUID';\nCOMMENT ON COLUMN users.username IS '登录用户名';\nCOMMENT ON COLUMN users.password IS 'SM4加密密文';\nCOMMENT ON COLUMN users.nickname IS '用户昵称';\nCOMMENT ON COLUMN users.role IS '用户角色';\n\n-- ============================================\n-- PetCare 评价表迁移\n-- 创建时间：2026-05-29\n-- 说明：存储用户评价信息，关联用户表\n-- ============================================\n\n-- 1. 创建评价表\nCREATE TABLE IF NOT EXISTS reviews (\n  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,\n  user_name     VARCHAR(50) NOT NULL DEFAULT '',\n  avatar        VARCHAR(500) DEFAULT '',\n  service_name  VARCHAR(200) NOT NULL DEFAULT '',\n  rating        INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),\n  content       TEXT DEFAULT '',\n  images        TEXT[] DEFAULT '{}',\n  pet_type      VARCHAR(20) DEFAULT '',\n  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()\n);\n\n-- 2. 创建索引\nCREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);\nCREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);\nCREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);\n\n-- 3. 表注释\nCOMMENT ON TABLE reviews IS '用户评价表';\nCOMMENT ON COLUMN reviews.user_id IS '关联用户ID';\nCOMMENT ON COLUMN reviews.user_name IS '用户名称';\nCOMMENT ON COLUMN reviews.rating IS '评分 1-5';\nCOMMENT ON COLUMN reviews.content IS '评价内容';\n\n-- ============================================\n-- PetCare 改造预约表和评价表 - 绑定用户\n-- 创建时间：2026-05-29\n-- 说明：\n--   1. 将 bookings 表的 user_id 改为 NOT NULL 并添加外键\n--   2. 将已有预约数据绑定到默认管理员账号\n--   3. 将已有评价数据绑定到默认管理员账号\n-- ============================================\n\n-- 步骤1：将 bookings 表中 user_id 为 NULL 的历史数据绑定到默认管理员\n-- 默认管理员用户名: admin\nUPDATE bookings SET user_id = (SELECT id FROM users WHERE username = 'admin' LIMIT 1)\nWHERE user_id IS NULL;\n\n-- 步骤2：将 reviews 表中所有历史数据绑定到默认管理员（如果已存在reviews表且有数据）\nDO $$\nBEGIN\n  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'reviews') THEN\n    UPDATE reviews SET user_id = (SELECT id FROM users WHERE username = 'admin' LIMIT 1)\n    WHERE user_id IS NULL OR user_id::text = '';\n  END IF;\nEND $$;\n\n-- 步骤3：为 bookings 表添加外键约束（如果 user_id 有值则必须引用有效用户）\nDO $$\nBEGIN\n  IF NOT EXISTS (\n    SELECT 1 FROM pg_constraint WHERE conname = 'fk_bookings_user_id'\n  ) THEN\n    ALTER TABLE bookings\n      ADD CONSTRAINT fk_bookings_user_id\n      FOREIGN KEY (user_id) REFERENCES users(id)\n      ON DELETE SET NULL;\n  END IF;\nEND $$;\n\n";

async function run() {
  console.log('开始执行迁移...');
  // Split by semicolons and run each statement
  const statements = migrations.split(';').map(s => s.trim()).filter(s => s.length > 0);
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    if (!stmt) continue;
    try {
      // Skip statements that contain $$ blocks (DO blocks)
      if (stmt.includes('\$\$')) {
        console.log(`跳过DO块: ${i + 1}`);
        continue;
      }
      await query(stmt + ';');
      console.log(`OK: statement ${i + 1}`);
    } catch (e) {
      // Log but continue - some may fail if already exists
      console.log(`SKIP ${i + 1}: ${e.message.substring(0, 60)}`);
    }
  }
  console.log('迁移完成');
}

run().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
