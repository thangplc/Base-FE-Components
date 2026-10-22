import type { StorybookConfig } from "@storybook/nextjs-vite"
import tailwindcss from "@tailwindcss/vite"

const config: StorybookConfig = {
  // Stories live outside src/ so components/ui stays copy-paste clean.
  stories: ["../stories/**/*.stories.@(ts|tsx|mdx)"],
  addons: ["@storybook/addon-docs", "@storybook/addon-themes"],
  framework: {
    name: "@storybook/nextjs-vite",
    options: {},
  },
  staticDirs: ["../public"],
  async viteFinal(config) {
    // Next compiles Tailwind through Turbopack; Storybook runs on Vite.
    config.plugins = [...(config.plugins ?? []), tailwindcss()]
    return config
  },
}

export default config
