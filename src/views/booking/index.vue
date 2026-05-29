<!--
  预约服务页面
  优雅的预约表单：日期选择、时间段、宠物信息
-->

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useBookingForm } from '@/composables/useBookingForm'
import { useToast } from '@/composables/useToast'
import { useUserStore } from '@/stores/user'
import { submitBooking } from '@/api/booking.api'
import { ServiceCategoryLabel } from '@/types'
import { formatPriceFromYuan } from '@/utils/format'
import { formatDate } from '@/utils/date'

const router = useRouter()
const cartStore = useCartStore()
const toast = useToast()
const userStore = useUserStore()
const { form, errors, submitting, timeSlots, petTypeOptions, validate, reset } =
  useBookingForm(cartStore.selectedService?.id)

const service = computed(() => cartStore.selectedService)

const dateOptions = computed(() => {
  const dates: { label: string; value: string; weekday: string }[] = []
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  for (let i = 0; i < 7; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    dates.push({
      label: formatDate(d),
      value: formatDate(d),
      weekday: weekdays[d.getDay()],
    })
  }
  return dates
})

async function handleSubmit() {
  if (!validate()) {
    toast.error('请完善预约信息')
    return
  }
  if (!service.value) {
    toast.error('请先选择服务项目')
    return
  }
  form.serviceId = service.value.id
  submitting.value = true
  try {
    await submitBooking({ ...form, serviceName: service.value?.name ?? '', price: service.value?.price ?? 0 }, userStore.token)
    toast.success('预约提交成功！')
    reset()
    cartStore.clearSelection()
    setTimeout(() => router.push('/orders'), 1200)
  } catch {
    toast.error('预约失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

function goSelectService() {
  router.push('/services')
}
</script>

<template>
  <div class="booking-page">
    <div class="section-header">
      <h2 class="section-title">预约服务</h2>
      <p class="section-subtitle">选择时间，为爱宠预约一次专业护理</p>
    </div>

    <!-- 未选择服务 -->
    <div v-if="!service" class="empty-state">
      <span class="empty-state__icon">🛁</span>
      <p>请先从服务列表选择需要的服务项目</p>
      <button class="btn-gradient" @click="goSelectService">
        去选择服务 →
      </button>
    </div>

    <!-- 预约表单 -->
    <div v-else class="booking-card">
      <!-- 已选服务摘要 -->
      <div class="booking-card__service">
        <div class="service-summary">
          <span class="service-summary__badge">{{
            ServiceCategoryLabel[service.category]
          }}</span>
          <h3 class="service-summary__name">{{ service.name }}</h3>
          <div class="service-summary__meta">
            <span class="service-summary__price">{{
              formatPriceFromYuan(service.price)
            }}</span>
            <span class="service-summary__divider">·</span>
            <span class="service-summary__duration">⏱ {{ service.duration }}分钟</span>
          </div>
        </div>
        <button class="change-btn" @click="goSelectService">
          更换
        </button>
      </div>

      <!-- 表单区域 -->
      <div class="booking-card__form">
        <!-- 选择日期 -->
        <div class="form-group">
          <label class="form-label">
            <span class="form-label__icon">📅</span>
            预约日期
          </label>
          <div class="date-grid">
            <button
              v-for="d in dateOptions"
              :key="d.value"
              class="date-item"
              :class="{ 'date-item--active': form.bookingDate === d.value }"
              @click="form.bookingDate = d.value"
            >
              <span class="date-item__day">{{ d.label.slice(5) }}</span>
              <span class="date-item__week">{{ d.weekday }}</span>
            </button>
          </div>
          <span v-if="errors.bookingDate" class="form-error">{{
            errors.bookingDate
          }}</span>
        </div>

        <!-- 选择时间段 -->
        <div class="form-group">
          <label class="form-label">
            <span class="form-label__icon">🕐</span>
            时间段
          </label>
          <div class="time-grid">
            <button
              v-for="slot in timeSlots"
              :key="slot"
              class="time-item"
              :class="{ 'time-item--active': form.timeSlot === slot }"
              @click="form.timeSlot = slot"
            >
              {{ slot }}
            </button>
          </div>
          <span v-if="errors.timeSlot" class="form-error">{{
            errors.timeSlot
          }}</span>
        </div>

        <!-- 宠物信息 -->
        <div class="form-group">
          <label class="form-label">
            <span class="form-label__icon">🐾</span>
            宠物名称
          </label>
          <input
            v-model="form.petName"
            class="form-input"
            placeholder="请输入宠物名字"
            maxlength="20"
          />
          <span v-if="errors.petName" class="form-error">{{
            errors.petName
          }}</span>
        </div>

        <div class="form-row">
          <div class="form-group form-group--half">
            <label class="form-label">宠物类型</label>
            <select v-model="form.petType" class="form-input">
              <option
                v-for="opt in petTypeOptions"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>
          </div>
          <div class="form-group form-group--half">
            <label class="form-label">宠物品种</label>
            <input
              v-model="form.petBreed"
              class="form-input"
              placeholder="如：泰迪、英短"
              maxlength="20"
            />
            <span v-if="errors.petBreed" class="form-error">{{
              errors.petBreed
            }}</span>
          </div>
        </div>

        <!-- 备注 -->
        <div class="form-group">
          <label class="form-label">
            <span class="form-label__icon">📝</span>
            备注（选填）
          </label>
          <textarea
            v-model="form.remark"
            class="form-textarea"
            placeholder="如：特殊需求、注意事项、健康状况等"
            rows="3"
            maxlength="200"
          />
        </div>
      </div>

      <!-- 提交按钮 -->
      <button
        class="submit-btn"
        :disabled="submitting"
        @click="handleSubmit"
      >
        <template v-if="submitting">
          <span class="submit-btn__spinner" />
          提交中…
        </template>
        <template v-else>
          确认预约 · {{ formatPriceFromYuan(service.price) }}
        </template>
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.section-header {
  text-align: center;
  padding: var(--spacing-3xl) 0 var(--spacing-xl);
}

.booking-page {
  max-width: 720px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-3xl) var(--spacing-xl);

  &__icon {
    font-size: 64px;
    display: block;
    margin-bottom: var(--spacing-md);
    animation: float 3s ease-in-out infinite;
  }

  p {
    color: var(--color-text-secondary);
    margin-bottom: var(--spacing-xl);
    font-size: var(--font-lg);
  }
}

.btn-gradient {
  display: inline-flex;
  padding: 12px 28px;
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

.booking-card {
  background: var(--color-white);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-card);
  border: 1px solid var(--color-border-light);

  &__service {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: var(--spacing-lg);
    margin-bottom: var(--spacing-lg);
    background: linear-gradient(135deg, #fffbeb, #fef3c7);
    border-radius: var(--radius-lg);
  }

  &__form {
    padding: 0;
  }
}

.service-summary {
  &__badge {
    display: inline-block;
    font-size: var(--font-xs);
    padding: 3px 10px;
    border-radius: var(--radius-full);
    background: rgba(245, 158, 11, 0.15);
    color: #92400e;
    font-weight: 600;
    margin-bottom: var(--spacing-sm);
  }

  &__name {
    font-size: var(--font-xl);
    font-weight: 700;
    color: var(--color-text-primary);
    margin-bottom: var(--spacing-sm);
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }

  &__price {
    font-size: var(--font-xl);
    font-weight: 800;
    color: #dc2626;
  }

  &__divider {
    color: var(--color-text-muted);
  }

  &__duration {
    font-size: var(--font-sm);
    color: var(--color-text-secondary);
  }
}

.change-btn {
  padding: 6px 16px;
  border-radius: var(--radius-full);
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: #92400e;
  font-size: var(--font-sm);
  font-weight: 500;
  transition: all var(--transition-fast);
  flex-shrink: 0;

  &:hover {
    background: rgba(245, 158, 11, 0.1);
    border-color: rgba(245, 158, 11, 0.5);
  }
}

/* 表单 */
.form-group {
  margin-bottom: var(--spacing-lg);
}

.form-row {
  display: flex;
  gap: var(--spacing-md);
}

.form-group--half {
  flex: 1;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--font-sm);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-sm);

  &__icon {
    font-size: 15px;
  }
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 11px 16px;
  border: 2px solid var(--color-border-light);
  border-radius: var(--radius-md);
  font-size: var(--font-base);
  background: var(--color-bg);
  outline: none;
  transition: all var(--transition-fast);
  color: var(--color-text-primary);

  &::placeholder {
    color: var(--color-text-muted);
  }

  &:focus {
    border-color: var(--color-primary);
    background: var(--color-white);
    box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
  }
}

.form-textarea {
  resize: vertical;
}

.form-error {
  display: block;
  margin-top: 6px;
  font-size: var(--font-xs);
  color: var(--color-danger);
}

/* 日期选择 */
.date-grid {
  display: flex;
  gap: var(--spacing-sm);
  overflow-x: auto;
  padding-bottom: 4px;
}

.date-item {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 18px;
  border-radius: var(--radius-md);
  border: 2px solid var(--color-border-light);
  background: var(--color-white);
  transition: all var(--transition-fast);

  &__day {
    font-size: var(--font-lg);
    font-weight: 700;
    color: var(--color-text-primary);
  }

  &__week {
    font-size: var(--font-xs);
    color: var(--color-text-muted);
  }

  &--active {
    border-color: var(--color-primary);
    background: linear-gradient(135deg, #fffbeb, #fef3c7);

    .date-item__day {
      color: #92400e;
    }

    .date-item__week {
      color: var(--color-primary);
      font-weight: 600;
    }
  }

  &:hover:not(&--active) {
    border-color: rgba(245, 158, 11, 0.3);
    background: var(--color-bg);
  }
}

/* 时间段选择 */
.time-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.time-item {
  padding: 10px 18px;
  border-radius: var(--radius-sm);
  border: 2px solid var(--color-border-light);
  background: var(--color-white);
  font-size: var(--font-sm);
  font-weight: 500;
  transition: all var(--transition-fast);
  color: var(--color-text-secondary);

  &--active {
    border-color: var(--color-primary);
    background: linear-gradient(135deg, #fffbeb, #fef3c7);
    color: #92400e;
    font-weight: 700;
  }

  &:hover:not(&--active) {
    border-color: rgba(245, 158, 11, 0.3);
  }
}

/* 提交按钮 */
.submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  width: 100%;
  padding: 16px 0;
  border-radius: var(--radius-md);
  background: var(--color-primary-gradient);
  color: var(--color-white);
  font-size: var(--font-lg);
  font-weight: 700;
  margin-top: var(--spacing-lg);
  box-shadow: 0 4px 16px rgba(245, 158, 11, 0.3);
  transition: all var(--transition-base);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(245, 158, 11, 0.4);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &__spinner {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 0;
  }

  .date-item {
    padding: 10px 14px;

    &__day {
      font-size: var(--font-base);
    }
  }
}
</style>

