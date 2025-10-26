import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Home, Briefcase, Users, MessageSquare, LogOut } from 'lucide-react'
import toast from 'react-hot-toast'

const StudentDashboard = () => {
  const { profile, signOut } = useAuthStore()
  const location = useLocation()

  const handleSignOut = async () => {
    const { error } = await signOut()
    if (!error) {
      toast.success('Signed out successfully')
    }
  }

  const navigation = [
    { name: 'Dashboard', href: '/student', icon: Home },
    { name: 'Assignments', href: '/student/assignments', icon: Briefcase },
    { name: 'My Teams', href: '/student/teams', icon: Users },
    { name: 'Chat', href: '/student/chat', icon: MessageSquare },
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
            <span className="badge-primary mt-2">Student</span>
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
          <Route index element={<StudentHome />} />
          <Route path="assignments" element={<StudentAssignments />} />
          <Route path="teams" element={<StudentTeams />} />
          <Route path="chat" element={<StudentChat />} />
        </Routes>
      </main>
    </div>
  )
}

// Placeholder components
const StudentHome = () => (
  <div>
    <h1 className="section-heading">Student Dashboard</h1>
    <div className="grid md:grid-cols-3 gap-6">
      <div className="card-hover">
        <h3 className="text-lg font-semibold mb-2 text-primary">Active Assignments</h3>
        <p className="text-3xl font-bold">5</p>
        <p className="text-sm text-gray-400 mt-2">2 due this week</p>
      </div>
      <div className="card-hover">
        <h3 className="text-lg font-semibold mb-2 text-secondary">My Teams</h3>
        <p className="text-3xl font-bold">3</p>
        <p className="text-sm text-gray-400 mt-2">All teams formed</p>
      </div>
      <div className="card-hover">
        <h3 className="text-lg font-semibold mb-2 text-primary">Pending Invites</h3>
        <p className="text-3xl font-bold">2</p>
        <p className="text-sm text-gray-400 mt-2">Respond soon</p>
      </div>
    </div>
    <div className="card mt-6">
      <h2 className="text-xl font-bold mb-4">Coming Soon</h2>
      <p className="text-gray-400">Full student features including assignment viewing, team formation, and real-time chat are being built.</p>
    </div>
  </div>
)

const StudentAssignments = () => (
  <div>
    <h1 className="section-heading">My Assignments</h1>
    <div className="card">
      <p className="text-gray-400">Assignment list coming soon...</p>
    </div>
  </div>
)

const StudentTeams = () => (
  <div>
    <h1 className="section-heading">My Teams</h1>
    <div className="card">
      <p className="text-gray-400">Team management interface coming soon...</p>
    </div>
  </div>
)

const StudentChat = () => (
  <div>
    <h1 className="section-heading">Team Chat</h1>
    <div className="card">
      <p className="text-gray-400">Real-time chat coming soon...</p>
    </div>
  </div>
)

export default StudentDashboard
