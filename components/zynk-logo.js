export function ZynkLogo() {
  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <span className="text-2xl font-bold text-primary-foreground">Z</span>
        </div>
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent animate-pulse"></div>
      </div>
    </div>
  )
}


