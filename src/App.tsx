import type { ReactNode } from 'react'
import { MutationCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Navigate, Route, BrowserRouter, Routes } from 'react-router-dom'
import { Toaster, toast } from 'sonner'

import { AppShell } from '@/components/layout/AppShell'
import { useAuthStore } from '@/store/authStore'
import { DatesRoute } from '@/routes/DatesRoute'
import { GamesRoute } from '@/routes/GamesRoute'
import { ConnectRoute } from '@/routes/ConnectRoute'
import { ExploreRoute } from '@/routes/ExploreRoute'
import { ForgotPasswordRoute } from '@/routes/ForgotPasswordRoute'
import { HomeRoute } from '@/routes/HomeRoute'
import { JoinRoute } from '@/routes/JoinRoute'
import { LoginRoute } from '@/routes/LoginRoute'
import { ResetPasswordRoute } from '@/routes/ResetPasswordRoute'
import { ProfileRoute } from '@/routes/ProfileRoute'
import { QuizRoute } from '@/routes/QuizRoute'
import { RatingsRoute } from '@/routes/RatingsRoute'
import { SettingsRoute } from '@/routes/SettingsRoute'
import { SignupRoute } from '@/routes/SignupRoute'
import { SpinWheelRoute } from '@/routes/SpinWheelRoute'
import { WishlistRoute } from '@/routes/WishlistRoute'

// Global safety net: without this, a failed mutation (offline, a dropped
// connection, an RLS edge case) does nothing visible — the UI just sits
// there and the user has no idea whether their save went through. This
// covers every mutation in the app in one place instead of needing an
// onError handler at each of the ~30 call sites.
const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Something went wrong.'
      )
    },
  }),
})

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-ink text-muted-foreground">
        Loading...
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster
        position="top-center"
        richColors={false}
        toastOptions={{
          classNames: {
            toast:
              '!bg-card !text-foreground !border !border-line !shadow-lg !rounded-lg',
            title: '!font-sans',
            error: '!text-destructive',
            success: '!text-gold',
          },
        }}
      />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/signup" element={<SignupRoute />} />
          <Route path="/forgot-password" element={<ForgotPasswordRoute />} />
          <Route path="/reset-password" element={<ResetPasswordRoute />} />
          <Route path="/join/:code" element={<JoinRoute />} />
          <Route
            element={
              <RequireAuth>
                <AppShell />
              </RequireAuth>
            }
          >
            <Route path="/" element={<HomeRoute />} />
            <Route path="/connect" element={<ConnectRoute />} />
            <Route path="/modules" element={<ExploreRoute />} />
            <Route path="/modules/dates" element={<DatesRoute />} />
            <Route path="/modules/quiz" element={<QuizRoute />} />
            <Route path="/modules/ratings" element={<RatingsRoute />} />
            <Route path="/modules/wishlist" element={<WishlistRoute />} />
            <Route path="/modules/games" element={<GamesRoute />} />
            <Route path="/modules/games/wheel" element={<SpinWheelRoute />} />
            <Route path="/profile" element={<ProfileRoute />} />
            <Route path="/profile/settings" element={<SettingsRoute />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
