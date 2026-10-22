"use client"

import type { FieldValues } from "react-hook-form"

import { CheckboxGroup, type CheckboxGroupProps } from "@/components/common/checkbox-group"
import { FormField, type FormFieldBaseProps } from "./form-field"

type FormCheckboxGroupProps<T extends FieldValues> = FormFieldBaseProps<T> &
  Omit<CheckboxGroupProps, "value" | "defaultValue" | "onValueChange" | "legend" | "className">

/**
 * Checkbox list field: the form value is a string[] (or one joined string
 * with `separator`). `label` becomes the group's legend.
 */
export function FormCheckboxGroup<T extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
  ...groupProps
}: FormCheckboxGroupProps<T>) {
  return (
    <FormField control={control} name={name} description={description} className={className}>
      {(field) => (
        <CheckboxGroup<string[] | string>
          {...groupProps}
          legend={label}
          value={field.value ?? null}
          onValueChange={(value) => {
            field.onChange(value)
            field.onBlur()
          }}
        />
      )}
    </FormField>
  )
}
