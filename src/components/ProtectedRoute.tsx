import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { FullPageSpinner } from '@/components/ui/Spinner'
import { roleHomePath } from '@/lib/roleRouting'
import type { Role } from '@/types'

export function ProtectedRoute({ children, roles }: { children: ReactNode; roles?: Role[] }) {
  const { session, profile, loading } = useAuth()

  if (loading) return <FullPageSpinner />
  if (!session) return <Navigate to="/login" replace />
  if (roles && profile && !roles.includes(profile.role)) {
    return <Navigate to={roleHomePath(profile.role)} replace />
  }

  return <>{children}</>
}
