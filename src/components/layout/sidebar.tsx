import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Settings, Search, HelpCircle, ChevronLeft, ChevronRight, List, Columns2, Upload, LogIn } from 'lucide-react'
import { cn } from '@/lib/utils'
import { RecentDatasets } from '@/components/dataset/recent'
import { HelpPopup } from '@/components/common/help'
import { UserMenu } from '@/components/layout/user-menu'
import { UploadDatasetDialog } from '@/components/dataset/upload-dialog'
import { Badge } from "@/components/ui/badge"
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const navItems = [
  { icon: Columns2, label: 'Viewer', href: '/viewer' },
  { icon: List, label: 'Datasets', href: '/datasets' },
  { icon: Search, label: 'Explore', href: '/explore' },
  { icon: Settings, label: 'Settings', href: '/settings' },
]

interface SidebarProps {
  isExpanded: boolean
  onToggle: () => void
}

export default function Sidebar({ isExpanded = true, onToggle = () => { } }: SidebarProps) {
  const pathname = usePathname()
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [uploadDatasetDialogOpen, setUploadDatasetDialogOpen] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()

  const handleUploadSuccess = () => {
    setUploadDatasetDialogOpen(false)
    // refresh logic, if needed
  }

  return (
    <>
      <div
        className={cn(
          "mr-4 px-2 bg-background border border-border rounded-lg sticky top-0 transition-all duration-300 ease-in-out overflow-hidden",
          isExpanded ? "w-80" : "w-14"
        )}
        style={{ height: "96dvh" }}
      >
        <div className="space-y-4 py-4">
          {/* Logo Section */}
          <div className="flex items-center pl-2 z-10 pb-2">

            <Link href="/about" className="flex items-center justify-start w-full">
              <div className={cn("relative h-[26px]")}>
                <svg
                  viewBox="0 0 338 325"
                  className="w-full h-full fill-primary-foreground"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M77.8863 0.81894C49.3863 4.91895 23.0863 24.4189 9.3863 51.519C7.3863 55.6189 4.4863 63.3189 3.0863 68.5189L0.486299 78.1189L0.0862992 154.619C-0.213701 234.719 0.0862992 244.619 3.9863 258.619C11.1863 284.519 32.2863 307.719 57.9863 317.919C73.8863 324.319 69.1863 324.019 163.886 324.419C257.386 324.719 259.786 324.619 275.386 319.519C308.286 308.519 332.386 279.519 336.886 245.319C337.586 239.819 337.886 210.219 337.686 156.619C337.386 76.7189 337.286 76.0189 335.086 68.1189C325.986 35.7189 300.986 11.019 268.486 2.41895C260.486 0.218934 259.186 0.218934 172.386 0.0189526C121.086 -0.0810535 81.6863 0.218934 77.8863 0.81894ZM264.486 29.8189C283.886 36.4189 299.186 51.2189 305.986 69.7189C310.686 82.7189 311.086 89.7189 310.686 168.619C310.286 248.519 310.486 245.119 303.786 259.519C295.586 277.219 276.886 292.219 258.086 296.119C247.586 298.419 91.0863 298.319 80.1863 296.019C54.5863 290.719 33.7863 269.219 29.2863 243.319C28.0863 236.219 27.8863 221.919 28.0863 157.419L28.3863 80.1189L31.0863 72.0189C39.0863 48.4189 57.2863 32.9189 83.3863 27.2189C84.4863 27.019 123.886 26.9189 170.886 26.9189L256.386 27.1189L264.486 29.8189Z" />
                  <path d="M97.1863 79.119C85.3863 86.219 86.5863 103.919 99.2863 109.719C104.286 112.019 107.786 112.119 112.586 110.119C117.586 108.019 119.786 105.919 121.986 101.119C129.186 85.419 112.086 70.219 97.1863 79.119Z" />
                  <path d="M155.886 130.219C152.886 131.619 149.586 133.419 148.686 134.319C146.986 135.819 147.186 136.219 151.186 140.519C153.586 143.019 157.886 148.719 160.886 153.119C163.886 157.519 169.086 165.019 172.586 169.819C176.086 174.619 178.886 179.019 178.886 179.619C178.886 180.119 173.386 188.319 166.686 197.819C160.086 207.319 152.086 218.719 149.086 223.119C146.086 227.519 142.986 231.819 142.286 232.719C139.086 236.319 140.386 236.619 158.186 236.619H175.386L177.986 232.319C179.486 230.019 184.286 222.519 188.686 215.819L196.786 203.419L205.186 216.319C214.386 230.419 219.686 235.719 226.486 237.619C232.686 239.419 241.586 238.419 247.986 235.119C255.586 231.319 255.886 230.919 252.186 228.119C249.286 225.819 218.686 184.019 217.386 180.419C216.986 179.419 219.986 174.319 225.486 166.519C244.786 139.119 250.486 131.019 251.286 129.819C251.886 128.919 248.286 128.619 234.886 128.619H217.786L208.686 142.619L199.586 156.719L195.086 148.619C192.586 144.119 188.386 138.319 185.786 135.719C177.586 127.419 166.386 125.319 155.886 130.219Z" />
                  <path d="M88.8863 171.919C88.8863 218.719 89.0863 220.819 94.2863 228.619C98.2863 234.719 104.686 237.919 113.886 238.419C127.286 239.219 138.086 234.319 139.586 226.719C140.186 223.619 140.086 223.419 138.086 224.519C135.486 225.919 130.386 225.919 127.686 224.519C123.086 222.119 122.886 219.519 122.886 172.619V128.619H88.8863V171.919Z" />
                </svg>
              </div>
              {isExpanded && <h2 className="text-md font-bold ml-2 mr-2">indexr</h2>}
              {isExpanded && <Badge variant="outline" className='text-xs font-bold ml-auto'>v0.0.1</Badge>}
            </Link>
          </div>

          {/* Navigation Links */}
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              {...item}
              isActive={pathname === item.href}
              isExpanded={isExpanded}
            />
          ))}

          {/* Recent Datasets */}
          {isExpanded && (
            <div className="py-2">
              <ScrollArea>
                <RecentDatasets />
              </ScrollArea>
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <SidebarFooter
          isExpanded={isExpanded}
          onToggle={onToggle}
          onHelpClick={() => setIsHelpOpen(true)}
          onUploadClick={() => setUploadDatasetDialogOpen(true)}
        />
      </div>

      {/* Upload Dataset Dialog */}
      <UploadDatasetDialog
        open={uploadDatasetDialogOpen}
        onOpenChange={setUploadDatasetDialogOpen}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Help Popup */}
      <HelpPopup isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </>
  )
}

interface NavItemProps {
  icon: React.ElementType
  label: string
  href: string
  isActive: boolean
  isExpanded: boolean
}

function NavItem({ icon: Icon, label, href, isActive, isExpanded }: NavItemProps) {
  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start px-2",
        isActive && "bg-muted"
      )}
      asChild
    >
      <Link href={href} className="flex items-center">
        <div className="flex items-center justify-center flex-shrink-0">
          <Icon className="h-5 w-5" />
        </div>
        {isExpanded && <span className="ml-3 truncate">{label}</span>}
      </Link>
    </Button>
  )
}

interface SidebarFooterProps {
  isExpanded: boolean
  onToggle: () => void
  onHelpClick: () => void
  onUploadClick: () => void
}

function SidebarFooter({ isExpanded, onToggle, onHelpClick, onUploadClick }: SidebarFooterProps) {
  const { data: session } = useSession()
  const router = useRouter()

  return (
    <div className="absolute bottom-0 left-0 w-full pb-4 px-2 space-y-4">
      {/* Upload Button */}
      <Button
        variant={isExpanded ? "outline" : "ghost"}
        className="w-full justify-between px-2"
        onClick={onUploadClick}
      >
        <div className="flex items-center">
          <Upload className="h-5 w-5 mr-4" />
          {isExpanded && <span className="truncate">Upload</span>}
        </div>
      </Button>

      {isExpanded && !session && (
        <Button
          variant={isExpanded ? "outline" : "ghost"}
          className="w-full justify-between px-2"
          onClick={() => router.push("/auth/signin")}
        >
          <div className="flex items-center">
            <LogIn className="h-5 w-5 mr-4" />
            {isExpanded && <span className="truncate">Sign in</span>}
          </div>
        </Button>
      )}

      {!isExpanded && session && (
        <Avatar className="h-8 w-8 cursor-pointer" onClick={() => router.push("/settings")}>
          <AvatarImage src={session.user?.image || undefined} alt={session.user?.name || "User"} />
          <AvatarFallback>{session.user?.name?.[0] || "U"}</AvatarFallback>
        </Avatar>
      )}

      {/* User Menu */}
      {isExpanded && session && (
        <UserMenu />
      )}

      <div className={`${isExpanded ? "flex" : ""}`}>
        {/* Help and Collapse Buttons */}
        <Button
          variant="ghost"
          className="w-full justify-start px-2"
          size="default"
          onClick={onHelpClick}
        >
          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
            <HelpCircle className="h-5 w-5" />
          </div>
          {isExpanded && <span className="ml-3 truncate">Help</span>}
        </Button>

        <Button
          variant="ghost"
          className="justify-start px-2"
          size="default"
          onClick={onToggle}
        >
          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
            {isExpanded ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </div>
          {isExpanded && <span className="truncate"></span>}
        </Button>
      </div>
    </div>
  )
}
