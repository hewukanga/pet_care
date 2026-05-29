<!--
  登录页面
  支持用户名密码登录，密码使用SM4加密传输
-->

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { encryptSM4 } from '@/utils/sm4'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

/** 登录表单数据 */
const username = ref('')
const password = ref('')
/** 加载状态 */
const loading = ref(false)
/** 错误消息 */
const errorMsg = ref('')

/** 是否可以提交 */
const canSubmit = computed(() => username.value.trim() && password.value.trim() && !loading.value)

/** 登录成功后的跳转路径 */
const redirectPath = computed(() => (route.query.redirect as string) || '/')

/**
 * 处理登录提交
 */
async function handleLogin() {
  if (!canSubmit.value) return

  errorMsg.value = ''
  loading.value = true

  try {
    // 先用SM4加密密码，再发送到后端
    const encryptedPassword = encryptSM4(password.value)
    await userStore.loginAction(username.value, encryptedPassword)
    // 登录成功，跳转到目标页面
    router.push(redirectPath.value)
  } catch (error) {
    errorMsg.value = error instanceof Error ? error.message : '登录失败，请重试'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <!-- Logo区域 -->
      <div class="login-card__header">
        <div class="login-card__logo">🐾</div>
        <h2 class="login-card__title">PetCare 宠物洗护专家</h2>
        <p class="login-card__subtitle">欢迎回来，请登录您的账号</p>
      </div>

      <!-- 表单 -->
      <form class="login-form" @submit.prevent="handleLogin">
        <div class="form-field">
          <label class="form-field__label" for="username">用户名</label>
          <input
            id="username"
            v-model="username"
            type="text"
            class="form-field__input"
            placeholder="请输入用户名"
            autocomplete="username"
            :disabled="loading"
          />
        </div>

        <div class="form-field">
          <label class="form-field__label" for="password">密码</label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="form-field__input"
            placeholder="请输入密码"
            autocomplete="current-password"
            :disabled="loading"
          />
        </div>

        <!-- 错误消息 -->
        <p v-if="errorMsg" class="login-form__error">{{ errorMsg }}</p>

        <!-- 提交按钮 -->
        <button
          type="submit"
          class="login-form__submit"
          :disabled="!canSubmit"
        >
          <span v-if="loading" class="login-form__spinner" />
          <span>{{ loading ? '登录中…' : '登录' }}</span>
        </button>
      </form>

      <!-- 底部提示 -->
      <div class="login-card__footer">
        <p class="login-card__tip">
          <span class="login-card__tip-icon">🔒</span>
          密码采用国密SM4加密传输，保障您的信息安全
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.login-page {
  min-height: calc(100vh - 60px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, #fef9ef 0%, #fdf2d9 50%, #fef3c7 100%);
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: var(--color-white);
  border-radius: var(--radius-xl);
  box-shadow: 0 8px 40px rgba(180, 83, 9, 0.12);
  overflow: hidden;

  &__header {
    text-align: center;
    padding: var(--spacing-2xl) var(--spacing-xl) var(--spacing-lg);
  }

  &__logo {
    font-size: 52px;
    margin-bottom: var(--spacing-md);
  }

  &__title {
    font-size: var(--font-xl);
    font-weight: 700;
    color: var(--color-text-primary);
    letter-spacing: -0.3px;
  }

  &__subtitle {
    margin-top: var(--spacing-xs);
    font-size: var(--font-sm);
    color: var(--color-text-muted);
  }

  &__footer {
    padding: var(--spacing-md) var(--spacing-xl) var(--spacing-xl);
  }

  &__tip {
    text-align: center;
    font-size: var(--font-xs);
    color: var(--color-text-muted);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
  }

  &__tip-icon {
    font-size: 12px;
  }
}

.login-form {
  padding: 0 var(--spacing-xl);

  &__error {
    background: #fef2f2;
    color: #dc2626;
    font-size: var(--font-sm);
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--radius-sm);
    margin-bottom: var(--spacing-md);
  }

  &__submit {
    width: 100%;
    padding: 14px;
    border-radius: var(--radius-lg);
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    color: var(--color-white);
    font-size: var(--font-base);
    font-weight: 700;
    transition: all var(--transition-base);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
    box-shadow: 0 4px 16px rgba(245, 158, 11, 0.3);

    &:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 8px 24px rgba(245, 158, 11, 0.4);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  &__spinner {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: var(--color-white);
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }
}

.form-field {
  margin-bottom: var(--spacing-lg);

  &__label {
    display: block;
    font-size: var(--font-sm);
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: var(--spacing-xs);
  }

  &__input {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid var(--color-border-light);
    border-radius: var(--radius-md);
    font-size: var(--font-base);
    color: var(--color-text-primary);
    transition: border-color var(--transition-fast);
    background: var(--color-bg-alt);

    &:focus {
      outline: none;
      border-color: #f59e0b;
      background: var(--color-white);
    }

    &:disabled {
      opacity: 0.5;
    }

    &::placeholder {
      color: var(--color-text-muted);
    }
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
