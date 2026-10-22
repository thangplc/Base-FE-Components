"use client"

import type { ReactNode } from "react"
import { ThemeProvider } from "next-themes"

import { TruncateTooltipProvider } from "@/components/common/truncated-text"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"

/** App-wide providers. Add query client, auth, i18n... here. */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider>
        <TruncateTooltipProvider>
          {children}
          <Toaster richColors closeButton />
        </TruncateTooltipProvider>
      </TooltipProvider>
    </ThemeProvider>
  )
}
