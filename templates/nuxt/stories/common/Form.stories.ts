import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { FieldGroup } from '@/components/ui/field'
import FormCheckboxGroup from '@/components/common/form/FormCheckboxGroup.vue'
import FormDatePicker from '@/components/common/form/FormDatePicker.vue'
import FormDateRangePicker from '@/components/common/form/FormDateRangePicker.vue'
import FormInput from '@/components/common/form/FormInput.vue'
import FormSelect from '@/components/common/form/FormSelect.vue'
import FormSwitch from '@/components/common/form/FormSwitch.vue'
import FormTextarea from '@/components/common/form/FormTextarea.vue'

const schema = z.object({
  email: z.string().email('Invalid email address'),
  plan: z.string().min(1, 'Please select a plan'),
  note: z.string().max(80, 'Max 80 characters').optional(),
  // value-format="yyyy-MM-dd" → the form holds a string.
  startDate: z.string({ required_error: 'Please pick a start date' }),
  meetingAt: z.date({ required_error: 'Please pick a date and time' }),
  period: z
    .object({ from: z.string().optional(), to: z.string().optional() }, { required_error: 'Please pick a period' })
    // No `path`: the field reads its error at its own path.
    .refine(range => range.from && range.to, 'Pick both a start and an end day'),
  channels: z.array(z.string()).min(1, 'Pick at least one channel'),
  skills: z.array(z.string()).min(2, 'Pick at least 2 skills'),
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
    components: { Button, FieldGroup, FormCheckboxGroup, FormDatePicker, FormDateRangePicker, FormInput, FormSelect, FormSwitch, FormTextarea },
    setup() {
      const { handleSubmit } = useForm({
        validationSchema: toTypedSchema(schema),
        initialValues: { email: '', plan: '', note: '', terms: false, channels: [], skills: [] },
      })
      const plans = [
        { label: 'Free', value: 'free' },
        { label: 'Pro', value: 'pro' },
        { label: 'Enterprise', value: 'enterprise', disabled: true },
      ]
      const onSubmit = handleSubmit(values => toast.success(JSON.stringify(values)))
      const channels = [
        { value: 'email', label: 'Email' },
        { value: 'push', label: 'Push' },
        { value: 'sms', label: 'SMS' },
      ]
      const skills = [
        { label: 'React', value: 'react' },
        { label: 'Vue', value: 'vue' },
        { label: 'TypeScript', value: 'ts' },
        { label: 'Node.js', value: 'node' },
      ]
      return { plans, channels, skills, onSubmit }
    },
    template: `
      <form class="w-96" novalidate @submit="onSubmit">
        <FieldGroup>
          <FormInput name="email" label="Email" type="email" />
          <FormSelect name="plan" label="Plan" :options="plans" />
          <FormTextarea name="note" label="Note" description="Optional." />
          <FormDatePicker
            name="startDate"
            label="Start date"
            value-format="yyyy-MM-dd"
            description='Form value: "2026-10-22".'
          />
          <FormDatePicker name="meetingAt" label="Meeting" with-time :minute-step="15" />
          <FormDateRangePicker name="period" label="Period" value-format="yyyy-MM-dd" />
          <FormCheckboxGroup
            name="channels"
            label="Notify me by"
            select-all
            orientation="horizontal"
            :options="channels"
          />
          <FormSelect name="skills" label="Skills" multiple creatable :options="skills" />
          <FormSwitch name="terms" label="Accept terms" />
          <Button type="submit">Submit</Button>
        </FieldGroup>
      </form>
    `,
  }),
}
