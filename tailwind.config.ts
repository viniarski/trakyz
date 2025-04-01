import type { Config } from "tailwindcss";
import type { PluginAPI } from "tailwindcss/types/config";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    screens: {
      'xs': '480px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1440px',
      '3xl': '1600px',
      '4xl': '1920px',
    },
    extend: {
      colors: {
        background: {
          DEFAULT: "var(--bg-primary)",
          secondary: "var(--bg-secondary)",
          hover: "var(--bg-hover)",
        },
        text: {
          DEFAULT: "var(--text-primary)",
          secondary: "var(--text-secondary)",
        },
        accent: {
          DEFAULT: "var(--accent-primary)",
          secondary: "var(--accent-secondary)",
        },
      },
      opacity: {
        20: '0.2',
        80: '0.8',
      },
      fontSize: {
        '2xs': '0.625rem',
        'xxs': '0.675rem',
      },
    },
  },
  plugins: [
    function ({ addUtilities, addVariant }: PluginAPI) {
      addUtilities({
        '.fill-text-primary': {
          fill: 'var(--text-primary)',
        },
      });
      addVariant('theme-blue', '[data-theme="blue"] &');
    },
  ],
} satisfies Config;

export default config;