import { Link, Navigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

import { useCoupleStatus } from '@/features/couple/hooks/useCouple'
import { PartnerConnect } from '@/features/couple/components/PartnerConnect'

export function ConnectRoute() {
  const { data: coupleStatus } = useCoupleStatus()

  // Already connected — nothing to do here.
  if (coupleStatus?.inCouple) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-1">
        <Link
          to="/"
          aria-label="Back"
          className="-ml-1.5 rounded-full p-1.5 text-parchment-dim transition-colors hover:text-parchment"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-3xl font-medium text-parchment">
          Connect
        </h1>
      </div>

      <p className="text-muted-foreground">
        OurLife is for two. Invite your partner or enter their code to share a
        private space for everything you do together.
      </p>

      <PartnerConnect />
    </div>
  )
}
