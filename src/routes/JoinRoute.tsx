import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/store/authStore'
import { useAcceptInvite } from '@/features/couple/hooks/useCouple'

export function JoinRoute() {
  const { code } = useParams()
  const { user, isLoading } = useAuthStore()
  const acceptInvite = useAcceptInvite()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-ink text-muted-foreground">
        Loading...
      </div>
    )
  }

  if (!user) {
    return <Navigate to={`/login?redirect=/join/${code ?? ''}`} replace />
  }

  async function handleAccept() {
    if (!code) return
    setError(null)
    try {
      await acceptInvite.mutateAsync(code)
      navigate('/profile', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept invite.')
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-ink px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Join as a couple</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Accept this invite to connect with your partner on OurLife.
          </p>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button
            onClick={handleAccept}
            disabled={acceptInvite.isPending}
            className="w-full"
          >
            {acceptInvite.isPending ? 'Joining...' : 'Accept invite'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
