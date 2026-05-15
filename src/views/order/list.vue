<!--
  我的预约列表页
  精致优雅的订单卡片，展示状态和操作
-->

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Booking } from '@/types'
import { BookingStatus, BookingStatusLabel } from '@/types'
import { fetchBookingList, cancelBooking } from '@/api/booking.api'
import { useToast } from '@/composables/useToast'
import { formatPrice } from '@/utils/format'
import { formatDateTime } from '@/utils/date'

const toast = useToast()

const bookings = ref<Booking[]>([])
const loading = ref(false)

/** 状态样式映射 */
function statusClass(status: BookingStatus): string {
  const map: Record<BookingStatus, string> = {
    [BookingStatus.PENDING]: 'status--pending',
    [BookingStatus.CONFIRMED]: 'status--confirmed',
    [BookingStatus.IN_PROGRESS]: 'status--progress',
    [BookingStatus.COMPLETED]: 'status--completed',
    [BookingStatus.CANCELLED]: 'status--cancelled',
  }
  return map[status] ?? ''
}

/** 状态图标 */
function statusIcon(status: BookingStatus): string {
  const map: Record<BookingStatus, string> = {
    [BookingStatus.PENDING]: '⏳',
    [BookingStatus.CONFIRMED]: '✅',
    [BookingStatus.IN_PROGRESS]: '🔄',
    [BookingStatus.COMPLETED]: '🎉',
    [BookingStatus.CANCELLED]: '❌',
  }
  return map[status] ?? ''
}

async function loadBookings() {
  loading.value = true
  try {
    const result = await fetchBookingList({ page: 1, pageSize: 20 })
    bookings.value = result.records
  } finally {
    loading.value = false
  }
}

async function handleCancel(id: string) {
  const ok = await cancelBooking(id)
  if (ok) {
    toast.success('预约已取消')
    loadBookings()
  } else {
    toast.error('取消失败，该预约无法取消')
  }
}

onMounted(() => {
  loadBookings()
})
</script>

<template>
  <div class="order-list">
    <div class="section-header">
      <h2 class="section-title">📋 我的预约</h2>
      <p class="section-subtitle">查看和管理您的所有预约记录</p>
    </div>

    <!-- 加载 -->
    <div v-if="loading" class="state-msg">
      <span class="state-msg__spinner" />
      加载中…
    </div>

    <!-- 列表 -->
    <div v-else-if="bookings.length > 0" class="order-list__items">
      <div
        v-for="booking in bookings"
        :key="booking.id"
        class="order-card"
      >
        <!-- 状态条 -->
        <div class="order-card__status-bar" :class="statusClass(booking.status)">
          <span class="order-card__status-icon">{{
            statusIcon(booking.status)
          }}</span>
          <span class="order-card__status-text">{{
            BookingStatusLabel[booking.status]
          }}</span>
        </div>

        <div class="order-card__body">
          <div class="order-card__header">
            <h3 class="order-card__service">{{ booking.serviceName }}</h3>
            <span class="order-card__no">{{ booking.orderNo }}</span>
          </div>

          <div class="order-card__info">
            <div class="info-item">
              <span class="info-item__icon">📅</span>
              <div class="info-item__content">
                <span class="info-item__label">预约时间</span>
                <span class="info-item__value">{{
                  `${booking.bookingDate} ${booking.timeSlot}`
                }}</span>
              </div>
            </div>
            <div class="info-item">
              <span class="info-item__icon">🐾</span>
              <div class="info-item__content">
                <span class="info-item__label">宠物</span>
                <span class="info-item__value">{{
                  `${booking.petName}（${booking.petBreed}）`
                }}</span>
              </div>
            </div>
            <div v-if="booking.remark" class="info-item">
              <span class="info-item__icon">📝</span>
              <div class="info-item__content">
                <span class="info-item__label">备注</span>
                <span class="info-item__value">{{ booking.remark }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="order-card__footer">
          <div class="order-card__price">
            <span class="order-card__price-label">合计</span>
            <span class="order-card__price-value">{{
              formatPrice(booking.price)
            }}</span>
          </div>
          <div class="order-card__actions">
            <span class="order-card__time">{{
              formatDateTime(booking.createdAt)
            }}</span>
            <button
              v-if="booking.status === BookingStatus.PENDING"
              class="cancel-btn"
              @click="handleCancel(booking.id)"
            >
              取消预约
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <span class="empty-state__icon">📭</span>
      <p>暂无预约记录</p>
      <router-link to="/booking" class="btn-gradient">
        去预约服务 →
      </router-link>
    </div>
  </div>
</template>

<style scoped lang="scss">
.section-header {
  text-align: center;
  padding: var(--spacing-3xl) 0 var(--spacing-xl);
}

.order-list {
  max-width: 720px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);

  &__items {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }
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

.empty-state {
  text-align: center;
  padding: var(--spacing-3xl);
  color: var(--color-text-secondary);

  &__icon {
    font-size: 56px;
    display: block;
    margin-bottom: var(--spacing-md);
  }

  p {
    font-size: var(--font-lg);
    margin-bottom: var(--spacing-xl);
  }
}

.btn-gradient {
  display: inline-flex;
  padding: 10px 24px;
  border-radius: var(--radius-full);
  background: var(--color-primary-gradient);
  color: var(--color-white);
  font-weight: 700;
  font-size: var(--font-base);
  box-shadow: 0 4px 16px rgba(245, 158, 11, 0.3);
  transition: all var(--transition-base);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
  }
}

/* 订单卡片 */
.order-card {
  background: var(--color-white);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  border: 1px solid var(--color-border-light);
  transition: all var(--transition-base);

  &:hover {
    box-shadow: var(--shadow-card-hover);
  }

  &__status-bar {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: 10px var(--spacing-lg);
    font-size: var(--font-sm);
    font-weight: 600;
  }

  &__status-icon {
    font-size: 16px;
  }

  &__body {
    padding: var(--spacing-lg);
    padding-top: 0;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--spacing-md);
    padding-top: var(--spacing-md);
  }

  &__service {
    font-size: var(--font-xl);
    font-weight: 700;
    color: var(--color-text-primary);
  }

  &__no {
    font-size: var(--font-xs);
    color: var(--color-text-muted);
    white-space: nowrap;
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md) var(--spacing-lg);
    border-top: 1px solid var(--color-border-light);
    background: var(--color-bg);
  }

  &__price {
    display: flex;
    align-items: baseline;
    gap: var(--spacing-sm);

    &-label {
      font-size: var(--font-sm);
      color: var(--color-text-muted);
    }

    &-value {
      font-size: var(--font-2xl);
      font-weight: 800;
      color: #dc2626;
      letter-spacing: -0.5px;
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
  }

  &__time {
    font-size: var(--font-xs);
    color: var(--color-text-muted);
  }
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);

  &__icon {
    font-size: 15px;
    flex-shrink: 0;
    margin-top: 1px;
  }

  &__content {
    display: flex;
    gap: var(--spacing-sm);
  }

  &__label {
    font-size: var(--font-sm);
    color: var(--color-text-muted);
    white-space: nowrap;
  }

  &__value {
    font-size: var(--font-sm);
    color: var(--color-text-primary);
    font-weight: 500;
  }
}

.cancel-btn {
  padding: 6px 16px;
  border-radius: var(--radius-full);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #dc2626;
  font-size: var(--font-sm);
  font-weight: 500;
  transition: all var(--transition-fast);

  &:hover {
    background: var(--color-danger-bg);
    border-color: rgba(239, 68, 68, 0.5);
  }
}

/* 状态条颜色 */
.status--pending {
  background: linear-gradient(135deg, #fef3c7, #fef9c3);
  color: #92400e;
  border-bottom: 1px solid rgba(245, 158, 11, 0.15);
}

.status--confirmed {
  background: linear-gradient(135deg, #dbeafe, #eff6ff);
  color: #1e40af;
  border-bottom: 1px solid rgba(59, 130, 246, 0.1);
}

.status--progress {
  background: linear-gradient(135deg, #d1fae5, #ecfdf5);
  color: #065f46;
  border-bottom: 1px solid rgba(16, 185, 129, 0.1);
}

.status--completed {
  background: linear-gradient(135deg, #e5e7eb, #f3f4f6);
  color: #374151;
  border-bottom: 1px solid rgba(107, 114, 128, 0.1);
}

.status--cancelled {
  background: linear-gradient(135deg, #fee2e2, #fef2f2);
  color: #991b1b;
  border-bottom: 1px solid rgba(239, 68, 68, 0.1);
}
</style>
