import {
  FileTextIcon,
  LayoutDashboardIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react"

export type NavItem = {
  title: string
  url: string
  icon: LucideIcon
}

export type NavGroup = {
  label: string
  items: NavItem[]
}

/** Edit per project: app name, sidebar navigation. */
export const siteConfig = {
  name: "Starter Kit",
  description: "Base components built on shadcn/ui",
  nav: [
    {
      label: "Showcase",
      items: [
        { title: "Overview", url: "/", icon: LayoutDashboardIcon },
        { title: "Form", url: "/form", icon: FileTextIcon },
        { title: "Users", url: "/users", icon: UsersIcon },
      ],
    },
  ] satisfies NavGroup[],
}
