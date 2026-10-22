import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

/** `<Toaster />` is mounted once in providers.tsx; call `toast()` anywhere. */
const meta = {
  title: "UI/Sonner (Toast)",
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const Types: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={() => toast("Event has been created")}>Default</Button>
      <Button variant="outline" onClick={() => toast.success("Saved successfully")}>Success</Button>
      <Button variant="outline" onClick={() => toast.info("New version available")}>Info</Button>
      <Button variant="outline" onClick={() => toast.warning("Storage almost full")}>Warning</Button>
      <Button variant="outline" onClick={() => toast.error("Something went wrong")}>Error</Button>
    </div>
  ),
}

export const WithDescriptionAndAction: Story = {
  render: () => (
    <Button
      variant="outline"
      onClick={() =>
        toast("File deleted", {
          description: "report.pdf was moved to trash",
          action: { label: "Undo", onClick: () => toast.success("Restored") },
        })
      }
    >
      Delete file
    </Button>
  ),
}

export const PromiseToast: Story = {
  name: "Promise",
  render: () => (
    <Button
      variant="outline"
      onClick={() =>
        toast.promise(wait(1500), { loading: "Saving...", success: "Done", error: "Failed" })
      }
    >
      Save
    </Button>
  ),
}
