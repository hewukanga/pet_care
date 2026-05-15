<!--
  全局导航栏组件
  毛玻璃效果 + 优雅渐变，提供顶部导航和用户入口
-->

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

/** 导航栏是否透明（滚动后变为毛玻璃） */
const scrolled = ref(false)

function onScroll() {
  scrolled.value = window.scrollY > 20
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))

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

function navigate(path: string) {
  router.push(path)
}
</script>

<template>
  <header class="navbar" :class="{ 'navbar--scrolled': scrolled }">
    <div class="navbar__inner">
      <!-- 品牌标识 -->
      <router-link to="/" class="navbar__brand">
        <span class="navbar__logo">🐾</span>
        <span class="navbar__name">PetCare</span>
      </router-link>

      <!-- 导航菜单 -->
      <nav class="navbar__menu">
        <button
          v-for="item in navItems"
          :key="item.path"
          class="navbar__link"
          :class="{ 'navbar__link--active': isActive(item.path) }"
          @click="navigate(item.path)"
        >
          {{ item.label }}
          <span v-if="isActive(item.path)" class="navbar__link-dot" />
        </button>
      </nav>

      <!-- 右侧操作区 -->
      <div class="navbar__actions">
        <button class="navbar__btn" @click="navigate('/orders')">
          <span class="navbar__btn-icon">📋</span>
          <span class="navbar__btn-text">我的预约</span>
        </button>
        <button
          v-if="!userStore.isLoggedIn"
          class="navbar__btn navbar__btn--primary"
          @click="userStore.login()"
        >
          登录
        </button>
        <button v-else class="navbar__avatar" @click="navigate('/user')">
          <span class="navbar__avatar-icon">👤</span>
          <span class="navbar__avatar-name">{{ userStore.displayName }}</span>
        </button>
      </div>
    </div>
    <!-- 底部渐变线 -->
    <div class="navbar__glow" />
  </header>
</template>

<style scoped lang="scss">
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid transparent;
  transition: all var(--transition-base);

  &--scrolled {
    background: rgba(255, 255, 255, 0.92);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02);
    border-bottom-color: var(--color-border-light);
  }

  &__glow {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--color-primary-light), var(--color-primary), var(--color-primary-light), transparent);
    opacity: 0;
    transition: opacity var(--transition-base);
  }

  &--scrolled &__glow {
    opacity: 0.6;
  }

  &__inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--spacing-lg);
    height: 64px;
    display: flex;
    align-items: center;
    gap: var(--spacing-xl);
  }

  &__brand {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 800;
    font-size: 20px;
    background: var(--color-primary-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    flex-shrink: 0;
    transition: transform var(--transition-fast);

    &:hover {
      transform: scale(1.03);
    }
  }

  &__logo {
    font-size: 30px;
    -webkit-text-fill-color: initial;
    animation: float 3s ease-in-out infinite;
  }

  &__name {
    letter-spacing: -0.5px;
  }

  &__menu {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  &__link {
    position: relative;
    padding: 8px 16px;
    border-radius: var(--radius-sm);
    font-size: var(--font-base);
    font-weight: 500;
    color: var(--color-text-secondary);
    transition: all var(--transition-fast);

    &:hover {
      color: var(--color-primary-dark);
      background: var(--color-primary-bg);
    }

    &--active {
      color: var(--color-primary-dark);
      font-weight: 600;
      background: var(--color-primary-bg);
    }

    &-dot {
      position: absolute;
      bottom: 4px;
      left: 50%;
      transform: translateX(-50%);
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--color-primary);
      animation: scaleIn var(--transition-base);
    }
  }

  &__actions {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }

  &__btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: var(--radius-full);
    font-size: var(--font-sm);
    font-weight: 500;
    color: var(--color-text-secondary);
    transition: all var(--transition-fast);

    &:hover {
      background: var(--color-bg-alt);
      color: var(--color-text-primary);
    }

    &--primary {
      background: var(--color-primary-gradient);
      color: var(--color-white);
      font-weight: 600;
      padding: 8px 20px;
      box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 16px rgba(245, 158, 11, 0.4);
        background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%);
      }
    }
  }

  &__btn-icon {
    font-size: 15px;
  }

  &__avatar {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: var(--radius-full);
    background: var(--color-primary-bg);
    border: 1px solid rgba(245, 158, 11, 0.15);
    font-size: var(--font-sm);
    font-weight: 500;
    color: var(--color-primary-dark);
    transition: all var(--transition-fast);

    &:hover {
      background: linear-gradient(135deg, #fffbeb, #fef3c7);
      border-color: rgba(245, 158, 11, 0.3);
    }
  }

  &__avatar-icon {
    font-size: 16px;
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .navbar {
    &__inner {
      padding: 0 var(--spacing-md);
      gap: var(--spacing-sm);
    }

    &__name {
      display: none;
    }

    &__menu {
      gap: 0;
    }

    &__link {
      padding: 6px 10px;
      font-size: var(--font-sm);
    }

    &__btn-text {
      display: none;
    }

    &__btn {
      padding: 8px 12px;
    }

    &__avatar-name {
      display: none;
    }
  }
}
</style>
