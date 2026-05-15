<!--
  首页组件
  包含轮播横幅、服务分类入口、热门服务推荐、特色亮点等模块
-->

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { ServiceItem, Banner } from '@/types'
import { ServiceCategory, ServiceCategoryLabel, PetTypeLabel } from '@/types'
import { fetchHotServices } from '@/api/service.api'
import { formatPrice } from '@/utils/format'

const router = useRouter()

// ===== 轮播图数据 =====
const banners: Banner[] = [
  {
    id: 'b1',
    imageUrl: '',
    title: '专业宠物洗护',
    subtitle: '给爱宠最温柔的呵护，从洗护开始',
    link: '/services',
  },
  {
    id: 'b2',
    imageUrl: '',
    title: '夏日清凉SPA',
    subtitle: '精油护理限时特惠，让爱宠清爽一夏',
    link: '/services',
  },
  {
    id: 'b3',
    imageUrl: '',
    title: '新用户专享',
    subtitle: '首单立减30元，体验专业宠物服务',
    link: '/booking',
  },
]

/** 当前轮播索引 */
const currentBanner = ref(0)
/** 热门服务列表 */
const hotServices = ref<ServiceItem[]>([])

/**
 * 切换轮播图
 * @param index 目标索引
 */
function goToBanner(index: number) {
  currentBanner.value = index
}

/** 轮播自动播放 */
let bannerTimer: ReturnType<typeof setInterval> | null = null

function startBannerAutoPlay() {
  bannerTimer = setInterval(() => {
    currentBanner.value = (currentBanner.value + 1) % banners.length
  }, 4000)
}

// ===== 服务分类快捷入口 =====
const categoryEntries = [
  {
    key: ServiceCategory.BASIC,
    icon: '🛁',
    label: ServiceCategoryLabel[ServiceCategory.BASIC],
    desc: '深层清洁护毛',
  },
  {
    key: ServiceCategory.GROOMING,
    icon: '✂️',
    label: ServiceCategoryLabel[ServiceCategory.GROOMING],
    desc: '专业造型设计',
  },
  {
    key: ServiceCategory.SPA,
    icon: '💆',
    label: ServiceCategoryLabel[ServiceCategory.SPA],
    desc: '精油放松护理',
  },
  {
    key: ServiceCategory.HEALTH,
    icon: '🦷',
    label: ServiceCategoryLabel[ServiceCategory.HEALTH],
    desc: '口腔健康管理',
  },
  {
    key: ServiceCategory.BOARDING,
    icon: '🏠',
    label: ServiceCategoryLabel[ServiceCategory.BOARDING],
    desc: '安心假日寄养',
  },
]

/** 特色亮点 */
const highlights = [
  { icon: '🏅', title: '持证美容师', desc: '全部美容师持证上岗，经验丰富' },
  { icon: '🌿', title: '进口产品', desc: '使用国际认证宠物专用洗护产品' },
  { icon: '🏥', title: '安全第一', desc: '全程监控 + 安全操作规范' },
  { icon: '💯', title: '满意保证', desc: '不满意免费重做，无后顾之忧' },
]

onMounted(async () => {
  startBannerAutoPlay()
  hotServices.value = await fetchHotServices(4)
})
</script>

<template>
  <div class="home">
    <!-- 轮播横幅 -->
    <section class="hero">
      <div
        class="hero__slide"
        v-for="(banner, i) in banners"
        :key="banner.id"
        :class="{ 'hero__slide--active': i === currentBanner }"
        @click="banner.link && router.push(banner.link)"
      >
        <div class="hero__content">
          <h2 class="hero__title">{{ banner.title }}</h2>
          <p class="hero__subtitle">{{ banner.subtitle }}</p>
        </div>
      </div>
      <!-- 轮播指示器 -->
      <div class="hero__dots">
        <button
          v-for="(_, i) in banners"
          :key="i"
          class="hero__dot"
          :class="{ 'hero__dot--active': i === currentBanner }"
          @click.stop="goToBanner(i)"
        />
      </div>
    </section>

    <!-- 服务分类入口 -->
    <section class="categories">
      <div class="section-header">
        <h2 class="section-header__title">我们的服务</h2>
        <p class="section-header__desc">全方位宠物护理，一站式满足爱宠需求</p>
      </div>
      <div class="categories__grid">
        <button
          v-for="cat in categoryEntries"
          :key="cat.key"
          class="categories__card"
          @click="router.push('/services')"
        >
          <span class="categories__icon">{{ cat.icon }}</span>
          <span class="categories__label">{{ cat.label }}</span>
          <span class="categories__desc">{{ cat.desc }}</span>
        </button>
      </div>
    </section>

    <!-- 热门服务推荐 -->
    <section class="hot-services">
      <div class="section-header">
        <h2 class="section-header__title">🔥 热门推荐</h2>
        <p class="section-header__desc">大家都在选的精品服务</p>
      </div>
      <div class="hot-services__grid">
        <div
          v-for="service in hotServices"
          :key="service.id"
          class="service-card"
          @click="router.push(`/service/${service.id}`)"
        >
          <div class="service-card__header">
            <span class="service-card__category">{{
              ServiceCategoryLabel[service.category]
            }}</span>
            <span class="service-card__duration">⏱ {{ service.duration }}分钟</span>
          </div>
          <h3 class="service-card__name">{{ service.name }}</h3>
          <p class="service-card__desc">{{ service.description }}</p>
          <div class="service-card__footer">
            <div class="service-card__price">
              <span class="service-card__price-current">{{
                formatPrice(service.price)
              }}</span>
              <span v-if="service.originalPrice" class="service-card__price-original">{{
                formatPrice(service.originalPrice)
              }}</span>
            </div>
            <span class="service-card__pet-types">
              {{ service.petTypes.map((t) => PetTypeLabel[t]).join('·') }}
            </span>
          </div>
        </div>
      </div>
      <div class="see-more">
        <button class="see-more__btn" @click="router.push('/services')">
          查看全部服务 →
        </button>
      </div>
    </section>

    <!-- 特色亮点 -->
    <section class="highlights">
      <div class="highlights__grid">
        <div
          v-for="item in highlights"
          :key="item.title"
          class="highlights__item"
        >
          <span class="highlights__icon">{{ item.icon }}</span>
          <h3 class="highlights__title">{{ item.title }}</h3>
          <p class="highlights__desc">{{ item.desc }}</p>
        </div>
      </div>
    </section>

    <!-- 底部 CTA -->
    <section class="cta">
      <h2 class="cta__title">准备好给爱宠一次专业护理了吗？</h2>
      <p class="cta__desc">在线预约，到店即享，省时省心</p>
      <button class="cta__btn" @click="router.push('/booking')">
        立即预约 →
      </button>
    </section>
  </div>
</template>

<style scoped lang="scss">
/* 公共 Section 标题 */
.section-header {
  text-align: center;
  padding: var(--spacing-xl) 0 var(--spacing-lg);

  &__title {
    font-size: var(--font-2xl);
    font-weight: 700;
    color: var(--color-text-primary);
  }

  &__desc {
    margin-top: var(--spacing-sm);
    font-size: var(--font-base);
    color: var(--color-text-secondary);
  }
}

.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

/* ===== 轮播横幅 ===== */
.hero {
  position: relative;
  margin-top: var(--spacing-lg);
  border-radius: var(--radius-lg);
  overflow: hidden;
  aspect-ratio: 3 / 1;
  min-height: 280px;
  background: linear-gradient(135deg, #fef3c7, #fde68a);

  &__slide {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.6s ease;
    cursor: pointer;

    &--active {
      opacity: 1;
    }
  }

  &__content {
    text-align: center;
    padding: var(--spacing-xl);
  }

  &__title {
    font-size: var(--font-2xl);
    font-weight: 800;
    color: var(--color-primary-dark);
    margin-bottom: var(--spacing-sm);
  }

  &__subtitle {
    font-size: var(--font-lg);
    color: #92400e;
  }

  &__dots {
    position: absolute;
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 8px;
  }

  &__dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
    transition: all 0.3s;

    &--active {
      background: var(--color-white);
      transform: scale(1.3);
    }
  }
}

/* ===== 服务分类 ===== */
.categories {
  &__grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: var(--spacing-md);
  }

  &__card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-lg) var(--spacing-md);
    background: var(--color-white);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
    transition: all 0.3s;

    &:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-md);
    }
  }

  &__icon {
    font-size: 36px;
  }

  &__label {
    font-weight: 600;
    font-size: var(--font-base);
  }

  &__desc {
    font-size: var(--font-xs);
    color: var(--color-text-secondary);
  }
}

/* ===== 热门服务 ===== */
.hot-services {
  &__grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
  }
}

.service-card {
  background: var(--color-white);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);

  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__category {
    font-size: var(--font-xs);
    padding: 2px 8px;
    border-radius: var(--radius-full);
    background: var(--color-primary-bg);
    color: var(--color-primary-dark);
    font-weight: 600;
  }

  &__duration {
    font-size: var(--font-xs);
    color: var(--color-text-secondary);
  }

  &__name {
    font-size: var(--font-lg);
    font-weight: 700;
    color: var(--color-text-primary);
  }

  &__desc {
    font-size: var(--font-sm);
    color: var(--color-text-secondary);
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-top: auto;
    padding-top: var(--spacing-sm);
  }

  &__price {
    display: flex;
    align-items: baseline;
    gap: var(--spacing-xs);
  }

  &__price-current {
    font-size: var(--font-xl);
    font-weight: 800;
    color: var(--color-danger);
  }

  &__price-original {
    font-size: var(--font-xs);
    color: var(--color-text-placeholder);
    text-decoration: line-through;
  }

  &__pet-types {
    font-size: var(--font-xs);
    color: var(--color-text-placeholder);
  }
}

.see-more {
  text-align: center;
  padding-top: var(--spacing-lg);

  &__btn {
    padding: 10px 28px;
    border-radius: var(--radius-full);
    background: var(--color-primary);
    color: var(--color-white);
    font-size: var(--font-base);
    font-weight: 600;
    transition: background 0.2s;

    &:hover {
      background: var(--color-primary-dark);
    }
  }
}

/* ===== 特色亮点 ===== */
.highlights {
  padding: var(--spacing-2xl) 0;

  &__grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--spacing-lg);
  }

  &__item {
    text-align: center;
    padding: var(--spacing-lg);
  }

  &__icon {
    font-size: 40px;
    display: block;
    margin-bottom: var(--spacing-sm);
  }

  &__title {
    font-size: var(--font-base);
    font-weight: 600;
    margin-bottom: var(--spacing-xs);
  }

  &__desc {
    font-size: var(--font-sm);
    color: var(--color-text-secondary);
  }
}

/* ===== CTA ===== */
.cta {
  text-align: center;
  padding: var(--spacing-2xl) var(--spacing-lg);
  margin: var(--spacing-lg) 0;
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary));
  border-radius: var(--radius-lg);
  color: var(--color-white);

  &__title {
    font-size: var(--font-2xl);
    font-weight: 700;
  }

  &__desc {
    margin-top: var(--spacing-sm);
    font-size: var(--font-base);
    opacity: 0.9;
  }

  &__btn {
    margin-top: var(--spacing-lg);
    padding: 12px 36px;
    border-radius: var(--radius-full);
    background: var(--color-white);
    color: var(--color-primary-dark);
    font-size: var(--font-lg);
    font-weight: 700;
    transition: transform 0.2s;

    &:hover {
      transform: scale(1.05);
    }
  }
}

/* ===== 响应式 ===== */
@media (max-width: 768px) {
  .hero {
    aspect-ratio: 2 / 1;
    min-height: 180px;

    &__title {
      font-size: var(--font-xl);
    }

    &__subtitle {
      font-size: var(--font-base);
    }
  }

  .categories__grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .hot-services__grid {
    grid-template-columns: 1fr;
  }

  .highlights__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
