import { useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Clock, Heart, ImagePlus, Pencil, Settings } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { timeAgo } from '@/lib/utils'
import {
  useCoupleStatus,
  useSetRelationshipStatus,
} from '@/features/couple/hooks/useCouple'
import {
  relationshipStatusLabels,
  relationshipStatusOptions,
  type RelationshipStatus,
} from '@/features/couple/types'
import {
  useCoupleProfiles,
  useMyProfile,
  useRemoveAvatar,
  useUpdateProfile,
  useUploadAvatar,
} from '@/features/profile/hooks/useProfile'
import { useRecentActivity } from '@/features/profile/hooks/useRecentActivity'
import { isUsernameAvailable, profileLabel } from '@/features/profile/api/profileApi'

function memberSinceLabel(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  })
}

interface EditProfileDialogProps {
  initialDisplayName: string
  initialUsername: string
  inCouple: boolean
  relationshipStatus: RelationshipStatus | null
  coupleId: string | null
}

function EditProfileDialog({
  initialDisplayName,
  initialUsername,
  inCouple,
  relationshipStatus,
  coupleId,
}: EditProfileDialogProps) {
  const updateProfile = useUpdateProfile()
  const setStatus = useSetRelationshipStatus()

  const [open, setOpen] = useState(false)
  const [displayNameInput, setDisplayNameInput] = useState(initialDisplayName)
  const [usernameInput, setUsernameInput] = useState(initialUsername)
  const [statusInput, setStatusInput] = useState<RelationshipStatus>(
    relationshipStatus ?? 'dating'
  )
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!displayNameInput.trim()) return

    const nextUsername = usernameInput.trim()
    try {
      if (nextUsername && nextUsername !== initialUsername) {
        const available = await isUsernameAvailable(nextUsername)
        if (!available) {
          setError('That username is already taken.')
          return
        }
      }

      await updateProfile.mutateAsync({
        displayName: displayNameInput.trim(),
        username: nextUsername || null,
      })

      if (inCouple && coupleId && statusInput !== relationshipStatus) {
        await setStatus.mutateAsync({ coupleId, status: statusInput })
      }

      setOpen(false)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not save your profile.'
      )
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) {
          setDisplayNameInput(initialDisplayName)
          setUsernameInput(initialUsername)
          setStatusInput(relationshipStatus ?? 'dating')
          setError(null)
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Pencil className="h-3.5 w-3.5" />
          Edit profile
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display name</Label>
            <Input
              id="displayName"
              value={displayNameInput}
              onChange={(e) => setDisplayNameInput(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={usernameInput}
              onChange={(e) =>
                setUsernameInput(e.target.value.replace(/\s+/g, '').toLowerCase())
              }
            />
          </div>
          {inCouple && (
            <div className="space-y-2">
              <Label htmlFor="status">Relationship status</Label>
              <select
                id="status"
                value={statusInput}
                onChange={(e) =>
                  setStatusInput(e.target.value as RelationshipStatus)
                }
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {relationshipStatusOptions.map((option) => (
                  <option key={option} value={option} className="bg-card">
                    {relationshipStatusLabels[option]}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Shared with your partner.
              </p>
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button
            type="submit"
            className="w-full"
            disabled={updateProfile.isPending || setStatus.isPending}
          >
            {updateProfile.isPending || setStatus.isPending
              ? 'Saving...'
              : 'Save changes'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function ProfileRoute() {
  const { data: profile } = useMyProfile()
  const { data: coupleProfiles } = useCoupleProfiles()
  const { data: coupleStatus } = useCoupleStatus()
  const uploadAvatar = useUploadAvatar()
  const removeAvatar = useRemoveAvatar()
  const { items: activity, isLoading: activityLoading } = useRecentActivity()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const partnerLabel = coupleProfiles?.partner
    ? profileLabel(coupleProfiles.partner, 'Partner')
    : null
  const displayName = profile?.displayName || 'Unnamed'
  const inCouple = coupleStatus?.inCouple ?? false
  const status = coupleStatus?.relationshipStatus

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) uploadAvatar.mutate(file)
    e.target.value = ''
  }

  const header = (
    <div className="flex items-center justify-between">
      <h1 className="font-display text-3xl font-medium text-parchment">
        Profile
      </h1>
      <Button variant="ghost" size="icon" aria-label="Settings" asChild>
        <Link to="/profile/settings">
          <Settings className="h-5 w-5" />
        </Link>
      </Button>
    </div>
  )

  if (profile === undefined || coupleStatus === undefined) {
    return (
      <div className="space-y-6">
        {header}
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {header}

      <Card>
        <CardContent className="flex flex-col items-center gap-3 pt-6 text-center">
          <div className="relative">
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt=""
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-wine font-display text-3xl text-parchment">
                {displayName.charAt(0).toUpperCase() || '?'}
              </div>
            )}
            <button
              type="button"
              aria-label="Change profile picture"
              disabled={uploadAvatar.isPending}
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-line bg-ink-raised text-parchment-dim transition-colors hover:text-parchment disabled:opacity-70"
            >
              <ImagePlus className="h-3.5 w-3.5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          {profile?.avatarUrl && (
            <button
              type="button"
              onClick={() => removeAvatar.mutate()}
              disabled={removeAvatar.isPending}
              className="text-xs text-muted-foreground underline underline-offset-4 hover:text-parchment"
            >
              Remove photo
            </button>
          )}

          <div>
            <p className="font-display text-2xl text-parchment">
              {displayName}
            </p>
            <p className="text-sm text-muted-foreground">
              @{profile?.username || 'username'}
            </p>
          </div>

          {inCouple && status ? (
            <p className="flex items-center gap-1.5 text-sm text-gold">
              <Heart className="h-4 w-4" />
              {relationshipStatusLabels[status]}
              {partnerLabel && ` with ${partnerLabel}`}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Not connected with a partner yet.
            </p>
          )}

          {profile?.createdAt && (
            <p className="text-xs text-muted-foreground">
              Member since {memberSinceLabel(profile.createdAt)}
            </p>
          )}

          <EditProfileDialog
            initialDisplayName={profile?.displayName ?? ''}
            initialUsername={profile?.username ?? ''}
            inCouple={inCouple}
            relationshipStatus={coupleStatus?.relationshipStatus ?? null}
            coupleId={coupleStatus?.coupleId ?? null}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2 space-y-0">
          <Clock className="h-5 w-5 text-gold" />
          <CardTitle className="text-xl">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {activityLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : activity.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nothing yet — start adding dates, ratings, or wishlist items.
            </p>
          ) : (
            <ul className="space-y-3">
              {activity.map((item) => (
                <li key={item.id}>
                  <Link
                    to={item.to}
                    className="flex items-start gap-3 rounded-md transition-colors hover:text-parchment"
                  >
                    <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                    <span className="min-w-0 flex-1 text-sm text-parchment/90">
                      {item.text}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {timeAgo(item.createdAt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
