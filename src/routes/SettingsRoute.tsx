import { useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Trash2,
  UserPlus,
  UserX,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemePicker } from '@/components/ThemePicker'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { isSupabaseConfigured } from '@/lib/supabaseClient'
import { useAuthStore } from '@/store/authStore'
import {
  useCoupleStatus,
  useLeaveCouple,
} from '@/features/couple/hooks/useCouple'
import {
  useCoupleProfiles,
  useDeleteAccount,
} from '@/features/profile/hooks/useProfile'
import { profileLabel } from '@/features/profile/api/profileApi'

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
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)
  const { data: coupleProfiles } = useCoupleProfiles()
  const partnerLabel = profileLabel(coupleProfiles?.partner, 'your partner')
  const { data: coupleStatus } = useCoupleStatus()
  const leaveCouple = useLeaveCouple()
  const deleteAccount = useDeleteAccount()

  const [deleteConfirmInput, setDeleteConfirmInput] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const inCouple = coupleStatus?.inCouple ?? false

  async function handleDeleteAccount() {
    setDeleteError(null)
    try {
      await deleteAccount.mutateAsync()
      await logout()
      navigate('/login', { replace: true })
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : 'Failed to delete account.'
      )
    }
  }

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

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <ThemePicker />
        </CardContent>
      </Card>

      <Card className="divide-y divide-line overflow-hidden">
        {inCouple ? (
          <SettingsRow
            icon={UserX}
            label={`Leave partner (${partnerLabel})`}
            onClick={() => leaveCouple.mutate()}
          />
        ) : (
          <SettingsRow
            icon={UserPlus}
            label="Connect a partner"
            to="/connect"
          />
        )}

        <SettingsRow
          icon={Bell}
          label="Notifications"
          trailing={<Badge variant="outline">coming soon</Badge>}
        />

        <SettingsRow icon={LogOut} label="Log out" onClick={() => logout()} />
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-lg text-destructive">
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Dialog
            open={deleteDialogOpen}
            onOpenChange={(open) => {
              setDeleteDialogOpen(open)
              if (!open) {
                setDeleteConfirmInput('')
                setDeleteError(null)
              }
            }}
          >
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="destructive"
                disabled={!isSupabaseConfigured}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete your account?</DialogTitle>
                <DialogDescription>
                  This permanently deletes your account, profile, and any data
                  only you can see. Shared couple content (ratings, dates,
                  wishlist, etc.) stays visible to your partner. This cannot be
                  undone.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <p className="text-sm text-parchment">
                  Type <span className="font-mono text-destructive">DELETE</span>{' '}
                  to confirm.
                </p>
                <Input
                  value={deleteConfirmInput}
                  onChange={(e) => setDeleteConfirmInput(e.target.value)}
                  placeholder="DELETE"
                />
                {deleteError && (
                  <p className="text-sm text-destructive">{deleteError}</p>
                )}
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={
                    deleteConfirmInput !== 'DELETE' || deleteAccount.isPending
                  }
                  onClick={handleDeleteAccount}
                >
                  {deleteAccount.isPending
                    ? 'Deleting...'
                    : 'Permanently delete my account'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {!isSupabaseConfigured && (
            <p className="mt-2 text-xs text-muted-foreground">
              Unavailable in demo mode.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
