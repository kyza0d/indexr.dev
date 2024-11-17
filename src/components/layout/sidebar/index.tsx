'use client';

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Files, FilePen, HelpCircle, Upload, LogIn, Search, Home, PanelLeft, PanelLeftOpen } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { RecentDatasets } from '@/components/dataset/components/recent'
import { HelpPopup } from '@/layout/sidebar/components/help'
import { UserMenu } from '@/layout/sidebar/components/user-menu'
import { UploadDatasetDialog } from '@/actions/upload/upload-dialog'
import { Badge } from "@/components/ui/badge"
import { useSession } from 'next-auth/react'
import { Skeleton } from '@/components/ui/skeleton';
import Logo from '../assets/logo';

export default function Sidebar() {
  const pathname = usePathname();
  const [expanded, setIsExpanded] = useState(true);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [uploadDatasetDialogOpen, setUploadDatasetDialogOpen] = useState(false);
  const { status: sessionStatus } = useSession();

  const navItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: FilePen, label: 'Editor', href: '/editor' },
    ...(sessionStatus === 'loading' ? [
      { icon: Files, label: <Skeleton className="h-5 w-20" />, href: '' }
    ] : sessionStatus === 'unauthenticated' ? [
      {
        icon: LogIn,
        label: 'Log in',
        href: '/auth/sign-in'
      }
    ] : [
      { icon: Files, label: 'Datasets', href: '/datasets' }
    ]),
    { icon: Search, label: 'Explore', href: '/explore' },
  ];

  const handleUploadSuccess = () => {
    setUploadDatasetDialogOpen(false);
  };

  const handleToggle = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <>
      <div
        className={cn(
          expanded ? "w-[560px]" : "w-14",
          "h-[97dvh] top-4 px-2 transition-all ease-in-out duration-200 bg-background border border-border rounded-lg rounded-l-none border-l-transparent sticky overflow-hidden",
        )}
      >
        <div className="space-y-4 py-4">
          <Button
            variant="ghost"
            className="justify-start absolute right-2 top-2 px-2 z-10"
            onClick={handleToggle}
          >
            <div className="w-5 h-5 flex items-center justify-center">
              {expanded ? <PanelLeft className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
            </div>
          </Button>
          {/* Logo Section */}
          {expanded && (
            <div className="absolute top-0 left-2 mt-0">
              <Link href="/about" className="flex items-center justify-start">
                <Logo />
                <div className='absolute flex'>
                  <h2 className="text-md font-bold mr-2 ml-12">indexr</h2>
                  <Badge variant="outline" className="text-xs font-bold ml-4 mr-6">v0.3.0</Badge>
                </div>
              </Link>
            </div>
          )}

          <div className="space-y-4 pt-14" >
            {/* Navigation Links */}
            {navItems.map((item) => (
              <NavItem
                key={item.href}
                {...item}
                isActive={pathname === item.href}
                expanded={expanded}
              />
            ))}
          </div>

          {expanded && sessionStatus == "authenticated" && (
            <>
              <Separator />
              <h2 className="text-sm font-semibold ml-2 mb-2">Recents</h2>
            </>
          )}
          {/* Recent Datasets */}
          {expanded && (
            <ScrollArea className='absolute top-0'>
              <RecentDatasets />
            </ScrollArea>
          )}
        </div>

        {/* Sidebar Footer */}
        <SidebarFooter
          expanded={expanded}
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
  icon: React.ElementType;
  label: string | React.ReactNode; // Allow ReactNode to accept Skeleton or string
  href: string;
  isActive: boolean;
  expanded: boolean;
}

function NavItem({ icon: Icon, label, href, isActive, expanded }: NavItemProps) {
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
        {expanded && <span className="ml-3 truncate">{label}</span>}
      </Link>
    </Button>
  )
}

interface SidebarFooterProps {
  expanded: boolean;
  onHelpClick: () => void;
  onUploadClick: () => void;
}

function SidebarFooter({ expanded, onHelpClick, onUploadClick }: SidebarFooterProps) {
  const { data: session, status } = useSession();

  return (
    <div className={`w-full space-y-2 ${expanded ? "absolute items-center bottom-4" : "flex flex-col items-center absolute bottom-4"}`}>
      {session &&
        <div className='mr-6'>
          <Button
            variant="ghost"
            className="w-full justify-between px-2"
            onClick={onUploadClick}
          >
            <div className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              {expanded && <span className="truncate">Upload</span>}
            </div>
          </Button>
        </div>
      }


      <div className='flex justify-between w-full'>
        {session && <UserMenu expanded={expanded} />}
        {status !== "authenticated" && status == "loading" && (
          <div className='min-h-[48px] w-full items-center flex space-x-2 px-2'>
            <Skeleton className="rounded-full w-8 h-8" />
            <Skeleton className="w-2/3 h-5" />
          </div>
        )}

        {expanded && (
          <div className='flex relative mr-6'>
            <Button
              variant="ghost"
              onClick={onHelpClick}
            >
              <div className="w-5 h-5 flex items-center justify-center mr-3">
                <HelpCircle className="h-5 w-5" />
              </div>
              <span className="truncate">Help</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
