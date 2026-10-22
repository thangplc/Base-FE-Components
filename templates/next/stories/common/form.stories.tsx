import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { FieldGroup } from "@/components/ui/field"
import {
  FormCheckboxGroup,
  FormDatePicker,
  FormDateRangePicker,
  FormInput,
  FormSelect,
  FormSwitch,
  FormTextarea,
} from "@/components/common/form"

const schema = z.object({
  email: z.email("Invalid email address"),
  plan: z.string().min(1, "Please select a plan"),
  note: z.string().max(80, "Max 80 characters").optional(),
  // valueFormat="yyyy-MM-dd" → the form holds a string.
  startDate: z.string({ error: "Please pick a start date" }).min(1, "Please pick a start date"),
  meetingAt: z.date({ error: "Please pick a date and time" }),
  period: z
    .object({ from: z.string().optional(), to: z.string().optional() }, { error: "Please pick a period" })
    // No `path`: react-hook-form re-validates on change only at the field's own path.
    .refine((range) => range.from && range.to, "Pick both a start and an end day"),
  channels: z.array(z.string()).min(1, "Pick at least one channel"),
  skills: z.array(z.string()).min(2, "Pick at least 2 skills"),
  terms: z.boolean().refine(Boolean, "You must accept the terms"),
})

type Values = z.infer<typeof schema>

function DemoForm() {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", plan: "", note: "", terms: false, channels: [], skills: [] },
  })

  return (
    <form
      className="w-96"
      noValidate
      onSubmit={form.handleSubmit((values) => toast.success(JSON.stringify(values)))}
    >
      <FieldGroup>
        <FormInput control={form.control} name="email" label="Email" type="email" />
        <FormSelect
          control={form.control}
          name="plan"
          label="Plan"
          options={[
            { label: "Free", value: "free" },
            { label: "Pro", value: "pro" },
            { label: "Enterprise", value: "enterprise", disabled: true },
          ]}
        />
        <FormTextarea control={form.control} name="note" label="Note" description="Optional." />
        <FormDatePicker
          control={form.control}
          name="startDate"
          label="Start date"
          valueFormat="yyyy-MM-dd"
          description='Form value: "2026-10-22".'
        />
        <FormDatePicker control={form.control} name="meetingAt" label="Meeting" withTime minuteStep={15} />
        <FormDateRangePicker
          control={form.control}
          name="period"
          label="Period"
          valueFormat="yyyy-MM-dd"
        />
        <FormCheckboxGroup
          control={form.control}
          name="channels"
          label="Notify me by"
          selectAll
          orientation="horizontal"
          options={[
            { value: "email", label: "Email" },
            { value: "push", label: "Push" },
            { value: "sms", label: "SMS" },
          ]}
        />
        <FormSelect
          control={form.control}
          name="skills"
          label="Skills"
          multiple
          creatable
          options={[
            { label: "React", value: "react" },
            { label: "Vue", value: "vue" },
            { label: "TypeScript", value: "ts" },
            { label: "Node.js", value: "node" },
          ]}
        />
        <FormSwitch control={form.control} name="terms" label="Accept terms" />
        <Button type="submit">Submit</Button>
      </FieldGroup>
    </form>
  )
}

const meta = {
  title: "Common/Form",
  component: DemoForm,
} satisfies Meta<typeof DemoForm>

export default meta
type Story = StoryObj<typeof meta>

/** Submit empty to see every wrapper's error state. */
export const AllFields: Story = {}
