import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { fetchProfile } from '@/services/authService'
import type { Profile } from '@/types'

interface AuthContextValue {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
  /** Set when the profiles row couldn't be fetched — distinct from "no row yet". */
  profileError: string | null
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadProfile(userId: string) {
    try {
      const p = await fetchProfile(userId)
      setProfile(p)
      // A previous fetch may have failed (RLS hiccup, dropped connection, etc.)
      // and been silently swallowed into `profile = null`, which made
      // roleHomePath() fall back to the student `/dashboard` route even for a
      // print_shop account. Surfacing the error (instead of only logging it)
      // means that failure is now visible in the UI rather than looking like
      // "the app is ignoring my role change".
      setProfileError(null)
    } catch (err) {
      console.error('Failed to load profile for', userId, err)
      setProfile(null)
      setProfileError(err instanceof Error ? err.message : 'Failed to load your profile.')
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (data.session?.user) {
        loadProfile(data.session.user.id).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      if (newSession?.user) {
        loadProfile(newSession.user.id)
      } else {
        setProfile(null)
        setProfileError(null)
      }
    })

    return () => subscription.subscription.unsubscribe()
  }, [])

  // Re-fetch the profile whenever the tab regains focus. Without this, editing
  // `role` / `print_shop_id` directly in the Supabase table editor while a demo
  // browser tab is already signed in has no visible effect — the profile was
  // only ever fetched once, at sign-in, and nothing else in the app re-queries
  // it. This is almost certainly why role changes "did nothing": the fix
  // wasn't wrong routing logic, it was a stale in-memory profile that only a
  // full reload (or, now, a tab focus) would refresh.
  useEffect(() => {
    function onVisible() {
      if (document.visibilityState === 'visible' && session?.user) {
        loadProfile(session.user.id)
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [session])

  const value: AuthContextValue = {
    session,
    user: session?.user ?? null,
    profile,
    profileError,
    loading,
    refreshProfile: async () => {
      if (session?.user) await loadProfile(session.user.id)
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
