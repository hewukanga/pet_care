<!--
  我的预约列表页
  展示用户的所有预约记录，支持查看状态和取消操作
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

/** 预约列表 */
const bookings = ref<Booking[]>([])
/** 加载状态 */
const loading = ref(false)

/** 状态 color 映射 */
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

/** 加载预约列表 */
async function loadBookings() {
  loading.value = true
  try {
    const result = await fetchBookingList({ page: 1, pageSize: 20 })
    bookings.value = result.records
  } finally {
    loading.value = false
  }
}

/**
 * 取消预约
 * @param id 预约ID
 */
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
      <h2>📋 我的预约</h2>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="order-list__loading">加载中…</div>

    <!-- 预约列表 -->
    <div v-else-if="bookings.length > 0" class="order-list__items">
      <div
        v-for="booking in bookings"
        :key="booking.id"
        class="order-card"
      >
        <div class="order-card__header">
          <span class="order-card__no">订单号：{{ booking.orderNo }}</span>
          <span
            class="order-card__status"
            :class="statusClass(booking.status)"
          >
            {{ BookingStatusLabel[booking.status] }}
          </span>
        </div>

        <div class="order-card__body">
          <h3 class="order-card__service">{{ booking.serviceName }}</h3>
          <div class="order-card__info">
            <div class="info-row">
              <span class="info-label">📅 预约时间</span>
              <span>{{ booking.bookingDate }} {{ booking.timeSlot }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">🐾 宠物</span>
              <span>{{ booking.petName }}（{{ booking.petBreed }}）</span>
            </div>
            <div v-if="booking.remark" class="info-row">
              <span class="info-label">📝 备注</span>
              <span>{{ booking.remark }}</span>
            </div>
          </div>
        </div>

        <div class="order-card__footer">
          <span class="order-card__price">{{
            formatPrice(booking.price)
          }}</span>
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

    <!-- 空状态 -->
    <div v-else class="order-list__empty">
      <p>暂无预约记录</p>
      <router-link to="/booking" class="btn-primary">
        去预约服务 →
      </router-link>
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
}

.order-list {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);

  &__loading,
  &__empty {
    text-align: center;
    padding: var(--spacing-2xl);
    color: var(--color-text-secondary);
  }

  &__empty p {
    margin-bottom: var(--spacing-lg);
  }

  &__items {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }
}

.btn-primary {
  display: inline-block;
  padding: 10px 24px;
  border-radius: var(--radius-full);
  background: var(--color-primary);
  color: var(--color-white);
  font-weight: 600;

  &:hover {
    background: var(--color-primary-dark);
  }
}

.order-card {
  background: var(--color-white);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: var(--spacing-md);
    border-bottom: 1px solid var(--color-border);
  }

  &__no {
    font-size: var(--font-sm);
    color: var(--color-text-secondary);
  }

  &__body {
    padding: var(--spacing-md) 0;
  }

  &__service {
    font-size: var(--font-lg);
    font-weight: 700;
    margin-bottom: var(--spacing-md);
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  &__footer {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding-top: var(--spacing-md);
    border-top: 1px solid var(--color-border);
  }

  &__price {
    font-size: var(--font-xl);
    font-weight: 800;
    color: var(--color-danger);
  }

  &__time {
    margin-left: auto;
    font-size: var(--font-xs);
    color: var(--color-text-placeholder);
  }
}

.info-row {
  display: flex;
  gap: var(--spacing-sm);
  font-size: var(--font-sm);
  color: var(--color-text-secondary);

  .info-label {
    flex-shrink: 0;
    color: var(--color-text-primary);
    font-weight: 500;
  }
}

.cancel-btn {
  padding: 6px 16px;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-danger);
  color: var(--color-danger);
  font-size: var(--font-sm);
  transition: all 0.2s;

  &:hover {
    background: #fef2f2;
  }
}

/* 状态标签 */
.order-card__status {
  font-size: var(--font-xs);
  padding: 2px 10px;
  border-radius: var(--radius-full);
  font-weight: 600;
}

.status--pending {
  background: #fef3c7;
  color: #92400e;
}

.status--confirmed {
  background: #dbeafe;
  color: #1e40af;
}

.status--progress {
  background: #d1fae5;
  color: #065f46;
}

.status--completed {
  background: #e5e7eb;
  color: #374151;
}

.status--cancelled {
  background: #fee2e2;
  color: #991b1b;
}
</style>
