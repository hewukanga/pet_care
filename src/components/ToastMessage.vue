<!--
  全局 Toast 消息组件
  精致的消息提示动画
-->

<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const { toasts } = useToast()

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
  top: 80px;
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
  padding: 12px 24px;
  border-radius: var(--radius-md);
  background: var(--color-white);
  box-shadow: var(--shadow-xl);
  font-size: var(--font-sm);
  font-weight: 500;
  pointer-events: auto;
  backdrop-filter: blur(8px);

  &--success {
    border-left: 3px solid var(--color-success);
    background: linear-gradient(135deg, #ecfdf5, var(--color-white));
  }

  &--error {
    border-left: 3px solid var(--color-danger);
    background: linear-gradient(135deg, #fef2f2, var(--color-white));
  }

  &--info {
    border-left: 3px solid var(--color-info);
    background: linear-gradient(135deg, #eef2ff, var(--color-white));
  }

  &__icon {
    flex-shrink: 0;
    font-size: 16px;
  }

  &__msg {
    white-space: nowrap;
  }
}

.toast-enter-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-leave-active {
  transition: all 0.25s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-16px) scale(0.95);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.9);
}
</style>
