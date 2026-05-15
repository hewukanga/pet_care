<!--
  个人中心页面
  展示用户基本信息和快捷操作入口
-->

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

/** 快捷操作菜单项 */
const menuItems = [
  { icon: '📋', label: '我的预约', path: '/orders' },
  { icon: '🐾', label: '我的宠物', path: '' },
  { icon: '🎫', label: '优惠券', path: '' },
  { icon: '⭐', label: '我的收藏', path: '' },
]
</script>

<template>
  <div class="user-page">
    <!-- 用户信息卡片 -->
    <div class="user-card">
      <div v-if="userStore.isLoggedIn" class="user-card__info">
        <div class="avatar">🐶</div>
        <div class="user-detail">
          <h3>{{ userStore.displayName }}</h3>
          <p>{{ userStore.userInfo?.phone }}</p>
        </div>
        <button class="logout-btn" @click="userStore.logout()">退出登录</button>
      </div>
      <div v-else class="user-card__login">
        <div class="avatar avatar--ghost">👤</div>
        <p>登录后查看更多功能</p>
        <button class="login-btn" @click="userStore.login()">立即登录</button>
      </div>
    </div>

    <!-- 快捷菜单 -->
    <div class="menu-section">
      <div
        v-for="item in menuItems"
        :key="item.label"
        class="menu-item"
        :class="{ 'menu-item--disabled': !item.path }"
        @click="item.path && router.push(item.path)"
      >
        <span class="menu-item__icon">{{ item.icon }}</span>
        <span class="menu-item__label">{{ item.label }}</span>
        <span class="menu-item__arrow">›</span>
      </div>
    </div>

    <!-- 底部信息 -->
    <div class="app-version">PetCare v1.0.0</div>
  </div>
</template>

<style scoped lang="scss">
.user-page {
  max-width: 600px;
  margin: 0 auto;
  padding: var(--spacing-lg) var(--spacing-md);
}

.user-card {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-lg);
  color: var(--color-white);

  &__info {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
  }

  &__login {
    text-align: center;
    padding: var(--spacing-md) 0;

    p {
      margin: var(--spacing-md) 0;
      font-size: var(--font-base);
    }
  }
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  flex-shrink: 0;
}

.user-detail {
  flex: 1;

  h3 {
    font-size: var(--font-xl);
    font-weight: 700;
  }

  p {
    font-size: var(--font-sm);
    opacity: 0.85;
    margin-top: 2px;
  }
}

.logout-btn {
  padding: 6px 14px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.2);
  color: var(--color-white);
  font-size: var(--font-sm);

  &:hover {
    background: rgba(255, 255, 255, 0.35);
  }
}

.login-btn {
  padding: 10px 28px;
  border-radius: var(--radius-full);
  background: var(--color-white);
  color: var(--color-primary-dark);
  font-weight: 600;
  font-size: var(--font-base);

  &:hover {
    transform: scale(1.05);
  }
}

.menu-section {
  background: var(--color-white);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  cursor: pointer;
  transition: background 0.15s;

  &:not(:last-child) {
    border-bottom: 1px solid var(--color-border);
  }

  &:hover {
    background: var(--color-bg);
  }

  &--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &__icon {
    font-size: 22px;
  }

  &__label {
    flex: 1;
    font-size: var(--font-base);
    font-weight: 500;
  }

  &__arrow {
    font-size: 22px;
    color: var(--color-text-placeholder);
  }
}

.app-version {
  text-align: center;
  padding: var(--spacing-xl) 0;
  font-size: var(--font-xs);
  color: var(--color-text-placeholder);
}
</style>
