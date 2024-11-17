// user-menu.tsx

import React from 'react'
import { useTheme } from "next-themes"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Settings, LogOut, Moon, Sun } from 'lucide-react'
import { signIn, signOut, useSession } from "next-auth/react"
import Link from 'next/link'
import { cn } from '@/lib/utils'

const ThemeToggle = () => {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <Tabs
      value={theme}
      onValueChange={(value) => setTheme(value)}
      className="w-full mt-4"
    >
      <TabsList className="flex justify-between w-full">
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

interface UserMenuProps {
  expanded: boolean;
}

function UserMenu({ expanded }: UserMenuProps) {
  const { data: session } = useSession()

  if (!session) {
    return (
      <Button onClick={() => signIn()}>Sign In</Button>
    )
  }

  return (
    <DropdownMenu>

      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={cn('px-0 py-2 relative justify-start w-full ', expanded ? 'px-2' : 'hover:bg-transparent')}>
          <Avatar className='w-8 h-8'>
            <AvatarImage src={session.user?.image || undefined} alt={session.user?.name || "User"} />
            <AvatarFallback>{session.user?.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
          {expanded && <div className="flex-1 text-left ml-2">{session.user?.email}</div>}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side={expanded ? "bottom" : "left"}
        align={expanded ? "start" : "end"}
        className={cn('flex flex-col w-[395px]', expanded ? 'mb-2 ml-2' : 'ml-6 -mb-4')}
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{session.user?.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {session.user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center w-full">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => signOut()} className="flex items-center w-full">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
        <ThemeToggle />
      </DropdownMenuContent>
    </DropdownMenu >
  )
}

export { UserMenu, ThemeToggle }
