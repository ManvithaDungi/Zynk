"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell } from "lucide-react"

export function NotificationBell() {
  const [notificationCount] = useState(3) // This would come from an API

  return (
    <Button variant="ghost" size="sm" className="relative">
      <Bell className="h-5 w-5" />
      {notificationCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
        >
          {notificationCount > 9 ? "9+" : notificationCount}
        </Badge>
      )}
    </Button>
  )
}
