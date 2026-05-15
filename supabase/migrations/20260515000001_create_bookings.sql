-- ============================================
-- PetCare 预约表迁移
-- 创建时间：2026-05-15
-- 说明：存储用户宠物洗护预约信息
-- ============================================

-- 1. 创建预约状态枚举类型
DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM (
    'PENDING',    -- 待确认
    'CONFIRMED',  -- 已确认
    'IN_PROGRESS',-- 服务中
    'COMPLETED',  -- 已完成
    'CANCELLED'   -- 已取消
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2. 创建宠物类型枚举
DO $$ BEGIN
  CREATE TYPE pet_type AS ENUM (
    'DOG_SMALL',   -- 小型犬
    'DOG_MEDIUM',  -- 中型犬
    'DOG_LARGE',   -- 大型犬
    'CAT',         -- 猫咪
    'OTHER'        -- 其他宠物
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 3. 创建预约主表
CREATE TABLE IF NOT EXISTS bookings (
  -- 主键
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 订单编号（业务唯一标识）
  order_no      VARCHAR(20) NOT NULL UNIQUE,

  -- 服务信息
  service_id    VARCHAR(50) NOT NULL,
  service_name  VARCHAR(200) NOT NULL,

  -- 预约时间
  booking_date  DATE NOT NULL,
  time_slot     VARCHAR(20) NOT NULL,

  -- 宠物信息
  pet_name      VARCHAR(50) NOT NULL,
  pet_type      pet_type NOT NULL DEFAULT 'DOG_SMALL',
  pet_breed     VARCHAR(50) NOT NULL DEFAULT '',

  -- 备注
  remark        TEXT DEFAULT '',

  -- 预约状态
  status        booking_status NOT NULL DEFAULT 'PENDING',

  -- 价格（单位：元）
  price         NUMERIC(10, 2) NOT NULL DEFAULT 0,

  -- 用户关联（可选，支持匿名预约）
  user_id       UUID,

  -- 时间戳
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. 创建索引
-- 按用户查询
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
-- 按预约日期查询
CREATE INDEX IF NOT EXISTS idx_bookings_booking_date ON bookings(booking_date);
-- 按状态查询
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
-- 按创建时间倒序（列表查询最常用）
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);
-- 按订单号查询
CREATE INDEX IF NOT EXISTS idx_bookings_order_no ON bookings(order_no);
-- 复合索引：用户 + 状态
CREATE INDEX IF NOT EXISTS idx_bookings_user_status ON bookings(user_id, status);

-- 5. 创建更新时间自动触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_bookings_updated_at ON bookings;
CREATE TRIGGER trg_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 6. 生成订单编号函数
-- 格式：PC + yyyyMMddHHmmss + 3位随机数
CREATE OR REPLACE FUNCTION generate_order_no()
RETURNS VARCHAR(20) AS $$
DECLARE
  prefix VARCHAR := 'PC';
  ts VARCHAR;
  rand_suffix VARCHAR;
BEGIN
  ts := to_char(NOW(), 'YYYYMMDDHH24MISS');
  rand_suffix := lpad(floor(random() * 1000)::TEXT, 3, '0');
  RETURN prefix || ts || rand_suffix;
END;
$$ LANGUAGE plpgsql;

-- 7. 行级安全策略（RLS）
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- 允许匿名用户插入（创建预约）
DROP POLICY IF EXISTS "允许任何人创建预约" ON bookings;
CREATE POLICY "允许任何人创建预约" ON bookings
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 用户只能查看自己的预约
DROP POLICY IF EXISTS "用户查看自己的预约" ON bookings;
CREATE POLICY "用户查看自己的预约" ON bookings
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 用户只能更新自己的预约
DROP POLICY IF EXISTS "用户更新自己的预约" ON bookings;
CREATE POLICY "用户更新自己的预约" ON bookings
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 8. 添加表注释
COMMENT ON TABLE bookings IS '宠物洗护预约表';
COMMENT ON COLUMN bookings.id IS '主键 UUID';
COMMENT ON COLUMN bookings.order_no IS '订单编号，格式：PC+年月日时分秒+3位随机数';
COMMENT ON COLUMN bookings.service_id IS '服务项目ID';
COMMENT ON COLUMN bookings.service_name IS '服务项目名称（冗余便于查询展示）';
COMMENT ON COLUMN bookings.booking_date IS '预约日期';
COMMENT ON COLUMN bookings.time_slot IS '预约时间段，如 10:00-11:00';
COMMENT ON COLUMN bookings.pet_name IS '宠物名称';
COMMENT ON COLUMN bookings.pet_type IS '宠物类型枚举';
COMMENT ON COLUMN bookings.pet_breed IS '宠物品种，如泰迪、英短';
COMMENT ON COLUMN bookings.remark IS '用户备注';
COMMENT ON COLUMN bookings.status IS '预约状态枚举';
COMMENT ON COLUMN bookings.price IS '价格（元）';
COMMENT ON COLUMN bookings.user_id IS '关联用户ID（可为空，支持匿名预约）';
COMMENT ON COLUMN bookings.created_at IS '创建时间';
COMMENT ON COLUMN bookings.updated_at IS '最后更新时间';
