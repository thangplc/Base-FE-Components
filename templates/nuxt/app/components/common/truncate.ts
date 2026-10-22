import type { InjectionKey } from 'vue'

/** Provided by TruncateTooltipProvider; TruncatedText warns in dev without it. */
export const TRUNCATE_TOOLTIP_KEY: InjectionKey<true> = Symbol('truncate-tooltip')
