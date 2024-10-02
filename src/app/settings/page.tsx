"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { Loader2, User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface UserSettings {
  theme: 'light' | 'dark' | 'system'
  autoTag: boolean
  publicByDefault: boolean
}

export default function SettingsPage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [settings, setSettings] = useState<UserSettings>({
    theme: 'system',
    autoTag: true,
    publicByDefault: false,
  })

  useEffect(() => {
    const fetchSettings = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch(`/api/user/${session.user.id}/settings`)
          if (response.ok) {
            const userSettings = await response.json()
            setSettings(userSettings)
          } else {
            throw new Error('Failed to fetch settings')
          }
        } catch (err) {
          console.error('Error fetching settings:', err)
          toast({
            title: "Error",
            description: "Failed to load settings. Please try again.",
            variant: "destructive",
          })
        }
      }
    }

    fetchSettings()
  }, [session?.user?.id])

  const handleChange = (name: keyof UserSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/user/${session?.user?.id}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })
      if (!response.ok) {
        throw new Error('Failed to update settings')
      }

      // Update the session with new settings
      await update({
        ...session,
        user: {
          ...session?.user,
          ...settings
        }
      })

      toast({
        title: "Settings updated",
        description: "Your settings have been successfully saved.",
      })
    } catch (err) {
      setError('Failed to update settings. Please try again.')
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin')
    return null
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      {error && (
        <div className="bg-destructive text-destructive-foreground p-4 rounded-md mb-6">
          {error}
        </div>
      )}
      <Card>
        <CardHeader>
          <CardTitle>User Preferences</CardTitle>
          <CardDescription>Customize your Indexr experience.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={session?.user?.image || undefined} alt={session?.user?.name || "User"} />
                <AvatarFallback>
                  <User className="h-10 w-10" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{session?.user?.name}</h2>
                <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select
                name="theme"
                value={settings.theme}
                onValueChange={(value) => handleChange("theme", value as 'light' | 'dark' | 'system')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="autoTag">Auto-tag datasets</Label>
              <Switch
                id="autoTag"
                name="autoTag"
                checked={settings.autoTag}
                onCheckedChange={(checked) => handleChange("autoTag", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="publicByDefault">Make datasets public by default</Label>
              <Switch
                id="publicByDefault"
                name="publicByDefault"
                checked={settings.publicByDefault}
                onCheckedChange={(checked) => handleChange("publicByDefault", checked)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
