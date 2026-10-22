import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { Button } from "./button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card"
import { Field, FieldGroup, FieldLabel } from "./field"
import { Input } from "./input"

const meta = {
  title: "UI/Card",
  component: Card,
  argTypes: { size: { control: "select", options: ["default", "sm"] } },
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <Card {...args} className="w-96">
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>Enter your email below to login.</CardDescription>
        <CardAction>
          <Button variant="link">Sign up</Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="card-email">Email</FieldLabel>
            <Input id="card-email" type="email" placeholder="m@example.com" />
          </Field>
          <Field>
            <FieldLabel htmlFor="card-password">Password</FieldLabel>
            <Input id="card-password" type="password" />
          </Field>
        </FieldGroup>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button className="w-full">Login</Button>
        <Button variant="outline" className="w-full">Login with Google</Button>
      </CardFooter>
    </Card>
  ),
}

export const Small: Story = {
  args: { size: "sm" },
  render: (args) => (
    <Card {...args} className="w-72">
      <CardHeader>
        <CardDescription>Total revenue</CardDescription>
        <CardTitle className="text-2xl tabular-nums">$45,231.89</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">+20.1% from last month</CardContent>
    </Card>
  ),
}
