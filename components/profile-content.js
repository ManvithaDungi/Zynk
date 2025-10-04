import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EditProfileDialog } from "@/components/edit-profile-dialog"
import { PostGrid } from "@/components/post-grid"
import { FollowButton } from "@/components/follow-button"
import { Settings, Calendar, Shield } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export function ProfileContent({ profileUser, isOwnProfile, currentUserId }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center md:items-start">
              <Avatar className="h-32 w-32 border-4 border-primary/20">
                <AvatarImage src={profileUser.avatar || ""} />
                <AvatarFallback className="text-2xl">{profileUser.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{profileUser.username}</h1>
                  {profileUser.isVerified && (
                    <Badge variant="secondary" className="gap-1">
                      <Shield className="h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2">
                  {isOwnProfile ? (
                    <Button variant="outline" onClick={() => setIsEditDialogOpen(true)} className="gap-2">
                      <Settings className="h-4 w-4" />
                      Edit Profile
                    </Button>
                  ) : (
                    <FollowButton
                      targetUserId={profileUser.id}
                      currentUserId={currentUserId}
                      isFollowing={profileUser.followers.includes(currentUserId)}
                    />
                  )}
                </div>
              </div>

              <div className="flex gap-6 text-sm">
                <div className="text-center">
                  <div className="font-bold text-lg">{profileUser.postsCount}</div>
                  <div className="text-muted-foreground">Posts</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg">{profileUser.followers.length}</div>
                  <div className="text-muted-foreground">Followers</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg">{profileUser.following.length}</div>
                  <div className="text-muted-foreground">Following</div>
                </div>
              </div>

              {profileUser.bio && <p className="text-sm leading-relaxed">{profileUser.bio}</p>}

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined {formatDistanceToNow(new Date(profileUser.createdAt), { addSuffix: true })}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="likes">Likes</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-6">
          <PostGrid userId={profileUser.id} type="posts" />
        </TabsContent>

        <TabsContent value="media" className="mt-6">
          <PostGrid userId={profileUser.id} type="media" />
        </TabsContent>

        <TabsContent value="likes" className="mt-6">
          <PostGrid userId={profileUser.id} type="likes" />
        </TabsContent>
      </Tabs>

      {isOwnProfile && (
        <EditProfileDialog user={profileUser} isOpen={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} />
      )}
    </div>
  )
}


