-- ============================================
-- PetCare 评价表迁移
-- 创建时间：2026-05-29
-- 说明：存储用户评价信息，关联用户表
-- ============================================

-- 1. 创建评价表
CREATE TABLE IF NOT EXISTS reviews (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_name     VARCHAR(50) NOT NULL DEFAULT '',
  avatar        VARCHAR(500) DEFAULT '',
  service_name  VARCHAR(200) NOT NULL DEFAULT '',
  rating        INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content       TEXT DEFAULT '',
  images        TEXT[] DEFAULT '{}',
  pet_type      VARCHAR(20) DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. 创建索引
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- 3. 表注释
COMMENT ON TABLE reviews IS '用户评价表';
COMMENT ON COLUMN reviews.user_id IS '关联用户ID';
COMMENT ON COLUMN reviews.user_name IS '用户名称';
COMMENT ON COLUMN reviews.rating IS '评分 1-5';
COMMENT ON COLUMN reviews.content IS '评价内容';
