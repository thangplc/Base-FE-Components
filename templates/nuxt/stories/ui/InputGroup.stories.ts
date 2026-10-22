import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ArrowUpIcon, CopyIcon, MailIcon, SearchIcon } from '@lucide/vue'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from '@/components/ui/input-group'

const components = {
  InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText, InputGroupTextarea,
  ArrowUpIcon, CopyIcon, MailIcon, SearchIcon,
}

const meta = {
  title: 'UI/InputGroup',
  component: InputGroup,
  decorators: [() => ({ template: '<div class="flex w-80 flex-col gap-4"><story /></div>' })],
} satisfies Meta<typeof InputGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Icons: Story = {
  render: () => ({
    components,
    template: `
      <InputGroup>
        <InputGroupAddon><SearchIcon /></InputGroupAddon>
        <InputGroupInput placeholder="Search..." />
        <InputGroupAddon align="inline-end">12 results</InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupInput placeholder="Email" />
        <InputGroupAddon align="inline-end"><MailIcon /></InputGroupAddon>
      </InputGroup>
    `,
  }),
}

export const TextAddons: Story = {
  render: () => ({
    components,
    template: `
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
    `,
  }),
}

export const WithButton: Story = {
  render: () => ({
    components,
    template: `
      <InputGroup>
        <InputGroupInput model-value="https://x.com/shadcn" readonly />
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="icon-xs" aria-label="Copy"><CopyIcon /></InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    `,
  }),
}

export const Textarea: Story = {
  render: () => ({
    components,
    template: `
      <InputGroup>
        <InputGroupTextarea placeholder="Ask, search or chat..." />
        <InputGroupAddon align="block-end">
          <InputGroupText>52% used</InputGroupText>
          <InputGroupButton variant="default" size="icon-xs" class="ml-auto rounded-full" aria-label="Send">
            <ArrowUpIcon />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    `,
  }),
}
