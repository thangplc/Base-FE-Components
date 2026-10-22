import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

const SIZES = { sm: 40, default: 64, lg: 96 } as const
const STROKES = { sm: 4, default: 6, lg: 8 } as const

const strokeClass = {
  default: "stroke-primary",
  success: "stroke-success",
  warning: "stroke-warning",
  destructive: "stroke-destructive",
}

export type ProgressCircleProps = {
  /** 0–`max` (default 100). */
  value?: number | null
  max?: number
  variant?: keyof typeof strokeClass
  /** Unknown progress: a spinning arc. */
  indeterminate?: boolean
  /** sm 40px / default 64px / lg 96px, or a number of px. */
  size?: keyof typeof SIZES | number
  /** Ring thickness in px (default 4 / 6 / 8 by size). */
  strokeWidth?: number
  lineCap?: "round" | "butt"
  /** Degrees left open at the bottom, e.g. 75 for a "dashboard" gauge. */
  gapDegree?: number
  /** Show the value in the middle (default: true unless indeterminate). */
  showValue?: boolean
  /** Text for the value; default "42%". */
  formatValue?: (value: number, max: number) => ReactNode
  /** Custom content in the middle (instead of the value). */
  children?: ReactNode
  "aria-label"?: string
  className?: string
}

/** Circular progress (SVG ring), optionally a gauge with a gap at the bottom. */
export function ProgressCircle({
  value,
  max = 100,
  variant = "default",
  indeterminate = false,
  size = "default",
  strokeWidth,
  lineCap = "round",
  gapDegree = 0,
  showValue = !indeterminate,
  formatValue = (v, m) => `${Math.round((v / m) * 100)}%`,
  children,
  "aria-label": ariaLabel,
  className,
}: ProgressCircleProps) {
  const px = typeof size === "number" ? size : SIZES[size]
  const stroke = strokeWidth ?? (typeof size === "number" ? Math.max(3, Math.round(size / 11)) : STROKES[size])
  const current = Math.min(max, Math.max(0, value ?? 0))
  const radius = (px - stroke) / 2
  const circumference = 2 * Math.PI * radius
  // The visible arc: the whole circle minus the gap.
  const arc = circumference * (1 - Math.min(Math.max(gapDegree, 0), 359) / 360)
  const filled = indeterminate ? arc * 0.25 : arc * (current / max)
  // Start at the top, or just after the gap (which is centered at the bottom).
  const rotation = gapDegree > 0 ? 90 + gapDegree / 2 : -90
  const center = px / 2

  return (
    <div
      data-slot="progress-circle"
      role="progressbar"
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={indeterminate ? undefined : current}
      className={cn("relative inline-flex shrink-0 items-center justify-center", className)}
      style={{ width: px, height: px }}
    >
      <svg
        width={px}
        height={px}
        viewBox={`0 0 ${px} ${px}`}
        className={cn(indeterminate && "animate-spin [animation-duration:1.2s]")}
        aria-hidden
      >
        <g transform={`rotate(${rotation} ${center} ${center})`} fill="none" strokeWidth={stroke} strokeLinecap={lineCap}>
          <circle cx={center} cy={center} r={radius} className="stroke-muted" strokeDasharray={`${arc} ${circumference}`} />
          <circle
            cx={center}
            cy={center}
            r={radius}
            className={cn(strokeClass[variant], "transition-[stroke-dasharray] duration-300")}
            strokeDasharray={`${filled} ${circumference}`}
            opacity={filled === 0 ? 0 : 1}
          />
        </g>
      </svg>
      {(children || showValue) && (
        <span
          className={cn(
            "absolute inset-0 flex items-center justify-center font-medium tabular-nums",
            px < 56 ? "text-[0.65rem]" : px < 88 ? "text-sm" : "text-lg"
          )}
        >
          {children ?? formatValue(current, max)}
        </span>
      )}
    </div>
  )
}
