import type { ReactNode } from "react"
import { InboxIcon } from "lucide-react"

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

type EmptyStateProps = {
  title: ReactNode
  description?: ReactNode
  icon?: ReactNode
  /** Buttons / links shown under the text. */
  action?: ReactNode
  className?: string
}

/** Placeholder for an empty list or page: icon, title, description and actions. Fits `DataTable`'s `emptyState`. */
export function EmptyState({
  title,
  description,
  icon = <InboxIcon />,
  action,
  className,
}: EmptyStateProps) {
  return (
    <Empty className={className}>
      <EmptyHeader>
        <EmptyMedia variant="icon">{icon}</EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        {description && <EmptyDescription>{description}</EmptyDescription>}
      </EmptyHeader>
      {action && <EmptyContent>{action}</EmptyContent>}
    </Empty>
  )
}
