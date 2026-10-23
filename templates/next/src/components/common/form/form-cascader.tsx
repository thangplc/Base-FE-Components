"use client"

import type { FieldValues } from "react-hook-form"

import { Cascader, type CascaderProps } from "@/components/common/cascader"
import { FormField, type FormFieldBaseProps } from "./form-field"

type FormCascaderProps<T extends FieldValues> = FormFieldBaseProps<T> &
  Omit<CascaderProps, "value" | "defaultValue" | "onValueChange" | "id" | "ref" | "className" | "aria-invalid" | "multiple"> & {
    multiple?: boolean
    changeOnSelect?: boolean
    showCheckedStrategy?: "all" | "parent" | "child"
  }

/** Cascader field: a path (string[]), or paths (string[][]) with `multiple`. */
export function FormCascader<T extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
  multiple = false,
  changeOnSelect,
  showCheckedStrategy,
  ...cascaderProps
}: FormCascaderProps<T>) {
  return (
    <FormField control={control} name={name} label={label} description={description} className={className}>
      {(field, { id, invalid }) => {
        const shared = { ...cascaderProps, id, ref: field.ref, "aria-invalid": invalid }
        // The dropdown has no blur of its own: picking marks the field touched.
        return multiple ? (
          <Cascader
            {...shared}
            multiple
            showCheckedStrategy={showCheckedStrategy}
            value={field.value ?? []}
            onValueChange={(value) => {
              field.onChange(value)
              field.onBlur()
            }}
          />
        ) : (
          <Cascader
            {...shared}
            changeOnSelect={changeOnSelect}
            value={field.value ?? null}
            onValueChange={(value) => {
              field.onChange(value ?? [])
              field.onBlur()
            }}
          />
        )
      }}
    </FormField>
  )
}
