"use client"

import type { FieldValues } from "react-hook-form"

import { TreeSelect, type TreeSelectProps } from "@/components/common/tree"
import { FormField, type FormFieldBaseProps } from "./form-field"

type FormTreeSelectProps<T extends FieldValues> = FormFieldBaseProps<T> &
  Omit<TreeSelectProps, "value" | "defaultValue" | "onValueChange" | "id" | "ref" | "className" | "aria-invalid"> & {
    multiple?: boolean
    treeCheckable?: boolean
    showCheckedStrategy?: "all" | "parent" | "child"
  }

/** TreeSelect field: a key (string), or keys (string[]) with `multiple` / `treeCheckable`. */
export function FormTreeSelect<T extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
  ...selectProps
}: FormTreeSelectProps<T>) {
  const many = !!selectProps.multiple || !!selectProps.treeCheckable
  return (
    <FormField control={control} name={name} label={label} description={description} className={className}>
      {(field, { id, invalid }) => {
        const shared = { ...selectProps, id, ref: field.ref, "aria-invalid": invalid }
        // The dropdown has no blur of its own: picking marks the field touched.
        return many ? (
          <TreeSelect
            {...shared}
            multiple
            value={field.value ?? []}
            onValueChange={(value: string[]) => {
              field.onChange(value)
              field.onBlur()
            }}
          />
        ) : (
          <TreeSelect
            {...shared}
            multiple={false}
            treeCheckable={false}
            value={field.value ?? null}
            onValueChange={(value: string | undefined) => {
              field.onChange(value ?? "")
              field.onBlur()
            }}
          />
        )
      }}
    </FormField>
  )
}
