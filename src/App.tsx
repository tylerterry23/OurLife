import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Navigate, Route, BrowserRouter, Routes } from 'react-router-dom'

import { AppShell } from '@/components/layout/AppShell'
import { useAuthStore } from '@/store/authStore'
import { DatesRoute } from '@/routes/DatesRoute'
import { GamesRoute } from '@/routes/GamesRoute'
import { ConnectRoute } from '@/routes/ConnectRoute'
import { ForgotPasswordRoute } from '@/routes/ForgotPasswordRoute'
import { HomeRoute } from '@/routes/HomeRoute'
import { JoinRoute } from '@/routes/JoinRoute'
import { LoginRoute } from '@/routes/LoginRoute'
import { ResetPasswordRoute } from '@/routes/ResetPasswordRoute'
import { ModulesRoute } from '@/routes/ModulesRoute'
import { PlacesRoute } from '@/routes/PlacesRoute'
import { ProfileRoute } from '@/routes/ProfileRoute'
import { QuizRoute } from '@/routes/QuizRoute'
import { RatingsRoute } from '@/routes/RatingsRoute'
import { SettingsRoute } from '@/routes/SettingsRoute'
import { SignupRoute } from '@/routes/SignupRoute'
import { WishlistRoute } from '@/routes/WishlistRoute'

const queryClient = new QueryClient()

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
            <Route path="/modules" element={<ModulesRoute />} />
            <Route path="/modules/dates" element={<DatesRoute />} />
            <Route path="/modules/quiz" element={<QuizRoute />} />
            <Route path="/modules/places" element={<PlacesRoute />} />
            <Route path="/modules/ratings" element={<RatingsRoute />} />
            <Route path="/modules/wishlist" element={<WishlistRoute />} />
            <Route path="/modules/games" element={<GamesRoute />} />
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
