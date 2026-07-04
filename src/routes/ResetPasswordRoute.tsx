import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient'
import { useAuthStore } from '@/store/authStore'

const MIN_PASSWORD_LENGTH = 6

export function ResetPasswordRoute() {
  const navigate = useNavigate()
  const updatePassword = useAuthStore((s) => s.updatePassword)
  // In demo mode there's no recovery session to wait for, so start ready.
  const [ready, setReady] = useState(!isSupabaseConfigured)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  // Following the reset link establishes a temporary recovery session
  // (detectSessionInUrl exchanges the code). Wait for it before allowing
  // a password change so updateUser has an authenticated session.
  useEffect(() => {
    if (!isSupabaseConfigured) return
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setReady(true)
      }
    })
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
    })
    return () => data.subscription.unsubscribe()
  }, [])

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
      setTimeout(() => navigate('/', { replace: true }), 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="font-display text-4xl italic text-parchment">
            Choose a new password
          </h1>
          {!ready && (
            <p className="mt-1 text-sm text-muted-foreground">
              Verifying your reset link...
            </p>
          )}
        </div>

        {done ? (
          <p className="text-center text-sm text-gold">
            Password updated. Taking you in...
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={MIN_PASSWORD_LENGTH}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={MIN_PASSWORD_LENGTH}
                required
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              type="submit"
              disabled={isSubmitting || !ready}
              className="w-full"
            >
              {isSubmitting ? 'Updating...' : 'Update password'}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
