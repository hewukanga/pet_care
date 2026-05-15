<!--
  预约服务页面
  提供完整的预约表单：选择日期、时间段、填写宠物信息
-->

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useBookingForm } from '@/composables/useBookingForm'
import { useToast } from '@/composables/useToast'
import { submitBooking } from '@/api/booking.api'
import { ServiceCategoryLabel } from '@/types'
import { formatPrice } from '@/utils/format'
import { formatDate } from '@/utils/date'

const router = useRouter()
const cartStore = useCartStore()
const toast = useToast()
const { form, errors, submitting, timeSlots, petTypeOptions, validate, reset } =
  useBookingForm()

/** 当前选中服务 */
const service = computed(() => cartStore.selectedService)

/**
 * 生成未来7天的日期选项
 */
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

/**
 * 提交预约
 */
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
    await submitBooking({ ...form })
    toast.success('预约提交成功！')
    reset()
    cartStore.clearSelection()
    // 跳转到预约列表
    setTimeout(() => router.push('/orders'), 1000)
  } catch {
    toast.error('预约失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

/** 返回服务列表选择服务 */
function goSelectService() {
  router.push('/services')
}
</script>

<template>
  <div class="booking-page">
    <div class="section-header">
      <h2>预约服务</h2>
      <p>选择服务和时间，为爱宠预约一次专业护理</p>
    </div>

    <!-- 未选择服务时的提示 -->
    <div v-if="!service" class="booking-page__empty">
      <p>请先从服务列表选择需要的服务项目</p>
      <button class="btn-primary" @click="goSelectService">
        去选择服务 →
      </button>
    </div>

    <!-- 预约表单 -->
    <div v-else class="booking-card">
      <!-- 已选服务摘要 -->
      <div class="booking-card__service">
        <span class="badge">{{
          ServiceCategoryLabel[service.category]
        }}</span>
        <h3>{{ service.name }}</h3>
        <div class="price-row">
          <span class="price">{{ formatPrice(service.price) }}</span>
          <span class="duration">⏱ 约{{ service.duration }}分钟</span>
        </div>
        <button class="change-btn" @click="goSelectService">更换服务</button>
      </div>

      <div class="booking-card__form">
        <!-- 选择日期 -->
        <div class="form-group">
          <label class="form-label">预约日期</label>
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
          <label class="form-label">时间段</label>
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
          <label class="form-label">宠物名称</label>
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
          <label class="form-label">备注（选填）</label>
          <textarea
            v-model="form.remark"
            class="form-textarea"
            placeholder="如：特殊需求、注意事项等"
            rows="3"
            maxlength="200"
          />
        </div>
      </div>

      <!-- 提交 -->
      <button
        class="submit-btn"
        :disabled="submitting"
        @click="handleSubmit"
      >
        {{ submitting ? '提交中…' : `确认预约 ${formatPrice(service.price)}` }}
      </button>
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

.booking-page {
  max-width: 720px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);

  &__empty {
    text-align: center;
    padding: var(--spacing-2xl);

    p {
      color: var(--color-text-secondary);
      margin-bottom: var(--spacing-lg);
    }
  }
}

.btn-primary {
  padding: 10px 24px;
  border-radius: var(--radius-full);
  background: var(--color-primary);
  color: var(--color-white);
  font-weight: 600;
  font-size: var(--font-base);

  &:hover {
    background: var(--color-primary-dark);
  }
}

.booking-card {
  background: var(--color-white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);

  &__service {
    position: relative;
    padding-bottom: var(--spacing-lg);
    border-bottom: 1px solid var(--color-border);
    margin-bottom: var(--spacing-lg);

    h3 {
      font-size: var(--font-xl);
      font-weight: 700;
      margin: var(--spacing-sm) 0;
    }

    .price-row {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
    }

    .price {
      font-size: var(--font-xl);
      font-weight: 800;
      color: var(--color-danger);
    }

    .duration {
      font-size: var(--font-sm);
      color: var(--color-text-secondary);
    }

    .change-btn {
      position: absolute;
      top: 0;
      right: 0;
      font-size: var(--font-sm);
      color: var(--color-primary);
      padding: 4px 12px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--color-primary);

      &:hover {
        background: var(--color-primary-bg);
      }
    }
  }
}

.badge {
  display: inline-block;
  font-size: var(--font-xs);
  padding: 2px 10px;
  border-radius: var(--radius-full);
  background: var(--color-primary-bg);
  color: var(--color-primary-dark);
  font-weight: 600;
}

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
  display: block;
  font-size: var(--font-sm);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-sm);
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--font-base);
  background: var(--color-bg);
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: var(--color-primary);
    background: var(--color-white);
  }
}

.form-textarea {
  resize: vertical;
}

.form-error {
  display: block;
  margin-top: 4px;
  font-size: var(--font-xs);
  color: var(--color-danger);
}

/* 日期选择网格 */
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
  gap: 2px;
  padding: 10px 16px;
  border-radius: var(--radius-sm);
  border: 2px solid var(--color-border);
  background: var(--color-white);
  transition: all 0.2s;

  &__day {
    font-size: var(--font-base);
    font-weight: 600;
  }

  &__week {
    font-size: var(--font-xs);
    color: var(--color-text-secondary);
  }

  &--active {
    border-color: var(--color-primary);
    background: var(--color-primary-bg);

    .date-item__day {
      color: var(--color-primary-dark);
    }

    .date-item__week {
      color: var(--color-primary);
    }
  }

  &:hover:not(&--active) {
    border-color: var(--color-primary-light);
  }
}

/* 时间段选择网格 */
.time-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.time-item {
  padding: 8px 14px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-white);
  font-size: var(--font-sm);
  transition: all 0.2s;

  &--active {
    border-color: var(--color-primary);
    background: var(--color-primary-bg);
    color: var(--color-primary-dark);
    font-weight: 600;
  }

  &:hover:not(&--active) {
    border-color: var(--color-primary-light);
  }
}

.submit-btn {
  width: 100%;
  padding: 14px 0;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  color: var(--color-white);
  font-size: var(--font-lg);
  font-weight: 700;
  margin-top: var(--spacing-md);
  transition: opacity 0.2s;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 0;
  }

  .date-item {
    padding: 8px 12px;
  }
}
</style>

