"use client"

import { useId, useState, type ReactNode } from "react"

import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { cn } from "@/lib/utils"

export type CheckboxGroupOption = {
  value: string
  label: ReactNode
  description?: ReactNode
  disabled?: boolean
}

export type CheckboxGroupProps<T extends string[] | string = string[]> = {
  options: CheckboxGroupOption[]
  /** Controlled selected values. */
  value?: T | null
  defaultValue?: T
  onValueChange?: (value: T) => void
  /**
   * Emit the values joined into one string (e.g. "," → "email,sms")
   * instead of an array; `value` is then split the same way.
   */
  separator?: string
  legend?: ReactNode
  /**
   * Adds a "select all" checkbox on top (pass a label, or `true` for
   * "Select all"). It shows a dash when only some options are selected.
   */
  selectAll?: boolean | ReactNode
  orientation?: "vertical" | "horizontal"
  disabled?: boolean
  className?: string
}

const toArray = (value: string[] | string | null | undefined, separator?: string) =>
  Array.isArray(value) ? value : value && separator ? value.split(separator) : []

/** A list of checkboxes with an optional tri-state "select all". */
export function CheckboxGroup<T extends string[] | string = string[]>({
  options,
  value: valueProp,
  defaultValue,
  onValueChange,
  separator,
  legend,
  selectAll,
  orientation = "vertical",
  disabled,
  className,
}: CheckboxGroupProps<T>) {
  const id = useId()
  const [inner, setInner] = useState(() => toArray(defaultValue, separator))
  const value = valueProp === undefined ? inner : toArray(valueProp, separator)

  const setValue = (next: string[]) => {
    if (valueProp === undefined) setInner(next)
    onValueChange?.((separator === undefined ? next : next.join(separator)) as T)
  }

  // "Select all" only toggles enabled options; disabled ones keep their state.
  const enabled = options.filter((option) => !option.disabled && !disabled).map((o) => o.value)
  const selectedEnabled = enabled.filter((v) => value.includes(v))
  const allState =
    selectedEnabled.length === 0 ? false : selectedEnabled.length === enabled.length ? true : "indeterminate"

  const toggleAll = () =>
    setValue(
      allState === true
        ? value.filter((v) => !enabled.includes(v))
        : [...new Set([...value, ...enabled])]
    )

  const toggle = (option: string, checked: boolean) =>
    setValue(checked ? [...value, option] : value.filter((v) => v !== option))

  return (
    <FieldSet className={className}>
      {legend && <FieldLegend variant="label">{legend}</FieldLegend>}
      {selectAll && (
        <Field orientation="horizontal">
          <Checkbox
            id={`${id}-all`}
            checked={allState}
            disabled={disabled || enabled.length === 0}
            onCheckedChange={toggleAll}
          />
          <FieldLabel htmlFor={`${id}-all`}>{selectAll === true ? "Select all" : selectAll}</FieldLabel>
        </Field>
      )}
      <FieldGroup
        data-slot="checkbox-group"
        className={cn(
          selectAll && "pl-6",
          orientation === "horizontal" && "flex-row flex-wrap gap-x-6"
        )}
      >
        {options.map((option, i) => {
          const optionId = `${id}-${i}`
          return (
            <Field key={option.value} orientation="horizontal" data-disabled={option.disabled || disabled}>
              <Checkbox
                id={optionId}
                checked={value.includes(option.value)}
                disabled={option.disabled || disabled}
                onCheckedChange={(checked) => toggle(option.value, checked === true)}
              />
              {option.description ? (
                <FieldContent>
                  <FieldLabel htmlFor={optionId}>{option.label}</FieldLabel>
                  <FieldDescription>{option.description}</FieldDescription>
                </FieldContent>
              ) : (
                <FieldLabel htmlFor={optionId} className="font-normal">
                  {option.label}
                </FieldLabel>
              )}
            </Field>
          )
        })}
      </FieldGroup>
    </FieldSet>
  )
}
