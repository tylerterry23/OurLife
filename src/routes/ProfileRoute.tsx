import { useState, type FormEvent } from 'react'
import { LogOut, Palette } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/store/authStore'
import { useSettingsStore } from '@/store/settingsStore'

export function ProfileRoute() {
  const { user, logout } = useAuthStore()
  const { displayNames, setDisplayNames } = useSettingsStore()
  const [partner1, setPartner1] = useState(displayNames.partner1)
  const [partner2, setPartner2] = useState(displayNames.partner2)
  const [saved, setSaved] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!partner1.trim() || !partner2.trim()) return
    setDisplayNames({ partner1: partner1.trim(), partner2: partner2.trim() })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-medium text-parchment">
        Profile
      </h1>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-xl">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Signed in as{' '}
            <span className="text-parchment">{user?.email ?? 'unknown'}</span>
          </p>
          <Button variant="outline" onClick={() => logout()} className="gap-2">
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Display names</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="partner1">Partner A</Label>
                <Input
                  id="partner1"
                  value={partner1}
                  onChange={(e) => setPartner1(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partner2">Partner B</Label>
                <Input
                  id="partner2"
                  value={partner2}
                  onChange={(e) => setPartner2(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button type="submit">{saved ? 'Saved' : 'Save'}</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="opacity-60">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-gold" />
            <CardTitle className="text-xl">Appearance</CardTitle>
          </div>
          <Badge variant="outline">coming soon</Badge>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Theme options will live here — for now OurLife only ships the one
            look.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
