<!--
  全局页脚组件
  展示版权信息和网站链接
-->

<template>
  <footer class="app-footer">
    <div class="app-footer__inner">
      <div class="app-footer__brand">
        <span class="app-footer__logo">🐾</span>
        <span>PetCare 宠物洗护专家</span>
      </div>
      <div class="app-footer__links">
        <span>服务热线：400-888-9999</span>
        <span>营业时间：每日 09:00 - 18:00</span>
      </div>
      <div class="app-footer__copy">
        © 2026 PetCare. All rights reserved.
      </div>
    </div>
  </footer>
</template>

<style scoped lang="scss">
.app-footer {
  background: var(--color-text-primary);
  color: var(--color-text-placeholder);
  padding: var(--spacing-xl) var(--spacing-md);

  &__inner {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-md);
    text-align: center;
  }

  &__brand {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-size: var(--font-lg);
    color: var(--color-white);
    font-weight: 600;
  }

  &__logo {
    font-size: 24px;
  }

  &__links {
    display: flex;
    gap: var(--spacing-lg);
    font-size: var(--font-sm);
  }

  &__copy {
    font-size: var(--font-xs);
  }
}
</style>
