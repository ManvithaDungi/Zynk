"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PostCard } from "@/components/post-card"
import { FollowButton } from "@/components/follow-button"
import { Search, TrendingUp, Users, Hash, Loader2 } from "lucide-react"
import Link from "next/link"
import type { User } from "@/lib/auth"

interface TrendingTopic {
  tag: string
  posts: number
}

interface SuggestedUser {
  id: string
  username: string
  avatar: string | null
  bio: string
  followers: string[]
  isVerified: boolean
}

interface ExploreContentProps {
  user: User
}

export function ExploreContent({ user }: ExploreContentProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([])
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([])
  const [trendingPosts, setTrendingPosts] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchExploreData()
  }, [])

  const fetchExploreData = async () => {
    try {
      const [trendsResponse, usersResponse, postsResponse] = await Promise.all([
        fetch("/api/explore/trending"),
        fetch("/api/explore/users"),
        fetch("/api/explore/posts"),
      ])

      if (trendsResponse.ok) {
        const trendsData = await trendsResponse.json()
        setTrendingTopics(trendsData.topics)
      }

      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setSuggestedUsers(usersData.users)
      }

      if (postsResponse.ok) {
        const postsData = await postsResponse.json()
        setTrendingPosts(postsData.posts)
      }
    } catch (error) {
      console.error("Failed to fetch explore data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setIsSearching(true)

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.results)
      }
    } catch (error) {
      console.error("Search failed:", error)
    } finally {
      setIsSearching(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Search Section */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Discover
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Search users, posts, hashtags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={isSearching}>
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </form>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-6 space-y-4">
              <h3 className="font-semibold">Search Results</h3>
              <div className="space-y-3">
                {searchResults.map((result, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    {result.type === "user" && (
                      <>
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={result.avatar || ""} />
                          <AvatarFallback>{result.username.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Link href={`/profile/${result.username}`} className="font-semibold hover:underline">
                              {result.username}
                            </Link>
                            {result.isVerified && (
                              <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                                <span className="text-primary-foreground text-xs">✓</span>
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{result.bio}</p>
                        </div>
                        <FollowButton
                          targetUserId={result.id}
                          currentUserId={user.userId}
                          isFollowing={result.followers?.includes(user.userId) || false}
                        />
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="trending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="people">People</TabsTrigger>
          <TabsTrigger value="topics">Topics</TabsTrigger>
        </TabsList>

        <TabsContent value="trending" className="space-y-6">
          <div className="space-y-6">
            {trendingPosts.length === 0 ? (
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No trending posts yet</h3>
                  <p className="text-muted-foreground">Check back later for trending content</p>
                </CardContent>
              </Card>
            ) : (
              trendingPosts.map((post) => (
                <PostCard key={post.id} post={post} currentUserId={user.userId} currentUser={user} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="people" className="space-y-6">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Suggested for you
              </CardTitle>
            </CardHeader>
            <CardContent>
              {suggestedUsers.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No suggestions available</p>
              ) : (
                <div className="space-y-4">
                  {suggestedUsers.map((suggestedUser) => (
                    <div key={suggestedUser.id} className="flex items-center gap-4 p-4 rounded-lg bg-muted/20">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={suggestedUser.avatar || ""} />
                        <AvatarFallback>{suggestedUser.username.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Link href={`/profile/${suggestedUser.username}`} className="font-semibold hover:underline">
                            {suggestedUser.username}
                          </Link>
                          {suggestedUser.isVerified && (
                            <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                              <span className="text-primary-foreground text-xs">✓</span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{suggestedUser.bio}</p>
                        <p className="text-xs text-muted-foreground">{suggestedUser.followers.length} followers</p>
                      </div>
                      <FollowButton
                        targetUserId={suggestedUser.id}
                        currentUserId={user.userId}
                        isFollowing={suggestedUser.followers.includes(user.userId)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="topics" className="space-y-6">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5 text-primary" />
                Trending Topics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {trendingTopics.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No trending topics yet</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {trendingTopics.map((topic, index) => (
                    <div key={index} className="p-4 rounded-lg bg-muted/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">#{topic.tag}</h3>
                          <p className="text-sm text-muted-foreground">{topic.posts} posts</p>
                        </div>
                        <Badge variant="secondary">{index + 1}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
