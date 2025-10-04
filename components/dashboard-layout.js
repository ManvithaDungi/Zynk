import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ZynkLogo } from "@/components/zynk-logo"
import { NavigationMenu } from "@/components/navigation-menu"
import { SearchBar } from "@/components/search-bar"
import { NotificationBell } from "@/components/notification-bell"
import { UserMenu } from "@/components/user-menu"
import { MobileNav } from "@/components/mobile-nav"
import { Menu } from "lucide-react"

export function DashboardLayout({ children, user }) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMobileNavOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <ZynkLogo />
          </div>

          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <SearchBar />
          </div>

          <div className="flex items-center gap-2">
            <NotificationBell />
            <UserMenu user={user} />
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="hidden md:flex w-64 min-h-[calc(100vh-4rem)] border-r border-border/40 bg-card/30">
          <NavigationMenu user={user} />
        </aside>

        <main className="flex-1 min-h-[calc(100vh-4rem)]">{children}</main>
      </div>

      <MobileNav user={user} isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />
    </div>
  )
}


