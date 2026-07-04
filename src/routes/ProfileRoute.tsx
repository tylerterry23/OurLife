import { useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Activity, Heart, ImagePlus, Settings, Upload } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { isSupabaseConfigured } from '@/lib/supabaseClient'
import { useSettingsStore } from '@/store/settingsStore'
import {
  relationshipStatusLabels,
  useProfileStore,
  type RelationshipStatus,
} from '@/store/profileStore'
import { useCoupleStatus } from '@/features/couple/hooks/useCouple'
import {
  useMyProfile,
  useUpdateProfile,
  useUploadAvatar,
} from '@/features/profile/hooks/useProfile'

const statusOptions = Object.keys(
  relationshipStatusLabels
) as RelationshipStatus[]

interface ProfileEditorProps {
  initialDisplayName: string
  initialUsername: string
  initialStatus: RelationshipStatus
  avatarUrl: string | null | undefined
  partnerLabel: string | null
  onSave: (values: {
    displayName: string
    username: string
    status: RelationshipStatus
  }) => Promise<void>
  onUploadAvatar?: (file: File) => void
  isSaving: boolean
  isUploadingAvatar: boolean
}

function ProfileEditor({
  initialDisplayName,
  initialUsername,
  initialStatus,
  avatarUrl,
  partnerLabel,
  onSave,
  onUploadAvatar,
  isSaving,
  isUploadingAvatar,
}: ProfileEditorProps) {
  const [displayNameInput, setDisplayNameInput] = useState(initialDisplayName)
  const [usernameInput, setUsernameInput] = useState(initialUsername)
  const [statusInput, setStatusInput] = useState(initialStatus)
  const [saved, setSaved] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!usernameInput.trim() || !displayNameInput.trim()) return
    await onSave({
      displayName: displayNameInput.trim(),
      username: usernameInput.trim(),
      status: statusInput,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) onUploadAvatar?.(file)
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
              aria-label={
                onUploadAvatar
                  ? 'Change profile picture'
                  : 'Change profile picture (unavailable in demo mode)'
              }
              disabled={!onUploadAvatar || isUploadingAvatar}
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
          <p className="flex items-center gap-1.5 text-sm text-gold">
            <Heart className="h-4 w-4" />
            {relationshipStatusLabels[statusInput]}
            {partnerLabel && ` with ${partnerLabel}`}
          </p>
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
                  setUsernameInput(e.target.value.replace(/\s+/g, ''))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={statusInput}
                onChange={(e) =>
                  setStatusInput(e.target.value as RelationshipStatus)
                }
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option} className="bg-card">
                    {relationshipStatusLabels[option]}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" disabled={isSaving}>
              {saved ? 'Saved' : 'Save'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  )
}

export function ProfileRoute() {
  const { displayNames, setDisplayNames } = useSettingsStore()
  const demoProfile = useProfileStore()
  const { data: coupleStatus } = useCoupleStatus()

  const { data: realProfile } = useMyProfile()
  const updateProfile = useUpdateProfile()
  const uploadAvatar = useUploadAvatar()

  const partnerLabel = coupleStatus?.inCouple ? displayNames.partner2 : null

  async function handleSave(values: {
    displayName: string
    username: string
    status: RelationshipStatus
  }) {
    if (isSupabaseConfigured) {
      await updateProfile.mutateAsync(values)
    } else {
      demoProfile.setUsername(values.username)
      demoProfile.setStatus(values.status)
      setDisplayNames({ partner1: values.displayName })
    }
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

  // Wait for the real profile fetch to settle before mounting the editor,
  // so its initial local state reflects loaded data instead of a flash of
  // empty defaults (and so we only need to key/remount it once).
  if (isSupabaseConfigured && realProfile === undefined) {
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
        key={isSupabaseConfigured ? 'real' : 'demo'}
        initialDisplayName={
          isSupabaseConfigured
            ? (realProfile?.displayName ?? '')
            : displayNames.partner1
        }
        initialUsername={
          isSupabaseConfigured
            ? (realProfile?.username ?? '')
            : demoProfile.username
        }
        initialStatus={
          isSupabaseConfigured
            ? ((realProfile?.status as RelationshipStatus) ?? 'dating')
            : demoProfile.status
        }
        avatarUrl={isSupabaseConfigured ? realProfile?.avatarUrl : null}
        partnerLabel={partnerLabel}
        onSave={handleSave}
        onUploadAvatar={
          isSupabaseConfigured
            ? (file) => uploadAvatar.mutate(file)
            : undefined
        }
        isSaving={updateProfile.isPending}
        isUploadingAvatar={uploadAvatar.isPending}
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
