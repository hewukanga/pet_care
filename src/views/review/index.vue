<!--
  评价展示页面
  展示所有用户的评价列表，含评分统计和星级分布
-->

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchReviewList, fetchReviewStats, fetchMyReviewList, deleteReview } from '@/api/review.api'
import type { Review, ReviewStats } from '@/types'
import { useUserStore } from '@/stores/user'
import { useToast } from '@/composables/useToast'
import { formatDate } from '@/utils/date'

/** 评价列表 */
const reviews = ref<Review[]>([])
/** 评价统计 */
const stats = ref<ReviewStats | null>(null)
/** 当前页码 */
const page = ref(1)
/** 总记录数 */
const total = ref(0)
/** 每页数量 */
const pageSize = 10
/** 是否加载中 */
const loading = ref(false)
const tab = ref<'all' | 'my'>('all')
const userStore = useUserStore()
const toast = useToast()

/** 加载评价数据 */
async function loadReviews() {
  loading.value = true
  try {
    let result
    if (tab.value === 'my' && userStore.token) {
      result = await fetchMyReviewList({ page: page.value, pageSize }, userStore.token)
    } else {
      result = await fetchReviewList({ page: page.value, pageSize })
    }
    reviews.value = result.records
    total.value = result.total
  } catch {
    console.error('加载评价失败')
  } finally {
    loading.value = false
  }
}

/** 加载统计数据 */
async function loadStats() {
  try {
    stats.value = await fetchReviewStats()
  } catch {
    console.error('加载统计失败')
  }
}

/** 渲染星级 */
function renderStars(rating: number): string {
  return '⭐'.repeat(rating) + '☆'.repeat(5 - rating)
}

/** 总页数 */
function totalPages(): number {
  return Math.ceil(total.value / pageSize)
}

/** 切换页码 */
function goPage(p: number) {
  if (p < 1 || p > totalPages()) return
  page.value = p
  loadReviews()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function switchTab(t: 'all' | 'my') {
  if (t === 'my' && !userStore.isLoggedIn) {
    toast.error('请先登录')
    return
  }
  tab.value = t
  page.value = 1
  loadReviews()
  if (t === 'all') loadStats()
}

async function handleDelete(id: string) {
  if (!confirm('确定删除这条评价吗？')) return
  try {
    await deleteReview(id, userStore.token)
    toast.success('删除成功')
    loadReviews()
  } catch {
    toast.error('删除失败')
  }
}

onMounted(() => {
  loadReviews()
  loadStats()
})
</script>

<template>
  <div class="review-page">
    <div class="section-header">
      <h2 class="section-title">客户评价</h2>
      <p class="section-subtitle">听听宠物主人们的真实反馈</p>
    </div>

    <!-- Tab切换 -->
    <div class="tab-bar">
      <button
        class="tab-btn"
        :class="{ 'tab-btn--active': tab === 'all' }"
        @click="switchTab('all')"
      >全部评价</button>
      <button
        class="tab-btn"
        :class="{ 'tab-btn--active': tab === 'my' }"
        @click="switchTab('my')"
      >我的评价</button>
    </div>

    <!-- 评分统计卡片 -->
    <div v-if="stats && tab === 'all'" class="stats-card">
      <div class="stats-card__main">
        <span class="stats-card__score">{{ stats.averageRating }}</span>
        <div class="stats-card__stars">
          <span class="stars-text">{{ renderStars(Math.round(stats.averageRating)) }}</span>
        </div>
        <span class="stats-card__count">共 {{ stats.totalCount }} 条评价</span>
      </div>
      <div class="stats-card__bars">
        <div
          v-for="star in [5, 4, 3, 2, 1]"
          :key="star"
          class="bar-row"
        >
          <span class="bar-row__label">{{ star }}星</span>
          <div class="bar-row__track">
            <div
              class="bar-row__fill"
              :style="{
                width: stats.totalCount
                  ? ((stats.distribution[star] || 0) / stats.totalCount * 100) + '%'
                  : '0%'
              }"
            />
          </div>
          <span class="bar-row__num">{{ stats.distribution[star] || 0 }}</span>
        </div>
      </div>
    </div>

    <!-- 评价列表 -->
    <div v-if="loading" class="loading">
      <span class="spinner" />
      加载中…
    </div>

    <div v-else-if="reviews.length === 0" class="empty-state">
      <span class="empty-state__icon">📝</span>
      <p>暂无评价</p>
    </div>

    <div v-else class="review-list">
      <div
        v-for="item in reviews"
        :key="item.id"
        class="review-card"
      >
        <div class="review-card__header">
          <span class="review-card__avatar">{{ item.avatar }}</span>
          <div class="review-card__user">
            <span class="review-card__name">{{ item.userName }}</span>
            <span class="review-card__date">{{ formatDate(item.createdAt) }}</span>
          </div>
          <div class="review-card__rating">
            <span class="review-card__stars">{{ renderStars(item.rating) }}</span>
          </div>
        </div>
        <div class="review-card__body">
          <p class="review-card__content">{{ item.content }}</p>
          <div class="review-card__meta">
            <span class="review-card__service">{{ item.serviceName }}</span>
            <span
              v-if="item.petType"
              class="review-card__tag"
            >{{ item.petType }}</span>
            <button
              v-if="tab === 'my'"
              class="review-card__delete"
              @click="handleDelete(item.id)"
            >删除</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="totalPages() > 1" class="pagination">
      <button
        class="pagination__btn"
        :disabled="page <= 1"
        @click="goPage(page - 1)"
      >
        上一页
      </button>
      <span class="pagination__info">{{ page }} / {{ totalPages() }}</span>
      <button
        class="pagination__btn"
        :disabled="page >= totalPages()"
        @click="goPage(page + 1)"
      >
        下一页
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.review-page {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

.section-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);

  .section-title {
    font-size: var(--font-2xl);
    font-weight: 800;
    color: var(--color-text-primary);
    margin-bottom: var(--spacing-xs);
  }

  .section-subtitle {
    font-size: var(--font-base);
    color: var(--color-text-muted);
  }
}

/* 统计卡片 */
.stats-card {
  display: flex;
  gap: var(--spacing-xl);
  background: var(--color-white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  margin-bottom: var(--spacing-xl);

  &__main {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-sm);
    min-width: 120px;
  }

  &__score {
    font-size: 48px;
    font-weight: 800;
    color: var(--color-primary);
    line-height: 1;
  }

  .stars-text {
    font-size: var(--font-sm);
  }

  &__count {
    font-size: var(--font-xs);
    color: var(--color-text-muted);
  }

  &__bars {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
}

.bar-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);

  &__label {
    width: 30px;
    font-size: var(--font-xs);
    color: var(--color-text-secondary);
  }

  &__track {
    flex: 1;
    height: 8px;
    background: var(--color-border-light);
    border-radius: var(--radius-full);
    overflow: hidden;
  }

  &__fill {
    height: 100%;
    background: linear-gradient(90deg, var(--color-primary), #fbbf24);
    border-radius: var(--radius-full);
    transition: width 0.4s ease;
  }

  &__num {
    width: 24px;
    font-size: var(--font-xs);
    color: var(--color-text-muted);
    text-align: right;
  }
}

/* 评价卡片 */
.review-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.review-card {
  background: var(--color-white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.04);
  transition: box-shadow var(--transition-fast);

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  }

  &__header {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-md);
  }

  &__avatar {
    font-size: 32px;
  }

  &__user {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  &__name {
    font-weight: 600;
    font-size: var(--font-base);
    color: var(--color-text-primary);
  }

  &__date {
    font-size: var(--font-xs);
    color: var(--color-text-muted);
  }

  &__stars {
    font-size: var(--font-sm);
  }

  &__content {
    font-size: var(--font-base);
    color: var(--color-text-primary);
    line-height: 1.6;
    margin-bottom: var(--spacing-sm);
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }

  &__service {
    font-size: var(--font-xs);
    color: var(--color-primary);
    background: rgba(245, 158, 11, 0.1);
    padding: 2px 10px;
    border-radius: var(--radius-full);
  }

  &__tag {
    font-size: var(--font-xs);
    color: var(--color-text-muted);
    background: var(--color-bg);
    padding: 2px 10px;
    border-radius: var(--radius-full);
  }
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xl);
  color: var(--color-text-muted);
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-border-light);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-text-muted);

  &__icon {
    font-size: 48px;
    display: block;
    margin-bottom: var(--spacing-sm);
  }
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);

  &__btn {
    padding: 8px 20px;
    border-radius: var(--radius-full);
    border: 1px solid var(--color-border-light);
    background: var(--color-white);
    font-size: var(--font-sm);
    color: var(--color-text-primary);
    cursor: pointer;
    transition: all var(--transition-fast);

    &:hover:not(:disabled) {
      border-color: var(--color-primary);
      color: var(--color-primary);
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }

  &__info {
    font-size: var(--font-sm);
    color: var(--color-text-muted);
  }
}

@media (max-width: 768px) {
  .review-page {
    padding: var(--spacing-md);
  }

  .stats-card {
    flex-direction: column;
    align-items: center;
  }
}

/* Tab切换 */
.tab-bar {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
}

.tab-btn {
  flex: 1;
  padding: 10px 0;
  border-radius: var(--radius-md);
  border: 2px solid var(--color-border-light);
  background: var(--color-white);
  font-size: var(--font-base);
  font-weight: 600;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);

  &--active {
    border-color: var(--color-primary);
    background: linear-gradient(135deg, #fffbeb, #fef3c7);
    color: #92400e;
  }

  &:hover:not(&--active) {
    border-color: rgba(245, 158, 11, 0.3);
  }
}

.review-card__delete {
  margin-left: auto;
  padding: 2px 10px;
  border-radius: var(--radius-full);
  border: 1px solid rgba(239, 68, 68, 0.3);
  background: transparent;
  color: #dc2626;
  font-size: var(--font-xs);
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    background: rgba(239, 68, 68, 0.08);
  }
}

</style>
