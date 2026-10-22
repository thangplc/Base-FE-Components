"use client"

import type { ReactNode } from "react"
import { ChevronDownIcon, ChevronRightIcon, MinusIcon, PlusIcon } from "lucide-react"
import { Accordion as AccordionPrimitive } from "radix-ui"

import { Accordion, AccordionContent, AccordionItem } from "@/components/ui/accordion"
import { cn } from "@/lib/utils"

export type CollapseItem = {
  key: string
  title: ReactNode
  content: ReactNode
  /** Actions on the right of the header (clicking them doesn't toggle). */
  extra?: ReactNode
  /** Icon before the title. */
  icon?: ReactNode
  disabled?: boolean
}

export type CollapseBaseProps = {
  items: CollapseItem[]
  /** "bordered" (one box, default), "separated" (a card per panel) or "ghost" (no borders). */
  variant?: "bordered" | "separated" | "ghost"
  size?: "sm" | "default"
  /** Chevron (default) or a +/− box. */
  expandIcon?: "chevron" | "plus-minus"
  expandIconPosition?: "start" | "end"
  /** "header": the whole row toggles (default); "icon": only the icon does. */
  collapsible?: "header" | "icon"
  /** Keep closed panels in the DOM (e.g. to preserve form state). */
  forceMount?: boolean
  className?: string
}

export type CollapseProps = CollapseBaseProps &
  (
    | {
        /** Only one panel open at a time. */
        accordion: true
        value?: string | null
        defaultValue?: string
        onValueChange?: (value: string | undefined) => void
      }
    | {
        accordion?: false
        value?: string[]
        defaultValue?: string[]
        onValueChange?: (value: string[]) => void
      }
  )

const variantClass = {
  // The shadcn AccordionItem draws the divider (not-last:border-b).
  bordered: { root: "rounded-lg border", item: "", pad: "px-4" },
  separated: { root: "gap-2", item: "rounded-lg border", pad: "px-4" },
  ghost: { root: "", item: "not-last:border-b-0", pad: "px-2" },
}

/** Panels that expand and collapse: a list (`items`) on the shadcn Accordion. */
export function Collapse(props: CollapseProps) {
  const {
    items,
    variant = "bordered",
    size = "default",
    expandIcon = "chevron",
    expandIconPosition = "end",
    collapsible = "header",
    forceMount = false,
    className,
  } = props
  const styles = variantClass[variant]
  const headerPad = size === "sm" ? "py-2" : "py-3"

  const icon = (
    <span
      aria-hidden
      data-slot="collapse-icon"
      className="flex size-4 shrink-0 items-center justify-center text-muted-foreground transition-transform duration-200"
    >
      {expandIcon === "plus-minus" ? (
        <span className="flex size-4 items-center justify-center rounded-[4px] border border-input">
          <PlusIcon className="size-3 group-data-[state=open]/panel:hidden" />
          <MinusIcon className="hidden size-3 group-data-[state=open]/panel:block" />
        </span>
      ) : expandIconPosition === "start" ? (
        <ChevronRightIcon className="size-4 transition-transform duration-200 group-data-[state=open]/panel:rotate-90" />
      ) : (
        <ChevronDownIcon className="size-4 transition-transform duration-200 group-data-[state=open]/panel:rotate-180" />
      )}
    </span>
  )

  const panels = items.map((item) => {
    const title = (
      <span className="flex min-w-0 flex-1 items-center gap-2">
        {item.icon && <span className="flex shrink-0 text-muted-foreground [&_svg]:size-4">{item.icon}</span>}
        <span className="min-w-0 flex-1">{item.title}</span>
      </span>
    )
    const triggerClass =
      "rounded-md text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none"
    return (
      <AccordionItem
        key={item.key}
        value={item.key}
        disabled={item.disabled}
        className={cn("group/panel data-disabled:opacity-50", styles.item)}
      >
        <AccordionPrimitive.Header
          data-slot="collapse-header"
          className={cn("flex items-center gap-2 text-sm font-medium", styles.pad, headerPad, variant === "ghost" && "rounded-md hover:bg-muted/50")}
        >
          {collapsible === "icon" ? (
            <>
              {expandIconPosition === "start" && (
                <AccordionPrimitive.Trigger aria-label="Toggle" className={triggerClass}>{icon}</AccordionPrimitive.Trigger>
              )}
              {title}
              {expandIconPosition === "end" && (
                <AccordionPrimitive.Trigger aria-label="Toggle" className={triggerClass}>{icon}</AccordionPrimitive.Trigger>
              )}
            </>
          ) : (
            <AccordionPrimitive.Trigger className={cn("flex flex-1 items-center gap-2", triggerClass)}>
              {expandIconPosition === "start" && icon}
              {title}
              {expandIconPosition === "end" && icon}
            </AccordionPrimitive.Trigger>
          )}
          {item.extra && <span className="flex shrink-0 items-center gap-1 font-normal">{item.extra}</span>}
        </AccordionPrimitive.Header>
        <AccordionContent
          forceMount={forceMount || undefined}
          // A force-mounted panel stays rendered: hide it while closed.
          className={cn("text-muted-foreground", styles.pad, "pb-3", forceMount && "group-data-[state=closed]/panel:hidden")}
        >
          {item.content}
        </AccordionContent>
      </AccordionItem>
    )
  })

  const rootClass = cn("flex w-full flex-col", styles.root, className)

  return props.accordion ? (
    <Accordion
      type="single"
      collapsible
      value={props.value === undefined ? undefined : (props.value ?? "")}
      defaultValue={props.defaultValue}
      onValueChange={(value) => props.onValueChange?.(value || undefined)}
      className={rootClass}
      data-slot="collapse"
    >
      {panels}
    </Accordion>
  ) : (
    <Accordion
      type="multiple"
      value={props.value}
      defaultValue={props.defaultValue}
      onValueChange={props.onValueChange}
      className={rootClass}
      data-slot="collapse"
    >
      {panels}
    </Accordion>
  )
}
