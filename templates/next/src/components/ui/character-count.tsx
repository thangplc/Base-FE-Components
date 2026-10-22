import * as React from "react"
import { cn } from "cn"

type CharacterCountProps = {
  length: number
  minLength?: number
  maxLength?: number
  className?: string
}

/**
 * "12/100" (or "3 / min 10") shown by Input and Textarea when they have
 * minLength / maxLength. Red while below the minimum (once typing started)
 * and when the maximum is reached.
 */
function CharacterCount({ length, minLength, maxLength, className }: CharacterCountProps) {
  const belowMin = minLength !== undefined && length > 0 && length < minLength
  const atMax = maxLength !== undefined && length >= maxLength

  return (
    <span
      data-slot="character-count"
      aria-live="polite"
      className={cn(
        "pointer-events-none text-xs text-muted-foreground tabular-nums select-none",
        (belowMin || atMax) && "text-destructive",
        className
      )}
    >
      {maxLength !== undefined ? `${length}/${maxLength}` : `${length} / min ${minLength}`}
    </span>
  )
}

/** Tracks the text length for both controlled (`value`) and uncontrolled inputs. */
function useTextLength(value: unknown, defaultValue: unknown) {
  const [length, setLength] = React.useState(String(defaultValue ?? "").length)
  return [value !== undefined ? String(value ?? "").length : length, setLength] as const
}

export { CharacterCount, useTextLength }
