<!--
  服务列表页
  优雅展示所有可用服务，支持分类筛选
-->

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { ServiceItem } from '@/types'
import { ServiceCategoryLabel, PetTypeLabel } from '@/types'
import { fetchServiceList } from '@/api/service.api'
import { SERVICE_CATEGORY_OPTIONS } from '@/constants/service.const'
import { formatPrice } from '@/utils/format'

const router = useRouter()

const activeCategory = ref('')
const services = ref<ServiceItem[]>([])
const loading = ref(false)
const categoryOptions = SERVICE_CATEGORY_OPTIONS

async function loadServices() {
  loading.value = true
  try {
    const result = await fetchServiceList(
      { page: 1, pageSize: 20 },
      activeCategory.value || undefined
    )
    services.value = result.records
  } finally {
    loading.value = false
  }
}

function switchCategory(category: string) {
  activeCategory.value = category
  loadServices()
}

function viewDetail(id: string) {
  router.push(`/service/${id}`)
}

onMounted(() => {
  loadServices()
})
</script>

<template>
  <div class="service-list">
    <div class="section-header">
      <h2 class="section-title">服务项目</h2>
      <p class="section-subtitle">选择最适合您爱宠的专业护理方案</p>
    </div>

    <!-- 分类筛选 -->
    <div class="filter-bar">
      <button
        v-for="opt in categoryOptions"
        :key="opt.value"
        class="filter-btn"
        :class="{ 'filter-btn--active': activeCategory === opt.value }"
        @click="switchCategory(opt.value)"
      >
        {{ opt.label }}
      </button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="state-msg">
      <span class="state-msg__spinner" />
      加载中…
    </div>

    <!-- 服务列表 -->
    <div v-else class="service-list__grid">
      <div
        v-for="(service, index) in services"
        :key="service.id"
        class="service-card"
        :style="{ animationDelay: `${index * 0.05}s` }"
        @click="viewDetail(service.id)"
      >
        <div class="service-card__header">
          <span class="service-card__badge">{{
            ServiceCategoryLabel[service.category]
          }}</span>
          <span class="service-card__duration">
            <span>⏱</span> {{ service.duration }}分钟
          </span>
        </div>
        <h3 class="service-card__name">{{ service.name }}</h3>
        <p class="service-card__desc">{{ service.description }}</p>
        <div class="service-card__footer">
          <div class="service-card__price">
            <span class="service-card__price-current">{{
              formatPrice(service.price)
            }}</span>
            <span
              v-if="service.originalPrice"
              class="service-card__price-original"
            >
              {{ formatPrice(service.originalPrice) }}
            </span>
          </div>
          <span class="service-card__pets">
            {{ service.petTypes.map((t) => PetTypeLabel[t]).join(' · ') }}
          </span>
        </div>
        <div class="service-card__hover-glow" />
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!loading && services.length === 0" class="state-msg">
      <span class="state-msg__icon">📭</span>
      <p>暂无相关服务</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.section-header {
  text-align: center;
  padding: var(--spacing-3xl) 0 var(--spacing-xl);
}

.service-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

/* 筛选栏 */
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  justify-content: center;
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-sm);
  background: var(--color-white);
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-xs);
}

.filter-btn {
  padding: 8px 20px;
  border-radius: var(--radius-full);
  font-size: var(--font-sm);
  font-weight: 500;
  background: transparent;
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);

  &:hover {
    color: var(--color-primary);
    background: var(--color-primary-bg);
  }

  &--active {
    background: var(--color-primary-gradient);
    color: var(--color-white);
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);

    &:hover {
      color: var(--color-white);
      background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%);
    }
  }
}

/* 网格 */
.service-list__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-lg);
}

/* 卡片 */
.service-card {
  position: relative;
  background: var(--color-white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-card);
  cursor: pointer;
  transition: all var(--transition-base);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  overflow: hidden;
  animation: fadeInUp 0.5s ease both;

  &__hover-glow {
    position: absolute;
    inset: 0;
    border-radius: var(--radius-lg);
    background: radial-gradient(ellipse at 50% 0%, rgba(245, 158, 11, 0.06), transparent 70%);
    opacity: 0;
    transition: opacity var(--transition-base);
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-card-hover);
    border-color: rgba(245, 158, 11, 0.15);

    .service-card__hover-glow {
      opacity: 1;
    }
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__badge {
    font-size: var(--font-xs);
    padding: 4px 12px;
    border-radius: var(--radius-full);
    background: linear-gradient(135deg, #fffbeb, #fef3c7);
    color: #92400e;
    font-weight: 600;
  }

  &__duration {
    font-size: var(--font-xs);
    color: var(--color-text-muted);
  }

  &__name {
    font-size: var(--font-xl);
    font-weight: 700;
    color: var(--color-text-primary);
    letter-spacing: -0.3px;
  }

  &__desc {
    font-size: var(--font-sm);
    color: var(--color-text-secondary);
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    flex: 1;
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-top: auto;
  }

  &__price {
    display: flex;
    align-items: baseline;
    gap: var(--spacing-xs);
  }

  &__price-current {
    font-size: var(--font-2xl);
    font-weight: 800;
    color: #dc2626;
    letter-spacing: -0.5px;
  }

  &__price-original {
    font-size: var(--font-sm);
    color: var(--color-text-muted);
    text-decoration: line-through;
  }

  &__pets {
    font-size: var(--font-xs);
    color: var(--color-text-muted);
    background: var(--color-bg-alt);
    padding: 2px 10px;
    border-radius: var(--radius-full);
  }
}

/* 状态提示 */
.state-msg {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-3xl);
  color: var(--color-text-muted);

  &__icon {
    font-size: 40px;
  }

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

@media (max-width: 768px) {
  .service-list__grid {
    grid-template-columns: 1fr;
  }

  .filter-bar {
    border-radius: var(--radius-md);
  }
}
</style>
