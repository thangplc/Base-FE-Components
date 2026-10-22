import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { FieldGroup } from '@/components/ui/field'
import FormInput from '@/components/common/form/FormInput.vue'
import FormSelect from '@/components/common/form/FormSelect.vue'
import FormSwitch from '@/components/common/form/FormSwitch.vue'
import FormTextarea from '@/components/common/form/FormTextarea.vue'

const schema = z.object({
  email: z.string().email('Invalid email address'),
  plan: z.string().min(1, 'Please select a plan'),
  note: z.string().max(80, 'Max 80 characters').optional(),
  terms: z.boolean().refine(Boolean, 'You must accept the terms'),
})

const meta = {
  title: 'Common/Form',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** Submit empty to see every wrapper's error state. */
export const AllFields: Story = {
  render: () => ({
    components: { Button, FieldGroup, FormInput, FormSelect, FormSwitch, FormTextarea },
    setup() {
      const { handleSubmit } = useForm({
        validationSchema: toTypedSchema(schema),
        initialValues: { email: '', plan: '', note: '', terms: false },
      })
      const plans = [
        { label: 'Free', value: 'free' },
        { label: 'Pro', value: 'pro' },
        { label: 'Enterprise', value: 'enterprise', disabled: true },
      ]
      const onSubmit = handleSubmit(values => toast.success(JSON.stringify(values)))
      return { plans, onSubmit }
    },
    template: `
      <form class="w-96" novalidate @submit="onSubmit">
        <FieldGroup>
          <FormInput name="email" label="Email" type="email" />
          <FormSelect name="plan" label="Plan" :options="plans" />
          <FormTextarea name="note" label="Note" description="Optional." />
          <FormSwitch name="terms" label="Accept terms" />
          <Button type="submit">Submit</Button>
        </FieldGroup>
      </form>
    `,
  }),
}
