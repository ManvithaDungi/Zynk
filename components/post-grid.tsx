"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PostCard } from "./post-card"
import { CreatePostDialog } from "./create-post-dialog"
import { Plus, ImageIcon, Loader2 } from "lucide-react"

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

interface PostGridProps {
  userId: string
  type: "posts" | "media" | "likes"
  currentUserId?: string
}

export function PostGrid({ userId, type, currentUserId }: PostGridProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPosts()
  }, [userId, type])

  const fetchPosts = async () => {
    try {
      const response = await fetch(`/api/users/${userId}/posts?type=${type}`)
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
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={fetchPosts} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (posts.length === 0) {
    const isOwnProfile = userId === currentUserId

    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-12 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
              {type === "media" ? (
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              ) : (
                <Plus className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">
                {type === "posts" && "No posts yet"}
                {type === "media" && "No media yet"}
                {type === "likes" && "No liked posts yet"}
              </h3>
              <p className="text-muted-foreground">
                {type === "posts" && isOwnProfile && "Share your first post to get started"}
                {type === "posts" && !isOwnProfile && "This user hasn't posted anything yet"}
                {type === "media" && "Posts with photos and videos will appear here"}
                {type === "likes" && "Liked posts will appear here"}
              </p>
            </div>
            {type === "posts" && isOwnProfile && <CreatePostDialog user={{ username: "user", avatar: null }} />}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} currentUserId={currentUserId || ""} onDelete={handleDeletePost} />
      ))}
    </div>
  )
}
