import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7f0',
          100: '#feeee0',
          200: '#fcd9c1',
          300: '#f9c196',
          400: '#f5a169',
          500: '#f28844',
          600: '#e36e42',
          700: '#bc5534',
          800: '#954530',
          900: '#773b2a',
        },
      },
    },
  },
  plugins: [],
}
export default config