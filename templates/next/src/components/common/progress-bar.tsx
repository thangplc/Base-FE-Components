import type { ComponentProps, ReactNode } from "react"

import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { ProgressCircle } from "./progress-circle"

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
  /** "line" (default) or "circle" (ProgressCircle with the label underneath). */
  type?: "line" | "circle"
  /** Circle only: degrees left open at the bottom (gauge). */
  gapDegree?: number
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
  type = "line",
  gapDegree,
  className,
}: ProgressBarProps) {
  const current = Math.min(max, Math.max(0, value ?? 0))

  if (type === "circle") {
    return (
      <div data-slot="progress-bar" className={cn("inline-flex flex-col items-center gap-1.5 text-center", className)}>
        <ProgressCircle
          value={current}
          max={max}
          size={size ?? "default"}
          variant={variant ?? "default"}
          indeterminate={indeterminate}
          gapDegree={gapDegree}
          showValue={showValue}
          formatValue={formatValue}
          aria-label={typeof label === "string" ? label : undefined}
        />
        {label && <span className="text-sm font-medium">{label}</span>}
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
    )
  }

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
