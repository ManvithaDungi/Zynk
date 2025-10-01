"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { ImageIcon, X, Plus } from "lucide-react"

interface CreatePostDialogProps {
  user: {
    username: string
    avatar?: string | null
  }
}

export function CreatePostDialog({ user }: CreatePostDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [content, setContent] = useState("")
  const [images, setImages] = useState<string[]>([])
  const { toast } = useToast()

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          setImages((prev) => [...prev, result])
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim() && images.length === 0) {
      toast({
        title: "Empty post",
        description: "Please add some content or images to your post.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          images,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Post created!",
          description: "Your post has been shared successfully.",
        })
        setContent("")
        setImages([])
        setIsOpen(false)
        // Refresh the page to show the new post
        window.location.reload()
      } else {
        toast({
          title: "Failed to create post",
          description: data.message || "Something went wrong",
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Post
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create a new post</DialogTitle>
          <DialogDescription>Share what's on your mind with your followers.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar || ""} />
              <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="What's happening?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[100px] resize-none border-0 p-0 focus-visible:ring-0 text-lg"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-2">{content.length}/500 characters</p>
            </div>
          </div>

          {/* Image Preview */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              <label htmlFor="image-upload" className="cursor-pointer">
                <Button type="button" variant="ghost" size="sm" className="gap-2" asChild>
                  <span>
                    <ImageIcon className="h-4 w-4" />
                    Add Photos
                  </span>
                </Button>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || (!content.trim() && images.length === 0)}>
                {isLoading ? "Posting..." : "Post"}
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
