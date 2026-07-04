import { useState, type FormEvent } from 'react'
import { Check, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { QrCode } from '@/components/QrCode'
import {
  useAcceptInvite,
  useDeclineInvite,
  useInvitePartner,
  useMyInvites,
} from '../hooks/useCouple'

// Self-contained partner-connection UI: invite by email (returns a code +
// QR), redeem a code, and respond to invites addressed to you. Rendered
// wherever a not-yet-connected user needs to link up (onboarding, Settings).
export function PartnerConnect() {
  const { data: invites } = useMyInvites()
  const invitePartner = useInvitePartner()
  const acceptInvite = useAcceptInvite()
  const declineInvite = useDeclineInvite()

  const [emailInput, setEmailInput] = useState('')
  const [sentCode, setSentCode] = useState<string | null>(null)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [joinCodeInput, setJoinCodeInput] = useState('')
  const [joinError, setJoinError] = useState<string | null>(null)

  const received = invites?.received ?? []
  const sent = invites?.sent ?? []

  async function handleInvite(e: FormEvent) {
    e.preventDefault()
    if (!emailInput.trim()) return
    setInviteError(null)
    try {
      const result = await invitePartner.mutateAsync(emailInput.trim())
      setSentCode(result.inviteCode)
      setEmailInput('')
    } catch (err) {
      setInviteError(
        err instanceof Error ? err.message : 'Could not send the invite.'
      )
    }
  }

  async function handleJoin(e: FormEvent) {
    e.preventDefault()
    if (!joinCodeInput.trim()) return
    setJoinError(null)
    try {
      await acceptInvite.mutateAsync(joinCodeInput.trim())
      setJoinCodeInput('')
    } catch (err) {
      setJoinError(
        err instanceof Error ? err.message : 'Could not join with that code.'
      )
    }
  }

  return (
    <div className="space-y-4">
      {received.length > 0 && (
        <Card className="border-gold/40">
          <CardHeader>
            <CardTitle className="text-lg">You've been invited</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {received.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between gap-3"
              >
                <span className="text-sm text-parchment">
                  A partner invited you to connect.
                </span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => acceptInvite.mutate(invite.inviteCode)}
                    disabled={acceptInvite.isPending}
                  >
                    <Check className="h-4 w-4" />
                    Accept
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label="Decline invite"
                    onClick={() => declineInvite.mutate(invite.inviteCode)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Invite your partner</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {sentCode ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <p className="text-sm text-muted-foreground">
                Share this code, or have your partner scan the QR:
              </p>
              <span className="font-mono text-lg text-gold">{sentCode}</span>
              <QrCode value={`${window.location.origin}/join/${sentCode}`} />
              <p className="text-xs text-muted-foreground">
                They'll be connected as soon as they accept.
              </p>
            </div>
          ) : sent.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Invite sent to {sent[0].inviteeEmail} — waiting for them to
                accept.
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setSentCode(sent[0].inviteCode)}
              >
                Show code again
              </Button>
            </div>
          ) : (
            <form onSubmit={handleInvite} className="flex items-center gap-2">
              <Input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Partner's email"
                className="h-9"
                required
              />
              <Button
                type="submit"
                size="sm"
                disabled={invitePartner.isPending}
              >
                Invite
              </Button>
            </form>
          )}
          {inviteError && (
            <p className="text-sm text-destructive">{inviteError}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Have a code?</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleJoin} className="flex items-center gap-2">
            <Input
              value={joinCodeInput}
              onChange={(e) => setJoinCodeInput(e.target.value)}
              placeholder="Enter invite code"
              className="h-9 font-mono"
            />
            <Button type="submit" size="sm" disabled={acceptInvite.isPending}>
              Join
            </Button>
          </form>
          {joinError && (
            <p className="mt-2 text-sm text-destructive">{joinError}</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
