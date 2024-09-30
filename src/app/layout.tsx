import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from "@/components/layout/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import RootLayoutClient from '@/components/layout/root-client'
import { SessionProvider } from "next-auth/react"

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
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
