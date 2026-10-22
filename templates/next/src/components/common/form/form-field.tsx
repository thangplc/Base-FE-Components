"use client"

import type { ReactNode } from "react"
import {
  Controller,
  type Control,
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form"

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"

export type FormFieldBaseProps<T extends FieldValues> = {
  control: Control<T>
  name: FieldPath<T>
  label?: ReactNode
  description?: ReactNode
  className?: string
}

type FormFieldProps<T extends FieldValues> = FormFieldBaseProps<T> & {
  orientation?: "vertical" | "horizontal" | "responsive"
  children: (
    field: ControllerRenderProps<T, FieldPath<T>>,
    state: { id: string; invalid: boolean }
  ) => ReactNode
}

/**
 * Connects any control to react-hook-form and renders label, description
 * and error with the shadcn `Field` primitives. FormInput, FormSelect, ...
 * are thin wrappers around this, so build new form controls here too.
 */
export function FormField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
  orientation = "vertical",
  children,
}: FormFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const id = `field-${field.name}`
        const control = children(field, { id, invalid: fieldState.invalid })

        if (orientation === "horizontal") {
          return (
            <Field
              orientation="horizontal"
              data-invalid={fieldState.invalid}
              className={className}
            >
              <FieldContent>
                {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}
                {description && <FieldDescription>{description}</FieldDescription>}
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </FieldContent>
              {control}
            </Field>
          )
        }

        return (
          <Field
            orientation={orientation}
            data-invalid={fieldState.invalid}
            className={className}
          >
            {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}
            {control}
            {description && <FieldDescription>{description}</FieldDescription>}
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )
      }}
    />
  )
}
