<!--
  服务列表页
  展示所有可用服务项目，支持分类筛选
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

/** 当前选中分类 */
const activeCategory = ref('')
/** 服务列表 */
const services = ref<ServiceItem[]>([])
/** 加载状态 */
const loading = ref(false)
/** 分类选项 */
const categoryOptions = SERVICE_CATEGORY_OPTIONS

/**
 * 加载服务列表
 */
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

/**
 * 切换分类筛选
 * @param category 分类值
 */
function switchCategory(category: string) {
  activeCategory.value = category
  loadServices()
}

/**
 * 查看服务详情
 * @param id 服务ID
 */
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
      <h2>服务项目</h2>
      <p>选择最适合您爱宠的专业护理服务</p>
    </div>

    <!-- 分类筛选 -->
    <div class="filter-bar">
      <button
        v-for="opt in categoryOptions"
        :key="opt.value"
        class="filter-bar__btn"
        :class="{ 'filter-bar__btn--active': activeCategory === opt.value }"
        @click="switchCategory(opt.value)"
      >
        {{ opt.label }}
      </button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="service-list__loading">加载中…</div>

    <!-- 服务列表 -->
    <div v-else class="service-list__grid">
      <div
        v-for="service in services"
        :key="service.id"
        class="service-card"
        @click="viewDetail(service.id)"
      >
        <div class="service-card__header">
          <span class="service-card__category">{{
            ServiceCategoryLabel[service.category]
          }}</span>
          <span class="service-card__duration">⏱ {{ service.duration }}分钟</span>
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
          <span class="service-card__pet-types">
            {{ service.petTypes.map((t) => PetTypeLabel[t]).join('·') }}
          </span>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!loading && services.length === 0" class="service-list__empty">
      <p>暂无相关服务</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.section-header {
  text-align: center;
  padding: var(--spacing-xl) 0 var(--spacing-lg);

  h2 {
    font-size: var(--font-2xl);
    font-weight: 700;
  }

  p {
    margin-top: var(--spacing-sm);
    color: var(--color-text-secondary);
  }
}

.service-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  justify-content: center;
  margin-bottom: var(--spacing-lg);

  &__btn {
    padding: 6px 16px;
    border-radius: var(--radius-full);
    font-size: var(--font-sm);
    background: var(--color-white);
    color: var(--color-text-secondary);
    border: 1px solid var(--color-border);
    transition: all 0.2s;

    &:hover {
      border-color: var(--color-primary);
      color: var(--color-primary);
    }

    &--active {
      background: var(--color-primary);
      color: var(--color-white);
      border-color: var(--color-primary);
    }
  }
}

.service-list__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}

.service-list__loading,
.service-list__empty {
  text-align: center;
  padding: var(--spacing-2xl);
  color: var(--color-text-secondary);
}

.service-card {
  background: var(--color-white);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);

  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__category {
    font-size: var(--font-xs);
    padding: 2px 8px;
    border-radius: var(--radius-full);
    background: var(--color-primary-bg);
    color: var(--color-primary-dark);
    font-weight: 600;
  }

  &__duration {
    font-size: var(--font-xs);
    color: var(--color-text-secondary);
  }

  &__name {
    font-size: var(--font-lg);
    font-weight: 700;
  }

  &__desc {
    font-size: var(--font-sm);
    color: var(--color-text-secondary);
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-top: auto;
    padding-top: var(--spacing-sm);
  }

  &__price-current {
    font-size: var(--font-xl);
    font-weight: 800;
    color: var(--color-danger);
  }

  &__price-original {
    font-size: var(--font-xs);
    color: var(--color-text-placeholder);
    text-decoration: line-through;
    margin-left: var(--spacing-xs);
  }

  &__pet-types {
    font-size: var(--font-xs);
    color: var(--color-text-placeholder);
  }
}

@media (max-width: 768px) {
  .service-list__grid {
    grid-template-columns: 1fr;
  }
}
</style>
