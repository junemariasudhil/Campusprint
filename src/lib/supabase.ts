import { createClient } from '@supabase/supabase-js'

const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

const supabaseUrl = rawSupabaseUrl?.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '')

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Copy .env.example to .env and fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
  )
}

// Demo mode: each browser TAB gets its own isolated auth session, so you can be
// signed in as a different user in every tab at once (e.g. 3 students + 1 print
// shop operator side by side). This trades away "stay signed in after closing the
// tab" for that isolation — fine for a live demo, not what you want in production.
// Toggle with VITE_DEMO_MULTI_TAB_SESSIONS=true in .env.
const demoMultiTabSessions = import.meta.env.VITE_DEMO_MULTI_TAB_SESSIONS === 'true'

function getTabId(): string {
  const key = 'campusprint-tab-id'
  let id = window.sessionStorage.getItem(key)
  if (!id) {
    id = crypto.randomUUID()
    window.sessionStorage.setItem(key, id)
  }
  return id
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: demoMultiTabSessions
    ? {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.sessionStorage,
        // A unique key per tab means each tab also gets its own auth broadcast
        // channel, so signing in on one tab can't override another tab's session.
        storageKey: `sb-campusprint-${getTabId()}-auth-token`,
      }
    : undefined,
})

export const PRINT_DOCUMENTS_BUCKET = 'print-documents'
