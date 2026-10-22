import { useState } from "react"
import { functionalUpdate, type Updater } from "@tanstack/react-table"

/**
 * State that is either owned by the table (uncontrolled) or by the parent
 * (controlled, when `value` is passed). `onChange` fires in both cases.
 */
export function useControllableState<T>(
  value: T | undefined,
  onChange: ((value: T) => void) | undefined,
  initial: T
) {
  const [inner, setInner] = useState(initial)
  const controlled = value !== undefined
  const current = controlled ? value : inner

  function set(updater: Updater<T>) {
    const next = functionalUpdate(updater, current)
    if (!controlled) setInner(next)
    onChange?.(next)
  }

  return [current, set] as const
}
