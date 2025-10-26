import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Home, Briefcase, Users, BarChart3, LogOut } from 'lucide-react'
import toast from 'react-hot-toast'

const TeacherDashboard = () => {
  const { profile, signOut } = useAuthStore()
  const location = useLocation()

  const handleSignOut = async () => {
    const { error } = await signOut()
    if (!error) {
      toast.success('Signed out successfully')
    }
  }

  const navigation = [
    { name: 'Dashboard', href: '/teacher', icon: Home },
    { name: 'Assignments', href: '/teacher/assignments', icon: Briefcase },
    { name: 'Teams', href: '/teacher/teams', icon: Users },
    { name: 'Analytics', href: '/teacher/analytics', icon: BarChart3 },
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
                    ? 'bg-secondary/10 text-secondary border-l-4 border-secondary'
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
            <span className="badge-secondary mt-2">Teacher</span>
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
          <Route index element={<TeacherHome />} />
          <Route path="assignments" element={<TeacherAssignments />} />
          <Route path="teams" element={<TeacherTeams />} />
          <Route path="analytics" element={<TeacherAnalytics />} />
        </Routes>
      </main>
    </div>
  )
}

// Placeholder components
const TeacherHome = () => (
  <div>
    <h1 className="section-heading">Teacher Dashboard</h1>
    <div className="grid md:grid-cols-3 gap-6">
      <div className="card-hover">
        <h3 className="text-lg font-semibold mb-2 text-secondary">Active Assignments</h3>
        <p className="text-3xl font-bold">8</p>
        <p className="text-sm text-gray-400 mt-2">Across 3 classes</p>
      </div>
      <div className="card-hover">
        <h3 className="text-lg font-semibold mb-2 text-primary">Teams Formed</h3>
        <p className="text-3xl font-bold">45</p>
        <p className="text-sm text-gray-400 mt-2">75% completion rate</p>
      </div>
      <div className="card-hover">
        <h3 className="text-lg font-semibold mb-2 text-secondary">Pending Submissions</h3>
        <p className="text-3xl font-bold">12</p>
        <p className="text-sm text-gray-400 mt-2">Due this week</p>
      </div>
    </div>
    <div className="card mt-6">
      <h2 className="text-xl font-bold mb-4">Coming Soon</h2>
      <p className="text-gray-400">Full teacher features including assignment creation, team monitoring, and student analytics are being built.</p>
    </div>
  </div>
)

const TeacherAssignments = () => (
  <div>
    <h1 className="section-heading">My Assignments</h1>
    <div className="card">
      <p className="text-gray-400">Assignment management interface coming soon...</p>
    </div>
  </div>
)

const TeacherTeams = () => (
  <div>
    <h1 className="section-heading">Student Teams</h1>
    <div className="card">
      <p className="text-gray-400">Team management interface coming soon...</p>
    </div>
  </div>
)

const TeacherAnalytics = () => (
  <div>
    <h1 className="section-heading">Class Analytics</h1>
    <div className="card">
      <p className="text-gray-400">Analytics dashboard coming soon...</p>
    </div>
  </div>
)

export default TeacherDashboard
