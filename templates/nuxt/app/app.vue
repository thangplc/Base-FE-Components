<script setup lang="ts">
import TruncateTooltipProvider from '@/components/common/TruncateTooltipProvider.vue'
import { Toaster } from '@/components/ui/sonner'
import { siteConfig } from '@/config/site'

useHead({
  title: siteConfig.name,
  meta: [{ name: 'description', content: siteConfig.description }],
})
</script>

<template>
  <NuxtRouteAnnouncer />
  <TruncateTooltipProvider>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Toaster rich-colors close-button />
  </TruncateTooltipProvider>
</template>
