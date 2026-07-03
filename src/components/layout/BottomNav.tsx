import { NavLink } from 'react-router-dom'
import {
  Calendar,
  Compass,
  Gamepad2,
  Gift,
  Home,
  MessageCircleQuestion,
  Star,
} from 'lucide-react'

import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/dates', label: 'Dates', icon: Calendar },
  { to: '/quiz', label: 'Ask Me Anything', icon: MessageCircleQuestion },
  { to: '/places', label: 'Been & Going', icon: Compass },
  { to: '/ratings', label: 'Ratings', icon: Star },
  { to: '/wishlist', label: 'Wishlist', icon: Gift },
  { to: '/games', label: 'Games', icon: Gamepad2 },
]

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink-raised/95 backdrop-blur supports-[backdrop-filter]:bg-ink-raised/80">
      <ul className="mx-auto flex max-w-3xl items-stretch justify-between px-1 pb-[env(safe-area-inset-bottom)]">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex min-h-14 flex-col items-center justify-center gap-1 px-1 py-2 text-[10px] text-parchment-dim transition-colors hover:text-parchment md:flex-row md:gap-2 md:text-sm',
                  isActive && 'text-gold hover:text-gold'
                )
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="hidden sm:inline">{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
