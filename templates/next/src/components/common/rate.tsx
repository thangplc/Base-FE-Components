"use client"

import { useState, type ComponentType, type ReactNode, type Ref } from "react"
import { StarIcon } from "lucide-react"

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const sizeClass = { sm: "size-4 text-sm", default: "size-5 text-base", lg: "size-7 text-xl" }

export type RateProps = {
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  /** Number of stars (default 5). */
  count?: number
  /** Pick half stars (click the left half). */
  allowHalf?: boolean
  /** Clicking the current value again resets to 0 (default true). */
  allowClear?: boolean
  /** Show the score only (no hover / click / keyboard). */
  readOnly?: boolean
  disabled?: boolean
  size?: keyof typeof sizeClass
  /** Icon component (default Star) or any node ("A", "♥"). */
  character?: IconType | ReactNode
  /** A different character per star, e.g. faces for 1–5. */
  renderCharacter?: (index: number) => IconType | ReactNode
  /** Tooltip per star, e.g. ["Bad", "Poor", "OK", "Good", "Great"]. */
  tooltips?: string[]
  /** Show the number ("3.5") after the stars. */
  showValue?: boolean
  /** Hovered value (undefined when the pointer leaves). */
  onHoverChange?: (value: number | undefined) => void
  id?: string
  name?: string
  "aria-label"?: string
  "aria-invalid"?: boolean
  className?: string
  ref?: Ref<HTMLDivElement>
}

type IconType = ComponentType<{ className?: string; fill?: string; strokeWidth?: number }>

// Lucide icons are forwardRef objects; plain function components work too.
const isComponent = (value: unknown): value is IconType =>
  typeof value === "function" || (typeof value === "object" && value !== null && "render" in value)

/** Star rating with half stars, custom characters and tooltips; ← → / Home / End on the keyboard. */
export function Rate({
  value: valueProp,
  defaultValue = 0,
  onValueChange,
  count = 5,
  allowHalf = false,
  allowClear = true,
  readOnly = false,
  disabled = false,
  size = "default",
  character = StarIcon,
  renderCharacter,
  tooltips,
  showValue = false,
  onHoverChange,
  id,
  name,
  "aria-label": ariaLabel = "Rating",
  "aria-invalid": invalid,
  className,
  ref,
}: RateProps) {
  const [inner, setInner] = useState(defaultValue)
  const value = valueProp ?? inner
  const [hover, setHover] = useState<number>()
  // After clearing, don't preview the cleared value again until the pointer moves to another one.
  const [cleared, setCleared] = useState<number>()
  const interactive = !readOnly && !disabled
  const shown = interactive && hover !== undefined ? hover : value
  const step = allowHalf ? 0.5 : 1

  const setValue = (next: number) => {
    const clamped = Math.min(count, Math.max(0, next))
    if (valueProp === undefined) setInner(clamped)
    onValueChange?.(clamped)
  }
  const setHovered = (next: number | undefined) => {
    setHover(next)
    onHoverChange?.(next)
  }

  // Value under the pointer on star `index`: the left half counts as .5 with allowHalf.
  const pointerValue = (event: React.MouseEvent<HTMLElement>, index: number) => {
    if (!allowHalf) return index + 1
    const { left, width } = event.currentTarget.getBoundingClientRect()
    return event.clientX - left < width / 2 ? index + 0.5 : index + 1
  }

  const characterAt = (index: number) => {
    const icon = renderCharacter ? renderCharacter(index) : character
    if (isComponent(icon)) {
      const Icon = icon
      return <Icon className={sizeClass[size]} fill="currentColor" strokeWidth={0} />
    }
    return <span className={cn("flex items-center justify-center leading-none", sizeClass[size])}>{icon}</span>
  }

  return (
    <div
      id={id}
      ref={ref}
      data-slot="rate"
      role="slider"
      tabIndex={interactive ? 0 : -1}
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={count}
      aria-valuenow={value}
      aria-valuetext={tooltips?.[Math.ceil(value) - 1] ?? `${value} / ${count}`}
      aria-readonly={readOnly || undefined}
      aria-disabled={disabled || undefined}
      aria-invalid={invalid || undefined}
      data-disabled={disabled || undefined}
      className={cn(
        "inline-flex items-center gap-2 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50 data-disabled:opacity-50",
        className
      )}
      onKeyDown={(event) => {
        if (!interactive) return
        const keys: Record<string, number> = {
          ArrowRight: value + step,
          ArrowUp: value + step,
          ArrowLeft: value - step,
          ArrowDown: value - step,
          Home: 0,
          End: count,
        }
        if (event.key in keys) {
          event.preventDefault()
          setHovered(undefined)
          setValue(keys[event.key])
        }
      }}
      onPointerLeave={() => {
        if (!interactive) return
        setHovered(undefined)
        setCleared(undefined)
      }}
    >
      <div className="flex items-center gap-1">
        {Array.from({ length: count }, (_, index) => {
          // 0, 50 or 100% of this star filled.
          const fill = Math.min(1, Math.max(0, shown - index))
          const star = (
            <span
              key={index}
              data-slot="rate-star"
              data-fill={fill === 1 ? "full" : fill > 0 ? "half" : "empty"}
              className={cn(
                "relative inline-flex text-muted transition-transform",
                interactive && "cursor-pointer hover:scale-110"
              )}
              onPointerMove={(event) => {
                if (!interactive) return
                const next = pointerValue(event, index)
                if (next === cleared) return
                setCleared(undefined)
                if (next !== hover) setHovered(next)
              }}
              onClick={(event) => {
                if (!interactive) return
                const next = pointerValue(event, index)
                if (allowClear && next === value) {
                  setValue(0)
                  setCleared(next)
                  setHovered(undefined)
                } else {
                  setValue(next)
                }
              }}
            >
              {characterAt(index)}
              <span
                aria-hidden
                className="absolute inset-y-0 left-0 overflow-hidden text-warning"
                style={{ width: `${fill * 100}%` }}
              >
                {characterAt(index)}
              </span>
            </span>
          )
          return tooltips?.[index] ? (
            <Tooltip key={index}>
              <TooltipTrigger asChild>{star}</TooltipTrigger>
              <TooltipContent>{tooltips[index]}</TooltipContent>
            </Tooltip>
          ) : (
            star
          )
        })}
      </div>
      {showValue && <span className="text-sm text-muted-foreground tabular-nums">{shown}</span>}
      {name && <input type="hidden" name={name} value={value} />}
    </div>
  )
}
