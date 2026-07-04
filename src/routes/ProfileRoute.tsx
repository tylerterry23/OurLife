import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Activity, Heart, ImagePlus, Settings, Upload } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSettingsStore } from '@/store/settingsStore'
import {
  relationshipStatusLabels,
  useProfileStore,
  type RelationshipStatus,
} from '@/store/profileStore'
import { useCoupleStatus } from '@/features/couple/hooks/useCouple'

const statusOptions = Object.keys(
  relationshipStatusLabels
) as RelationshipStatus[]

export function ProfileRoute() {
  const { displayNames, setDisplayNames } = useSettingsStore()
  const { username, status, setUsername, setStatus } = useProfileStore()
  const { data: coupleStatus } = useCoupleStatus()

  const [usernameInput, setUsernameInput] = useState(username)
  const [displayNameInput, setDisplayNameInput] = useState(
    displayNames.partner1
  )
  const [saved, setSaved] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!usernameInput.trim() || !displayNameInput.trim()) return
    setUsername(usernameInput.trim())
    setDisplayNames({ partner1: displayNameInput.trim() })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-medium text-parchment">
          Profile
        </h1>
        <Button variant="ghost" size="icon" aria-label="Settings" asChild>
          <Link to="/settings">
            <Settings className="h-5 w-5" />
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-wine font-display text-3xl text-parchment">
              {displayNameInput.charAt(0).toUpperCase() || '?'}
            </div>
            <button
              type="button"
              aria-label="Change profile picture (coming soon)"
              disabled
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-line bg-ink-raised text-parchment-dim disabled:opacity-70"
            >
              <ImagePlus className="h-3.5 w-3.5" />
            </button>
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
            {relationshipStatusLabels[status]}
            {coupleStatus?.inCouple && ` with ${displayNames.partner2}`}
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
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as RelationshipStatus)
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
            <Button type="submit">{saved ? 'Saved' : 'Save'}</Button>
          </form>
        </CardContent>
      </Card>

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
