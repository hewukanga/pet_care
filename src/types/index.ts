/**
 * 全局类型定义
 * 定义项目中使用的核心数据结构和接口
 */

// ==================== 通用响应结构 ====================

/** 后端统一响应结构 */
export interface Result<T = unknown> {
  code: number
  message: string
  data: T
}

/** 分页查询参数 */
export interface PageQuery {
  page: number
  pageSize: number
}

/** 分页响应数据 */
export interface PageResult<T> {
  records: T[]
  total: number
  page: number
  pageSize: number
}

// ==================== 服务相关类型 ====================

/** 服务分类枚举 */
export enum ServiceCategory {
  /** 基础洗护 */
  BASIC = 'BASIC',
  /** 美容造型 */
  GROOMING = 'GROOMING',
  /** SPA护理 */
  SPA = 'SPA',
  /** 健康管理 */
  HEALTH = 'HEALTH',
  /** 寄养服务 */
  BOARDING = 'BOARDING',
}

/** 服务分类标签映射 */
export const ServiceCategoryLabel: Record<ServiceCategory, string> = {
  [ServiceCategory.BASIC]: '基础洗护',
  [ServiceCategory.GROOMING]: '美容造型',
  [ServiceCategory.SPA]: 'SPA护理',
  [ServiceCategory.HEALTH]: '健康管理',
  [ServiceCategory.BOARDING]: '寄养服务',
}

/** 服务项目信息 */
export interface ServiceItem {
  id: string
  /** 服务名称 */
  name: string
  /** 服务分类 */
  category: ServiceCategory
  /** 价格（元） */
  price: number
  /** 原价（用于展示折扣） */
  originalPrice?: number
  /** 服务时长（分钟） */
  duration: number
  /** 服务描述 */
  description: string
  /** 封面图片 URL */
  coverImage: string
  /** 详细图片列表 */
  images: string[]
  /** 是否热门 */
  hot: boolean
  /** 是否上架 */
  active: boolean
  /** 适用宠物类型 */
  petTypes: PetType[]
}

// ==================== 宠物类型 ====================

/** 宠物类型枚举 */
export enum PetType {
  DOG_SMALL = 'DOG_SMALL',
  DOG_MEDIUM = 'DOG_MEDIUM',
  DOG_LARGE = 'DOG_LARGE',
  CAT = 'CAT',
  OTHER = 'OTHER',
}

/** 宠物类型标签映射 */
export const PetTypeLabel: Record<PetType, string> = {
  [PetType.DOG_SMALL]: '小型犬',
  [PetType.DOG_MEDIUM]: '中型犬',
  [PetType.DOG_LARGE]: '大型犬',
  [PetType.CAT]: '猫咪',
  [PetType.OTHER]: '其他宠物',
}

// ==================== 预约相关类型 ====================

/** 预约状态枚举 */
export enum BookingStatus {
  /** 待确认 */
  PENDING = 'PENDING',
  /** 已确认 */
  CONFIRMED = 'CONFIRMED',
  /** 服务中 */
  IN_PROGRESS = 'IN_PROGRESS',
  /** 已完成 */
  COMPLETED = 'COMPLETED',
  /** 已取消 */
  CANCELLED = 'CANCELLED',
}

/** 预约状态标签映射 */
export const BookingStatusLabel: Record<BookingStatus, string> = {
  [BookingStatus.PENDING]: '待确认',
  [BookingStatus.CONFIRMED]: '已确认',
  [BookingStatus.IN_PROGRESS]: '服务中',
  [BookingStatus.COMPLETED]: '已完成',
  [BookingStatus.CANCELLED]: '已取消',
}

/** 预约信息 */
export interface Booking {
  id: string
  /** 预约编号 */
  orderNo: string
  /** 服务项目 */
  serviceId: string
  serviceName: string
  /** 预约日期 */
  bookingDate: string
  /** 预约时间段 */
  timeSlot: string
  /** 宠物名称 */
  petName: string
  /** 宠物类型 */
  petType: PetType
  /** 宠物品种 */
  petBreed: string
  /** 备注 */
  remark: string
  /** 预约状态 */
  status: BookingStatus
  /** 价格 */
  price: number
  /** 创建时间 */
  createdAt: string
}

/** 预约表单提交数据 */
export interface BookingFormData {
  serviceId: string
  bookingDate: string
  timeSlot: string
  petName: string
  petType: PetType
  petBreed: string
  remark: string
  /** 服务名称（可选） */
  serviceName?: string
  /** 价格（可选） */
  price?: number
}

// ==================== 用户相关类型 ====================

/** 用户信息 */
export interface UserInfo {
  id: string
  nickname: string
  avatar: string
  phone: string
  /** 认证 token */
  token: string
}

// ==================== 轮播图类型 ====================

/** 轮播图项 */
export interface Banner {
  id: string
  imageUrl: string
  title: string
  subtitle: string
  link?: string
}


// ==================== 评价相关类型 ====================

/** 评价信息 */
export interface Review {
  id: string
  /** 用户名 */
  userName: string
  /** 头像 */
  avatar: string
  /** 服务名称 */
  serviceName: string
  /** 评分 (1-5) */
  rating: number
  /** 评价内容 */
  content: string
  /** 标签图片列表 */
  images: string[]
  /** 宠物类型 */
  petType: string
  /** 创建时间 */
  createdAt: string
}

/** 评价统计 */
export interface ReviewStats {
  averageRating: number
  totalCount: number
  distribution: Record<number, number>
}

