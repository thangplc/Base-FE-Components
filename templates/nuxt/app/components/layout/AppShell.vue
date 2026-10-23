<script setup lang="ts">
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import AppHeader from './AppHeader.vue'
import AppSidebar from './AppSidebar.vue'

/** Sidebar + sticky header + content area. Used by layouts/default.vue. */
</script>

<template>
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <AppHeader />
      <main class="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <slot />
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>
