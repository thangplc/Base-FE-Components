"use client"

import type { ComponentProps } from "react"
import type { FieldValues } from "react-hook-form"

import { Input } from "@/components/ui/input"
import { FormField, type FormFieldBaseProps } from "./form-field"

type FormInputProps<T extends FieldValues> = FormFieldBaseProps<T> &
  Omit<
    ComponentProps<typeof Input>,
    "name" | "value" | "defaultValue" | "onChange" | "onBlur" | "className"
  >

export function FormInput<T extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
  ...inputProps
}: FormInputProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      label={label}
      description={description}
      className={className}
    >
      {(field, { id, invalid }) => (
        <Input
          {...inputProps}
          {...field}
          id={id}
          value={field.value ?? ""}
          aria-invalid={invalid}
        />
      )}
    </FormField>
  )
}
