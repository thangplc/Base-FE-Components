"use client"

import type { FieldValues } from "react-hook-form"

import {
  DatePicker,
  DateRangePicker,
  DateTimePicker,
  type DateLike,
  type DatePickerProps,
  type DateRangePickerProps,
  type DateTimePickerProps,
} from "@/components/common/date-picker"
import { FormField, type FormFieldBaseProps } from "./form-field"

type Controlled = "value" | "onChange" | "id" | "ref" | "className" | "aria-invalid"

type FormDatePickerProps<T extends FieldValues> = FormFieldBaseProps<T> &
  Omit<DateTimePickerProps, Controlled> & {
    /** Also pick a time (DateTimePicker). */
    withTime?: boolean
  }

/**
 * Date (or date + time) field. The form value has the shape set by
 * `valueFormat`: a Date by default, or e.g. "yyyy-MM-dd" for a string.
 */
export function FormDatePicker<T extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
  withTime = false,
  ...pickerProps
}: FormDatePickerProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      label={label}
      description={description}
      className={className}
    >
      {(field, { id, invalid }) => {
        const props: DatePickerProps<DateLike> = {
          ...pickerProps,
          id,
          ref: field.ref,
          value: field.value,
          // The popover has no blur of its own: picking a value marks the field touched.
          onChange: (value) => {
            field.onChange(value ?? null)
            field.onBlur()
          },
          "aria-invalid": invalid,
        }
        return withTime ? <DateTimePicker {...props} /> : <DatePicker {...props} />
      }}
    </FormField>
  )
}

type FormDateRangePickerProps<T extends FieldValues> = FormFieldBaseProps<T> &
  Omit<DateRangePickerProps, Controlled>

/**
 * `{ from, to }` field; each side has the shape set by `valueFormat`.
 * Put range rules on the object itself (a zod `.refine` without `path`):
 * react-hook-form re-validates on change only at the field's own path, so an
 * error on `period.to` would show on submit but not clear while picking.
 */
export function FormDateRangePicker<T extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
  ...pickerProps
}: FormDateRangePickerProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      label={label}
      description={description}
      className={className}
    >
      {(field, { id, invalid }) => (
        <DateRangePicker<DateLike>
          {...pickerProps}
          id={id}
          ref={field.ref}
          value={field.value}
          onChange={(value) => {
            field.onChange(value ?? null)
            field.onBlur()
          }}
          aria-invalid={invalid}
        />
      )}
    </FormField>
  )
}
