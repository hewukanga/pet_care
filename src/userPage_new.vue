<!--
  个人中心页面
  优雅的用户信息和快捷操作入口
-->

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const menuItems = [
  { icon: '📋', label: '我的预约', desc: '查看和管理预约记录', path: '/orders' },
  { icon: '🐾', label: '我的宠物', desc: '管理宠物档案信息', path: '' },
  { icon: '🎫', label: '优惠券', desc: '查看可用优惠券', path: '' },
  { icon: '⭐', label: '我的收藏', desc: '收藏的服务项目', path: '' },
]
</script>

<template>
  <div class="user-page">
    <!-- 用户卡片 -->
    <div class="user-card">
      <div class="user-card__bg">
        <div class="user-card__circle user-card__circle--1" />
        <div class="user-card__circle user-card__circle--2" />
      </div>

      <div v-if="userStore.isLoggedIn" class="user-card__info">
        <div class="user-card__avatar">
          <span class="user-card__avatar-emoji">🐶</span>
        </div>
        <div class="user-card__detail">
          <h3 class="user-card__name">{{ userStore.displayName }}</h3>
          <p class="user-card__phone">{{ userStore.userInfo?.phone }}</p>
        </div>
        <button class="logout-btn" @click="userStore.logout()">
          退出
        </button>
      </div>

      <div v-else class="user-card__login">
        <div class="user-card__avatar user-card__avatar--ghost">
          <span>👤</span>
        </div>
        <p class="user-card__hint">登录后解锁更多功能</p>
        <button class="login-btn" @click="router.push('/login')">
          立即登录
        </button>
      </div>

      <!-- 统计 -->
      <div v-if="userStore.isLoggedIn" class="user-card__stats">
        <div class="user-card__stat">
          <span class="user-card__stat-num">3</span>
          <span class="user-card__stat-label">预约</span>
        </div>
        <div class="user-card__stat">
          <span class="user-card__stat-num">1</span>
          <span class="user-card__stat-label">宠物</span>
        </div>
        <div class="user-card__stat">
          <span class="user-card__stat-num">2</span>
          <span class="user-card__stat-label">优惠券</span>
        </div>
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
        <div class="menu-item__content">
          <span class="menu-item__label">{{ item.label }}</span>
          <span class="menu-item__desc">{{ item.desc }}</span>
        </div>
        <span class="menu-item__arrow">›</span>
      </div>
    </div>

    <!-- 版本 -->
    <div class="app-version">PetCare v1.0.0</div>
  </div>
</template>

<style scoped lang="scss">
.user-page {
  max-width: 600px;
  margin: 0 auto;
  padding: var(--spacing-lg) var(--spacing-md);
}

/* 用户卡片 */
.user-card {
  position: relative;
  border-radius: var(--radius-xl);
  overflow: hidden;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%);
  color: var(--color-white);
  margin-bottom: var(--spacing-lg);
  box-shadow: 0 8px 32px rgba(245, 158, 11, 0.25);

  &__bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  &__circle {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);

    &--1 {
      width: 200px;
      height: 200px;
      top: -60px;
      right: -40px;
    }

    &--2 {
      width: 100px;
      height: 100px;
      bottom: -20px;
      left: 20%;
    }
  }

  &__info {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-xl);
    position: relative;
  }

  &__login {
    text-align: center;
    padding: var(--spacing-2xl) var(--spacing-xl);
    position: relative;
  }

  &__avatar {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    flex-shrink: 0;
    border: 2px solid rgba(255, 255, 255, 0.3);

    &--ghost {
      margin: 0 auto;
      font-size: 36px;
    }
  }

  &__detail {
    flex: 1;
  }

  &__name {
    font-size: var(--font-xl);
    font-weight: 700;
    letter-spacing: -0.3px;
  }

  &__phone {
    font-size: var(--font-sm);
    opacity: 0.8;
    margin-top: 2px;
  }

  &__hint {
    margin: var(--spacing-md) 0 var(--spacing-lg);
    font-size: var(--font-base);
    opacity: 0.85;
  }

  &__stats {
    display: flex;
    border-top: 1px solid rgba(255, 255, 255, 0.15);
    position: relative;
  }

  &__stat {
    flex: 1;
    text-align: center;
    padding: var(--spacing-md);

    &:not(:last-child) {
      border-right: 1px solid rgba(255, 255, 255, 0.15);
    }

    &-num {
      display: block;
      font-size: var(--font-xl);
      font-weight: 800;
    }

    &-label {
      font-size: var(--font-xs);
      opacity: 0.8;
    }
  }
}

.logout-btn {
  padding: 6px 14px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.15);
  color: var(--color-white);
  font-size: var(--font-sm);
  font-weight: 500;
  backdrop-filter: blur(4px);
  transition: all var(--transition-fast);

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
}

.login-btn {
  padding: 12px 36px;
  border-radius: var(--radius-full);
  background: var(--color-white);
  color: #78350f;
  font-weight: 700;
  font-size: var(--font-base);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transition: all var(--transition-base);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
}

/* 快捷菜单 */
.menu-section {
  background: var(--color-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  border: 1px solid var(--color-border-light);
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  cursor: pointer;
  transition: all var(--transition-fast);

  &:not(:last-child) {
    border-bottom: 1px solid var(--color-border-light);
  }

  &:hover:not(&--disabled) {
    background: var(--color-primary-bg);

    .menu-item__arrow {
      transform: translateX(2px);
    }
  }

  &--disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  &__icon {
    font-size: 22px;
    width: 40px;
    height: 40px;
    border-radius: var(--radius-sm);
    background: var(--color-bg-alt);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__content {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  &__label {
    font-size: var(--font-base);
    font-weight: 600;
    color: var(--color-text-primary);
  }

  &__desc {
    font-size: var(--font-xs);
    color: var(--color-text-muted);
    margin-top: 2px;
  }

  &__arrow {
    font-size: 22px;
    color: var(--color-text-muted);
    transition: transform var(--transition-fast);
  }
}

.app-version {
  text-align: center;
  padding: var(--spacing-xl) 0;
  font-size: var(--font-xs);
  color: var(--color-text-muted);
}
</style>
