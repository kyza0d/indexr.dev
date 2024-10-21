import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    'text-[hsl(var(--type-number))]',
    'text-[hsl(var(--type-boolean))]',
    'text-[hsl(var(--type-date))]',
    'text-[hsl(var(--type-email))]',
    'text-[hsl(var(--type-currency))]',
    'text-[hsl(var(--type-percentage))]',
    'text-[hsl(var(--type-array))]',
    'text-[hsl(var(--type-object))]',
    'text-[hsl(var(--type-null))]',
    'text-[hsl(var(--type-empty))]',
    'text-[hsl(var(--type-unknown))]',
    'text-[hsl(var(--type-bigint))]',
    'text-[hsl(var(--type-regex))]',
    'text-[hsl(var(--type-text))]',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))'
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        colors: {
          type: {
            number: 'hsl(var(--type-number))',
            boolean: 'hsl(var(--type-boolean))',
            date: 'hsl(var(--type-date))',
            email: 'hsl(var(--type-email))',
            currency: 'hsl(var(--type-currency))',
            percentage: 'hsl(var(--type-percentage))',
            array: 'hsl(var(--type-array))',
            object: 'hsl(var(--type-object))',
            null: 'hsl(var(--type-null))',
            empty: 'hsl(var(--type-empty))',
            unknown: 'hsl(var(--type-unknown))',
            bigint: 'hsl(var(--type-bigint))',
            regex: 'hsl(var(--type-regex))',
            text: 'hsl(var(--type-text))',
          },
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        }
      }
    }
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
};
export default config;
