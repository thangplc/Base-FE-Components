"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Progress as ProgressPrimitive } from "radix-ui"

const progressVariants = cva("relative flex w-full items-center overflow-hidden rounded-full bg-muted", {
  variants: {
    size: {
      sm: "h-1",
      default: "h-2",
      lg: "h-3",
    },
  },
  defaultVariants: { size: "default" },
})

const indicatorVariants = cva("h-full bg-primary transition-transform", {
  variants: {
    variant: {
      default: "bg-primary",
      success: "bg-success",
      warning: "bg-warning",
      destructive: "bg-destructive",
    },
  },
  defaultVariants: { variant: "default" },
})

type ProgressProps = Omit<React.ComponentProps<typeof ProgressPrimitive.Root>, "value"> &
  VariantProps<typeof progressVariants> &
  VariantProps<typeof indicatorVariants> & {
    /** 0–`max` (default 100). */
    value?: number | null
    /** Unknown progress: a bar sliding back and forth. */
    indeterminate?: boolean
  }

function Progress({
  className,
  value,
  max = 100,
  size,
  variant,
  indeterminate = false,
  ...props
}: ProgressProps) {
  const percent = Math.min(100, Math.max(0, ((value ?? 0) / max) * 100))

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={indeterminate ? null : (value ?? 0)}
      max={max}
      className={cn(progressVariants({ size }), className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          indicatorVariants({ variant }),
          indeterminate ? "w-2/5 animate-progress-indeterminate" : "w-full"
        )}
        style={indeterminate ? undefined : { transform: `translateX(-${100 - percent}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress, progressVariants }
