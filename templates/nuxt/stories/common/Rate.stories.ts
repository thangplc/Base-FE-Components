import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { AngryIcon, FrownIcon, HeartIcon, LaughIcon, MehIcon, SmileIcon } from '@lucide/vue'
import { ref } from 'vue'
import Rate from '@/components/common/Rate.vue'

/**
 * Star rating: hover to preview, click to set (click the same value again to
 * clear), ← → / Home / End on the keyboard.
 */
const meta = {
  title: 'Common/Rate',
  component: Rate,
  args: { modelValue: 3 },
} satisfies Meta<typeof Rate>

export default meta
type Story = StoryObj<typeof meta>

function story(props: Record<string, unknown>, initial = 3): Story {
  return {
    render: () => ({
      components: { Rate },
      setup: () => ({ props, value: ref(initial) }),
      template: '<Rate v-bind="props" v-model="value" />',
    }),
  }
}

export const Default: Story = story({})

/** `allow-half`: click the left half of a star for .5. */
export const Half: Story = story({ allowHalf: true, showValue: true }, 2.5)

export const Sizes: Story = {
  render: () => ({
    components: { Rate },
    template: `
      <div class="flex flex-col gap-2">
        <Rate size="sm" :model-value="3" />
        <Rate :model-value="3" />
        <Rate size="lg" :model-value="3" />
      </div>
    `,
  }),
}

/** `tooltips` per star (and the screen-reader text). */
export const Tooltips: Story = story({ tooltips: ['Tệ', 'Tạm', 'Ổn', 'Tốt', 'Tuyệt vời'] })

/** `character`: any icon or text; `count` for more stars. */
export const Characters: Story = {
  render: () => ({
    components: { Rate },
    setup: () => ({ HeartIcon, a: ref(2), b: ref(6), c: ref(4) }),
    template: `
      <div class="flex flex-col gap-2">
        <Rate v-model="a" :character="HeartIcon" />
        <Rate v-model="b" character="A" :count="10" />
        <Rate v-model="c" character="好" allow-half />
      </div>
    `,
  }),
}

const faces = [AngryIcon, FrownIcon, MehIcon, SmileIcon, LaughIcon]

/** `render-character`: a different icon per star. */
export const Faces: Story = story({
  renderCharacter: (index: number) => faces[index]!,
  size: 'lg',
  tooltips: ['Angry', 'Sad', 'Meh', 'Happy', 'Delighted'],
})

export const ReadOnly: Story = story({ readOnly: true, allowHalf: true, showValue: true }, 4.5)

export const Disabled: Story = story({ disabled: true })

/** `@hover-change` driving a label. */
export const HoverLabel: Story = {
  render: () => ({
    components: { Rate },
    setup: () => ({ value: ref(3), hover: ref<number>(), labels: ['Terrible', 'Bad', 'Normal', 'Good', 'Wonderful'] }),
    template: `
      <div class="flex items-center gap-3">
        <Rate v-model="value" @hover-change="v => (hover = v)" />
        <span class="text-sm text-muted-foreground">{{ labels[(hover ?? value) - 1] ?? 'Not rated' }}</span>
      </div>
    `,
  }),
}
