<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner'
import { siteConfig } from '@/config/site'

useHead({
  title: siteConfig.name,
  meta: [{ name: 'description', content: siteConfig.description }],
})
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <Toaster rich-colors close-button />
</template>
