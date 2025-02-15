import { DM_Sans, DM_Mono } from 'next/font/google'

import { ThemeProvider } from "@/layout/theme/provider"
import { Toaster } from "@/components/ui/toaster"

import { App } from '@/layout/app'
import { SessionProvider } from "next-auth/react"

import './globals.css'

const font_sans = DM_Sans({
  subsets: ['latin-ext'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
})

const font_mono = DM_Mono({
  subsets: ['latin-ext'],
  weight: ['400'],
  variable: '--font-mono',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${font_sans.variable} ${font_mono.variable}`} suppressHydrationWarning>
      <body className="font-sans">
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <App>
              {children}
            </App>
            <Toaster />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
