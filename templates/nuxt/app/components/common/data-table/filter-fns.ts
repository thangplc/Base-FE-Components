import type { FilterFn } from '@tanstack/vue-table'
import type { DataTableFilter, DateRange, NumberRange } from './types'

/** Local yyyy-mm-dd, so a date-range filter matches what the user sees. */
function toDay(value: unknown) {
  const date = new Date(value as string | number | Date)
  if (Number.isNaN(date.getTime()))
    return undefined
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

const select: FilterFn<unknown> = (row, id, value: string | undefined) =>
  !value || String(row.getValue(id)) === value
select.autoRemove = value => !value

const multiSelect: FilterFn<unknown> = (row, id, value: string[] | undefined) =>
  !value?.length || value.includes(String(row.getValue(id)))
multiSelect.autoRemove = value => !value?.length

const numberRange: FilterFn<unknown> = (row, id, value: NumberRange | undefined) => {
  const [min, max] = value ?? []
  const n = Number(row.getValue(id))
  return (min === undefined || n >= min) && (max === undefined || n <= max)
}
numberRange.autoRemove = value => !value || (value[0] === undefined && value[1] === undefined)

const dateRange: FilterFn<unknown> = (row, id, value: DateRange | undefined) => {
  if (!value?.from && !value?.to)
    return true
  const day = toDay(row.getValue(id))
  if (!day)
    return false
  return (!value.from || day >= value.from) && (!value.to || day <= value.to)
}
dateRange.autoRemove = value => !value?.from && !value?.to

/** Client-side filter function used for each `DataTableFilter['type']`. */
export const filterFnByType: Record<DataTableFilter['type'], FilterFn<unknown>> = {
  'select': select,
  'multi-select': multiSelect,
  'number-range': numberRange,
  'date-range': dateRange,
}
