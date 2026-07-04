import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { HeartHandshake } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useCoupleStatus } from '../hooks/useCouple'

// Modules hold shared couple data, so they need a couple to write to.
// Rather than let the add form fail after the fact, gate the whole module
// behind connection status: connected users see their content, solo users
// get pointed at the connect flow.
export function ConnectGate({
  children,
  what,
}: {
  children: ReactNode
  what: string
}) {
  const { data: coupleStatus } = useCoupleStatus()

  if (coupleStatus === undefined) {
    return <p className="text-muted-foreground">Loading...</p>
  }

  if (coupleStatus.inCouple) {
    return <>{children}</>
  }

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
        <HeartHandshake className="h-10 w-10 text-gold" />
        <div className="space-y-1">
          <p className="font-display text-xl text-parchment">
            Connect with your partner first
          </p>
          <p className="max-w-xs text-sm text-muted-foreground">
            {what} is shared between the two of you. Link up with your partner
            to start.
          </p>
        </div>
        <Button asChild>
          <Link to="/connect">Connect a partner</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
