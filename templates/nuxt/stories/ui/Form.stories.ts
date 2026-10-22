import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

/**
 * The raw shadcn-vue form parts (vee-validate `FormField` + FormItem...).
 * Day to day, prefer the Common/Form wrappers (FormInput, FormSelect...).
 */
const meta = {
  title: 'UI/Form (vee-validate)',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { Button, Input, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage },
    setup() {
      const { handleSubmit } = useForm({
        validationSchema: toTypedSchema(z.object({ username: z.string().min(2, 'At least 2 characters') })),
      })
      const onSubmit = handleSubmit(values => toast.success(`Hello ${values.username}`))
      return { onSubmit }
    },
    template: `
      <form class="flex w-80 flex-col gap-4" @submit="onSubmit">
        <FormField v-slot="{ componentField }" name="username">
          <FormItem>
            <FormLabel>Username</FormLabel>
            <FormControl><Input placeholder="shadcn" v-bind="componentField" /></FormControl>
            <FormDescription>This is your public display name.</FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>
        <Button type="submit">Submit</Button>
      </form>
    `,
  }),
}
