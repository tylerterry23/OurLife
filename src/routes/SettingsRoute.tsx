import { useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  Bell,
  ChevronRight,
  LogOut,
  Palette,
  User,
  UserPlus,
  UserX,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/store/authStore'
import { useProfileStore } from '@/store/profileStore'
import { useSettingsStore } from '@/store/settingsStore'

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
  const { displayNames, setDisplayNames } = useSettingsStore()
  const { isConnectedToPartner, setIsConnectedToPartner } = useProfileStore()
  const [showConnectForm, setShowConnectForm] = useState(false)
  const [partnerNameInput, setPartnerNameInput] = useState(
    displayNames.partner2
  )

  function handleConnect(e: FormEvent) {
    e.preventDefault()
    if (!partnerNameInput.trim()) return
    setDisplayNames({ partner2: partnerNameInput.trim() })
    setIsConnectedToPartner(true)
    setShowConnectForm(false)
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-medium text-parchment">
        Settings
      </h1>

      <Card className="divide-y divide-line overflow-hidden">
        <SettingsRow icon={User} label="Profile" to="/profile" />

        <SettingsRow
          icon={Palette}
          label="App Theme"
          trailing={<Badge variant="outline">coming soon</Badge>}
        />

        {isConnectedToPartner ? (
          <SettingsRow
            icon={UserX}
            label={`Leave partner (${displayNames.partner2})`}
            onClick={() => setIsConnectedToPartner(false)}
          />
        ) : (
          <div>
            <SettingsRow
              icon={UserPlus}
              label="Connect with partner"
              onClick={() => setShowConnectForm((v) => !v)}
            />
            {showConnectForm && (
              <form
                onSubmit={handleConnect}
                className="flex items-center gap-2 border-t border-line px-4 py-3"
              >
                <Input
                  value={partnerNameInput}
                  onChange={(e) => setPartnerNameInput(e.target.value)}
                  placeholder="Partner's name"
                  className="h-9"
                />
                <Button type="submit" size="sm">
                  Connect
                </Button>
              </form>
            )}
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
