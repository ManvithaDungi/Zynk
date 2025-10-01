"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreatePostDialog } from "@/components/create-post-dialog"
import { PostCard } from "@/components/post-card"
import { TrendingUp, Users, Loader2 } from "lucide-react"

interface Post {
  id: string
  content: string
  images: string[]
  author: {
    id: string
    username: string
    avatar: string | null
    isVerified: boolean
  }
  likes: string[]
  comments: number
  createdAt: Date
  updatedAt: Date
}

interface FeedContentProps {
  user?: {
    userId: string
    username: string
    avatar?: string | null
  }
}

export function FeedContent({ user }: FeedContentProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/posts")
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts)
      } else {
        setError("Failed to load posts")
      }
    } catch (error) {
      setError("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeletePost = (postId: string) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId))
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={fetchPosts} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Create Post Section */}
      {user && (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <CreatePostDialog user={user} />
              </div>
              <Button variant="outline" className="gap-2 bg-transparent">
                <Users className="h-4 w-4" />
                Find Friends
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts Feed */}
      {posts.length === 0 ? (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Welcome to Zynk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Start connecting with friends and sharing your moments. Your feed will appear here once you follow some
              users or create your first post.
            </p>
            <div className="flex gap-2">
              {user && <CreatePostDialog user={user} />}
              <Button variant="outline" className="gap-2 bg-transparent">
                <Users className="h-4 w-4" />
                Find Friends
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} currentUserId={user?.userId || ""} onDelete={handleDeletePost} />
          ))}
        </div>
      )}
    </div>
  )
}
