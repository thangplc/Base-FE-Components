import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '.'

const components = {
  Button, Field, FieldGroup, FieldLabel, Input,
  Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
}

const meta = {
  title: 'UI/Card',
  component: Card,
  argTypes: { size: { control: 'select', options: ['default', 'sm'] } },
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: args => ({
    components,
    setup: () => ({ args }),
    template: `
      <Card v-bind="args" class="w-96">
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>Enter your email below to login.</CardDescription>
          <CardAction><Button variant="link">Sign up</Button></CardAction>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel for="card-email">Email</FieldLabel>
              <Input id="card-email" type="email" placeholder="m@example.com" />
            </Field>
            <Field>
              <FieldLabel for="card-password">Password</FieldLabel>
              <Input id="card-password" type="password" />
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter class="flex-col gap-2">
          <Button class="w-full">Login</Button>
          <Button variant="outline" class="w-full">Login with Google</Button>
        </CardFooter>
      </Card>
    `,
  }),
}

export const Small: Story = {
  render: () => ({
    components,
    template: `
      <Card size="sm" class="w-72">
        <CardHeader>
          <CardDescription>Total revenue</CardDescription>
          <CardTitle class="text-2xl tabular-nums">$45,231.89</CardTitle>
        </CardHeader>
        <CardContent class="text-sm text-muted-foreground">+20.1% from last month</CardContent>
      </Card>
    `,
  }),
}
