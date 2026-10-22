"use client"

import type { ReactNode } from "react"
import { CheckIcon, XIcon, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export type StepStatus = "complete" | "current" | "upcoming" | "error"

export type StepItem = {
  title: ReactNode
  description?: ReactNode
  /** Shown instead of the step number. */
  icon?: LucideIcon
  /** Mark a step as failed (e.g. a validation error on that step). */
  status?: "error"
}

type StepperProps = {
  steps: StepItem[]
  /** Index of the current step; earlier steps are complete. */
  current: number
  /** Makes steps clickable: completed ones, or all with `allowJumpAhead`. */
  onStepClick?: (index: number) => void
  allowJumpAhead?: boolean
  orientation?: "horizontal" | "vertical"
  className?: string
}

const indicatorClass: Record<StepStatus, string> = {
  complete: "border-primary bg-primary text-primary-foreground",
  current: "border-primary text-primary ring-3 ring-primary/20",
  upcoming: "border-input text-muted-foreground",
  error: "border-destructive bg-destructive/10 text-destructive",
}

/** Progress through a multi-step flow (checkout, onboarding, wizard). */
export function Stepper({
  steps,
  current,
  onStepClick,
  allowJumpAhead = false,
  orientation = "horizontal",
  className,
}: StepperProps) {
  const statusOf = (index: number): StepStatus =>
    steps[index].status === "error"
      ? "error"
      : index < current
        ? "complete"
        : index === current
          ? "current"
          : "upcoming"

  const vertical = orientation === "vertical"

  return (
    <ol
      data-slot="stepper"
      data-orientation={orientation}
      className={cn(vertical ? "flex flex-col" : "flex w-full items-start gap-3", className)}
    >
      {steps.map((step, index) => {
        const status = statusOf(index)
        const last = index === steps.length - 1
        const clickable =
          onStepClick !== undefined && index !== current && (status === "complete" || allowJumpAhead)
        const Icon = status === "complete" ? CheckIcon : status === "error" ? XIcon : step.icon

        const content = (
          <>
            <span
              data-slot="step-indicator"
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full border-2 bg-background text-sm font-medium transition-colors",
                indicatorClass[status]
              )}
            >
              {Icon ? <Icon className="size-4" /> : index + 1}
            </span>
            <span className={cn("flex min-w-0 flex-col gap-0.5", vertical ? "pt-1" : "pt-1.5")}>
              <span
                className={cn(
                  "text-sm font-medium",
                  status === "upcoming" && "text-muted-foreground",
                  status === "error" && "text-destructive"
                )}
              >
                {step.title}
              </span>
              {step.description && <span className="text-xs text-muted-foreground">{step.description}</span>}
            </span>
          </>
        )

        return (
          <li
            key={index}
            data-slot="step"
            data-status={status}
            aria-current={status === "current" ? "step" : undefined}
            className={cn("relative flex", vertical ? "gap-3 pb-8 last:pb-0" : "items-start gap-3", !last && !vertical && "flex-1")}
          >
            {/* Vertical connector, under the indicator. */}
            {vertical && !last && (
              <span
                aria-hidden
                className={cn("absolute top-10 bottom-2 left-4 w-0.5 -translate-x-1/2 rounded-full", index < current ? "bg-primary" : "bg-border")}
              />
            )}
            {clickable ? (
              <button
                type="button"
                onClick={() => onStepClick(index)}
                className="flex gap-3 rounded-md text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [&:hover_[data-slot=step-indicator]]:border-primary"
              >
                {content}
              </button>
            ) : (
              <div className="flex gap-3">{content}</div>
            )}
            {/* Horizontal connector, between this step and the next. */}
            {!vertical && !last && (
              <span
                aria-hidden
                className={cn("mt-4 h-0.5 min-w-6 flex-1 rounded-full", index < current ? "bg-primary" : "bg-border")}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}
