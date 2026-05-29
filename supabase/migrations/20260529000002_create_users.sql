-- ============================================
-- PetCare 用户表迁移
-- 创建时间：2026-05-29
-- 说明：存储平台用户信息，支持SM4加密登录
-- ============================================

-- 1. 创建用户角色枚举
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'ADMIN',
    'USER'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2. 创建用户主表
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username      VARCHAR(50) NOT NULL UNIQUE,
  password      VARCHAR(256) NOT NULL,
  nickname      VARCHAR(50) NOT NULL DEFAULT '',
  avatar        VARCHAR(500) DEFAULT '',
  phone         VARCHAR(20) DEFAULT '',
  role          user_role NOT NULL DEFAULT 'USER',
  active        BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

INSERT INTO users (username, password, nickname, role, active)
VALUES (
  'admin',
  'PLACEHOLDER_WILL_BE_UPDATED_BY_SEED_SCRIPT',
  '管理员',
  'ADMIN',
  true
)
ON CONFLICT (username) DO NOTHING;

COMMENT ON TABLE users IS '平台用户表';
COMMENT ON COLUMN users.id IS '主键 UUID';
COMMENT ON COLUMN users.username IS '登录用户名';
COMMENT ON COLUMN users.password IS 'SM4加密密文';
COMMENT ON COLUMN users.nickname IS '用户昵称';
COMMENT ON COLUMN users.role IS '用户角色';
