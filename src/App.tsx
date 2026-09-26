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
  const { session, profile, loading } = useAuth()

  if (loading) return <FullPageSpinner />
  if (!session) return <Navigate to="/login" replace />
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
