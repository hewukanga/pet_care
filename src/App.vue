<!--
  根组件
  包含导航栏、路由视图、Toast消息和页脚
-->

<script setup lang="ts">
import AppNavbar from '@/components/AppNavbar.vue'
import AppFooter from '@/components/AppFooter.vue'
import ToastMessage from '@/components/ToastMessage.vue'
</script>

<template>
  <div class="page-container">
    <AppNavbar />
    <main class="page-content">
      <router-view />
    </main>
    <AppFooter />
    <ToastMessage />
  </div>
</template>
