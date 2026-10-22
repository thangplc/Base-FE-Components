"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { createPortal } from "react-dom"

import { cn } from "@/lib/utils"

const SHOW_DELAY_MS = 300
const MAX_WIDTH = 384 // max-w-sm

// Anchored with top (below the element) or bottom (above it), not a
// transform: the zoom-in animation owns `transform` while it runs.
type Tip = { text: string; left: number; top?: number; bottom?: number }

const TruncateTooltipContext = createContext(false)

/** Cut off horizontally (one line) or vertically (line-clamp). */
function isTruncated(element: HTMLElement) {
  return element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight
}

/**
 * One tooltip for the whole app: when the pointer rests on an element with
 * `data-truncate` whose text is actually cut off, show its full text above
 * it (below near the top edge). Mount once at the root (providers.tsx).
 */
export function TruncateTooltipProvider({ children }: { children: ReactNode }) {
  const [tip, setTip] = useState<Tip | null>(null)

  useEffect(() => {
    let current: HTMLElement | null = null
    let timer: ReturnType<typeof setTimeout> | undefined

    const hide = () => {
      clearTimeout(timer)
      current = null
      setTip(null)
    }

    const onPointerOver = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null
      const element = target?.closest<HTMLElement>("[data-truncate]") ?? null
      if (element === current) return
      hide()
      if (!element || !isTruncated(element)) return
      current = element
      timer = setTimeout(() => {
        const rect = element.getBoundingClientRect()
        const left = Math.max(8, Math.min(rect.left, window.innerWidth - MAX_WIDTH - 8))
        const text = element.innerText
        setTip(
          rect.top < 48
            ? { text, left, top: rect.bottom + 6 }
            : { text, left, bottom: window.innerHeight - rect.top + 6 }
        )
      }, SHOW_DELAY_MS)
    }

    document.addEventListener("pointerover", onPointerOver)
    document.documentElement.addEventListener("pointerleave", hide)
    // Any scroll moves the element away from the tooltip.
    window.addEventListener("scroll", hide, true)
    return () => {
      clearTimeout(timer)
      document.removeEventListener("pointerover", onPointerOver)
      document.documentElement.removeEventListener("pointerleave", hide)
      window.removeEventListener("scroll", hide, true)
    }
  }, [])

  return (
    <TruncateTooltipContext.Provider value>
      {children}
      {tip &&
        createPortal(
          <div
            role="tooltip"
            className="pointer-events-none fixed z-50 w-max max-w-sm rounded-md bg-foreground px-3 py-1.5 text-xs break-words whitespace-pre-wrap text-background animate-in fade-in-0 zoom-in-95"
            style={{ left: tip.left, top: tip.top, bottom: tip.bottom }}
          >
            {tip.text}
          </div>,
          document.body
        )}
    </TruncateTooltipContext.Provider>
  )
}

const lineClamp: Record<number, string> = {
  2: "line-clamp-2",
  3: "line-clamp-3",
  4: "line-clamp-4",
  5: "line-clamp-5",
  6: "line-clamp-6",
}

type TruncatedTextProps = {
  children: ReactNode
  /** 1 = single line with an ellipsis; 2–6 = cut after that many lines. */
  lines?: number
  /** Show the full text in a tooltip on hover when it is cut off. */
  tooltip?: boolean
  className?: string
}

/**
 * Text that is cut with an ellipsis when it doesn't fit, with the full text
 * in a tooltip on hover (needs `TruncateTooltipProvider` at the root).
 * The parent must bound the width: e.g. a table cell, `w-48`, or `min-w-0`
 * inside a flex row.
 */
export function TruncatedText({ children, lines = 1, tooltip = true, className }: TruncatedTextProps) {
  const hasProvider = useContext(TruncateTooltipContext)

  useEffect(() => {
    if (tooltip && !hasProvider && process.env.NODE_ENV !== "production") {
      console.warn("TruncatedText: wrap the app in <TruncateTooltipProvider> to get tooltips.")
    }
  }, [tooltip, hasProvider])

  return (
    <span
      data-truncate={tooltip ? "" : undefined}
      className={cn(
        "block min-w-0",
        lines > 1 ? (lineClamp[lines] ?? "line-clamp-6") + " break-words whitespace-normal" : "truncate",
        className
      )}
    >
      {children}
    </span>
  )
}
