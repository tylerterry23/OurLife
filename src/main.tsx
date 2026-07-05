import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'

import './lib/fonts'
import './lib/theme'
import './index.css'
import App from './App.tsx'
import { useAuthStore } from './store/authStore'

// Restore any existing Supabase session before the app renders, so
// RequireAuth doesn't flash the login screen for an already-signed-in user.
await useAuthStore.getState().initSession()

// Registers the PWA service worker for offline caching / installability.
//
// NOT wired up: real push notifications. That needs a `push_subscriptions`
// table, VAPID keys generated server-side, and a delivery mechanism (e.g. a
// Supabase Edge Function calling the Web Push API) — none of which exist
// yet. Revisit once Tyler & Lauren are actually using this day to day.
registerSW({ immediate: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
