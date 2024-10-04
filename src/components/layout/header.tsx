import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Menu, Upload, Search } from 'lucide-react'
import UserMenu from '@/components/layout/user-menu'
import { UploadDatasetDialog } from '@/components/dataset/upload-dialog'
import { useRouter } from 'next/navigation'
import { Badge } from "@/components/ui/badge"

interface HeaderProps {
  onToggleSidebar: () => void
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const [uploadDatasetDialogOpen, setUploadDatasetDialogOpen] = useState(false)
  const router = useRouter()

  const handleUploadSuccess = () => {
    setUploadDatasetDialogOpen(false)
    router.refresh()
  }

  return (
    <header className="border-b bg-background sticky top-0 z-40">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="lg:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">indexr</span>
            <Badge variant="secondary">beta</Badge>
          </Link>
          <nav className="hidden md:flex items-center space-x-4 pl-4">
            <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
              About
            </Link>
            {/*
            <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
              Support
            </Link>
          */}
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => setUploadDatasetDialogOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
          <UserMenu />
        </div>
      </div>
      <UploadDatasetDialog
        open={uploadDatasetDialogOpen}
        onOpenChange={setUploadDatasetDialogOpen}
        onUploadSuccess={handleUploadSuccess}
      />
    </header>
  )
}
