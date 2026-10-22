<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { z } from 'zod'
import FormInput from '@/components/common/form/FormInput.vue'
import FormSelect from '@/components/common/form/FormSelect.vue'
import FormSwitch from '@/components/common/form/FormSwitch.vue'
import FormTextarea from '@/components/common/form/FormTextarea.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { FieldGroup } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: z.string().min(1, 'Please select a role'),
  bio: z.string().max(160, 'Bio must be 160 characters or less').optional(),
  notifications: z.boolean(),
})

const roles = [
  { label: 'Admin', value: 'admin' },
  { label: 'Editor', value: 'editor' },
  { label: 'Viewer', value: 'viewer' },
]

const { handleSubmit, isSubmitting, resetForm } = useForm({
  validationSchema: toTypedSchema(profileSchema),
  initialValues: { name: '', email: '', role: '', bio: '', notifications: true },
})

const onSubmit = handleSubmit(async (values) => {
  await new Promise(resolve => setTimeout(resolve, 800))
  toast.success('Profile saved', { description: JSON.stringify(values) })
})
</script>

<template>
  <PageHeader
    title="Form"
    description="vee-validate + zod, wired through the Form* wrappers."
  />
  <Card class="max-w-xl">
    <CardHeader>
      <CardTitle>Profile</CardTitle>
      <CardDescription>Submit with empty fields to see validation.</CardDescription>
    </CardHeader>
    <form novalidate @submit="onSubmit">
      <CardContent>
        <FieldGroup>
          <FormInput name="name" label="Name" placeholder="Jane Doe" />
          <FormInput name="email" label="Email" type="email" placeholder="jane@example.com" />
          <FormSelect name="role" label="Role" :options="roles" placeholder="Select a role" />
          <FormTextarea
            name="bio"
            label="Bio"
            description="Max 160 characters."
            placeholder="Tell us about yourself"
          />
          <FormSwitch
            name="notifications"
            label="Email notifications"
            description="Receive product updates by email."
          />
        </FieldGroup>
      </CardContent>
      <CardFooter class="mt-6 justify-end gap-2">
        <Button type="button" variant="outline" @click="resetForm()">
          Reset
        </Button>
        <Button type="submit" :disabled="isSubmitting">
          <Spinner v-if="isSubmitting" data-icon="inline-start" />
          Save
        </Button>
      </CardFooter>
    </form>
  </Card>
</template>
