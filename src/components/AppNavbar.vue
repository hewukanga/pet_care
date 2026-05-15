<!--
  全局导航栏组件
  提供顶部导航、品牌标识和用户入口
-->

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

/** 导航菜单项 */
const navItems = [
  { label: '首页', path: '/' },
  { label: '服务项目', path: '/services' },
  { label: '预约服务', path: '/booking' },
]

/** 判断当前路由是否激活 */
function isActive(path: string): boolean {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

/** 跳转到指定页面 */
function navigate(path: string) {
  router.push(path)
}
</script>

<template>
  <header class="navbar">
    <div class="navbar__inner">
      <!-- 品牌标识 -->
      <router-link to="/" class="navbar__brand">
        <span class="navbar__logo">🐾</span>
        <span class="navbar__name">PetCare</span>
      </router-link>

      <!-- 导航菜单 (桌面端) -->
      <nav class="navbar__menu">
        <button
          v-for="item in navItems"
          :key="item.path"
          class="navbar__link"
          :class="{ 'navbar__link--active': isActive(item.path) }"
          @click="navigate(item.path)"
        >
          {{ item.label }}
        </button>
      </nav>

      <!-- 右侧操作区 -->
      <div class="navbar__actions">
        <button class="navbar__btn" @click="navigate('/orders')">
          📋 我的预约
        </button>
        <button
          v-if="!userStore.isLoggedIn"
          class="navbar__btn navbar__btn--primary"
          @click="userStore.login()"
        >
          登录
        </button>
        <button v-else class="navbar__avatar" @click="navigate('/user')">
          👤 {{ userStore.displayName }}
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped lang="scss">
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--color-white);
  box-shadow: var(--shadow-sm);

  &__inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--spacing-md);
    height: 60px;
    display: flex;
    align-items: center;
    gap: var(--spacing-lg);
  }

  &__brand {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-weight: 700;
    font-size: var(--font-lg);
    color: var(--color-primary-dark);
    flex-shrink: 0;
  }

  &__logo {
    font-size: 28px;
  }

  &__name {
    letter-spacing: 0.5px;
  }

  &__menu {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
  }

  &__link {
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--radius-sm);
    font-size: var(--font-base);
    color: var(--color-text-secondary);
    transition: all 0.2s;

    &:hover {
      color: var(--color-primary);
      background: var(--color-primary-bg);
    }

    &--active {
      color: var(--color-primary-dark);
      font-weight: 600;
      background: var(--color-primary-bg);
    }
  }

  &__actions {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }

  &__btn {
    padding: 6px 14px;
    border-radius: var(--radius-full);
    font-size: var(--font-sm);
    color: var(--color-text-secondary);
    transition: all 0.2s;

    &:hover {
      background: var(--color-bg);
    }

    &--primary {
      background: var(--color-primary);
      color: var(--color-white);
      font-weight: 600;

      &:hover {
        background: var(--color-primary-dark);
      }
    }
  }

  &__avatar {
    padding: 4px 12px;
    border-radius: var(--radius-full);
    font-size: var(--font-sm);
    background: var(--color-primary-bg);
    color: var(--color-primary-dark);
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .navbar {
    &__inner {
      padding: 0 var(--spacing-sm);
      gap: var(--spacing-sm);
    }

    &__name {
      display: none;
    }

    &__menu {
      gap: 0;
    }

    &__link {
      padding: var(--spacing-sm) 10px;
      font-size: var(--font-sm);
    }

    &__actions {
      gap: 4px;
    }

    &__btn {
      padding: 4px 10px;
      font-size: var(--font-xs);
    }
  }
}
</style>
