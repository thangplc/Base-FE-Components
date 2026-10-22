import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { LogOutIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/common/confirm-dialog"

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

const meta = {
  title: "Common/ConfirmDialog",
  component: ConfirmDialog,
  args: {
    trigger: <Button variant="outline">Open</Button>,
    title: "Are you sure?",
    description: "This action cannot be undone.",
    confirmText: "Confirm",
    cancelText: "Cancel",
    variant: "default",
    onConfirm: () => {
      toast.success("Confirmed")
    },
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["default", "destructive"] },
    trigger: { control: false },
  },
} satisfies Meta<typeof ConfirmDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Destructive: Story = {
  args: {
    trigger: (
      <Button variant="destructive">
        <Trash2Icon data-icon="inline-start" />
        Delete project
      </Button>
    ),
    title: "Delete this project?",
    description: "All files and settings will be permanently removed.",
    confirmText: "Delete",
    variant: "destructive",
  },
}

/** onConfirm returns a promise: buttons are disabled and a spinner shows until it resolves. */
export const AsyncConfirm: Story = {
  args: {
    trigger: (
      <Button variant="outline">
        <LogOutIcon data-icon="inline-start" />
        Sign out
      </Button>
    ),
    title: "Sign out of all devices?",
    confirmText: "Sign out",
    onConfirm: async () => {
      await wait(1500)
      toast.success("Signed out")
    },
  },
}

/** If onConfirm throws, the dialog stays open so the user can retry. */
export const FailingConfirm: Story = {
  args: {
    title: "Retry payment?",
    confirmText: "Retry",
    onConfirm: async () => {
      await wait(1000)
      toast.error("Payment failed, try again")
      throw new Error("Payment failed")
    },
  },
}
