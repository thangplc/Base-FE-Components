import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { FileTextIcon } from "lucide-react"

import { TruncatedText } from "@/components/common/truncated-text"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const long =
  "Umbrella International Holdings Corporation Limited — Asia Pacific Regional Headquarters, Singapore"
const paragraph =
  "Customer asked to split the invoice into two payments, send the receipt to the finance team, and keep a copy for the yearly audit. The second payment is due at the end of next month."

/**
 * Cuts text with an ellipsis when it doesn't fit; hover a cut-off text to
 * read it in full. One app-wide tooltip (`TruncateTooltipProvider` in
 * providers.tsx), so it is cheap to use everywhere. The parent must bound
 * the width.
 */
const meta = {
  title: "Common/TruncatedText",
  component: TruncatedText,
  args: { children: long, lines: 1, tooltip: true },
  argTypes: { lines: { control: { type: "number", min: 1, max: 6 } } },
  decorators: [(Story) => <div className="w-72"><Story /></div>],
} satisfies Meta<typeof TruncatedText>

export default meta
type Story = StoryObj<typeof meta>

export const SingleLine: Story = {}

export const FitsNoTooltip: Story = {
  name: "Fits (no tooltip)",
  args: { children: "Acme" },
}

export const MultiLine: Story = {
  args: { children: paragraph, lines: 2 },
}

export const WithoutTooltip: Story = {
  args: { tooltip: false },
}

export const InCard: Story = {
  render: () => (
    <Card className="w-72">
      <CardHeader>
        <CardTitle>
          <TruncatedText>{long}</TruncatedText>
        </CardTitle>
        <CardDescription>
          <TruncatedText lines={2}>{paragraph}</TruncatedText>
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">Hover the title or the description.</CardContent>
    </Card>
  ),
}

/** In a flex row the text needs `min-w-0` (built in) and a flexible slot. */
export const InFlexRow: Story = {
  render: () => (
    <div className="flex w-72 items-center gap-2 rounded-lg border p-3 text-sm">
      <FileTextIcon className="size-4 shrink-0 text-muted-foreground" />
      <TruncatedText className="flex-1">quarterly-financial-report-2026-q3-final-v2-approved.pdf</TruncatedText>
      <span className="shrink-0 text-muted-foreground">2.4 MB</span>
    </div>
  ),
}
