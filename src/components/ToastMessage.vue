<!--
  全局 Toast 消息组件
  在页面顶部展示短暂的消息提示
-->

<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const { toasts } = useToast()

/** 根据类型返回对应图标 */
function iconClass(type: string): string {
  const map: Record<string, string> = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
  }
  return map[type] ?? 'ℹ️'
}
</script>

<template>
  <Teleport to="body">
    <div class="toast-container" aria-live="polite">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast-item"
          :class="`toast-item--${toast.type}`"
        >
          <span class="toast-item__icon">{{ iconClass(toast.type) }}</span>
          <span class="toast-item__msg">{{ toast.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
.toast-container {
  position: fixed;
  top: 72px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  pointer-events: none;
}

.toast-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: 10px 20px;
  border-radius: var(--radius-sm);
  background: var(--color-white);
  box-shadow: var(--shadow-lg);
  font-size: var(--font-sm);
  pointer-events: auto;

  &--success {
    border-left: 3px solid var(--color-success);
  }

  &--error {
    border-left: 3px solid var(--color-danger);
  }

  &--info {
    border-left: 3px solid var(--color-info);
  }

  &__icon {
    flex-shrink: 0;
  }

  &__msg {
    white-space: nowrap;
  }
}

/* Toast 进出动画 */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-12px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
