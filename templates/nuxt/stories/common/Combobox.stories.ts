import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { ComboboxOption } from '@/components/common/combobox'
import { ref, watch } from 'vue'
import { Combobox } from '@/components/common/combobox'

const cities: ComboboxOption[] = [
  { value: 'hn', label: 'Hà Nội', group: 'Miền Bắc' },
  { value: 'hp', label: 'Hải Phòng', group: 'Miền Bắc' },
  { value: 'qn', label: 'Quảng Ninh', group: 'Miền Bắc' },
  { value: 'dn', label: 'Đà Nẵng', group: 'Miền Trung' },
  { value: 'hue', label: 'Huế', group: 'Miền Trung' },
  { value: 'kh', label: 'Khánh Hoà', group: 'Miền Trung', disabled: true },
  { value: 'hcm', label: 'TP. Hồ Chí Minh', group: 'Miền Nam' },
  { value: 'ct', label: 'Cần Thơ', group: 'Miền Nam' },
  { value: 'vt', label: 'Vũng Tàu', group: 'Miền Nam' },
]

const frameworks: ComboboxOption[] = [
  { value: 'next', label: 'Next.js', description: 'React framework' },
  { value: 'nuxt', label: 'Nuxt', description: 'Vue framework' },
  { value: 'remix', label: 'Remix' },
  { value: 'astro', label: 'Astro' },
  { value: 'svelte', label: 'SvelteKit' },
]

/**
 * Searchable select on a Popover, single or `multiple` (chips). The search
 * ignores accents ("ha noi" finds "Hà Nội"); ↑ ↓ Enter work in the list, and
 * Backspace in an empty search removes the last chip.
 */
const meta = {
  title: 'Common/Combobox',
  component: Combobox,
  args: { options: frameworks },
} satisfies Meta<typeof Combobox>

export default meta
type Story = StoryObj<typeof meta>

function story(props: Record<string, unknown>, initial: unknown = undefined): Story {
  return {
    render: () => ({
      components: { Combobox },
      setup: () => ({ props, value: ref(initial) }),
      template: `
        <div class="flex w-80 flex-col gap-2">
          <Combobox v-bind="props" v-model="value" />
          <code class="text-xs text-muted-foreground">{{ JSON.stringify(value ?? null) }}</code>
        </div>
      `,
    }),
  }
}

/** Single value with a search box. */
export const Single: Story = story({ options: frameworks })

/** Groups (`group` on each option); disabled options are skipped by the keyboard. */
export const Groups: Story = story({ options: cities })

/** `multiple`: chips in the trigger, "+N" after `max-tag-count` (3). */
export const Multiple: Story = story({ options: cities, multiple: true }, ['hn', 'dn'])

/** `show-select-all` (tri-state) and `:max-count="4"`: other options disable at the limit. */
export const SelectAllAndMax: Story = story({ options: cities, multiple: true, showSelectAll: true, maxCount: 4 }, ['hn', 'dn'])

/** `tag-mode="count"`: "3 selected" instead of chips. */
export const CountMode: Story = story({ options: cities, multiple: true, tagMode: 'count' }, ['hn', 'dn'])

/** `creatable`: type a new tag and press Enter. */
export const Creatable: Story = story({ options: frameworks, multiple: true, creatable: true, placeholder: 'Add tags' }, ['next'])

const users = Array.from({ length: 200 }, (_, i) => ({ value: `u${i + 1}`, label: `User ${i + 1}`, description: `user${i + 1}@example.com` }))

/** `@search` + `loading`: server-side search; chips keep their labels. */
export const ServerSearch: Story = {
  render: () => ({
    components: { Combobox },
    setup() {
      const query = ref('')
      const options = ref<ComboboxOption[]>(users.slice(0, 8))
      const loading = ref(false)
      const value = ref<string[]>([])
      let timer: ReturnType<typeof setTimeout> | undefined
      // Fake API: 400ms debounce + latency.
      watch(query, (q) => {
        loading.value = true
        clearTimeout(timer)
        timer = setTimeout(() => {
          options.value = users.filter(u => u.label.toLowerCase().includes(q.toLowerCase())).slice(0, 8)
          loading.value = false
        }, 400)
      })
      return { query, options, loading, value }
    },
    template: `
      <div class="flex w-80 flex-col gap-2">
        <Combobox v-model="value" multiple :options="options" :loading="loading" @search="q => (query = q)" />
        <code class="text-xs text-muted-foreground">{{ JSON.stringify(value) }}</code>
      </div>
    `,
  }),
}

export const Disabled: Story = story({ options: frameworks, disabled: true }, 'next')
