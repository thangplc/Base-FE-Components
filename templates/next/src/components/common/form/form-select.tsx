"use client"

import type { FieldValues } from "react-hook-form"

import { Combobox, type ComboboxProps } from "@/components/common/combobox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FormField, type FormFieldBaseProps } from "./form-field"

export type SelectOption = { label: string; value: string; disabled?: boolean }

type ComboboxExtras = Pick<
  ComboboxProps,
  | "searchPlaceholder"
  | "emptyText"
  | "onSearch"
  | "loading"
  | "maxCount"
  | "maxTagCount"
  | "tagMode"
  | "showSelectAll"
  | "creatable"
  | "clearable"
  | "labels"
>

type FormSelectProps<T extends FieldValues> = FormFieldBaseProps<T> &
  ComboboxExtras & {
    options: (SelectOption & { description?: string; group?: string })[]
    placeholder?: string
    disabled?: boolean
    /** Pick several values (string[]); renders a Combobox with chips. */
    multiple?: boolean
    /** Single value with a search box; renders a Combobox. */
    searchable?: boolean
  }

/** Select field: the shadcn Select, or a Combobox when `multiple` / `searchable`. */
export function FormSelect<T extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
  options,
  placeholder,
  disabled,
  multiple = false,
  searchable = false,
  ...comboboxProps
}: FormSelectProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      label={label}
      description={description}
      className={className}
    >
      {(field, { id, invalid }) => {
        if (multiple || searchable) {
          const shared = {
            ...comboboxProps,
            id,
            ref: field.ref,
            options,
            placeholder,
            disabled,
            "aria-invalid": invalid,
          }
          // The list has no blur of its own: picking marks the field touched.
          return multiple ? (
            <Combobox
              {...shared}
              multiple
              value={field.value ?? []}
              onValueChange={(value) => {
                field.onChange(value)
                field.onBlur()
              }}
            />
          ) : (
            <Combobox
              {...shared}
              value={field.value ?? null}
              onValueChange={(value) => {
                field.onChange(value ?? "")
                field.onBlur()
              }}
            />
          )
        }
        return (
          <Select
            name={field.name}
            value={field.value ?? ""}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <SelectTrigger
              id={id}
              ref={field.ref}
              onBlur={field.onBlur}
              aria-invalid={invalid}
              className="w-full"
            >
              <SelectValue placeholder={placeholder ?? "Select an option"} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      }}
    </FormField>
  )
}
