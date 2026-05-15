<!--
  首页组件
  精致优雅的宠物洗护服务展示首页
-->

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
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
    subtitle: '给爱宠最温柔的呵护，从每一次洗护开始',
    link: '/services',
  },
  {
    id: 'b2',
    imageUrl: '',
    title: '夏日清凉SPA',
    subtitle: '精油护理 · 限时特惠 · 让爱宠清爽一夏',
    link: '/services',
  },
  {
    id: 'b3',
    imageUrl: '',
    title: '新用户专享礼遇',
    subtitle: '首单立减 ¥30，体验专业宠物服务',
    link: '/booking',
  },
]

const currentBanner = ref(0)
const hotServices = ref<ServiceItem[]>([])
let bannerTimer: ReturnType<typeof setInterval> | null = null

function goToBanner(index: number) {
  currentBanner.value = index
}

function startBannerAutoPlay() {
  bannerTimer = setInterval(() => {
    currentBanner.value = (currentBanner.value + 1) % banners.length
  }, 5000)
}

onMounted(async () => {
  startBannerAutoPlay()
  hotServices.value = await fetchHotServices(4)
})

onUnmounted(() => {
  if (bannerTimer) clearInterval(bannerTimer)
})

// ===== 服务分类快捷入口 =====
const categoryEntries = [
  { key: ServiceCategory.BASIC, icon: '🛁', label: ServiceCategoryLabel[ServiceCategory.BASIC], desc: '深层清洁护毛' },
  { key: ServiceCategory.GROOMING, icon: '✂️', label: ServiceCategoryLabel[ServiceCategory.GROOMING], desc: '专业造型设计' },
  { key: ServiceCategory.SPA, icon: '💆', label: ServiceCategoryLabel[ServiceCategory.SPA], desc: '精油放松护理' },
  { key: ServiceCategory.HEALTH, icon: '🦷', label: ServiceCategoryLabel[ServiceCategory.HEALTH], desc: '口腔健康管理' },
  { key: ServiceCategory.BOARDING, icon: '🏠', label: ServiceCategoryLabel[ServiceCategory.BOARDING], desc: '安心假日寄养' },
]

const highlights = [
  { icon: '🏅', title: '持证美容师', desc: '全部美容师持证上岗 · 经验丰富 · 定期培训' },
  { icon: '🌿', title: '进口产品', desc: '国际认证宠物专用洗护产品 · 温和零刺激' },
  { icon: '🏥', title: '安全第一', desc: '全程高清监控 · 严格安全操作规范' },
  { icon: '💯', title: '满意保证', desc: '不满意免费重做 · 7天无忧售后保障' },
]
</script>

<template>
  <div class="home">
    <!-- Hero 轮播区 -->
    <section class="hero">
      <!-- 装饰背景 -->
      <div class="hero__bg">
        <div class="hero__bg-circle hero__bg-circle--1" />
        <div class="hero__bg-circle hero__bg-circle--2" />
        <div class="hero__bg-circle hero__bg-circle--3" />
      </div>

      <div class="hero__inner">
        <div
          v-for="(banner, i) in banners"
          :key="banner.id"
          class="hero__slide"
          :class="{ 'hero__slide--active': i === currentBanner }"
          @click="banner.link && router.push(banner.link)"
        >
          <div class="hero__content">
            <div class="hero__badge">🐾 PetCare 宠物洗护专家</div>
            <h2 class="hero__title">{{ banner.title }}</h2>
            <p class="hero__subtitle">{{ banner.subtitle }}</p>
            <button class="hero__cta" @click.stop="banner.link && router.push(banner.link)">
              了解更多 →
            </button>
          </div>
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

      <!-- 底部统计条 -->
      <div class="hero__stats">
        <div class="hero__stat">
          <span class="hero__stat-num">5000+</span>
          <span class="hero__stat-label">服务宠物</span>
        </div>
        <div class="hero__stat-divider" />
        <div class="hero__stat">
          <span class="hero__stat-num">98%</span>
          <span class="hero__stat-label">好评率</span>
        </div>
        <div class="hero__stat-divider" />
        <div class="hero__stat">
          <span class="hero__stat-num">8+</span>
          <span class="hero__stat-label">年经验</span>
        </div>
      </div>
    </section>

    <!-- 服务分类入口 -->
    <section class="categories">
      <div class="section-header">
        <h2 class="section-title">我们的服务</h2>
        <p class="section-subtitle">全方位宠物护理，一站式满足爱宠所有需求</p>
      </div>
      <div class="categories__grid">
        <button
          v-for="(cat, index) in categoryEntries"
          :key="cat.key"
          class="categories__card"
          :style="{ animationDelay: `${index * 0.08}s` }"
          @click="router.push('/services')"
        >
          <div class="categories__icon-wrap">
            <span class="categories__icon">{{ cat.icon }}</span>
          </div>
          <span class="categories__label">{{ cat.label }}</span>
          <span class="categories__desc">{{ cat.desc }}</span>
        </button>
      </div>
    </section>

    <!-- 热门服务推荐 -->
    <section class="hot-services">
      <div class="section-header">
        <h2 class="section-title">🔥 热门推荐</h2>
        <p class="section-subtitle">大家都在选的精品服务，品质有保障</p>
      </div>
      <div class="hot-services__grid">
        <div
          v-for="service in hotServices"
          :key="service.id"
          class="service-card"
          @click="router.push(`/service/${service.id}`)"
        >
          <div class="service-card__header">
            <span class="service-card__badge">{{
              ServiceCategoryLabel[service.category]
            }}</span>
            <span class="service-card__duration">
              <span class="service-card__duration-icon">⏱</span>
              {{ service.duration }}分钟
            </span>
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
            <span class="service-card__pets">
              {{ service.petTypes.map((t) => PetTypeLabel[t]).join(' · ') }}
            </span>
          </div>
          <!-- 悬浮渐变遮罩 -->
          <div class="service-card__hover-glow" />
        </div>
      </div>
      <div class="see-more">
        <button class="see-more__btn" @click="router.push('/services')">
          查看全部服务
          <span class="see-more__arrow">→</span>
        </button>
      </div>
    </section>

    <!-- 特色亮点 -->
    <section class="highlights">
      <div class="highlights__grid">
        <div v-for="item in highlights" :key="item.title" class="highlights__item">
          <div class="highlights__icon-wrap">
            <span class="highlights__icon">{{ item.icon }}</span>
          </div>
          <h3 class="highlights__title">{{ item.title }}</h3>
          <p class="highlights__desc">{{ item.desc }}</p>
        </div>
      </div>
    </section>

    <!-- 底部 CTA -->
    <section class="cta">
      <div class="cta__inner">
        <span class="cta__emoji">🐶</span>
        <h2 class="cta__title">准备好给爱宠一次专业护理了吗？</h2>
        <p class="cta__desc">在线预约 · 到店即享 · 省时省心</p>
        <button class="cta__btn" @click="router.push('/booking')">
          立即预约
          <span class="cta__btn-arrow">→</span>
        </button>
        <div class="cta__paws">
          <span class="cta__paw cta__paw--1">🐾</span>
          <span class="cta__paw cta__paw--2">🐾</span>
          <span class="cta__paw cta__paw--3">🐾</span>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
/* 公共 Section 标题 */
.section-header {
  text-align: center;
  padding: var(--spacing-3xl) 0 var(--spacing-xl);
}

.home {
  overflow: hidden;
}

/* ===== Hero 轮播区 ===== */
.hero {
  position: relative;
  margin: var(--spacing-lg) var(--spacing-md) 0;
  border-radius: var(--radius-xl);
  overflow: hidden;
  min-height: 420px;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 30%, #fcd34d 60%, #f59e0b 100%);

  &__bg {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
  }

  &__bg-circle {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.15);

    &--1 {
      width: 400px;
      height: 400px;
      top: -150px;
      right: -80px;
      animation: float 6s ease-in-out infinite;
    }

    &--2 {
      width: 200px;
      height: 200px;
      bottom: -60px;
      left: 10%;
      background: rgba(255, 255, 255, 0.1);
      animation: float 5s ease-in-out infinite 1s;
    }

    &--3 {
      width: 100px;
      height: 100px;
      top: 20%;
      left: 5%;
      background: rgba(255, 255, 255, 0.12);
      animation: float 4s ease-in-out infinite 2s;
    }
  }

  &__inner {
    position: relative;
    z-index: 2;
    height: 100%;
    min-height: 360px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__slide {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transform: scale(0.97);
    transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1),
      transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;

    &--active {
      opacity: 1;
      transform: scale(1);
    }
  }

  &__content {
    text-align: center;
    padding: var(--spacing-xl);
    max-width: 600px;
  }

  &__badge {
    display: inline-block;
    padding: 6px 16px;
    border-radius: var(--radius-full);
    background: rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(8px);
    font-size: var(--font-sm);
    font-weight: 600;
    color: #92400e;
    margin-bottom: var(--spacing-lg);
  }

  &__title {
    font-size: var(--font-4xl);
    font-weight: 800;
    color: #78350f;
    margin-bottom: var(--spacing-md);
    letter-spacing: -1px;
    line-height: 1.15;
  }

  &__subtitle {
    font-size: var(--font-lg);
    color: #92400e;
    opacity: 0.85;
    margin-bottom: var(--spacing-xl);
  }

  &__cta {
    padding: 14px 36px;
    border-radius: var(--radius-full);
    background: var(--color-white);
    color: #78350f;
    font-size: var(--font-base);
    font-weight: 700;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    transition: all var(--transition-base);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }
  }

  &__dots {
    position: absolute;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 10px;
    z-index: 3;
  }

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.4);
    transition: all var(--transition-base);

    &--active {
      width: 28px;
      border-radius: 4px;
      background: var(--color-white);
    }
  }

  &__stats {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-xl);
    padding: var(--spacing-md) var(--spacing-xl);
    background: rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(8px);
    z-index: 2;
  }

  &__stat {
    text-align: center;

    &-num {
      display: block;
      font-size: var(--font-xl);
      font-weight: 800;
      color: #78350f;
    }

    &-label {
      font-size: var(--font-xs);
      color: #92400e;
      opacity: 0.8;
    }

    &-divider {
      width: 1px;
      height: 32px;
      background: rgba(146, 64, 14, 0.15);
    }
  }
}

/* ===== 服务分类 ===== */
.categories {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);

  &__grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: var(--spacing-md);
  }

  &__card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-xl) var(--spacing-md);
    background: var(--color-white);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border-light);
    box-shadow: var(--shadow-card);
    transition: all var(--transition-base);
    animation: fadeInUp 0.6s ease both;

    &:hover {
      transform: translateY(-6px);
      box-shadow: var(--shadow-card-hover);
      border-color: rgba(245, 158, 11, 0.2);
    }
  }

  &__icon-wrap {
    width: 64px;
    height: 64px;
    border-radius: var(--radius-md);
    background: linear-gradient(135deg, #fffbeb, #fef3c7);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform var(--transition-base);
  }

  &__card:hover &__icon-wrap {
    transform: scale(1.1);
  }

  &__icon {
    font-size: 32px;
  }

  &__label {
    font-weight: 700;
    font-size: var(--font-base);
    color: var(--color-text-primary);
  }

  &__desc {
    font-size: var(--font-xs);
    color: var(--color-text-muted);
  }
}

/* ===== 热门服务 ===== */
.hot-services {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);

  &__grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-lg);
  }
}

.service-card {
  position: relative;
  background: var(--color-white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-card);
  cursor: pointer;
  transition: all var(--transition-base);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  overflow: hidden;

  &__hover-glow {
    position: absolute;
    inset: 0;
    border-radius: var(--radius-lg);
    background: radial-gradient(ellipse at 50% 0%, rgba(245, 158, 11, 0.06), transparent 70%);
    opacity: 0;
    transition: opacity var(--transition-base);
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-card-hover);
    border-color: rgba(245, 158, 11, 0.15);

    .service-card__hover-glow {
      opacity: 1;
    }
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__badge {
    font-size: var(--font-xs);
    padding: 4px 12px;
    border-radius: var(--radius-full);
    background: linear-gradient(135deg, #fffbeb, #fef3c7);
    color: #92400e;
    font-weight: 600;
  }

  &__duration {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: var(--font-xs);
    color: var(--color-text-muted);

    &-icon {
      font-size: 13px;
    }
  }

  &__name {
    font-size: var(--font-xl);
    font-weight: 700;
    color: var(--color-text-primary);
    letter-spacing: -0.3px;
  }

  &__desc {
    font-size: var(--font-sm);
    color: var(--color-text-secondary);
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    flex: 1;
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-top: auto;
  }

  &__price {
    display: flex;
    align-items: baseline;
    gap: var(--spacing-xs);
  }

  &__price-current {
    font-size: var(--font-2xl);
    font-weight: 800;
    color: #dc2626;
    letter-spacing: -0.5px;
  }

  &__price-original {
    font-size: var(--font-sm);
    color: var(--color-text-muted);
    text-decoration: line-through;
  }

  &__pets {
    font-size: var(--font-xs);
    color: var(--color-text-muted);
    background: var(--color-bg-alt);
    padding: 2px 10px;
    border-radius: var(--radius-full);
  }
}

.see-more {
  text-align: center;
  padding-top: var(--spacing-xl);

  &__btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 32px;
    border-radius: var(--radius-full);
    background: var(--color-primary-gradient);
    color: var(--color-white);
    font-size: var(--font-base);
    font-weight: 700;
    box-shadow: 0 4px 16px rgba(245, 158, 11, 0.3);
    transition: all var(--transition-base);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(245, 158, 11, 0.4);
    }
  }

  &__arrow {
    transition: transform var(--transition-fast);
  }

  &__btn:hover &__arrow {
    transform: translateX(3px);
  }
}

/* ===== 特色亮点 ===== */
.highlights {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-3xl) var(--spacing-md);

  &__grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--spacing-lg);
  }

  &__item {
    text-align: center;
    padding: var(--spacing-xl) var(--spacing-lg);
    background: var(--color-white);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border-light);
    box-shadow: var(--shadow-card);
    transition: all var(--transition-base);

    &:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-card-hover);
    }
  }

  &__icon-wrap {
    width: 56px;
    height: 56px;
    border-radius: var(--radius-md);
    background: linear-gradient(135deg, var(--color-info-bg), #e0e7ff);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto var(--spacing-md);
  }

  &__icon {
    font-size: 28px;
  }

  &__title {
    font-size: var(--font-lg);
    font-weight: 700;
    margin-bottom: var(--spacing-sm);
    color: var(--color-text-primary);
  }

  &__desc {
    font-size: var(--font-sm);
    color: var(--color-text-secondary);
    line-height: 1.5;
  }
}

/* ===== CTA ===== */
.cta {
  max-width: 1200px;
  margin: 0 var(--spacing-md);
  padding: 0;

  &__inner {
    position: relative;
    text-align: center;
    padding: var(--spacing-3xl) var(--spacing-xl);
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%);
    border-radius: var(--radius-xl);
    color: var(--color-white);
    overflow: hidden;
  }

  &__emoji {
    font-size: 48px;
    display: block;
    margin-bottom: var(--spacing-md);
    animation: float 3s ease-in-out infinite;
  }

  &__title {
    font-size: var(--font-3xl);
    font-weight: 800;
    letter-spacing: -0.5px;
    margin-bottom: var(--spacing-sm);
  }

  &__desc {
    font-size: var(--font-lg);
    opacity: 0.9;
    margin-bottom: var(--spacing-xl);
  }

  &__btn {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 16px 44px;
    border-radius: var(--radius-full);
    background: var(--color-white);
    color: #78350f;
    font-size: var(--font-xl);
    font-weight: 700;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    transition: all var(--transition-base);

    &:hover {
      transform: translateY(-3px) scale(1.02);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
    }
  }

  &__btn-arrow {
    transition: transform var(--transition-fast);
  }

  &__btn:hover &__btn-arrow {
    transform: translateX(4px);
  }

  &__paws {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
  }

  &__paw {
    position: absolute;
    font-size: 24px;
    opacity: 0.15;

    &--1 {
      top: 15%;
      left: 8%;
      animation: float 4s ease-in-out infinite;
    }

    &--2 {
      bottom: 20%;
      right: 10%;
      animation: float 5s ease-in-out infinite 1s;
    }

    &--3 {
      top: 40%;
      right: 25%;
      animation: float 3.5s ease-in-out infinite 0.5s;
    }
  }
}

/* ===== 响应式 ===== */
@media (max-width: 768px) {
  .hero {
    min-height: 340px;
    margin: var(--spacing-sm) var(--spacing-sm) 0;

    &__title {
      font-size: var(--font-2xl);
    }

    &__subtitle {
      font-size: var(--font-base);
    }

    &__stats {
      gap: var(--spacing-md);
      padding: var(--spacing-sm) var(--spacing-md);
    }

    &__stat-num {
      font-size: var(--font-lg);
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

  .cta {
    margin: 0 var(--spacing-sm);

    &__title {
      font-size: var(--font-2xl);
    }

    &__btn {
      padding: 14px 36px;
      font-size: var(--font-lg);
    }
  }
}
</style>
