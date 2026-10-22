import * as React from "react"
import { cn } from "cn"

import { CharacterCount, useTextLength } from "@/components/ui/character-count"

const textareaClass =
  "flex field-sizing-content min-h-16 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"

type TextareaProps = React.ComponentProps<"textarea"> & {
  /**
   * Show "12/500" in the bottom-right corner. Defaults to true when
   * `maxLength` or `minLength` is set.
   */
  showCount?: boolean
}

function Textarea({ className, showCount, onChange, ...props }: TextareaProps) {
  const { minLength, maxLength, value, defaultValue } = props
  const [length, setLength] = useTextLength(value, defaultValue)
  const counted = showCount ?? (minLength !== undefined || maxLength !== undefined)

  if (!counted) {
    return (
      <textarea
        data-slot="textarea"
        className={cn(textareaClass, className)}
        onChange={onChange}
        {...props}
      />
    )
  }

  // With a counter, `className` sizes the wrapper and the textarea fills it,
  // leaving room at the bottom for the count.
  return (
    <div data-slot="textarea-wrapper" className={cn("relative w-full", className)}>
      <textarea
        data-slot="textarea"
        className={cn(textareaClass, "pb-6")}
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
        className="absolute right-5 bottom-1.5"
      />
    </div>
  )
}

export { Textarea }
