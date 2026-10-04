import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { FullPageSpinner } from '@/components/ui/Spinner'
import { roleHomePath } from '@/lib/roleRouting'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import AdminPage from '@/pages/AdminPage'
import PrintShopPage from '@/pages/PrintShopPage'
import NewRequestPage from '@/pages/request-flow/NewRequestPage'

function RoleHome() {
  const { session, profile, profileError, loading } = useAuth()

  if (loading) return <FullPageSpinner />
  if (!session) return <Navigate to="/login" replace />
  // Previously, a failed profile fetch (RLS issue, dropped connection) left
  // `profile` as null and silently sent every role — including print_shop and
  // admin — to the default '/dashboard' route with no indication anything had
  // gone wrong. Showing the error here instead makes a real backend problem
  // look like a real backend problem, not a routing bug.
  if (profileError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-cream px-4 text-center">
        <p className="text-sm font-medium text-red-600">Couldn't load your profile: {profileError}</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-2xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
        >
          Retry
        </button>
      </div>
    )
  }
  return <Navigate to={roleHomePath(profile?.role)} replace />
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<RoleHome />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={['student', 'teacher']}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/new-request"
          element={
            <ProtectedRoute roles={['student', 'teacher']}>
              <NewRequestPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/print-shop"
          element={
            <ProtectedRoute roles={['print_shop']}>
              <PrintShopPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
