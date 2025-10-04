import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { NavigationMenu } from "@/components/navigation-menu"
import { SearchBar } from "@/components/search-bar"

export function MobileNav({ user, isOpen, onClose }) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            {user.username}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <SearchBar />
          <NavigationMenu user={user} />
        </div>
      </SheetContent>
    </Sheet>
  )
}


