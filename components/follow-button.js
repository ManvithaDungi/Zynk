import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { UserPlus, UserMinus } from "lucide-react"

export function FollowButton({ targetUserId, currentUserId, isFollowing: initialIsFollowing }) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleFollow = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/user/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId,
          action: isFollowing ? "unfollow" : "follow",
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsFollowing(!isFollowing)
        toast({
          title: isFollowing ? "Unfollowed" : "Following",
          description: data.message,
        })
      } else {
        toast({
          title: "Error",
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
    <Button onClick={handleFollow} disabled={isLoading} variant={isFollowing ? "outline" : "default"} className="gap-2">
      {isFollowing ? (
        <>
          <UserMinus className="h-4 w-4" />
          {isLoading ? "Unfollowing..." : "Unfollow"}
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" />
          {isLoading ? "Following..." : "Follow"}
        </>
      )}
    </Button>
  )
}


