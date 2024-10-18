import { DM_Sans, DM_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from "@/components/layout/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import RootLayoutClient from '@/components/layout/layout.client'
import { SessionProvider } from "next-auth/react"

const font_sans = DM_Sans({
  subsets: ['latin-ext'],
  weight: ['500', '600'],
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
    <html lang="en" className={`${font_sans.variable} ${font_mono.variable}`}>
      <body className="font-sans">
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <RootLayoutClient>
              {children}
            </RootLayoutClient>
            <Toaster />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
