import { useState, type FormEvent } from 'react'
import { Check, Search, X } from 'lucide-react'

import { Avatar } from '@/components/Avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { QrCode } from '@/components/QrCode'
import type { UserSearchResult } from '../api/coupleApi'
import {
  useAcceptCoupleRequest,
  useAcceptInvite,
  useCancelCoupleRequest,
  useDeclineCoupleRequest,
  useFindUserByUsername,
  useIncomingRequests,
  useInvitePartner,
  useOutgoingRequests,
  useSendCoupleRequest,
} from '../hooks/useCouple'

function ResultRow({
  name,
  handle,
  avatarUrl,
  children,
}: {
  name: string
  handle: string | null
  avatarUrl?: string | null
  children?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar url={avatarUrl} name={name} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-sm text-parchment">{name}</p>
          {handle && (
            <p className="truncate text-xs text-muted-foreground">
              @{handle}
            </p>
          )}
        </div>
      </div>
      {children && <div className="flex shrink-0 gap-2">{children}</div>}
    </div>
  )
}

// Self-contained partner-connection UI. Primary path: search someone's
// exact username and send an in-app request they can accept/decline, like
// a follow request. Secondary path: invite someone who isn't on OurLife
// yet via a shareable email/QR code. Rendered wherever a not-yet-connected
// user needs to link up (onboarding, Settings).
export function PartnerConnect() {
  const { data: incoming } = useIncomingRequests()
  const { data: outgoing } = useOutgoingRequests()
  const findUser = useFindUserByUsername()
  const sendRequest = useSendCoupleRequest()
  const acceptRequest = useAcceptCoupleRequest()
  const declineRequest = useDeclineCoupleRequest()
  const cancelRequest = useCancelCoupleRequest()
  const invitePartner = useInvitePartner()
  const acceptInvite = useAcceptInvite()

  const [usernameInput, setUsernameInput] = useState('')
  const [searchResult, setSearchResult] = useState<UserSearchResult | null>(
    null
  )
  const [searched, setSearched] = useState<string | null>(null)

  const [emailInput, setEmailInput] = useState('')
  const [joinCodeInput, setJoinCodeInput] = useState('')
  const [joinError, setJoinError] = useState<string | null>(null)

  const myOutgoing = outgoing?.[0] ?? null

  async function handleSearch(e: FormEvent) {
    e.preventDefault()
    const username = usernameInput.trim().replace(/^@/, '')
    if (!username) return
    const result = await findUser.mutateAsync(username)
    setSearchResult(result)
    setSearched(username)
  }

  async function handleSendRequest() {
    if (!searchResult) return
    await sendRequest.mutateAsync(searchResult.username)
    setUsernameInput('')
    setSearchResult(null)
    setSearched(null)
  }

  async function handleInvite(e: FormEvent) {
    e.preventDefault()
    if (!emailInput.trim()) return
    await invitePartner.mutateAsync(emailInput.trim())
    setEmailInput('')
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
      {incoming && incoming.length > 0 && (
        <Card className="border-gold/40">
          <CardHeader>
            <CardTitle className="text-lg">Connection requests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {incoming.map((req) => (
              <ResultRow
                key={req.inviteId}
                name={req.fromDisplayName || req.fromUsername || 'Someone'}
                handle={req.fromUsername}
                avatarUrl={req.fromAvatarUrl}
              >
                <Button
                  type="button"
                  size="sm"
                  onClick={() => acceptRequest.mutate(req.inviteId)}
                  disabled={acceptRequest.isPending}
                >
                  <Check className="h-4 w-4" />
                  Accept
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label="Decline request"
                  onClick={() => declineRequest.mutate(req.inviteId)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </ResultRow>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Find your partner</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {myOutgoing ? (
            myOutgoing.toUsername ? (
              <ResultRow
                name={myOutgoing.toDisplayName || myOutgoing.toUsername}
                handle={myOutgoing.toUsername}
                avatarUrl={myOutgoing.toAvatarUrl}
              >
                <span className="whitespace-nowrap text-xs text-muted-foreground">
                  Waiting to accept
                </span>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label="Cancel request"
                  onClick={() => cancelRequest.mutate(myOutgoing.inviteId)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </ResultRow>
            ) : (
              <div className="flex flex-col items-center gap-3 text-center">
                <p className="text-sm text-muted-foreground">
                  Invite sent to {myOutgoing.inviteeEmail} — share this code
                  or QR if they haven't seen it yet:
                </p>
                <span className="font-mono text-lg text-gold">
                  {myOutgoing.inviteCode}
                </span>
                <QrCode
                  value={`${window.location.origin}/join/${myOutgoing.inviteCode}`}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => cancelRequest.mutate(myOutgoing.inviteId)}
                >
                  Cancel invite
                </Button>
              </div>
            )
          ) : (
            <>
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <Input
                  value={usernameInput}
                  onChange={(e) => {
                    setUsernameInput(e.target.value)
                    setSearchResult(null)
                    setSearched(null)
                  }}
                  placeholder="Their exact username"
                  className="h-9"
                />
                <Button
                  type="submit"
                  size="sm"
                  variant="outline"
                  disabled={findUser.isPending}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </form>

              {searched && !searchResult && (
                <p className="text-sm text-muted-foreground">
                  No one found with the username "{searched}".
                </p>
              )}

              {searchResult && (
                <ResultRow
                  name={searchResult.displayName || searchResult.username}
                  handle={searchResult.username}
                  avatarUrl={searchResult.avatarUrl}
                >
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSendRequest}
                    disabled={sendRequest.isPending}
                  >
                    Connect
                  </Button>
                </ResultRow>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {!myOutgoing && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-muted-foreground">
              Not on OurLife yet?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <form onSubmit={handleInvite} className="flex items-center gap-2">
              <Input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Their email"
                className="h-9"
                required
              />
              <Button
                type="submit"
                size="sm"
                variant="outline"
                disabled={invitePartner.isPending}
              >
                Invite
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base text-muted-foreground">
            Have an invite code?
          </CardTitle>
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
