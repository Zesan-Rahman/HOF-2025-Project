"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Activity, ChevronLeft, Trophy, Medal, Award, TrendingUp, TrendingDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Mock data - in a real app, this would come from your backend
const initialLeaderboardData = {
  weekly: [
    { rank: 1, username: "AlexSmith", points: 720, change: "+15", isCurrentUser: false },
    { rank: 2, username: "MikeJohnson", points: 685, change: "+5", isCurrentUser: false },
    { rank: 3, username: "JaneDoe", points: 650, change: "+10", isCurrentUser: true },
    { rank: 4, username: "SarahWilliams", points: 590, change: "-5", isCurrentUser: false },
    { rank: 5, username: "DavidBrown", points: 545, change: "+20", isCurrentUser: false },
    { rank: 6, username: "EmilyDavis", points: 530, change: "0", isCurrentUser: false },
    { rank: 7, username: "RobertMiller", points: 515, change: "+5", isCurrentUser: false },
    { rank: 8, username: "JenniferWilson", points: 510, change: "-10", isCurrentUser: false },
    { rank: 9, username: "MichaelMoore", points: 505, change: "+5", isCurrentUser: false },
    { rank: 10, username: "LisaTaylor", points: 500, change: "0", isCurrentUser: false },
  ],
  allTime: [
    { rank: 1, username: "MikeJohnson", points: 12580, change: "+5", isCurrentUser: false },
    { rank: 2, username: "AlexSmith", points: 11250, change: "+15", isCurrentUser: false },
    { rank: 3, username: "SarahWilliams", points: 10890, change: "-5", isCurrentUser: false },
    { rank: 4, username: "DavidBrown", points: 9750, change: "+20", isCurrentUser: false },
    { rank: 5, username: "JaneDoe", points: 8650, change: "+10", isCurrentUser: true },
    { rank: 6, username: "RobertMiller", points: 8215, change: "+5", isCurrentUser: false },
    { rank: 7, username: "EmilyDavis", points: 7930, change: "0", isCurrentUser: false },
    { rank: 8, username: "JenniferWilson", points: 7510, change: "-10", isCurrentUser: false },
    { rank: 9, username: "MichaelMoore", points: 7105, change: "+5", isCurrentUser: false },
    { rank: 10, username: "LisaTaylor", points: 6800, change: "0", isCurrentUser: false },
  ],
}

interface LeaderboardUser {
  rank: number
  username: string
  points: number
  change: string
  isCurrentUser: boolean
}

type TabType = "weekly" | "allTime"

type RecentChanges = {
  [key: string]: {value: number; timestamp: number}
}

export default function Leaderboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [leaderboardData, setLeaderboardData] = useState(initialLeaderboardData)
  const [recentChanges, setRecentChanges] = useState<RecentChanges>({})
  const [activeTab, setActiveTab] = useState<TabType>("weekly")

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-700" />
      default:
        return <span className="text-sm font-medium">{rank}</span>
    }
  }

  const getChangeColor = (change: string) => {
    if (change.startsWith("+")) return "text-green-500"
    if (change.startsWith("-")) return "text-red-500"
    return "text-gray-500"
  }

  const filterLeaderboard = (data: LeaderboardUser[]): LeaderboardUser[] => {
    if (!searchTerm) return data
    return data.filter((user) => user.username.toLowerCase().includes(searchTerm.toLowerCase()))
  }

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly select a user to update
      const tabData = [...leaderboardData[activeTab]]
      const randomIndex = Math.floor(Math.random() * tabData.length)
      const randomUser = tabData[randomIndex]

      // Determine if points increase or decrease
      const isIncrease = Math.random() > 0.3 // 70% chance of increase
      const pointChange = isIncrease ? Math.floor(Math.random() * 10) + 1 : -Math.floor(Math.random() * 5) - 1

      // Update the user's points
      const updatedUser = {
        ...randomUser,
        points: randomUser.points + pointChange,
        change: pointChange >= 0 ? `+${pointChange}` : `${pointChange}`,
      }

      // Update the leaderboard data
      tabData[randomIndex] = updatedUser

      // Sort the leaderboard by points
      tabData.sort((a, b) => b.points - a.points)

      // Update ranks
      const updatedTabData = tabData.map((user, index) => ({
        ...user,
        rank: index + 1,
      }))

      // Set the recent change to highlight the animation
      setRecentChanges({
        ...recentChanges,
        [`${activeTab}-${updatedUser.username}`]: {
          value: pointChange,
          timestamp: Date.now(),
        },
      })

      // Update the leaderboard data
      setLeaderboardData({
        ...leaderboardData,
        [activeTab]: updatedTabData,
      })
    }, 3000) // Update every 3 seconds

    return () => clearInterval(interval)
  }, [leaderboardData, activeTab, recentChanges])

  // Clear old recent changes
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      const updatedChanges = { ...recentChanges }
      let hasUpdates = false

      Object.keys(updatedChanges).forEach((key) => {
        if (now - updatedChanges[key].timestamp > 2000) {
          delete updatedChanges[key]
          hasUpdates = true
        }
      })

      if (hasUpdates) {
        setRecentChanges(updatedChanges)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [recentChanges])

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
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-2xl font-bold">Leaderboard</h1>
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Productivity Rankings</CardTitle>
              <CardDescription>See how you compare to other users in real-time</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="weekly" className="space-y-4" onValueChange={(value) => setActiveTab(value as TabType)}>
                <TabsList>
                  <TabsTrigger value="weekly">Weekly (Resets in 3 days)</TabsTrigger>
                  <TabsTrigger value="allTime">All Time</TabsTrigger>
                </TabsList>

                <TabsContent value="weekly">
                  <div className="space-y-2">
                    {filterLeaderboard(leaderboardData.weekly).map((user) => {
                      const recentChange = recentChanges[`weekly-${user.username}`]
                      const hasRecentChange = !!recentChange
                      const isPositiveChange = hasRecentChange && recentChange.value > 0

                      return (
                        <div
                          key={user.username}
                          className={cn(
                            "flex items-center gap-4 p-3 rounded-md transition-all duration-300",
                            user.isCurrentUser ? "bg-muted/50" : "",
                            hasRecentChange ? (isPositiveChange ? "bg-green-50" : "bg-red-50") : "",
                          )}
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                            {getRankIcon(user.rank)}
                          </div>
                          <div className="flex items-center gap-3 flex-1">
                            <Avatar>
                              <AvatarImage src="/placeholder-user.jpg" alt={user.username} />
                              <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {user.username} {user.isCurrentUser && "(You)"}
                              </p>
                              <div className="flex items-center gap-2">
                                <p
                                  className={cn(
                                    "text-sm transition-all duration-300",
                                    hasRecentChange
                                      ? isPositiveChange
                                        ? "text-green-600 font-medium"
                                        : "text-red-600 font-medium"
                                      : "text-muted-foreground",
                                  )}
                                >
                                  {user.points} points
                                </p>
                                {hasRecentChange && (
                                  <Badge
                                    variant={isPositiveChange ? "success" : "destructive"}
                                    className="animate-pulse"
                                  >
                                    {isPositiveChange ? "+" : ""}
                                    {recentChange.value}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`text-sm font-medium ${getChangeColor(user.change)}`}>{user.change}</div>
                            {user.change.startsWith("+") ? (
                              <TrendingUp className="h-4 w-4 text-green-500" />
                            ) : user.change.startsWith("-") ? (
                              <TrendingDown className="h-4 w-4 text-red-500" />
                            ) : null}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </TabsContent>

                <TabsContent value="allTime">
                  <div className="space-y-2">
                    {filterLeaderboard(leaderboardData.allTime).map((user) => {
                      const recentChange = recentChanges[`allTime-${user.username}`]
                      const hasRecentChange = !!recentChange
                      const isPositiveChange = hasRecentChange && recentChange.value > 0

                      return (
                        <div
                          key={user.username}
                          className={cn(
                            "flex items-center gap-4 p-3 rounded-md transition-all duration-300",
                            user.isCurrentUser ? "bg-muted/50" : "",
                            hasRecentChange ? (isPositiveChange ? "bg-green-50" : "bg-red-50") : "",
                          )}
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                            {getRankIcon(user.rank)}
                          </div>
                          <div className="flex items-center gap-3 flex-1">
                            <Avatar>
                              <AvatarImage src="/placeholder-user.jpg" alt={user.username} />
                              <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {user.username} {user.isCurrentUser && "(You)"}
                              </p>
                              <div className="flex items-center gap-2">
                                <p
                                  className={cn(
                                    "text-sm transition-all duration-300",
                                    hasRecentChange
                                      ? isPositiveChange
                                        ? "text-green-600 font-medium"
                                        : "text-red-600 font-medium"
                                      : "text-muted-foreground",
                                  )}
                                >
                                  {user.points} points
                                </p>
                                {hasRecentChange && (
                                  <Badge
                                    variant={isPositiveChange ? "success" : "destructive"}
                                    className="animate-pulse"
                                  >
                                    {isPositiveChange ? "+" : ""}
                                    {recentChange.value}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`text-sm font-medium ${getChangeColor(user.change)}`}>{user.change}</div>
                            {user.change.startsWith("+") ? (
                              <TrendingUp className="h-4 w-4 text-green-500" />
                            ) : user.change.startsWith("-") ? (
                              <TrendingDown className="h-4 w-4 text-red-500" />
                            ) : null}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
