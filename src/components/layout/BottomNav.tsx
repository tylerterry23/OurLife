import { NavLink } from 'react-router-dom'
import { Home, LayoutGrid, User } from 'lucide-react'

import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/modules', label: 'Explore', icon: LayoutGrid },
  { to: '/profile', label: 'Profile', icon: User },
]

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
      <ul className="flex items-center gap-1 rounded-full border border-line bg-ink-raised/90 p-1.5 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-ink-raised/75">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex min-w-16 flex-col items-center gap-0.5 rounded-full px-5 py-2 text-[11px] font-medium text-parchment-dim transition-colors hover:text-parchment',
                  isActive && 'bg-ink text-gold hover:text-gold'
                )
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
