import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, profile, loading } = useAuthStore()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="spinner w-16 h-16"></div>
      </div>
    )
  }

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requiredRole && profile?.role !== requiredRole) {
    // Redirect to appropriate dashboard if role doesn't match
    const redirectPath = profile?.role ? `/${profile.role}` : '/'
    return <Navigate to={redirectPath} replace />
  }

  return children
}

export default ProtectedRoute
