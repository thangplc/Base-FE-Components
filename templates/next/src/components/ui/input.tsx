import * as React from "react"
import { cn } from "cn"

import { CharacterCount, useTextLength } from "@/components/ui/character-count"

const inputClass =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"

type InputProps = React.ComponentProps<"input"> & {
  /**
   * Show "12/100" at the end of the field. Defaults to true when
   * `maxLength` or `minLength` is set.
   */
  showCount?: boolean
}

function Input({ className, type, showCount, onChange, ...props }: InputProps) {
  const { minLength, maxLength, value, defaultValue } = props
  const [length, setLength] = useTextLength(value, defaultValue)
  const counted = showCount ?? (minLength !== undefined || maxLength !== undefined)

  if (!counted) {
    return (
      <input
        type={type}
        data-slot="input"
        className={cn(inputClass, className)}
        onChange={onChange}
        {...props}
      />
    )
  }

  // With a counter, `className` sizes the wrapper (e.g. "w-48") and the
  // input fills it, leaving room on the right for the count.
  return (
    <div data-slot="input-wrapper" className={cn("relative w-full", className)}>
      <input
        type={type}
        data-slot="input"
        className={cn(inputClass, "pr-16")}
        onChange={(event) => {
          setLength(event.target.value.length)
          onChange?.(event)
        }}
        {...props}
      />
      <CharacterCount
        length={length}
        minLength={minLength}
        maxLength={maxLength}
        className="absolute inset-y-0 right-2.5 flex items-center"
      />
    </div>
  )
}

export { Input }
