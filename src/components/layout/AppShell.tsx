import { Outlet } from 'react-router-dom'
import { LogOut } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'
import { BottomNav } from './BottomNav'

export function AppShell() {
  const logout = useAuthStore((state) => state.logout)

  return (
    <div className="flex min-h-svh flex-col bg-ink text-foreground">
      <header className="sticky top-0 z-30 border-b border-line bg-ink/95 backdrop-blur supports-[backdrop-filter]:bg-ink/80">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <span className="font-display text-2xl italic tracking-wide text-parchment">
            OurLife
          </span>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Log out"
            onClick={() => logout()}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-24 pt-6">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  )
}
