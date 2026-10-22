import type { RowAction, RowActionDisplay } from './types'

/** Splits visible actions into inline buttons and "…" menu items. */
export function splitRowActions<TData>(actions: RowAction<TData>[], display: RowActionDisplay) {
  const visible = actions.filter(action => !action.hidden)
  return {
    inline: visible.filter(action => (action.display ?? display) === 'inline'),
    menu: visible.filter(action => (action.display ?? display) === 'menu'),
  }
}

/** Rough width (px) of the actions cell, used as the column size. */
export function estimateRowActionsWidth<TData>(actions: RowAction<TData>[], display: RowActionDisplay) {
  const { inline, menu } = splitRowActions(actions, display)
  const buttons = [
    ...inline.map(action => (action.icon ? 28 : action.label.length * 7 + 20)),
    ...(menu.length ? [28] : []),
  ]
  // buttons + 4px gaps + cell padding
  return Math.max(56, buttons.reduce((sum, width) => sum + width, 0) + (buttons.length - 1) * 4 + 16)
}
