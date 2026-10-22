import type { Updater } from '@tanstack/vue-table'
import type { Ref } from 'vue'

export { cn } from 'cn'

/** Applies a TanStack Table updater (value or function) to a ref. */
export function valueUpdater<T>(updaterOrValue: Updater<T>, target: Ref<T>) {
  target.value = typeof updaterOrValue === 'function'
    ? (updaterOrValue as (old: T) => T)(target.value)
    : updaterOrValue
}
