/**
 * 服务模块 API
 * 封装服务相关的后端接口调用
 */

import type { ServiceItem, PageResult, PageQuery } from '@/types'
import { ServiceCategory, PetType } from '@/types'

/**
 * 模拟服务数据
 * 在实际项目中应替换为真实 API 调用
 */
const mockServices: ServiceItem[] = [
  {
    id: 's1',
    name: '精致洗护套餐（小型犬）',
    category: ServiceCategory.BASIC,
    price: 128,
    originalPrice: 168,
    duration: 60,
    description: '包含深层清洁、护毛素护理、耳道清洁、指甲修剪、肛门腺清理，使用进口宠物专用洗护产品，温和无刺激。',
    coverImage: '',
    images: [],
    hot: true,
    active: true,
    petTypes: [PetType.DOG_SMALL],
  },
  {
    id: 's2',
    name: '精致洗护套餐（中型犬）',
    category: ServiceCategory.BASIC,
    price: 168,
    originalPrice: 218,
    duration: 75,
    description: '针对中型犬的专业洗护方案，包含全身深层清洁、护毛素保养、耳道清洁、指甲修剪、脚底毛清理。',
    coverImage: '',
    images: [],
    hot: true,
    active: true,
    petTypes: [PetType.DOG_MEDIUM],
  },
  {
    id: 's3',
    name: '精致洗护套餐（大型犬）',
    category: ServiceCategory.BASIC,
    price: 238,
    originalPrice: 298,
    duration: 90,
    description: '大型犬专属洗护方案，双人服务确保安全舒适，含深层清洁、护毛素护理、耳道清洁、指甲修剪、脚底毛清理。',
    coverImage: '',
    images: [],
    hot: false,
    active: true,
    petTypes: [PetType.DOG_LARGE],
  },
  {
    id: 's4',
    name: '猫咪安心洗护',
    category: ServiceCategory.BASIC,
    price: 158,
    originalPrice: 198,
    duration: 45,
    description: '专为猫咪设计的低应激洗护方案，使用无香精温和产品，全程轻柔操作，包含梳毛、清洁、指甲修剪。',
    coverImage: '',
    images: [],
    hot: true,
    active: true,
    petTypes: [PetType.CAT],
  },
  {
    id: 's5',
    name: '萌宠造型修剪',
    category: ServiceCategory.GROOMING,
    price: 198,
    originalPrice: 258,
    duration: 90,
    description: '由资深美容师根据宠物品种特点和主人需求设计专属造型，包含全身修剪、造型设计、眼部护理。',
    coverImage: '',
    images: [],
    hot: true,
    active: true,
    petTypes: [PetType.DOG_SMALL, PetType.DOG_MEDIUM, PetType.CAT],
  },
  {
    id: 's6',
    name: '精油SPA护理',
    category: ServiceCategory.SPA,
    price: 288,
    originalPrice: 368,
    duration: 60,
    description: '采用天然植物精油，配合专业按摩手法，舒缓宠物肌肉疲劳，滋润皮肤毛发，让爱宠享受极致放松体验。',
    coverImage: '',
    images: [],
    hot: false,
    active: true,
    petTypes: [PetType.DOG_SMALL, PetType.DOG_MEDIUM, PetType.DOG_LARGE, PetType.CAT],
  },
  {
    id: 's7',
    name: '牙齿清洁护理',
    category: ServiceCategory.HEALTH,
    price: 168,
    duration: 30,
    description: '使用超声波洁牙设备，温和去除牙结石和牙菌斑，预防口腔疾病，保持宠物口气清新。',
    coverImage: '',
    images: [],
    hot: false,
    active: true,
    petTypes: [PetType.DOG_SMALL, PetType.DOG_MEDIUM, PetType.DOG_LARGE, PetType.CAT],
  },
  {
    id: 's8',
    name: '豪华假日寄养',
    category: ServiceCategory.BOARDING,
    price: 128,
    originalPrice: 168,
    duration: 1440,
    description: '独立舒适寄养间，24小时监控看护，每日定时遛弯和互动玩耍，提供优质粮和纯净水，让主人出行无忧。',
    coverImage: '',
    images: [],
    hot: false,
    active: true,
    petTypes: [PetType.DOG_SMALL, PetType.DOG_MEDIUM, PetType.CAT],
  },
]

/**
 * 获取服务列表
 * @param query 分页查询参数
 * @param category 可选分类筛选
 * @returns 分页服务列表
 */
export async function fetchServiceList(
  query: PageQuery,
  category?: string
): Promise<PageResult<ServiceItem>> {
  // 模拟网络延迟
  await new Promise((r) => setTimeout(r, 300))
  let list = mockServices.filter((s) => s.active)
  if (category) {
    list = list.filter((s) => s.category === category)
  }
  const start = (query.page - 1) * query.pageSize
  return {
    records: list.slice(start, start + query.pageSize),
    total: list.length,
    page: query.page,
    pageSize: query.pageSize,
  }
}

/**
 * 获取服务详情
 * @param id 服务ID
 * @returns 服务信息，不存在则返回 null
 */
export async function fetchServiceDetail(id: string): Promise<ServiceItem | null> {
  await new Promise((r) => setTimeout(r, 200))
  return mockServices.find((s) => s.id === id) ?? null
}

/**
 * 获取热门服务
 * @param limit 返回数量上限
 * @returns 热门服务列表
 */
export async function fetchHotServices(limit = 4): Promise<ServiceItem[]> {
  await new Promise((r) => setTimeout(r, 200))
  return mockServices.filter((s) => s.hot && s.active).slice(0, limit)
}
