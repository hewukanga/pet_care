<!--
  服务详情页
  精致展示服务完整信息与预约入口
-->

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { ServiceItem } from '@/types'
import { ServiceCategoryLabel, PetTypeLabel } from '@/types'
import { fetchServiceDetail } from '@/api/service.api'
import { useCartStore } from '@/stores/cart'
import { formatPrice } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

const service = ref<ServiceItem | null>(null)
const loading = ref(true)

async function loadDetail() {
  loading.value = true
  try {
    const id = route.params.id as string
    service.value = await fetchServiceDetail(id)
    if (!service.value) {
      router.replace('/services')
    }
  } finally {
    loading.value = false
  }
}

function goBooking() {
  if (service.value) {
    cartStore.selectService(service.value)
    router.push('/booking')
  }
}

onMounted(() => {
  loadDetail()
})
</script>

<template>
  <div class="detail-page">
    <!-- 加载状态 -->
    <div v-if="loading" class="state-msg">
      <span class="state-msg__spinner" />
      加载中…
    </div>

    <template v-else-if="service">
      <!-- 返回按钮 -->
      <button class="back-btn" @click="router.back()">
        <span>←</span> 返回
      </button>

      <div class="detail-card">
        <!-- 头部区域 -->
        <div class="detail-card__hero">
          <div class="detail-card__decoration">
            <div class="detail-card__circle detail-card__circle--1" />
            <div class="detail-card__circle detail-card__circle--2" />
          </div>
          <div class="detail-card__header">
            <span class="category-badge">{{
              ServiceCategoryLabel[service.category]
            }}</span>
            <span class="duration-badge">
              <span>⏱</span> 约 {{ service.duration }} 分钟
            </span>
          </div>

          <h1 class="detail-card__name">{{ service.name }}</h1>

          <!-- 价格区 -->
          <div class="detail-card__price">
            <div class="price-block">
              <span class="price-current">{{ formatPrice(service.price) }}</span>
              <template v-if="service.originalPrice">
                <span class="price-original">{{
                  formatPrice(service.originalPrice)
                }}</span>
                <span class="price-save">
                  省{{ formatPrice(service.originalPrice - service.price) }}
                </span>
              </template>
            </div>
          </div>

          <!-- 适用宠物 -->
          <div class="detail-card__pets">
            <span class="pets-label">🐾 适用宠物</span>
            <span class="pets-value">{{
              service.petTypes.map((t) => PetTypeLabel[t]).join(' · ')
            }}</span>
          </div>
        </div>

        <!-- 服务详情 -->
        <div class="detail-card__body">
          <div class="detail-card__section">
            <h3 class="detail-card__section-title">
              <span class="detail-card__section-dot" />
              服务详情
            </h3>
            <p class="detail-card__desc">{{ service.description }}</p>
          </div>

          <!-- 服务包含列表 -->
          <div class="detail-card__section">
            <h3 class="detail-card__section-title">
              <span class="detail-card__section-dot" />
              服务包含
            </h3>
            <ul class="feature-list">
              <li class="feature-list__item">
                <span class="feature-list__check">✓</span>
                全身深层清洁护理
              </li>
              <li class="feature-list__item">
                <span class="feature-list__check">✓</span>
                专业护毛素滋润保养
              </li>
              <li class="feature-list__item">
                <span class="feature-list__check">✓</span>
                耳道清洁与检查
              </li>
              <li class="feature-list__item">
                <span class="feature-list__check">✓</span>
                指甲修剪与打磨
              </li>
              <li class="feature-list__item">
                <span class="feature-list__check">✓</span>
                肛门腺清理（按需）
              </li>
            </ul>
          </div>
        </div>

        <!-- 底部预约按钮 -->
        <div class="detail-card__sticky-bar">
          <div class="sticky-price">
            <span class="sticky-price__current">{{
              formatPrice(service.price)
            }}</span>
          </div>
          <button class="sticky-book-btn" @click="goBooking">
            立即预约
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.detail-page {
  max-width: 720px;
  margin: 0 auto;
  padding: var(--spacing-lg) var(--spacing-md);
}

.state-msg {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-3xl);
  color: var(--color-text-muted);

  &__spinner {
    width: 20px;
    height: 20px;
    border: 2px solid var(--color-border);
    border-top-color: var(--color-primary);
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: var(--spacing-md);
  font-size: var(--font-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
  padding: 8px 16px;
  border-radius: var(--radius-full);
  transition: all var(--transition-fast);

  &:hover {
    background: var(--color-white);
    color: var(--color-text-primary);
  }
}

.detail-card {
  background: var(--color-white);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  border: 1px solid var(--color-border-light);

  &__hero {
    position: relative;
    padding: var(--spacing-2xl) var(--spacing-xl);
    background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
    overflow: hidden;
  }

  &__decoration {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  &__circle {
    position: absolute;
    border-radius: 50%;
    background: rgba(245, 158, 11, 0.08);

    &--1 {
      width: 250px;
      height: 250px;
      top: -100px;
      right: -60px;
    }

    &--2 {
      width: 120px;
      height: 120px;
      bottom: -40px;
      left: -30px;
    }
  }

  &__header {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-lg);
    position: relative;
  }

  &__name {
    font-size: var(--font-3xl);
    font-weight: 800;
    color: var(--color-text-primary);
    letter-spacing: -0.5px;
    margin-bottom: var(--spacing-lg);
    position: relative;
    line-height: 1.2;
  }

  &__price {
    margin-bottom: var(--spacing-lg);
    position: relative;
  }

  &__pets {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(8px);
    border-radius: var(--radius-full);
    font-size: var(--font-sm);
    position: relative;

    .pets-label {
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .pets-value {
      color: #92400e;
      font-weight: 500;
    }
  }

  &__body {
    padding: var(--spacing-xl);
  }

  &__section {
    margin-bottom: var(--spacing-xl);

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__section-title {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-size: var(--font-lg);
    font-weight: 700;
    color: var(--color-text-primary);
    margin-bottom: var(--spacing-md);
    padding-bottom: var(--spacing-sm);
    border-bottom: 2px solid var(--color-border-light);
  }

  &__section-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--color-primary);
    flex-shrink: 0;
  }

  &__desc {
    font-size: var(--font-base);
    color: var(--color-text-secondary);
    line-height: 1.8;
  }

  &__sticky-bar {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-md) var(--spacing-xl);
    border-top: 1px solid var(--color-border-light);
    background: var(--color-white);
    position: sticky;
    bottom: 0;
  }
}

/* 标签 */
.category-badge {
  font-size: var(--font-xs);
  padding: 4px 14px;
  border-radius: var(--radius-full);
  background: rgba(245, 158, 11, 0.15);
  color: #92400e;
  font-weight: 600;
}

.duration-badge {
  font-size: var(--font-xs);
  color: var(--color-text-muted);
}

/* 价格 */
.price-block {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-sm);
}

.price-current {
  font-size: 36px;
  font-weight: 800;
  color: #dc2626;
  letter-spacing: -1px;
}

.price-original {
  font-size: var(--font-base);
  color: var(--color-text-muted);
  text-decoration: line-through;
}

.price-save {
  font-size: var(--font-xs);
  padding: 2px 10px;
  border-radius: var(--radius-xs);
  background: #fef2f2;
  color: #dc2626;
  font-weight: 700;
}

/* 服务包含 */
.feature-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-sm);

  &__item {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-size: var(--font-sm);
    color: var(--color-text-secondary);
    padding: var(--spacing-sm) 0;
  }

  &__check {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: linear-gradient(135deg, #10b981, #059669);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    flex-shrink: 0;
  }
}

/* 底部吸底栏 */
.sticky-price {
  display: flex;
  align-items: baseline;
  gap: 4px;

  &__current {
    font-size: var(--font-2xl);
    font-weight: 800;
    color: #dc2626;
    letter-spacing: -0.5px;
  }
}

.sticky-book-btn {
  flex: 1;
  padding: 14px 0;
  border-radius: var(--radius-md);
  background: var(--color-primary-gradient);
  color: var(--color-white);
  font-size: var(--font-lg);
  font-weight: 700;
  box-shadow: 0 4px 16px rgba(245, 158, 11, 0.3);
  transition: all var(--transition-base);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .detail-card {
    &__name {
      font-size: var(--font-2xl);
    }

    &__hero {
      padding: var(--spacing-xl);
    }

    &__body {
      padding: var(--spacing-lg);
    }

    &__sticky-bar {
      padding: var(--spacing-md) var(--spacing-lg);
    }
  }

  .feature-list {
    grid-template-columns: 1fr;
  }

  .price-current {
    font-size: var(--font-2xl);
  }
}
</style>
