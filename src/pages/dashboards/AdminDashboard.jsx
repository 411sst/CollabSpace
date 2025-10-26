import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Users, BarChart3, Settings, LogOut, Home } from 'lucide-react'
import toast from 'react-hot-toast'

const AdminDashboard = () => {
  const { profile, signOut } = useAuthStore()
  const location = useLocation()

  const handleSignOut = async () => {
    const { error } = await signOut()
    if (!error) {
      toast.success('Signed out successfully')
    }
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: Home },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gradient-dark flex">
      {/* Sidebar */}
      <aside className="w-64 bg-dark-lighter border-r border-gray-800 p-6">
        <h1 className="text-2xl font-bold text-gradient mb-8">CollabSpace</h1>

        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary border-l-4 border-primary'
                    : 'text-gray-400 hover:bg-dark/50 hover:text-gray-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto pt-8 border-t border-gray-800">
          <div className="mb-4">
            <p className="text-sm text-gray-500">Signed in as</p>
            <p className="text-gray-200 font-medium">{profile?.firstName} {profile?.lastName}</p>
            <span className="badge-primary mt-2">Admin</span>
          </div>
          <button
            onClick={handleSignOut}
            className="btn-ghost w-full flex items-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 custom-scrollbar overflow-y-auto">
        <Routes>
          <Route index element={<AdminHome />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="settings" element={<AdminSettings />} />
        </Routes>
      </main>
    </div>
  )
}

// Placeholder components
const AdminHome = () => (
  <div>
    <h1 className="section-heading">Admin Dashboard</h1>
    <div className="grid md:grid-cols-3 gap-6">
      <div className="card-hover">
        <h3 className="text-lg font-semibold mb-2 text-primary">Total Users</h3>
        <p className="text-3xl font-bold">1,234</p>
        <p className="text-sm text-gray-400 mt-2">+12% from last month</p>
      </div>
      <div className="card-hover">
        <h3 className="text-lg font-semibold mb-2 text-secondary">Active Assignments</h3>
        <p className="text-3xl font-bold">56</p>
        <p className="text-sm text-gray-400 mt-2">Across all classes</p>
      </div>
      <div className="card-hover">
        <h3 className="text-lg font-semibold mb-2 text-primary">Teams Formed</h3>
        <p className="text-3xl font-bold">189</p>
        <p className="text-sm text-gray-400 mt-2">This semester</p>
      </div>
    </div>
    <div className="card mt-6">
      <h2 className="text-xl font-bold mb-4">Coming Soon</h2>
      <p className="text-gray-400">Full admin features including user management, system analytics, and configuration are being built.</p>
    </div>
  </div>
)

const AdminUsers = () => (
  <div>
    <h1 className="section-heading">User Management</h1>
    <div className="card">
      <p className="text-gray-400">User management interface coming soon...</p>
    </div>
  </div>
)

const AdminAnalytics = () => (
  <div>
    <h1 className="section-heading">System Analytics</h1>
    <div className="card">
      <p className="text-gray-400">Analytics dashboard coming soon...</p>
    </div>
  </div>
)

const AdminSettings = () => (
  <div>
    <h1 className="section-heading">System Settings</h1>
    <div className="card">
      <p className="text-gray-400">Settings interface coming soon...</p>
    </div>
  </div>
)

export default AdminDashboard
