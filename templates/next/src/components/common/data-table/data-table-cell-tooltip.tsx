"use client"

import { useEffect, useState, type RefObject } from "react"
import { createPortal } from "react-dom"

const SHOW_DELAY_MS = 300
const MAX_WIDTH = 384 // max-w-sm

// Anchored with top (below the cell) or bottom (above it), not a transform:
// the zoom-in animation owns `transform` while it runs.
type Tip = { text: string; left: number; top?: number; bottom?: number }

/**
 * One tooltip for the whole table (not one per cell): when the pointer
 * rests on a `[data-slot=cell-content]` whose text is cut off by the
 * ellipsis, show the full text above it (below near the top edge).
 */
export function DataTableCellTooltip({ containerRef }: { containerRef: RefObject<HTMLElement | null> }) {
  const [tip, setTip] = useState<Tip | null>(null)

  useEffect(() => {
    const root = containerRef.current
    if (!root) return
    let current: HTMLElement | null = null
    let timer: ReturnType<typeof setTimeout> | undefined

    const hide = () => {
      clearTimeout(timer)
      current = null
      setTip(null)
    }

    const onPointerOver = (event: PointerEvent) => {
      const cell = (event.target as HTMLElement).closest<HTMLElement>("[data-slot=cell-content]")
      if (cell === current) return
      hide()
      // Only cells that are actually truncated get a tooltip.
      if (!cell || cell.scrollWidth <= cell.clientWidth) return
      current = cell
      timer = setTimeout(() => {
        const rect = cell.getBoundingClientRect()
        const left = Math.max(8, Math.min(rect.left, window.innerWidth - MAX_WIDTH - 8))
        setTip(
          rect.top < 48
            ? { text: cell.innerText, left, top: rect.bottom + 6 }
            : { text: cell.innerText, left, bottom: window.innerHeight - rect.top + 6 }
        )
      }, SHOW_DELAY_MS)
    }

    root.addEventListener("pointerover", onPointerOver)
    root.addEventListener("pointerleave", hide)
    // Any scroll (body, page) moves the cell away from the tooltip.
    window.addEventListener("scroll", hide, true)
    return () => {
      clearTimeout(timer)
      root.removeEventListener("pointerover", onPointerOver)
      root.removeEventListener("pointerleave", hide)
      window.removeEventListener("scroll", hide, true)
    }
  }, [containerRef])

  if (!tip) return null

  return createPortal(
    <div
      role="tooltip"
      className="pointer-events-none fixed z-50 w-max max-w-sm rounded-md bg-foreground px-3 py-1.5 text-xs break-words whitespace-pre-wrap text-background animate-in fade-in-0 zoom-in-95"
      style={{ left: tip.left, top: tip.top, bottom: tip.bottom }}
    >
      {tip.text}
    </div>,
    document.body
  )
}
