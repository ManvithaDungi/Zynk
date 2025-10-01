"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Camera } from "lucide-react"

interface ProfileUser {
  id: string
  username: string
  email: string
  avatar: string | null
  bio: string
  followers: string[]
  following: string[]
  postsCount: number
  isVerified: boolean
  isPrivate: boolean
  createdAt: Date
}

interface EditProfileDialogProps {
  user: ProfileUser
  isOpen: boolean
  onClose: () => void
}

export function EditProfileDialog({ user, isOpen, onClose }: EditProfileDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: user.username,
    bio: user.bio,
    isPrivate: user.isPrivate,
    avatar: user.avatar,
  })
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        })
        onClose()
        // Refresh the page to show updated data
        window.location.reload()
      } else {
        toast({
          title: "Update failed",
          description: data.message || "Failed to update profile",
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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // In a real app, you would upload to a service like Cloudinary or AWS S3
    // For now, we'll just create a placeholder URL
    const reader = new FileReader()
    reader.onload = (e) => {
      setFormData((prev) => ({
        ...prev,
        avatar: e.target?.result as string,
      }))
    }
    reader.readAsDataURL(file)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>Make changes to your profile here. Click save when you're done.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center space-y-2">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={formData.avatar || ""} />
                <AvatarFallback>{formData.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 p-1 bg-primary rounded-full cursor-pointer hover:bg-primary/80 transition-colors"
              >
                <Camera className="h-3 w-3 text-primary-foreground" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </label>
            </div>
            <p className="text-xs text-muted-foreground">Click the camera to change your avatar</p>
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
              placeholder="Enter your username"
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
              placeholder="Tell us about yourself..."
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">{formData.bio.length}/500 characters</p>
          </div>

          {/* Privacy Setting */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="private">Private Account</Label>
              <p className="text-xs text-muted-foreground">Only approved followers can see your posts</p>
            </div>
            <Switch
              id="private"
              checked={formData.isPrivate}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isPrivate: checked }))}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
