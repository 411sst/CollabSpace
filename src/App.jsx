import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'

// Pages
import Landing from './pages/Landing'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'

// Dashboards
import AdminDashboard from './pages/dashboards/AdminDashboard'
import TeacherDashboard from './pages/dashboards/TeacherDashboard'
import StudentDashboard from './pages/dashboards/StudentDashboard'

// Protected Route Component
import ProtectedRoute from './components/ProtectedRoute'

// Loading Component
const LoadingScreen = () => (
  <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
    <div className="text-center">
      <div className="spinner w-16 h-16 mx-auto mb-4"></div>
      <h2 className="text-2xl font-bold text-gradient">CollabSpace</h2>
      <p className="text-gray-400 mt-2">Loading...</p>
    </div>
  </div>
)

function App() {
  const { initialize, loading } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          className: '',
          style: {
            background: '#2D1F2B',
            color: '#ADEDFF',
            border: '1px solid #ADEDFF33',
          },
          success: {
            iconTheme: {
              primary: '#ADEDFF',
              secondary: '#1B0E1A',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#1B0E1A',
            },
          },
        }}
      />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/reset-password" element={<ResetPassword />} />

        {/* Protected Routes - Admin */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Teacher */}
        <Route
          path="/teacher/*"
          element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Student */}
        <Route
          path="/student/*"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
