// Stand-in for `#components` in Storybook: NuxtLink renders a plain <a>
// that updates the mocked route instead of navigating.
import { defineComponent, h } from 'vue'
import { mockRoute } from './nuxt-imports'

export const NuxtLink = defineComponent({
  name: 'NuxtLink',
  props: { to: { type: String, default: '/' } },
  setup(props, { slots, attrs }) {
    return () =>
      h('a', {
        ...attrs,
        href: props.to,
        onClick: (event: MouseEvent) => {
          event.preventDefault()
          mockRoute.path = props.to
        },
      }, slots.default?.())
  },
})
