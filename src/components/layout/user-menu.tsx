import React, { useEffect, useState } from 'react'
import { useTheme } from "next-themes"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Settings, LogOut, Moon, Sun } from 'lucide-react'
import { signIn, signOut, useSession } from "next-auth/react"
import Link from 'next/link'

const ThemeToggle = () => {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // This effect ensures the component waits until the client has rendered
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null // Avoid rendering on the server-side

  return (
    <Tabs
      value={theme} // Set the current theme as the active tab
      onValueChange={(value) => setTheme(value)} // Change theme when tab is selected
      className="w-full"
    >
      <TabsList className="flex  justify-between w-full">
        <TabsTrigger value="light" className="flex items-center gap-2 w-1/2">
          <Sun className="h-5 w-5" />
          <span>Light</span>
        </TabsTrigger>
        <TabsTrigger value="dark" className="flex items-center gap-2 w-1/2">
          <Moon className="h-5 w-5" />
          <span>Dark</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}

export default ThemeToggle

function UserMenu() {
  const { data: session } = useSession()

  if (!session) {
    return (
      <Button onClick={() => signIn()}>Sign In</Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="relative w-full space-x-2 justify-start px-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={session.user?.image || undefined} alt={session.user?.name || "User"} />
            <AvatarFallback>{session.user?.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <div>{session.user?.email}</div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[300px]" align="start" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{session.user?.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {session.user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => signOut()}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <ThemeToggle />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { UserMenu, ThemeToggle }
