import type { TreeNode } from '@/components/common/tree'
import { BuildingIcon, FolderIcon, UsersIcon } from '@lucide/vue'

/** Mock org chart shared by the Tree / TreeSelect stories. */
export const orgTree: TreeNode[] = [
  {
    key: 'hq',
    title: 'Head office',
    icon: BuildingIcon,
    children: [
      {
        key: 'eng',
        title: 'Engineering',
        icon: FolderIcon,
        children: [
          { key: 'fe', title: 'Frontend', icon: UsersIcon },
          { key: 'be', title: 'Backend', icon: UsersIcon },
          { key: 'qa', title: 'Quality', icon: UsersIcon, disabled: true },
        ],
      },
      {
        key: 'biz',
        title: 'Business',
        icon: FolderIcon,
        children: [
          { key: 'sales', title: 'Sales', icon: UsersIcon },
          { key: 'mkt', title: 'Marketing', icon: UsersIcon },
        ],
      },
    ],
  },
  {
    key: 'hn',
    title: 'Hà Nội branch',
    icon: BuildingIcon,
    children: [
      { key: 'hn-ops', title: 'Operations', icon: UsersIcon },
      { key: 'hn-cs', title: 'Customer support', icon: UsersIcon },
    ],
  },
]
