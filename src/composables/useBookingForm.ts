/**
 * 预约表单 Composable
 * 封装预约表单的状态管理和校验逻辑
 */

import { ref, reactive, computed } from 'vue'
import { useCartStore } from '@/stores/cart'
import type { BookingFormData } from '@/types'
import { PetType } from '@/types'
import { PET_TYPE_OPTIONS, TIME_SLOTS } from '@/constants/service.const'
import { isNotEmpty } from '@/utils/validator'

export function useBookingForm() {
  const cartStore = useCartStore()

  /** 表单数据 */
  const form = reactive<BookingFormData>({
    serviceId: cartStore.selectedService?.id ?? '',
    bookingDate: '',
    timeSlot: '',
    petName: '',
    petType: PetType.DOG_SMALL,
    petBreed: '',
    remark: '',
  })

  /** 各字段错误信息 */
  const errors = reactive<Record<string, string>>({})
  /** 是否正在提交 */
  const submitting = ref(false)

  /** 可选时间段 */
  const timeSlots = computed(() => TIME_SLOTS)
  /** 宠物类型选项 */
  const petTypeOptions = computed(() => PET_TYPE_OPTIONS)

  /**
   * 校验表单
   * @returns 是否通过校验
   */
  function validate(): boolean {
    // 清空之前的错误
    Object.keys(errors).forEach((k) => delete errors[k])

    if (!isNotEmpty(form.bookingDate)) {
      errors.bookingDate = '请选择预约日期'
    }
    if (!isNotEmpty(form.timeSlot)) {
      errors.timeSlot = '请选择时间段'
    }
    if (!isNotEmpty(form.petName)) {
      errors.petName = '请输入宠物名称'
    }
    if (!isNotEmpty(form.petBreed)) {
      errors.petBreed = '请输入宠物品种'
    }
    return Object.keys(errors).length === 0
  }

  /** 重置表单 */
  function reset() {
    form.bookingDate = ''
    form.timeSlot = ''
    form.petName = ''
    form.petType = PetType.DOG_SMALL
    form.petBreed = ''
    form.remark = ''
    Object.keys(errors).forEach((k) => delete errors[k])
  }

  return {
    form,
    errors,
    submitting,
    timeSlots,
    petTypeOptions,
    validate,
    reset,
  }
}
