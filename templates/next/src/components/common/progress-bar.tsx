import type { ComponentProps, ReactNode } from "react"

import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

type ProgressBarProps = Pick<
  ComponentProps<typeof Progress>,
  "value" | "max" | "size" | "variant" | "indeterminate"
> & {
  label?: ReactNode
  /** Small text under the bar, e.g. "3 of 12 files". */
  description?: ReactNode
  /** Show the value on the right of the label (default: true unless indeterminate). */
  showValue?: boolean
  /** Text for the value; default "42%". */
  formatValue?: (value: number, max: number) => ReactNode
  className?: string
}

/** Progress with a label, the value ("42%") and an optional description. */
export function ProgressBar({
  label,
  description,
  value,
  max = 100,
  indeterminate,
  showValue = !indeterminate,
  formatValue = (v, m) => `${Math.round((v / m) * 100)}%`,
  size,
  variant,
  className,
}: ProgressBarProps) {
  const current = Math.min(max, Math.max(0, value ?? 0))

  return (
    <div data-slot="progress-bar" className={cn("flex w-full flex-col gap-1.5", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="font-medium">{label}</span>
          {showValue && (
            <span className="text-muted-foreground tabular-nums">{formatValue(current, max)}</span>
          )}
        </div>
      )}
      <Progress
        value={current}
        max={max}
        size={size}
        variant={variant}
        indeterminate={indeterminate}
        aria-label={typeof label === "string" ? label : undefined}
      />
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
  )
}
