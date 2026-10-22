import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'

/** `<Toaster />` is mounted once in app.vue; call `toast()` anywhere. */
const meta = {
  title: 'UI/Sonner (Toast)',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const Types: Story = {
  render: () => ({
    components: { Button },
    setup: () => ({ toast }),
    template: `
      <div class="flex flex-wrap gap-2">
        <Button variant="outline" @click="toast('Event has been created')">Default</Button>
        <Button variant="outline" @click="toast.success('Saved successfully')">Success</Button>
        <Button variant="outline" @click="toast.info('New version available')">Info</Button>
        <Button variant="outline" @click="toast.warning('Storage almost full')">Warning</Button>
        <Button variant="outline" @click="toast.error('Something went wrong')">Error</Button>
      </div>
    `,
  }),
}

export const WithDescriptionAndAction: Story = {
  render: () => ({
    components: { Button },
    setup: () => ({
      deleteFile: () =>
        toast('File deleted', {
          description: 'report.pdf was moved to trash',
          action: { label: 'Undo', onClick: () => toast.success('Restored') },
        }),
    }),
    template: '<Button variant="outline" @click="deleteFile">Delete file</Button>',
  }),
}

export const PromiseToast: Story = {
  name: 'Promise',
  render: () => ({
    components: { Button },
    setup: () => ({
      save: () => toast.promise(wait(1500), { loading: 'Saving...', success: 'Done', error: 'Failed' }),
    }),
    template: '<Button variant="outline" @click="save">Save</Button>',
  }),
}
