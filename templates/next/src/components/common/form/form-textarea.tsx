"use client"

import type { ComponentProps } from "react"
import type { FieldValues } from "react-hook-form"

import { Textarea } from "@/components/ui/textarea"
import { FormField, type FormFieldBaseProps } from "./form-field"

type FormTextareaProps<T extends FieldValues> = FormFieldBaseProps<T> &
  Omit<
    ComponentProps<typeof Textarea>,
    "name" | "value" | "defaultValue" | "onChange" | "onBlur" | "className"
  >

export function FormTextarea<T extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
  ...textareaProps
}: FormTextareaProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      label={label}
      description={description}
      className={className}
    >
      {(field, { id, invalid }) => (
        <Textarea
          {...textareaProps}
          {...field}
          id={id}
          value={field.value ?? ""}
          aria-invalid={invalid}
        />
      )}
    </FormField>
  )
}
