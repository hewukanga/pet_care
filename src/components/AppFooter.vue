<!--
  全局页脚组件
  精致简约的品牌信息和联系方式
-->

<template>
  <footer class="app-footer">
    <div class="app-footer__inner">
      <div class="app-footer__top">
        <div class="app-footer__brand">
          <span class="app-footer__logo">🐾</span>
          <div>
            <h4 class="app-footer__name">PetCare</h4>
            <p class="app-footer__tagline">宠物洗护专家</p>
          </div>
        </div>
        <div class="app-footer__contact">
          <div class="app-footer__contact-item">
            <span>📞</span>
            <span>服务热线：400-888-9999</span>
          </div>
          <div class="app-footer__contact-item">
            <span>🕐</span>
            <span>营业时间：每日 09:00 - 18:00</span>
          </div>
        </div>
      </div>
      <div class="app-footer__divider" />
      <p class="app-footer__copy">
        © 2026 PetCare. All rights reserved. Made with ❤️ for pets.
      </p>
    </div>
  </footer>
</template>

<style scoped lang="scss">
.app-footer {
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  color: #94a3b8;
  padding: var(--spacing-2xl) var(--spacing-md) var(--spacing-lg);
  margin-top: auto;

  &__inner {
    max-width: 1200px;
    margin: 0 auto;
  }

  &__top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--spacing-lg);
  }

  &__brand {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
  }

  &__logo {
    font-size: 32px;
  }

  &__name {
    font-size: var(--font-xl);
    font-weight: 800;
    color: var(--color-white);
    letter-spacing: -0.3px;
  }

  &__tagline {
    font-size: var(--font-sm);
    color: #64748b;
    margin-top: 2px;
  }

  &__contact {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  &__contact-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-size: var(--font-sm);
  }

  &__divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(148, 163, 184, 0.15), transparent);
    margin: var(--spacing-lg) 0;
  }

  &__copy {
    text-align: center;
    font-size: var(--font-xs);
    color: #475569;
  }
}

@media (max-width: 768px) {
  .app-footer {
    &__top {
      flex-direction: column;
      text-align: center;
    }

    &__contact {
      align-items: center;
    }
  }
}
</style>
