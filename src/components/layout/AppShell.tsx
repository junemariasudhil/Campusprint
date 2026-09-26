import type { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LogOut, Printer, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { signOut } from '@/services/authService'
import { cn } from '@/lib/utils'

export function AppShell({ children }: { children: ReactNode }) {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  async function handleSignOut() {
    await signOut()
    navigate('/login', { replace: true })
  }

  const initial = (profile?.full_name || profile?.email || '?').charAt(0).toUpperCase()

  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-20 border-b border-orange-100/60 bg-cream/90 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 text-white shadow-md shadow-orange-500/20">
              <Printer className="h-5 w-5" />
            </span>
            <span className="text-lg font-bold text-slate-800">CampusPrint</span>
          </Link>

          <nav className="flex items-center gap-1">
            {profile?.role === 'admin' && (
              <Link
                to="/admin"
                className={cn(
                  'flex items-center gap-1 rounded-2xl px-3 py-2 text-sm font-semibold transition-colors',
                  location.pathname === '/admin'
                    ? 'bg-orange-100 text-orange-700'
                    : 'text-slate-500 hover:bg-orange-50',
                )}
              >
                <ShieldCheck className="h-4 w-4" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            )}
            <span className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-700">
              {initial}
            </span>
            <button
              onClick={handleSignOut}
              className="flex h-9 w-9 items-center justify-center rounded-2xl text-slate-400 hover:bg-orange-50 hover:text-slate-600"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pb-16 pt-6">{children}</main>
    </div>
  )
}
