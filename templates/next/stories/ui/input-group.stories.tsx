import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { ArrowUpIcon, CopyIcon, MailIcon, SearchIcon } from "lucide-react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group"

const meta = {
  title: "UI/InputGroup",
  component: InputGroup,
  decorators: [(Story) => <div className="flex w-80 flex-col gap-4"><Story /></div>],
} satisfies Meta<typeof InputGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Icons: Story = {
  render: () => (
    <>
      <InputGroup>
        <InputGroupAddon><SearchIcon /></InputGroupAddon>
        <InputGroupInput placeholder="Search..." />
        <InputGroupAddon align="inline-end">12 results</InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupInput placeholder="Email" />
        <InputGroupAddon align="inline-end"><MailIcon /></InputGroupAddon>
      </InputGroup>
    </>
  ),
}

export const TextAddons: Story = {
  render: () => (
    <>
      <InputGroup>
        <InputGroupAddon><InputGroupText>https://</InputGroupText></InputGroupAddon>
        <InputGroupInput placeholder="example.com" />
        <InputGroupAddon align="inline-end"><InputGroupText>.com</InputGroupText></InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupAddon><InputGroupText>$</InputGroupText></InputGroupAddon>
        <InputGroupInput placeholder="0.00" />
        <InputGroupAddon align="inline-end"><InputGroupText>USD</InputGroupText></InputGroupAddon>
      </InputGroup>
    </>
  ),
}

export const WithButton: Story = {
  render: () => (
    <InputGroup>
      <InputGroupInput defaultValue="https://x.com/shadcn" readOnly />
      <InputGroupAddon align="inline-end">
        <InputGroupButton size="icon-xs" aria-label="Copy"><CopyIcon /></InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
}

export const Textarea: Story = {
  render: () => (
    <InputGroup>
      <InputGroupTextarea placeholder="Ask, search or chat..." />
      <InputGroupAddon align="block-end">
        <InputGroupText>52% used</InputGroupText>
        <InputGroupButton variant="default" size="icon-xs" className="ml-auto rounded-full" aria-label="Send">
          <ArrowUpIcon />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
}
