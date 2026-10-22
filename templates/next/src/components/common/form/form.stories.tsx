import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { FieldGroup } from "@/components/ui/field"
import { FormInput, FormSelect, FormSwitch, FormTextarea } from "."

const schema = z.object({
  email: z.email("Invalid email address"),
  plan: z.string().min(1, "Please select a plan"),
  note: z.string().max(80, "Max 80 characters").optional(),
  terms: z.boolean().refine(Boolean, "You must accept the terms"),
})

type Values = z.infer<typeof schema>

function DemoForm() {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", plan: "", note: "", terms: false },
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
