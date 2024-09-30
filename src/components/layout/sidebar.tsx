'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Settings, HelpCircle, Home, ChevronLeft, ChevronRight, Map, List } from 'lucide-react'
import { cn } from '@/lib/utils'
import { RecentDatasets } from '@/components/dataset/recent'
import { HelpPopup } from '@/components/common/help'


const navItems = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: List, label: 'Datasets', href: '/datasets' },
  { icon: Map, label: 'Explore', href: '/explore' },
  { icon: Settings, label: 'Settings', href: '/settings' },
]

interface SidebarProps {
  isExpanded: boolean
  onToggle: () => void
}

export function Sidebar({ isExpanded, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const [isHelpOpen, setIsHelpOpen] = useState(false)


  return (
    <>
      <div
        className={cn(
          "mr-2 px-2 bg-background border border-border rounded-lg sticky top-20 transition-all duration-300 ease-in-out overflow-hidden",
          isExpanded ? "w-64" : "w-14"
        )}
        style={{ height: "86dvh" }}
      >
        <div className="space-y-4 py-4">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              {...item}
              isActive={pathname === item.href}
              isExpanded={isExpanded}
            />
          ))}
          {isExpanded && (
            <div className="py-2">
              <ScrollArea>
                <RecentDatasets initialDataset={{ id: "", name: "", fileType: "", updatedAt: "", isPublic: false }} />
              </ScrollArea>
            </div>
          )}
        </div>
        <SidebarFooter
          isExpanded={isExpanded}
          onToggle={onToggle}
          onHelpClick={() => setIsHelpOpen(true)}
        />
      </div>
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
}

function SidebarFooter({ isExpanded, onToggle, onHelpClick }: SidebarFooterProps) {
  return (
    <div className="absolute bottom-0 left-0 w-full pb-4 px-2 space-y-4">
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
        className="w-full justify-start px-2"
        size="default"
        onClick={onToggle}
      >
        <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
          {isExpanded ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </div>
        {isExpanded && <span className="ml-3 truncate">Collapse</span>}
      </Button>
    </div>
  )
}
