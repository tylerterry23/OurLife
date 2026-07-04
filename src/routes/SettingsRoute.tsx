import { useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  Bell,
  Check,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Palette,
  UserPlus,
  UserX,
  X,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { QrCode } from '@/components/QrCode'
import { useAuthStore } from '@/store/authStore'
import { useSettingsStore } from '@/store/settingsStore'
import {
  useAcceptInvite,
  useCoupleStatus,
  useDeclineInvite,
  useInvitePartner,
  useLeaveCouple,
  useMyInvites,
} from '@/features/couple/hooks/useCouple'

function SettingsRow({
  icon: Icon,
  label,
  onClick,
  to,
  trailing,
}: {
  icon: typeof Bell
  label: string
  onClick?: () => void
  to?: string
  trailing?: ReactNode
}) {
  const content = (
    <>
      <span className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-gold" />
        <span className="text-sm text-parchment">{label}</span>
      </span>
      {trailing ??
        (to && <ChevronRight className="h-4 w-4 text-parchment-dim" />)}
    </>
  )

  const className =
    'flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-ink'

  if (to) {
    return (
      <Link to={to} className={className}>
        {content}
      </Link>
    )
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  )
}

export function SettingsRoute() {
  const logout = useAuthStore((state) => state.logout)
  const { displayNames } = useSettingsStore()
  const { data: coupleStatus } = useCoupleStatus()
  const { data: invites } = useMyInvites()
  const invitePartner = useInvitePartner()
  const acceptInvite = useAcceptInvite()
  const declineInvite = useDeclineInvite()
  const leaveCouple = useLeaveCouple()

  const [showConnectForm, setShowConnectForm] = useState(false)
  const [emailInput, setEmailInput] = useState('')
  const [sentCode, setSentCode] = useState<string | null>(null)
  const [joinCodeInput, setJoinCodeInput] = useState('')
  const [joinError, setJoinError] = useState<string | null>(null)

  async function handleInvite(e: FormEvent) {
    e.preventDefault()
    if (!emailInput.trim()) return
    const result = await invitePartner.mutateAsync(emailInput.trim())
    setSentCode(result.inviteCode)
    setEmailInput('')
  }

  async function handleJoinWithCode(e: FormEvent) {
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

  const inCouple = coupleStatus?.inCouple ?? false
  const received = invites?.received ?? []
  const sent = invites?.sent ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-1">
        <Link
          to="/profile"
          aria-label="Back to profile"
          className="-ml-1.5 rounded-full p-1.5 text-parchment-dim transition-colors hover:text-parchment"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-3xl font-medium text-parchment">
          Settings
        </h1>
      </div>

      <Card className="divide-y divide-line overflow-hidden">
        <SettingsRow
          icon={Palette}
          label="App Theme"
          trailing={<Badge variant="outline">coming soon</Badge>}
        />

        {inCouple ? (
          <SettingsRow
            icon={UserX}
            label={`Leave partner (${displayNames.partner2})`}
            onClick={() => leaveCouple.mutate()}
          />
        ) : (
          <div>
            <SettingsRow
              icon={UserPlus}
              label="Invite a partner"
              onClick={() => setShowConnectForm((v) => !v)}
            />
            {showConnectForm && (
              <form
                onSubmit={handleInvite}
                className="flex items-center gap-2 border-t border-line px-4 py-3"
              >
                <Input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Partner's email"
                  className="h-9"
                  required
                />
                <Button type="submit" size="sm" disabled={invitePartner.isPending}>
                  Invite
                </Button>
              </form>
            )}
            {sentCode && (
              <div className="flex flex-col items-center gap-3 border-t border-line px-4 py-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Share this code, or have your partner scan the QR below:
                </p>
                <span className="font-mono text-lg text-gold">{sentCode}</span>
                <QrCode value={`${window.location.origin}/join/${sentCode}`} />
              </div>
            )}
            {sent.length > 0 && !sentCode && (
              <p className="border-t border-line px-4 py-3 text-sm text-muted-foreground">
                Invite sent to {sent[0].inviteeEmail} — waiting for them to
                accept.
              </p>
            )}
            <form
              onSubmit={handleJoinWithCode}
              className="flex flex-col gap-2 border-t border-line px-4 py-3"
            >
              <p className="text-sm text-parchment">
                Have a code from your partner?
              </p>
              <div className="flex items-center gap-2">
                <Input
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value)}
                  placeholder="Enter invite code"
                  className="h-9 font-mono"
                />
                <Button type="submit" size="sm" disabled={acceptInvite.isPending}>
                  Join
                </Button>
              </div>
              {joinError && (
                <p className="text-sm text-destructive">{joinError}</p>
              )}
            </form>
            {received.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between border-t border-line px-4 py-3"
              >
                <span className="text-sm text-parchment">
                  Invite from a partner — accept to connect
                </span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label="Accept invite"
                    onClick={() => acceptInvite.mutate(invite.inviteCode)}
                  >
                    <Check className="h-4 w-4" />
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
          </div>
        )}

        <SettingsRow
          icon={Bell}
          label="Notifications"
          trailing={<Badge variant="outline">coming soon</Badge>}
        />

        <SettingsRow icon={LogOut} label="Log out" onClick={() => logout()} />
      </Card>
    </div>
  )
}
