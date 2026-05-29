## 项目概览

PetCare（宠物洗护专家）是一个宠物洗护服务预约平台，支持在线浏览宠物洗护、美容、SPA、健康管理、寄养等服务，并完成预约。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Vue 3 + TypeScript（Composition API + `<script setup lang="ts">`） |
| 构建工具 | Vite |
| 状态管理 | Pinia |
| 路由 | Vue Router（Hash 模式） |
| 样式 | SCSS |
| 后端 | Express 5（Node.js + TypeScript，tsx 运行时） |
| 数据库 | PostgreSQL（Supabase 托管，`pg` 驱动） |

## 目录结构

```
pet_care/
├── index.html                          # 应用入口 HTML
├── package.json                        # 依赖与脚本配置
├── vite.config.ts                      # Vite 构建配置（含代理到后端3001端口）
├── tsconfig.json / .app.json / .server.json / .node.json
├── .env                                # 环境变量（数据库连接等）
├── .env.example
│
├── server/                             # 后端
│   ├── index.ts                        # Express 入口（端口 3001）
│   ├── db.ts                           # PostgreSQL 连接池
│   ├── booking.dao.ts                  # 预约数据访问层
│   └── booking.routes.ts               # 预约 API 路由（挂载 /api）
│
├── supabase/
│   └── migrations/                     # 数据库迁移脚本
│       └── 20260515000001_create_bookings.sql
│
└── src/                                # 前端源码
    ├── main.ts                         # Vue 应用入口
    ├── App.vue                         # 根组件
    ├── api/                            # API 调用层
    │   ├── booking.api.ts              # 预约 API（调用真实后端）
    │   └── service.api.ts              # 服务 API（当前使用模拟数据）
    ├── components/                     # 全局组件
    │   ├── AppNavbar.vue               # 导航栏
    │   ├── AppFooter.vue               # 页脚
    │   └── ToastMessage.vue            # Toast 消息
    ├── composables/                    # 组合式函数
    │   ├── useBookingForm.ts           # 预约表单逻辑与校验
    │   └── useToast.ts                 # Toast 提示
    ├── constants/
    │   └── service.const.ts            # 服务分类/宠物类型/时间段常量
    ├── router/
    │   └── index.ts                    # 路由配置（6条路由）
    ├── stores/                         # Pinia 状态管理
    │   ├── user.ts                     # 用户状态（模拟登录）
    │   └── cart.ts                     # 购物车/预约草稿
    ├── styles/
    │   └── global.scss                 # 全局样式（琥珀金色系）
    ├── types/
    │   └── index.ts                    # 所有 TypeScript 类型/接口/枚举
    ├── utils/                          # 工具函数
    │   ├── date.ts                     # 日期格式化
    │   ├── format.ts                   # 金额/电话/订单号格式化
    │   └── validator.ts                # 表单校验
    └── views/                          # 页面视图
        ├── home/index.vue              # 首页
        ├── service/list.vue            # 服务列表
        ├── service/detail.vue          # 服务详情
        ├── booking/index.vue           # 预约页面
        ├── order/list.vue              # 我的预约
        └── user/index.vue              # 个人中心
```

## 路由

| 路径 | 名称 | 组件 | 说明 |
|------|------|------|------|
| `/` | home | `views/home/index.vue` | 首页 |
| `/services` | service-list | `views/service/list.vue` | 服务列表 |
| `/service/:id` | service-detail | `views/service/detail.vue` | 服务详情 |
| `/booking` | booking | `views/booking/index.vue` | 预约表单 |
| `/orders` | orders | `views/order/list.vue` | 我的预约 |
| `/user` | user | `views/user/index.vue` | 个人中心 |

## 后端 API

所有接口挂载在 `/api` 路径下，返回统一结构：`{ code: number, message: string, data: T }`

| 方法 | 路径 | 功能 |
|------|------|------|
| GET | `/api/health` | 健康检查（含数据库连接状态） |
| POST | `/api/bookings` | 创建预约 |
| GET | `/api/bookings` | 分页查询预约列表（支持 `userId`、`orderNo` 筛选） |
| PUT | `/api/bookings/:id/cancel` | 取消预约（仅限 PENDING 状态，使用事务+行锁） |

## 数据库

Supabase PostgreSQL，`aws-1-ap-northeast-1`（东京区域）。

**表：`bookings`** — 宠物洗护预约表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| order_no | VARCHAR(30) | 订单编号，格式 `PC + yyyyMMddHHmmss + 3位随机数` |
| service_id | VARCHAR(50) | 服务ID |
| service_name | VARCHAR(200) | 服务名称 |
| booking_date | DATE | 预约日期 |
| time_slot | VARCHAR(20) | 时间段（8个时段：09:00-18:00） |
| pet_name | VARCHAR(50) | 宠物名字 |
| pet_type | 枚举 | DOG_SMALL / DOG_MEDIUM / DOG_LARGE / CAT / OTHER |
| pet_breed | VARCHAR(100) | 品种 |
| status | 枚举 | PENDING / CONFIRMED / IN_PROGRESS / COMPLETED / CANCELLED |
| price | NUMERIC(10,2) | 价格 |
| user_id | UUID | 用户ID（可空，支持匿名预约） |
| created_at | TIMESTAMPTZ | 创建时间（自动） |
| updated_at | TIMESTAMPTZ | 更新时间（自动触发器） |

## 业务闭环

1. 用户浏览首页 → 轮播广告、服务分类、热门推荐
2. 进入服务列表 → 按分类筛选（基础洗护/美容造型/SPA/健康管理/寄养）
3. 点击服务查看详情 → 价格、时长、适用宠物、服务包含项
4. 点击"立即预约" → 选择日期（未来7天）、时间段、填写宠物信息
5. 提交预约 → 后端创建记录，状态 PENDING
6. 我的预约 → 查看所有预约，可取消 PENDING 状态的预约
7. 个人中心 → 登录/退出、查看统计、快捷导航

**特色**：支持匿名预约，用户通过订单号查询和取消预约。

## 编码规范

- 所有代码注释使用中文
- UTF-8 编码
- Vue 3 Composition API：`<script setup lang="ts">`
- 前端分层：`api/` `composables/` `stores/` `utils/` `constants/` 职责分离
- 后端分层：DAO 层（`booking.dao.ts`）+ Route 层（`booking.routes.ts`）
- API 返回统一结构：`{ code, message, data }`

## 运行命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动前端 Vite 开发服务器 |
| `npm run server:dev` | 启动后端 Express + tsx watch（端口 3001） |
| `npm run build` | 构建（vue-tsc + vite build） |

## 注意事项

- 服务列表数据当前使用硬编码模拟数据（`src/api/service.api.ts`），后端尚未实现服务相关 API
- 用户系统当前为模拟登录（`src/stores/user.ts`），未对接真实认证
- 前端 Vite 代理将 `/api` 请求转发到 `http://localhost:3001`
- CORS 配置允许 `localhost:5173` 和 `localhost:5174`
