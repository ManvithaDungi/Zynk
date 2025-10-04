import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Home, Search, MessageCircle, Bell, Settings, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

const navigationItems = [
  { icon: Home, label: "Home", href: "/dashboard" },
  { icon: Search, label: "Explore", href: "/explore" },
  { icon: MessageCircle, label: "Messages", href: "/messages" },
  { icon: Bell, label: "Notifications", href: "/notifications" },
  { icon: TrendingUp, label: "Trending", href: "/trending" },
]

export function NavigationMenu({ user }) {
  const pathname = typeof window !== "undefined" ? window.location.pathname : ""

  return (
    <div className="flex flex-col w-full p-4 space-y-2">
      {navigationItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href

        return (
          <Button
            key={item.href}
            variant={isActive ? "secondary" : "ghost"}
            className={cn("w-full justify-start gap-3 h-12", isActive && "bg-primary/10 text-primary hover:bg-primary/20")}
            asChild
          >
            <a href={item.href}>
              <Icon className="h-5 w-5" />
              {item.label}
            </a>
          </Button>
        )
      })}

      <div className="pt-4 mt-4 border-t border-border/40">
        <Button variant="ghost" className="w-full justify-start gap-3 h-12" asChild>
          <a href={`/profile/${user.username}`}>
            <Avatar className="h-6 w-6">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="text-xs">{user.username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            Profile
          </a>
        </Button>

        <Button variant="ghost" className="w-full justify-start gap-3 h-12" asChild>
          <a href="/settings">
            <Settings className="h-5 w-5" />
            Settings
          </a>
        </Button>
      </div>
    </div>
  )
}


