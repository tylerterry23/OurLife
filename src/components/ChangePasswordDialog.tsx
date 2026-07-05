import { useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/store/authStore'

const MIN_PASSWORD_LENGTH = 6

export function ChangePasswordDialog({
  trigger,
}: {
  trigger: React.ReactNode
}) {
  const updatePassword = useAuthStore((s) => s.updatePassword)
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  function reset() {
    setPassword('')
    setConfirmPassword('')
    setError(null)
    setDone(false)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setIsSubmitting(true)
    try {
      await updatePassword(password)
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) reset()
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change password</DialogTitle>
        </DialogHeader>
        {done ? (
          <p className="text-sm text-gold">Password updated.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={MIN_PASSWORD_LENGTH}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">Confirm new password</Label>
              <Input
                id="confirmNewPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={MIN_PASSWORD_LENGTH}
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Updating...' : 'Update password'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
