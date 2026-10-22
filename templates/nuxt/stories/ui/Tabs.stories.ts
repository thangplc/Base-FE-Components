import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const components = { Card, CardContent, CardDescription, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger }

const meta = {
  title: 'UI/Tabs',
  component: Tabs,
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components,
    template: `
      <Tabs default-value="account" class="w-96">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="billing" disabled>Billing</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Make changes to your account here.</CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>Change your password here.</CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
    `,
  }),
}

export const Line: Story = {
  render: () => ({
    components,
    template: `
      <Tabs default-value="overview" class="w-96">
        <TabsList variant="line">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" class="text-sm text-muted-foreground">Overview content</TabsContent>
        <TabsContent value="analytics" class="text-sm text-muted-foreground">Analytics content</TabsContent>
        <TabsContent value="reports" class="text-sm text-muted-foreground">Reports content</TabsContent>
      </Tabs>
    `,
  }),
}

export const Vertical: Story = {
  render: () => ({
    components,
    template: `
      <Tabs default-value="general" orientation="vertical" class="w-[28rem]">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="general"><Card><CardContent class="text-sm">General settings</CardContent></Card></TabsContent>
        <TabsContent value="security"><Card><CardContent class="text-sm">Security settings</CardContent></Card></TabsContent>
        <TabsContent value="notifications"><Card><CardContent class="text-sm">Notification settings</CardContent></Card></TabsContent>
      </Tabs>
    `,
  }),
}
