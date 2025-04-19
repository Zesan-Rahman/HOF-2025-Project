"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, ChevronLeft } from "lucide-react"

// Mock data - in a real app, this would come from your backend
const mockApps = [
  { id: 1, name: "VS Code", productive: true },
  { id: 2, name: "Slack", productive: true },
  { id: 3, name: "Chrome", productive: null },
  { id: 4, name: "YouTube", productive: false },
  { id: 5, name: "Twitter", productive: false },
  { id: 6, name: "Notion", productive: true },
  { id: 7, name: "Spotify", productive: null },
  { id: 8, name: "Discord", productive: null },
  { id: 9, name: "Zoom", productive: true },
  { id: 10, name: "Netflix", productive: false },
]

export default function Settings() {
  const [apps, setApps] = useState(mockApps)
  const [newApp, setNewApp] = useState("")

  const handleToggleProductivity = (id: number, productive: boolean) => {
    setApps(apps.map((app) => (app.id === id ? { ...app, productive } : app)))
  }

  const handleAddApp = (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (newApp.trim()) {
      const exists = apps.some((app) => app.name.toLowerCase() === newApp.trim().toLowerCase())
      if (!exists) {
        setApps([...apps, { id: apps.length + 1, name: newApp, productive: null }])
      }
      setNewApp("")
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background px-4 py-3">
        <div className="flex items-center">
          <Link href="/dashboard" className="mr-4">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Button>
          </Link>
          <div className="flex items-center gap-2 font-semibold">
            <Activity className="h-5 w-5" />
            <span>ProductivityTracker</span>
          </div>
        </div>
      </header>
      <main className="flex-1 bg-muted/40 p-4 md:p-6">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-6 text-2xl font-bold">Settings</h1>

          <Tabs defaultValue="apps" className="space-y-6">
            <TabsList>
              <TabsTrigger value="apps">App Settings</TabsTrigger>
              <TabsTrigger value="account">Account Settings</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            <TabsContent value="apps" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>App Productivity Settings</CardTitle>
                  <CardDescription>Define which apps are productive or unproductive for you</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleAddApp} className="flex gap-2">
                    <Input
                      placeholder="Add a new app to track"
                      value={newApp}
                      onChange={(e) => setNewApp(e.target.value)}
                    />
                    <Button type="submit">Add</Button>
                  </form>

                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2 font-medium text-sm text-muted-foreground">
                      <div>App Name</div>
                      <div className="text-center">Productive</div>
                      <div className="text-center">Unproductive</div>
                    </div>

                    {apps.map((app) => (
                      <div key={app.id} className="grid grid-cols-3 items-center gap-2 py-2 border-b">
                        <div className="font-medium">{app.name}</div>
                        <div className="flex justify-center">
                          <Switch
                            checked={app.productive === true}
                            onCheckedChange={() => handleToggleProductivity(app.id, true)}
                          />
                        </div>
                        <div className="flex justify-center">
                          <Switch
                            checked={app.productive === false}
                            onCheckedChange={() => handleToggleProductivity(app.id, false)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <p className="text-sm text-muted-foreground">
                    You gain 5 points every 30 minutes using productive apps and lose 5 points using unproductive apps.
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="account" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>Update your account details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" defaultValue="JaneDoe" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="jane.doe@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <Input id="password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Save Changes</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Manage how and when you receive notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Daily Summary</Label>
                      <p className="text-sm text-muted-foreground">Receive a daily summary of your productivity</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Unproductive App Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when you spend too much time on unproductive apps
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Leaderboard Updates</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications about leaderboard changes</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Weekly Reset Reminder</Label>
                      <p className="text-sm text-muted-foreground">Get notified before the weekly leaderboard resets</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Save Preferences</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
