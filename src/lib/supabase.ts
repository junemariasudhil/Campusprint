import { createClient } from '@supabase/supabase-js'

const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

const supabaseUrl = rawSupabaseUrl?.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '')

// IMPORTANT: this used to `throw` here at module scope. That crashed the entire
// React tree before it ever mounted (no component gets a chance to catch a throw
// during module import), which is what produced the blank/"broken" screen when
// .env was missing, misnamed, or added after `npm run dev` was already running
// (Vite only reads .env files at dev-server start — you must restart `npm run dev`
// after creating or editing .env). We now surface this as data instead of an
// uncaught exception, so main.tsx can render a real, readable error screen.
export const supabaseConfigError: string | null =
  !supabaseUrl || !supabaseAnonKey
    ? 'Missing Supabase environment variables. Copy .env.example to .env, fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from Project Settings → API, and restart `npm run dev` (Vite only loads .env at startup).'
    : null

// A dummy-but-valid-shaped URL so createClient() below never itself throws when
// config is missing — the app will show the config error screen before any of
// this is actually used.
const safeUrl = supabaseUrl || 'https://placeholder.supabase.co'
const safeKey = supabaseAnonKey || 'placeholder-anon-key'

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

export const supabase = createClient(safeUrl, safeKey, {
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
