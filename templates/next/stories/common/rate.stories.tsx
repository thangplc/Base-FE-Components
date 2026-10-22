import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useState } from "react"
import { FrownIcon, HeartIcon, LaughIcon, MehIcon, SmileIcon, AngryIcon } from "lucide-react"

import { Rate } from "@/components/common/rate"

/**
 * Star rating: hover to preview, click to set (click the same value again to
 * clear), ← → / Home / End on the keyboard.
 */
const meta = {
  title: "Common/Rate",
  component: Rate,
  args: { defaultValue: 3 },
} satisfies Meta<typeof Rate>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** `allowHalf`: click the left half of a star for .5. */
export const Half: Story = { args: { allowHalf: true, defaultValue: 2.5, showValue: true } }

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Rate size="sm" defaultValue={3} />
      <Rate defaultValue={3} />
      <Rate size="lg" defaultValue={3} />
    </div>
  ),
}

/** `tooltips` per star (and the screen-reader text). */
export const Tooltips: Story = { args: { tooltips: ["Tệ", "Tạm", "Ổn", "Tốt", "Tuyệt vời"] } }

/** `character`: any icon or text; `count` for more stars. */
export const Characters: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Rate character={HeartIcon} defaultValue={2} />
      <Rate character="A" count={10} defaultValue={6} />
      <Rate character="好" defaultValue={4} allowHalf />
    </div>
  ),
}

const faces = [AngryIcon, FrownIcon, MehIcon, SmileIcon, LaughIcon]

/** `renderCharacter`: a different icon per star. */
export const Faces: Story = {
  args: { renderCharacter: (index: number) => faces[index], size: "lg", tooltips: ["Angry", "Sad", "Meh", "Happy", "Delighted"] },
}

export const ReadOnly: Story = { args: { readOnly: true, defaultValue: 4.5, allowHalf: true, showValue: true } }

export const Disabled: Story = { args: { disabled: true } }

function HoverDemo() {
  const [value, setValue] = useState(3)
  const [hover, setHover] = useState<number>()
  const labels = ["Terrible", "Bad", "Normal", "Good", "Wonderful"]
  return (
    <div className="flex items-center gap-3">
      <Rate value={value} onValueChange={setValue} onHoverChange={setHover} />
      <span className="text-sm text-muted-foreground">{labels[(hover ?? value) - 1] ?? "Not rated"}</span>
    </div>
  )
}

/** Controlled, with `onHoverChange` driving a label. */
export const HoverLabel: Story = { render: () => <HoverDemo /> }
