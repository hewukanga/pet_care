<!--
  服务详情页
  展示单个服务的完整信息，并提供预约入口
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

/** 服务详情 */
const service = ref<ServiceItem | null>(null)
/** 加载状态 */
const loading = ref(true)

/**
 * 加载服务详情
 */
async function loadDetail() {
  loading.value = true
  try {
    const id = route.params.id as string
    service.value = await fetchServiceDetail(id)
    if (!service.value) {
      // 未找到则返回列表页
      router.replace('/services')
    }
  } finally {
    loading.value = false
  }
}

/**
 * 立即预约
 */
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
  <div class="service-detail">
    <!-- 加载状态 -->
    <div v-if="loading" class="service-detail__loading">加载中…</div>

    <!-- 详情内容 -->
    <template v-else-if="service">
      <!-- 返回按钮 -->
      <button class="back-btn" @click="router.back()">← 返回</button>

      <div class="service-detail__card">
        <!-- 头部信息 -->
        <div class="service-detail__header">
          <span class="badge">{{
            ServiceCategoryLabel[service.category]
          }}</span>
          <span class="duration">⏱ 约{{ service.duration }}分钟</span>
        </div>

        <h1 class="service-detail__name">{{ service.name }}</h1>

        <!-- 价格 -->
        <div class="service-detail__price">
          <span class="price-current">{{ formatPrice(service.price) }}</span>
          <span v-if="service.originalPrice" class="price-original">
            {{ formatPrice(service.originalPrice) }}
          </span>
          <span v-if="service.originalPrice" class="price-discount">
            省{{ formatPrice(service.originalPrice - service.price) }}
          </span>
        </div>

        <!-- 适用宠物 -->
        <div class="service-detail__pets">
          <span class="label">适用宠物：</span>
          <span class="value">{{
            service.petTypes.map((t) => PetTypeLabel[t]).join('、')
          }}</span>
        </div>

        <!-- 服务描述 -->
        <div class="service-detail__section">
          <h3>服务详情</h3>
          <p>{{ service.description }}</p>
        </div>

        <!-- 预约按钮 -->
        <button class="booking-btn" @click="goBooking">
          立即预约 {{ formatPrice(service.price) }}
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.service-detail {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--spacing-lg) var(--spacing-md);

  &__loading {
    text-align: center;
    padding: var(--spacing-2xl);
    color: var(--color-text-secondary);
  }

  &__card {
    background: var(--color-white);
    border-radius: var(--radius-lg);
    padding: var(--spacing-xl);
    box-shadow: var(--shadow-sm);
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-md);
  }

  &__name {
    font-size: var(--font-2xl);
    font-weight: 700;
    margin-bottom: var(--spacing-md);
  }

  &__price {
    display: flex;
    align-items: baseline;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-lg);
  }

  &__pets {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--color-bg);
    border-radius: var(--radius-sm);
    margin-bottom: var(--spacing-lg);
    font-size: var(--font-sm);

    .label {
      color: var(--color-text-secondary);
    }

    .value {
      color: var(--color-primary-dark);
      font-weight: 600;
    }
  }

  &__section {
    margin-bottom: var(--spacing-xl);

    h3 {
      font-size: var(--font-lg);
      font-weight: 600;
      margin-bottom: var(--spacing-sm);
      padding-bottom: var(--spacing-sm);
      border-bottom: 2px solid var(--color-primary-light);
    }

    p {
      font-size: var(--font-base);
      color: var(--color-text-secondary);
      line-height: 1.8;
    }
  }
}

.back-btn {
  display: inline-block;
  margin-bottom: var(--spacing-md);
  font-size: var(--font-sm);
  color: var(--color-text-secondary);
  padding: 4px 12px;
  border-radius: var(--radius-sm);

  &:hover {
    background: var(--color-bg);
  }
}

.badge {
  font-size: var(--font-xs);
  padding: 4px 12px;
  border-radius: var(--radius-full);
  background: var(--color-primary-bg);
  color: var(--color-primary-dark);
  font-weight: 600;
}

.duration {
  font-size: var(--font-sm);
  color: var(--color-text-secondary);
}

.price-current {
  font-size: 32px;
  font-weight: 800;
  color: var(--color-danger);
}

.price-original {
  font-size: var(--font-base);
  color: var(--color-text-placeholder);
  text-decoration: line-through;
}

.price-discount {
  font-size: var(--font-sm);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  background: #fef2f2;
  color: var(--color-danger);
  font-weight: 600;
}

.booking-btn {
  width: 100%;
  padding: 14px 0;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  color: var(--color-white);
  font-size: var(--font-lg);
  font-weight: 700;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
}
</style>
