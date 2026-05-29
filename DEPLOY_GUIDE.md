# PetCare 登录功能部署指南

## 一、概述

已完成后端全部改造和前端核心文件创建。由于开发环境 sandbox 限制，部分 `src/` 子目录下的文件无法自动修改，需手动替换以下文件。

## 二、默认账号信息

| 项目 | 值 |
|------|-----|
| 用户名 | `admin` |
| 密码 | `admin123` |
| SM4密钥 | `a3f7b2c9d1e8f4567890abcdef123456` |
| SM4加密后密码 | `096249c9c5b34175d4bdc683ba596f19` |

> ⚠️ SM4密钥请妥善保管，前后端必须一致。

## 三、数据库迁移

### 步骤1：在 Supabase SQL Editor 中依次执行以下迁移脚本

1. `supabase/migrations/20260529000002_create_users.sql` — 创建用户表
2. `supabase/migrations/20260529000003_create_reviews.sql` — 创建评价表（如果已存在会跳过）
3. `supabase/migrations/20260529000004_alter_bookings_reviews.sql` — 绑定历史数据到admin用户

## 四、后端初始化

### 步骤2：安装依赖并初始化密码

```bash
cd D:\codexProjects\pet_care
npm install
npx tsx server/seed.ts
```

这将更新默认管理员密码为SM4加密密文。

### 步骤3：启动后端

```bash
npm run server:dev
```

## 五、前端文件手动替换

以下文件已在 `src/` 根目录生成了新版本，需手动复制内容替换原文件：

### 替换列表

| 新文件（在 src/ 根目录） | 需替换的目标文件 |
|--------------------------|------------------|
| `src/userStore.ts` | `src/stores/user.ts` |
| `src/bookingApi.ts` | `src/api/booking.api.ts` |
| `src/reviewApi.ts` | `src/api/review.api.ts` |
| `src/auth.api.ts` | 新建到 `src/api/auth.api.ts` |
| `src/sm4.ts` | 移动到 `src/utils/sm4.ts` |
| `src/LoginPage.vue` | 移动到 `src/views/login/index.vue` |

### 替换后需要做的调整

1. **`src/types/index.ts`** — `UserInfo` 接口需增加 `token` 字段：
```typescript
export interface UserInfo {
  id: string
  nickname: string
  avatar: string
  phone: string
  token: string  // 新增
}
```

2. **`src/router/index.ts`** — 添加登录路由和导航守卫：
```typescript
{
  path: '/login',
  name: 'login',
  component: () => import('@/views/login/index.vue'),
  meta: { title: '登录 - PetCare' },
},
```
并在导航守卫中添加：
```typescript
import { useUserStore } from '@/stores/user'

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  // 需要登录的页面列表
  const authPages = ['/booking', '/orders']
  if (authPages.includes(to.path) && !userStore.isLoggedIn) {
    next({ path: '/login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})
```

3. **`src/views/user/index.vue`** — 将登录按钮改为跳转到登录页：
```typescript
// 原来：@click="userStore.login()"
// 改为：@click="router.push('/login')"
```

4. **`src/main.ts`** — 已自动更新，无需额外修改

5. **`src/api/booking.api.ts`** 和 **`src/api/review.api.ts`** — 使用 src/ 根目录的新版本替换

6. **组件中引用booking/review API时需要传入token**：
```typescript
import { useUserStore } from '@/stores/user'
const userStore = useUserStore()
await submitBooking(data, userStore.token)
await fetchBookingList(query, userStore.token)
```

## 六、登录流程

1. 前端用户输入用户名+密码 → SM4加密密码 → POST /api/auth/login
2. 后端验证密码密文 → 返回用户信息+token
3. 前端存储token在localStorage → 后续请求带Authorization: Bearer token
4. 后端解析token获取userId → 所有数据操作绑定userId

## 七、API变更说明

### 新增接口
- `POST /api/auth/login` — 登录
- `GET /api/auth/me` — 获取当前用户信息
- `POST /api/reviews` — 创建评价（需登录）
- `DELETE /api/reviews/:id` — 删除评价（需登录）
- `GET /api/reviews/my` — 查询我的评价（需登录）

### 变更接口
- `POST /api/bookings` — 现在需要Authorization头
- `GET /api/bookings` — 现在只返回当前用户的预约
- `PUT /api/bookings/:id/cancel` — 现在需要Authorization头，且只能取消自己的预约

## 八、验证

```bash
# 测试登录
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"096249c9c5b34175d4bdc683ba596f19"}'

# 测试获取用户信息（用返回的token替换）
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer <token>"
```
