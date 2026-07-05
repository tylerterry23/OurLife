import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

export function ModulePageHeader({
  title,
  action,
}: {
  title: string
  action?: ReactNode
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1">
        <Link
          to="/modules"
          aria-label="Back to Explore"
          className="-ml-1.5 rounded-full p-1.5 text-parchment-dim transition-colors hover:text-parchment"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-3xl font-medium text-parchment">
          {title}
        </h1>
      </div>
      {action}
    </div>
  )
}
