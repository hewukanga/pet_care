-- ============================================
-- PetCare 改造预约表和评价表 - 绑定用户
-- 创建时间：2026-05-29
-- 说明：
--   1. 将 bookings 表的 user_id 改为 NOT NULL 并添加外键
--   2. 将已有预约数据绑定到默认管理员账号
--   3. 将已有评价数据绑定到默认管理员账号
-- ============================================

-- 步骤1：将 bookings 表中 user_id 为 NULL 的历史数据绑定到默认管理员
-- 默认管理员用户名: admin
UPDATE bookings SET user_id = (SELECT id FROM users WHERE username = 'admin' LIMIT 1)
WHERE user_id IS NULL;

-- 步骤2：将 reviews 表中所有历史数据绑定到默认管理员（如果已存在reviews表且有数据）
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'reviews') THEN
    UPDATE reviews SET user_id = (SELECT id FROM users WHERE username = 'admin' LIMIT 1)
    WHERE user_id IS NULL OR user_id::text = '';
  END IF;
END $$;

-- 步骤3：为 bookings 表添加外键约束（如果 user_id 有值则必须引用有效用户）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_bookings_user_id'
  ) THEN
    ALTER TABLE bookings
      ADD CONSTRAINT fk_bookings_user_id
      FOREIGN KEY (user_id) REFERENCES users(id)
      ON DELETE SET NULL;
  END IF;
END $$;
