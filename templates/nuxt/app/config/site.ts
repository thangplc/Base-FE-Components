import type { Component } from 'vue'
import { FileTextIcon, LayoutDashboardIcon, UsersIcon } from '@lucide/vue'

export interface NavItem {
  title: string
  url: string
  icon: Component
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

/** Edit per project: app name, sidebar navigation. */
export const siteConfig = {
  name: 'Starter Kit',
  description: 'Base components built on shadcn-vue',
  nav: [
    {
      label: 'Showcase',
      items: [
        { title: 'Overview', url: '/', icon: LayoutDashboardIcon },
        { title: 'Form', url: '/form', icon: FileTextIcon },
        { title: 'Users', url: '/users', icon: UsersIcon },
      ],
    },
  ] satisfies NavGroup[],
}
