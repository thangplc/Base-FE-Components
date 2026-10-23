"use client"

import type { FieldValues } from "react-hook-form"

import { Switch } from "@/components/ui/switch"
import { FormField, type FormFieldBaseProps } from "./form-field"

type FormSwitchProps<T extends FieldValues> = FormFieldBaseProps<T> & {
  disabled?: boolean
}

/** On / off field; the form value is a boolean. The label sits next to the switch. */
export function FormSwitch<T extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
  disabled,
}: FormSwitchProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      label={label}
      description={description}
      className={className}
      orientation="horizontal"
    >
      {(field, { id, invalid }) => (
        <Switch
          id={id}
          name={field.name}
          ref={field.ref}
          checked={!!field.value}
          onCheckedChange={field.onChange}
          onBlur={field.onBlur}
          disabled={disabled}
          aria-invalid={invalid}
        />
      )}
    </FormField>
  )
}
