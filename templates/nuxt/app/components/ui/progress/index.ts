import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export { default as Progress } from './Progress.vue'

export const progressVariants = cva('relative flex w-full items-center overflow-hidden rounded-full bg-muted', {
  variants: {
    size: {
      sm: 'h-1',
      default: 'h-2',
      lg: 'h-3',
    },
  },
  defaultVariants: { size: 'default' },
})

export const indicatorVariants = cva('h-full bg-primary transition-transform', {
  variants: {
    variant: {
      default: 'bg-primary',
      success: 'bg-success',
      warning: 'bg-warning',
      destructive: 'bg-destructive',
    },
  },
  defaultVariants: { variant: 'default' },
})

export type ProgressVariants = VariantProps<typeof progressVariants> & VariantProps<typeof indicatorVariants>
