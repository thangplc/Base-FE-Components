<script setup lang="ts">
import { useRoute } from '#imports'
import { computed } from 'vue'
import ThemeToggle from '@/components/common/ThemeToggle.vue'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { siteConfig } from '@/config/site'

const route = useRoute()
const current = computed(() =>
  siteConfig.nav.flatMap(group => group.items).find(item => item.url === route.path),
)
</script>

<template>
  <header class="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur">
    <SidebarTrigger class="-ml-1" />
    <Separator orientation="vertical" class="mr-2 data-[orientation=vertical]:h-4" />
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbPage>{{ current?.title ?? siteConfig.name }}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
    <div class="ml-auto flex items-center gap-2">
      <ThemeToggle />
    </div>
  </header>
</template>
