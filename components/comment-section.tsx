"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { Send, MoreHorizontal, Trash2, Heart, Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Comment {
  id: string
  content: string
  author: {
    id: string
    username: string
    avatar: string | null
    isVerified: boolean
  }
  likes: string[]
  createdAt: Date
  updatedAt: Date
}

interface CommentSectionProps {
  postId: string
  currentUserId: string
  currentUser: {
    username: string
    avatar?: string | null
  }
}

export function CommentSection({ postId, currentUserId, currentUser }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchComments()
  }, [postId])

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}/comments`)
      if (response.ok) {
        const data = await response.json()
        setComments(data.comments)
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment.trim() }),
      })

      if (response.ok) {
        const data = await response.json()
        setComments((prev) => [data.comment, ...prev])
        setNewComment("")
        toast({
          title: "Comment added",
          description: "Your comment has been posted successfully.",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to post comment",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLikeComment = async (commentId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/comments/${commentId}/like`, {
        method: "POST",
      })

      if (response.ok) {
        const data = await response.json()
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === commentId
              ? {
                  ...comment,
                  likes: data.isLiked
                    ? [...comment.likes, currentUserId]
                    : comment.likes.filter((id) => id !== currentUserId),
                }
              : comment,
          ),
        )
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive",
      })
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return

    try {
      const response = await fetch(`/api/posts/${postId}/comments/${commentId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setComments((prev) => prev.filter((comment) => comment.id !== commentId))
        toast({
          title: "Comment deleted",
          description: "Your comment has been deleted successfully.",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to delete comment",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Add Comment Form */}
      <form onSubmit={handleSubmitComment} className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={currentUser.avatar || ""} />
          <AvatarFallback className="text-xs">{currentUser.username.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <Textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[80px] resize-none"
            maxLength={500}
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{newComment.length}/500 characters</p>
            <Button type="submit" size="sm" disabled={!newComment.trim() || isSubmitting} className="gap-2">
              <Send className="h-3 w-3" />
              {isSubmitting ? "Posting..." : "Comment"}
            </Button>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <Card key={comment.id} className="border-border/30 bg-card/30">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.author.avatar || ""} />
                    <AvatarFallback className="text-xs">
                      {comment.author.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{comment.author.username}</span>
                        {comment.author.isVerified && (
                          <div className="w-3 h-3 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-primary-foreground text-xs">✓</span>
                          </div>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      {comment.author.id === currentUserId && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-3 w-3" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed mb-2">{comment.content}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`gap-1 h-6 px-2 ${
                        comment.likes.includes(currentUserId) ? "text-red-500 hover:text-red-600" : ""
                      }`}
                      onClick={() => handleLikeComment(comment.id)}
                    >
                      <Heart className={`h-3 w-3 ${comment.likes.includes(currentUserId) ? "fill-current" : ""}`} />
                      {comment.likes.length > 0 && <span className="text-xs">{comment.likes.length}</span>}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
