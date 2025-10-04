import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CommentSection } from "@/components/comment-section"
import { useToast } from "@/hooks/use-toast"
import { Heart, MessageCircle, Share, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export function PostCard({ post, currentUserId, currentUser, onDelete }) {
  const [isLiked, setIsLiked] = useState(post.likes.includes(currentUserId))
  const [likesCount, setLikesCount] = useState(post.likes.length)
  const [showComments, setShowComments] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const isOwnPost = post.author.id === currentUserId

  const handleLike = async () => {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: "POST",
      })

      if (response.ok) {
        setIsLiked(!isLiked)
        setLikesCount(isLiked ? likesCount - 1 : likesCount + 1)
      } else {
        toast({
          title: "Error",
          description: "Failed to update like status",
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
      setIsLoading(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by ${post.author.username}`,
          text: post.content,
          url: window.location.href,
        })
      } catch (error) {
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href)
        toast({
          title: "Link copied",
          description: "Post link has been copied to clipboard.",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to copy link",
          variant: "destructive",
        })
      }
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return

    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Post deleted",
          description: "Your post has been deleted successfully.",
        })
        onDelete?.(post.id)
      } else {
        toast({
          title: "Error",
          description: "Failed to delete post",
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

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <a href={`/profile/${post.author.username}`}>
              <Avatar className="h-10 w-10 cursor-pointer">
                <AvatarImage src={post.author.avatar || ""} />
                <AvatarFallback>{post.author.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            </a>
            <div>
              <div className="flex items-center gap-2">
                <a href={`/profile/${post.author.username}`} className="font-semibold hover:underline">
                  {post.author.username}
                </a>
                {post.author.isVerified && (
                  <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground text-xs">✓</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                {post.updatedAt !== post.createdAt && " • edited"}
              </p>
            </div>
          </div>

          {isOwnPost && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {post.content && (
          <div className="mb-4">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
          </div>
        )}

        {post.images.length > 0 && (
          <div className="mb-4">
            {post.images.length === 1 ? (
              <img
                src={post.images[0] || "/placeholder.svg"}
                alt="Post image"
                className="w-full max-h-96 object-cover rounded-lg"
              />
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {post.images.map((image, index) => (
                  <img
                    key={index}
                    src={image || "/placeholder.svg"}
                    alt={`Post image ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-border/40">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className={`gap-2 ${isLiked ? "text-red-500 hover:text-red-600" : ""}`}
              onClick={handleLike}
              disabled={isLoading}
            >
              <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
              {likesCount}
            </Button>

            <Button variant="ghost" size="sm" className="gap-2" onClick={() => setShowComments(!showComments)}>
              <MessageCircle className="h-4 w-4" />
              {post.comments}
            </Button>

            <Button variant="ghost" size="sm" className="gap-2" onClick={handleShare}>
              <Share className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        {showComments && currentUser && (
          <div className="mt-6 pt-6 border-t border-border/40">
            <CommentSection postId={post.id} currentUserId={currentUserId} currentUser={currentUser} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}


