"use client"

import type { FieldValues } from "react-hook-form"

import { Rate, type RateProps } from "@/components/common/rate"
import { FormField, type FormFieldBaseProps } from "./form-field"

type FormRateProps<T extends FieldValues> = FormFieldBaseProps<T> &
  Omit<RateProps, "value" | "defaultValue" | "onValueChange" | "id" | "ref" | "className" | "aria-invalid">

/** Star rating field; the form value is a number (0 = not rated). */
export function FormRate<T extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
  ...rateProps
}: FormRateProps<T>) {
  return (
    <FormField control={control} name={name} label={label} description={description} className={className}>
      {(field, { id, invalid }) => (
        <Rate
          {...rateProps}
          id={id}
          ref={field.ref}
          value={field.value ?? 0}
          onValueChange={(value) => {
            field.onChange(value)
            field.onBlur()
          }}
          aria-invalid={invalid}
        />
      )}
    </FormField>
  )
}
