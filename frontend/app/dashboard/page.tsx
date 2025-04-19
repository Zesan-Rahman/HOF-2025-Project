"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Clock, Award, Settings, LogOut, Activity } from "lucide-react"

// Mock data - in a real app, this would come from your backend
const mockUserData = {
  username: "JaneDoe",
  points: 650,
  startingPoints: 500,
  rank: 3,
  appUsage: [
    { name: "VS Code", duration: 180, productive: true },
    { name: "Slack", duration: 45, productive: true },
    { name: "YouTube", duration: 30, productive: false },
    { name: "Notion", duration: 60, productive: true },
    { name: "Twitter", duration: 15, productive: false },
  ],
  history: [
    { date: "Mon", points: 520 },
    { date: "Tue", points: 535 },
    { date: "Wed", points: 570 },
    { date: "Thu", points: 590 },
    { date: "Fri", points: 620 },
    { date: "Sat", points: 635 },
    { date: "Sun", points: 650 },
  ],
}

export default function Dashboard() {
  const [userData, setUserData] = useState(mockUserData)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeApp, setActiveApp] = useState("VS Code")
  const [timeLeft, setTimeLeft] = useState(30)

  // Simulate time passing and point updates
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())

      // Decrease the countdown timer
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // When timer reaches 0, update points based on current app
          const currentApp = userData.appUsage.find((app) => app.name === activeApp)
          if (currentApp) {
            setUserData((prev) => ({
              ...prev,
              points: prev.points + (currentApp.productive ? 5 : -5),
            }))
          }
          return 30 // Reset to 30 minutes
        }
        return prev - 1
      })

      // Randomly change the active app sometimes
      if (Math.random() > 0.9) {
        const apps = userData.appUsage.map((app) => app.name)
        setActiveApp(apps[Math.floor(Math.random() * apps.length)])
      }
    }, 1000) // Update every second for demo purposes

    return () => clearInterval(timer)
  }, [userData.appUsage, activeApp])

  // Calculate point change
  const pointChange = userData.points - userData.startingPoints
  const pointChangeColor = pointChange >= 0 ? "text-green-500" : "text-red-500"

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <Activity className="h-5 w-5" />
            <span>ProductivityTracker</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">
                {userData.points} pts
              </Badge>
              <Avatar>
                <AvatarImage src="/placeholder-user.jpg" alt={userData.username} />
                <AvatarFallback>{userData.username.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
            <Link href="/settings">
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="icon">
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Log out</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 bg-muted/40 p-4 md:p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="col-span-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle>Welcome back, {userData.username}</CardTitle>
                <CardDescription>
                  {currentTime.toLocaleDateString()} • {currentTime.toLocaleTimeString()}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  Next update in: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Current points</p>
                    <p className="text-2xl font-bold">{userData.points}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Change since start</p>
                    <p className={`text-2xl font-bold ${pointChangeColor}`}>
                      {pointChange >= 0 ? "+" : ""}
                      {pointChange}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Current rank</p>
                    <p className="text-2xl font-bold">#{userData.rank}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Currently using</p>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          userData.appUsage.find((app) => app.name === activeApp)?.productive
                            ? "success"
                            : "destructive"
                        }
                      >
                        {activeApp}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-medium">Progress to next level</span>
                    <span className="text-sm font-medium">650/700</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Activity Overview</CardTitle>
              <CardDescription>Your app usage and productivity trends</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="apps">
                <TabsList className="mb-4">
                  <TabsTrigger value="apps">App Usage</TabsTrigger>
                  <TabsTrigger value="history">Point History</TabsTrigger>
                </TabsList>
                <TabsContent value="apps" className="space-y-4">
                  <div className="space-y-4">
                    {userData.appUsage.map((app, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={app.productive ? "success" : "destructive"}
                            className="w-2 h-2 p-0 rounded-full"
                          />
                          <span className="font-medium">{app.name}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">
                            {Math.floor(app.duration / 60)}h {app.duration % 60}m
                          </span>
                          <Progress
                            value={
                              (app.duration / userData.appUsage.reduce((acc, curr) => acc + curr.duration, 0)) * 100
                            }
                            className="h-2 w-24"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="history">
                  <div className="h-[200px] flex items-end justify-between gap-2">
                    {userData.history.map((day, index) => (
                      <div key={index} className="flex flex-col items-center gap-1">
                        <div
                          className="bg-primary w-12 rounded-t-md"
                          style={{
                            height: `${(day.points / Math.max(...userData.history.map((d) => d.points))) * 150}px`,
                          }}
                        ></div>
                        <span className="text-xs font-medium">{day.date}</span>
                        <span className="text-xs text-muted-foreground">{day.points}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Leaderboard</CardTitle>
              <CardDescription>Weekly rankings • Resets in 3 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500 text-white">
                    <Award className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">AlexSmith</p>
                    <p className="text-sm text-muted-foreground">720 points</p>
                  </div>
                  <Badge>1st</Badge>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300 text-white">
                    <Award className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">MikeJohnson</p>
                    <p className="text-sm text-muted-foreground">685 points</p>
                  </div>
                  <Badge>2nd</Badge>
                </div>
                <div className="flex items-center gap-4 bg-muted/50 p-2 rounded-md">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-700 text-white">
                    <Award className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">JaneDoe (You)</p>
                    <p className="text-sm text-muted-foreground">650 points</p>
                  </div>
                  <Badge>3rd</Badge>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <span className="text-sm font-medium">4</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">SarahWilliams</p>
                    <p className="text-sm text-muted-foreground">590 points</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <span className="text-sm font-medium">5</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">DavidBrown</p>
                    <p className="text-sm text-muted-foreground">545 points</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/leaderboard">View Full Leaderboard</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
