import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Navigate, Route, BrowserRouter, Routes } from 'react-router-dom'

import { AppShell } from '@/components/layout/AppShell'
import { useAuthStore } from '@/store/authStore'
import { DatesRoute } from '@/routes/DatesRoute'
import { GamesRoute } from '@/routes/GamesRoute'
import { HomeRoute } from '@/routes/HomeRoute'
import { LoginRoute } from '@/routes/LoginRoute'
import { ModulesRoute } from '@/routes/ModulesRoute'
import { PlacesRoute } from '@/routes/PlacesRoute'
import { ProfileRoute } from '@/routes/ProfileRoute'
import { QuizRoute } from '@/routes/QuizRoute'
import { RatingsRoute } from '@/routes/RatingsRoute'
import { SettingsRoute } from '@/routes/SettingsRoute'
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
          <Route
            element={
              <RequireAuth>
                <AppShell />
              </RequireAuth>
            }
          >
            <Route path="/" element={<HomeRoute />} />
            <Route path="/modules" element={<ModulesRoute />} />
            <Route path="/dates" element={<DatesRoute />} />
            <Route path="/quiz" element={<QuizRoute />} />
            <Route path="/places" element={<PlacesRoute />} />
            <Route path="/ratings" element={<RatingsRoute />} />
            <Route path="/wishlist" element={<WishlistRoute />} />
            <Route path="/games" element={<GamesRoute />} />
            <Route path="/profile" element={<ProfileRoute />} />
            <Route path="/settings" element={<SettingsRoute />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
