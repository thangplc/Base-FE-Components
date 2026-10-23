"use client"

import type { FieldValues } from "react-hook-form"

import { Transfer, type TransferProps } from "@/components/common/transfer"
import { FormField, type FormFieldBaseProps } from "./form-field"

type FormTransferProps<T extends FieldValues> = FormFieldBaseProps<T> &
  Omit<TransferProps, "targetKeys" | "defaultTargetKeys" | "onValueChange" | "id" | "ref" | "className" | "aria-invalid">

/** Transfer field: the form value is the right-hand list's keys (string[]). */
export function FormTransfer<T extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
  ...transferProps
}: FormTransferProps<T>) {
  return (
    <FormField control={control} name={name} label={label} description={description} className={className}>
      {(field, { id, invalid }) => (
        <Transfer
          {...transferProps}
          id={id}
          ref={field.ref}
          targetKeys={field.value ?? []}
          onValueChange={(keys) => {
            field.onChange(keys)
            field.onBlur()
          }}
          aria-invalid={invalid}
        />
      )}
    </FormField>
  )
}
