import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { Printer } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { signInWithGoogle, signInWithPassword, signUpWithPassword } from '@/services/authService'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Pill } from '@/components/ui/Pill'

export default function LoginPage() {
  const { session, loading } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  if (!loading && session) return <Navigate to="/dashboard" replace />

  async function handleGoogle() {
    setError(null)
    setGoogleLoading(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed')
      setGoogleLoading(false)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      if (mode === 'signin') {
        await signInWithPassword(email, password)
      } else {
        await signUpWithPassword(email, password, fullName)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-4">
      <div className="mb-8 flex flex-col items-center gap-3">
        <span className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-r from-orange-500 to-amber-400 text-white shadow-lg shadow-orange-500/20">
          <Printer className="h-7 w-7" />
        </span>
        <h1 className="text-2xl font-bold text-slate-800">CampusPrint</h1>
        <p className="text-sm text-slate-400">Campus print orders, made simple</p>
      </div>

      <Card className="w-full max-w-sm p-6">
        <Button variant="secondary" fullWidth size="lg" onClick={handleGoogle} disabled={googleLoading}>
          <GoogleIcon />
          Continue with Google
        </Button>

        <p className="my-4 text-center text-xs text-slate-400">only @rajagiri.edu.in accounts are fully verified</p>

        <div className="mb-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-orange-100" />
          <span className="text-xs font-semibold text-slate-300">or</span>
          <div className="h-px flex-1 bg-orange-100" />
        </div>

        <div className="mb-4 flex justify-center gap-2">
          <Pill active={mode === 'signin'} onClick={() => setMode('signin')} type="button">
            Sign in
          </Pill>
          <Pill active={mode === 'signup'} onClick={() => setMode('signup')} type="button">
            Sign up
          </Pill>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === 'signup' && (
            <input
              type="text"
              required
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="rounded-2xl border border-orange-100 bg-white px-4 py-3 text-sm outline-none focus:border-orange-300"
            />
          )}
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-2xl border border-orange-100 bg-white px-4 py-3 text-sm outline-none focus:border-orange-300"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-2xl border border-orange-100 bg-white px-4 py-3 text-sm outline-none focus:border-orange-300"
          />

          {error && <p className="text-xs font-medium text-red-500">{error}</p>}

          <Button type="submit" size="lg" disabled={submitting}>
            {mode === 'signin' ? 'Sign in' : 'Create account'}
          </Button>
        </form>
      </Card>

      <p className="mt-6 max-w-sm text-center text-[11px] leading-relaxed text-slate-300">
        Prototype build for a Design Thinking course. Email/password sign-in accepts any address for
        testing convenience.
      </p>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}
