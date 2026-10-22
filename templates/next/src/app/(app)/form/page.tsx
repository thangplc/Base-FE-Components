"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import {
  FormInput,
  FormSelect,
  FormSwitch,
  FormTextarea,
} from "@/components/common/form"
import { PageHeader } from "@/components/common/page-header"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FieldGroup } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Invalid email address"),
  role: z.string().min(1, "Please select a role"),
  bio: z.string().max(160, "Bio must be 160 characters or less").optional(),
  notifications: z.boolean(),
})

type ProfileValues = z.infer<typeof profileSchema>

const roles = [
  { label: "Admin", value: "admin" },
  { label: "Editor", value: "editor" },
  { label: "Viewer", value: "viewer" },
]

export default function FormPage() {
  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", email: "", role: "", bio: "", notifications: true },
  })

  async function onSubmit(values: ProfileValues) {
    await new Promise((resolve) => setTimeout(resolve, 800))
    toast.success("Profile saved", {
      description: <pre className="text-xs">{JSON.stringify(values, null, 2)}</pre>,
    })
  }

  return (
    <>
      <PageHeader
        title="Form"
        description="react-hook-form + zod, wired through the FormField wrappers."
      />
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Submit with empty fields to see validation.</CardDescription>
        </CardHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <CardContent>
            <FieldGroup>
              <FormInput control={form.control} name="name" label="Name" placeholder="Jane Doe" />
              <FormInput
                control={form.control}
                name="email"
                label="Email"
                type="email"
                placeholder="jane@example.com"
              />
              <FormSelect
                control={form.control}
                name="role"
                label="Role"
                options={roles}
                placeholder="Select a role"
              />
              <FormTextarea
                control={form.control}
                name="bio"
                label="Bio"
                description="Max 160 characters."
                placeholder="Tell us about yourself"
              />
              <FormSwitch
                control={form.control}
                name="notifications"
                label="Email notifications"
                description="Receive product updates by email."
              />
            </FieldGroup>
          </CardContent>
          <CardFooter className="mt-6 justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => form.reset()}>
              Reset
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Spinner data-icon="inline-start" />}
              Save
            </Button>
          </CardFooter>
        </form>
      </Card>
    </>
  )
}
