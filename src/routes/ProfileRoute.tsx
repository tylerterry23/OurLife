import { useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Activity, Heart, ImagePlus, Settings, Upload } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  useUpdateProfile,
  useUploadAvatar,
} from '@/features/profile/hooks/useProfile'
import { isUsernameAvailable, profileLabel } from '@/features/profile/api/profileApi'

interface ProfileEditorProps {
  initialDisplayName: string
  initialUsername: string
  avatarUrl: string | null | undefined
  partnerLabel: string | null
  inCouple: boolean
  relationshipStatus: RelationshipStatus | null
  coupleId: string | null
}

function ProfileEditor({
  initialDisplayName,
  initialUsername,
  avatarUrl,
  partnerLabel,
  inCouple,
  relationshipStatus,
  coupleId,
}: ProfileEditorProps) {
  const updateProfile = useUpdateProfile()
  const uploadAvatar = useUploadAvatar()
  const setStatus = useSetRelationshipStatus()

  const [displayNameInput, setDisplayNameInput] = useState(initialDisplayName)
  const [usernameInput, setUsernameInput] = useState(initialUsername)
  const [statusInput, setStatusInput] = useState<RelationshipStatus>(
    relationshipStatus ?? 'dating'
  )
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const displayStatus = relationshipStatus ?? statusInput

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!displayNameInput.trim()) return

    const nextUsername = usernameInput.trim()
    try {
      // Only re-check availability if the username actually changed.
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

      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not save your profile.'
      )
    }
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) uploadAvatar.mutate(file)
    e.target.value = ''
  }

  return (
    <>
      <Card>
        <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
          <div className="relative">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-wine font-display text-3xl text-parchment">
                {displayNameInput.charAt(0).toUpperCase() || '?'}
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
          <div>
            <p className="font-display text-2xl text-parchment">
              {displayNameInput || 'Unnamed'}
            </p>
            <p className="text-sm text-muted-foreground">
              @{usernameInput || 'username'}
            </p>
          </div>
          {inCouple ? (
            <p className="flex items-center gap-1.5 text-sm text-gold">
              <Heart className="h-4 w-4" />
              {relationshipStatusLabels[displayStatus]}
              {partnerLabel && ` with ${partnerLabel}`}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Not connected with a partner yet.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Edit profile</CardTitle>
        </CardHeader>
        <CardContent>
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
                  setUsernameInput(
                    e.target.value.replace(/\s+/g, '').toLowerCase()
                  )
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
              disabled={updateProfile.isPending || setStatus.isPending}
            >
              {saved ? 'Saved' : 'Save'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  )
}

export function ProfileRoute() {
  const { data: profile } = useMyProfile()
  const { data: coupleProfiles } = useCoupleProfiles()
  const { data: coupleStatus } = useCoupleStatus()

  const partnerLabel = coupleProfiles?.partner
    ? profileLabel(coupleProfiles.partner, 'Partner')
    : null

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

  // Wait for the profile fetch to settle so the editor's initial local state
  // reflects loaded data rather than a flash of empty defaults.
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

      <ProfileEditor
        key={profile?.userId ?? 'me'}
        initialDisplayName={profile?.displayName ?? ''}
        initialUsername={profile?.username ?? ''}
        avatarUrl={profile?.avatarUrl}
        partnerLabel={partnerLabel}
        inCouple={coupleStatus?.inCouple ?? false}
        relationshipStatus={coupleStatus?.relationshipStatus ?? null}
        coupleId={coupleStatus?.coupleId ?? null}
      />

      <Card className="opacity-60">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-gold" />
            <CardTitle className="text-xl">My Uploads</CardTitle>
          </div>
          <Badge variant="outline">coming soon</Badge>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Photos and files you've added across OurLife will show up here.
          </p>
        </CardContent>
      </Card>

      <Card className="opacity-60">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-gold" />
            <CardTitle className="text-xl">Activity</CardTitle>
          </div>
          <Badge variant="outline">coming soon</Badge>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            A timeline of what you've added and answered will live here.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
