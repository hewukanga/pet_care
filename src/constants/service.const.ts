/**
 * 服务模块常量
 * 定义服务相关的固定配置项
 */

import { ServiceCategory, PetType } from '@/types'

/** 服务分类筛选项 */
export const SERVICE_CATEGORY_OPTIONS = [
  { label: '全部', value: '' },
  { label: '基础洗护', value: ServiceCategory.BASIC },
  { label: '美容造型', value: ServiceCategory.GROOMING },
  { label: 'SPA护理', value: ServiceCategory.SPA },
  { label: '健康管理', value: ServiceCategory.HEALTH },
  { label: '寄养服务', value: ServiceCategory.BOARDING },
]

/** 宠物类型选项 */
export const PET_TYPE_OPTIONS = [
  { label: '小型犬', value: PetType.DOG_SMALL },
  { label: '中型犬', value: PetType.DOG_MEDIUM },
  { label: '大型犬', value: PetType.DOG_LARGE },
  { label: '猫咪', value: PetType.CAT },
  { label: '其他宠物', value: PetType.OTHER },
]

/** 可预约时间段 */
export const TIME_SLOTS = [
  '09:00-10:00',
  '10:00-11:00',
  '11:00-12:00',
  '13:00-14:00',
  '14:00-15:00',
  '15:00-16:00',
  '16:00-17:00',
  '17:00-18:00',
]
