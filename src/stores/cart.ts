/**
 * 购物车/预约草稿状态管理 Store
 * 暂存用户正在进行的预约信息
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ServiceItem } from '@/types'

export const useCartStore = defineStore('cart', () => {
  /** 当前选中要预约的服务 */
  const selectedService = ref<ServiceItem | null>(null)

  /**
   * 设置当前预约服务
   * @param service 服务项目
   */
  function selectService(service: ServiceItem) {
    selectedService.value = service
  }

  /** 清除选中的服务 */
  function clearSelection() {
    selectedService.value = null
  }

  return {
    selectedService,
    selectService,
    clearSelection,
  }
})
