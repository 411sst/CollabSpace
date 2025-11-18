import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Users, BarChart3, Settings, LogOut, Home, Plus, Edit, Trash2, X, Loader2, Search, UserPlus, Shield, GraduationCap, BookOpen, Briefcase } from 'lucide-react'
import toast from 'react-hot-toast'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

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
            <p className="text-gray-200 font-medium">{profile?.first_name} {profile?.last_name}</p>
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

// Admin Home Dashboard
const AdminHome = () => {
  const { profile } = useAuthStore()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAssignments: 0,
    totalTeams: 0,
    usersByRole: { admin: 0, teacher: 0, student: 0 },
    recentUsers: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)

      // Fetch all data in parallel
      const [usersRes, assignmentsRes, teamsRes] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('assignments').select('id'),
        supabase.from('teams').select('id')
      ])

      if (usersRes.error) throw usersRes.error
      if (assignmentsRes.error) throw assignmentsRes.error
      if (teamsRes.error) throw teamsRes.error

      const users = usersRes.data || []
      const usersByRole = {
        admin: users.filter(u => u.role === 'admin').length,
        teacher: users.filter(u => u.role === 'teacher').length,
        student: users.filter(u => u.role === 'student').length
      }

      setStats({
        totalUsers: users.length,
        totalAssignments: assignmentsRes.data?.length || 0,
        totalTeams: teamsRes.data?.length || 0,
        usersByRole,
        recentUsers: users.slice(0, 5)
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
      toast.error('Failed to load dashboard statistics')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin': return 'badge-primary'
      case 'teacher': return 'badge-secondary'
      case 'student': return 'bg-blue-500/10 text-blue-400 px-2 py-1 rounded text-xs'
      default: return 'badge-primary'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="section-heading">Admin Dashboard</h1>
      <p className="text-gray-400 mb-6">Welcome back, {profile?.first_name}! Here's your system overview.</p>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="card-hover">
          <Users className="w-8 h-8 mb-3 text-primary" />
          <h3 className="text-lg font-semibold mb-2 text-gray-400">Total Users</h3>
          <p className="text-3xl font-bold text-primary">{stats.totalUsers}</p>
          <p className="text-sm text-gray-400 mt-2">Registered accounts</p>
        </div>
        <div className="card-hover">
          <Shield className="w-8 h-8 mb-3 text-primary" />
          <h3 className="text-lg font-semibold mb-2 text-gray-400">Admins</h3>
          <p className="text-3xl font-bold text-primary">{stats.usersByRole.admin}</p>
          <p className="text-sm text-gray-400 mt-2">System administrators</p>
        </div>
        <div className="card-hover">
          <GraduationCap className="w-8 h-8 mb-3 text-secondary" />
          <h3 className="text-lg font-semibold mb-2 text-gray-400">Teachers</h3>
          <p className="text-3xl font-bold text-secondary">{stats.usersByRole.teacher}</p>
          <p className="text-sm text-gray-400 mt-2">Creating assignments</p>
        </div>
        <div className="card-hover">
          <BookOpen className="w-8 h-8 mb-3 text-blue-400" />
          <h3 className="text-lg font-semibold mb-2 text-gray-400">Students</h3>
          <p className="text-3xl font-bold text-blue-400">{stats.usersByRole.student}</p>
          <p className="text-sm text-gray-400 mt-2">Active learners</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="card-hover">
          <Briefcase className="w-8 h-8 mb-3 text-secondary" />
          <h3 className="text-lg font-semibold mb-2 text-gray-400">Active Assignments</h3>
          <p className="text-4xl font-bold text-secondary">{stats.totalAssignments}</p>
          <p className="text-sm text-gray-400 mt-2">Across all teachers</p>
        </div>
        <div className="card-hover">
          <Users className="w-8 h-8 mb-3 text-primary" />
          <h3 className="text-lg font-semibold mb-2 text-gray-400">Teams Formed</h3>
          <p className="text-4xl font-bold text-primary">{stats.totalTeams}</p>
          <p className="text-sm text-gray-400 mt-2">Student collaborations</p>
        </div>
      </div>

      {stats.recentUsers.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4 text-gradient">Recent Users</h2>
          <div className="space-y-3">
            {stats.recentUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between bg-dark/30 p-3 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    {user.first_name?.[0]}{user.last_name?.[0]}
                  </div>
                  <div>
                    <p className="text-gray-300 font-medium">{user.first_name} {user.last_name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={getRoleBadgeClass(user.role)}>{user.role}</span>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(user.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.totalUsers === 0 && (
        <div className="card text-center py-12">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400 text-lg">No users registered yet</p>
          <p className="text-gray-500 text-sm mt-2">Users will appear here when they register</p>
        </div>
      )}
    </div>
  )
}

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role: 'student',
    student_id: '',
    section: ''
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateRole = async (userId, newRole) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error
      toast.success('User role updated successfully')
      fetchUsers()
    } catch (error) {
      console.error('Error updating role:', error)
      toast.error('Failed to update user role')
    }
  }

  const handleDeleteUser = async (userId, userEmail) => {
    if (!confirm(`Are you sure you want to delete user ${userEmail}? This action cannot be undone.`)) {
      return
    }

    try {
      // Use the PostgreSQL function for safe user deletion
      const { data, error } = await supabase
        .rpc('delete_user_safely', { user_id: userId })

      if (error) throw error

      // Check the function's response
      if (data && !data.success) {
        toast.error(data.error || 'Failed to delete user')
        return
      }

      toast.success('User deleted successfully')
      fetchUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error(error.message || 'Failed to delete user')
    }
  }

  const resetForm = () => {
    setFormData({
      email: '',
      first_name: '',
      last_name: '',
      role: 'student',
      student_id: '',
      section: ''
    })
    setEditingUser(null)
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.student_id?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = roleFilter === 'all' || user.role === roleFilter

    return matchesSearch && matchesRole
  })

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4" />
      case 'teacher': return <GraduationCap className="w-4 h-4" />
      case 'student': return <BookOpen className="w-4 h-4" />
      default: return null
    }
  }

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin': return 'badge-primary'
      case 'teacher': return 'badge-secondary'
      case 'student': return 'bg-blue-500/10 text-blue-400'
      default: return 'badge-primary'
    }
  }

  const userStats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    teachers: users.filter(u => u.role === 'teacher').length,
    students: users.filter(u => u.role === 'student').length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="section-heading">User Management</h1>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div className="card-hover text-center">
          <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
          <p className="text-2xl font-bold text-primary">{userStats.total}</p>
          <p className="text-sm text-gray-400">Total Users</p>
        </div>
        <div className="card-hover text-center">
          <Shield className="w-8 h-8 mx-auto mb-2 text-primary" />
          <p className="text-2xl font-bold text-primary">{userStats.admins}</p>
          <p className="text-sm text-gray-400">Admins</p>
        </div>
        <div className="card-hover text-center">
          <GraduationCap className="w-8 h-8 mx-auto mb-2 text-secondary" />
          <p className="text-2xl font-bold text-secondary">{userStats.teachers}</p>
          <p className="text-sm text-gray-400">Teachers</p>
        </div>
        <div className="card-hover text-center">
          <BookOpen className="w-8 h-8 mx-auto mb-2 text-blue-400" />
          <p className="text-2xl font-bold text-blue-400">{userStats.students}</p>
          <p className="text-sm text-gray-400">Students</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search users by name, email, or student ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field w-full pl-10"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="input-field md:w-48"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
          </select>
        </div>
      </div>

      {/* Users List */}
      {filteredUsers.length === 0 ? (
        <div className="card text-center py-12">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400 text-lg">No users found</p>
          <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">User</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Email</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Role</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Details</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Joined</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-800 hover:bg-dark/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        {user.first_name?.[0]}{user.last_name?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-200">{user.first_name} {user.last_name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-400">{user.email}</td>
                  <td className="py-3 px-4">
                    <select
                      value={user.role}
                      onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                      className={`badge ${getRoleBadgeClass(user.role)} cursor-pointer hover:opacity-80`}
                    >
                      <option value="admin">Admin</option>
                      <option value="teacher">Teacher</option>
                      <option value="student">Student</option>
                    </select>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-400">
                    {user.role === 'student' && user.student_id && (
                      <div>
                        <p>ID: {user.student_id}</p>
                        {user.section && <p>Section: {user.section}</p>}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-400">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDeleteUser(user.id, user.email)}
                      className="btn-ghost text-red-400 hover:bg-red-400/10 text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalAssignments: 0,
    totalTeams: 0,
    totalMessages: 0,
    usersByRole: { admin: 0, teacher: 0, student: 0 },
    recentActivity: [],
    popularAssignments: [],
    sectionDistribution: []
  })

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)

      // Fetch all data in parallel
      const [usersRes, assignmentsRes, teamsRes, messagesRes] = await Promise.all([
        supabase.from('profiles').select('role, section, created_at'),
        supabase.from('assignments').select(`
          *,
          teams (id),
          profiles!assignments_teacher_id_fkey (first_name, last_name)
        `),
        supabase.from('teams').select('*, team_members(id, status)'),
        supabase.from('chat_messages').select('created_at')
      ])

      if (usersRes.error) throw usersRes.error
      if (assignmentsRes.error) throw assignmentsRes.error
      if (teamsRes.error) throw teamsRes.error
      if (messagesRes.error) throw messagesRes.error

      const users = usersRes.data || []
      const assignments = assignmentsRes.data || []
      const teams = teamsRes.data || []
      const messages = messagesRes.data || []

      // Calculate statistics
      const usersByRole = {
        admin: users.filter(u => u.role === 'admin').length,
        teacher: users.filter(u => u.role === 'teacher').length,
        student: users.filter(u => u.role === 'student').length
      }

      // Popular assignments (most teams)
      const popularAssignments = assignments
        .map(a => ({
          title: a.title,
          teacher: `${a.profiles?.first_name} ${a.profiles?.last_name}`,
          teamCount: a.teams?.length || 0,
          sections: a.sections
        }))
        .sort((a, b) => b.teamCount - a.teamCount)
        .slice(0, 5)

      // Section distribution
      const sectionCounts = {}
      users
        .filter(u => u.role === 'student' && u.section)
        .forEach(u => {
          sectionCounts[u.section] = (sectionCounts[u.section] || 0) + 1
        })

      const sectionDistribution = Object.entries(sectionCounts)
        .map(([section, count]) => ({ section, count }))
        .sort((a, b) => b.count - a.count)

      // Recent activity (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const recentUsers = users.filter(u => new Date(u.created_at) > thirtyDaysAgo).length
      const recentMessages = messages.filter(m => new Date(m.created_at) > thirtyDaysAgo).length

      setAnalytics({
        totalUsers: users.length,
        totalAssignments: assignments.length,
        totalTeams: teams.length,
        totalMessages: messages.length,
        usersByRole,
        popularAssignments,
        sectionDistribution,
        recentActivity: {
          newUsers: recentUsers,
          newMessages: recentMessages
        }
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
      toast.error('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="section-heading">System Analytics</h1>

      {/* Main Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="card-hover text-center">
          <Users className="w-12 h-12 mx-auto mb-3 text-primary" />
          <h3 className="text-lg font-semibold mb-2 text-gray-400">Total Users</h3>
          <p className="text-4xl font-bold text-primary">{analytics.totalUsers}</p>
          <p className="text-sm text-gray-500 mt-2">+{analytics.recentActivity.newUsers} this month</p>
        </div>

        <div className="card-hover text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-3 text-secondary" />
          <h3 className="text-lg font-semibold mb-2 text-gray-400">Assignments</h3>
          <p className="text-4xl font-bold text-secondary">{analytics.totalAssignments}</p>
          <p className="text-sm text-gray-500 mt-2">Across all teachers</p>
        </div>

        <div className="card-hover text-center">
          <Users className="w-12 h-12 mx-auto mb-3 text-primary" />
          <h3 className="text-lg font-semibold mb-2 text-gray-400">Teams Formed</h3>
          <p className="text-4xl font-bold text-primary">{analytics.totalTeams}</p>
          <p className="text-sm text-gray-500 mt-2">Total collaborations</p>
        </div>

        <div className="card-hover text-center">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 text-secondary" />
          <h3 className="text-lg font-semibold mb-2 text-gray-400">Messages Sent</h3>
          <p className="text-4xl font-bold text-secondary">{analytics.totalMessages}</p>
          <p className="text-sm text-gray-500 mt-2">+{analytics.recentActivity.newMessages} this month</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* User Distribution */}
        <div className="card-hover">
          <h3 className="text-xl font-bold mb-4 text-gradient">User Distribution</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-gray-300">Admins</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 bg-dark/50 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${(analytics.usersByRole.admin / analytics.totalUsers) * 100}%` }}
                  />
                </div>
                <span className="text-primary font-bold w-12 text-right">{analytics.usersByRole.admin}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <GraduationCap className="w-5 h-5 text-secondary" />
                <span className="text-gray-300">Teachers</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 bg-dark/50 rounded-full h-2">
                  <div
                    className="bg-secondary h-2 rounded-full"
                    style={{ width: `${(analytics.usersByRole.teacher / analytics.totalUsers) * 100}%` }}
                  />
                </div>
                <span className="text-secondary font-bold w-12 text-right">{analytics.usersByRole.teacher}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-blue-400" />
                <span className="text-gray-300">Students</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 bg-dark/50 rounded-full h-2">
                  <div
                    className="bg-blue-400 h-2 rounded-full"
                    style={{ width: `${(analytics.usersByRole.student / analytics.totalUsers) * 100}%` }}
                  />
                </div>
                <span className="text-blue-400 font-bold w-12 text-right">{analytics.usersByRole.student}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section Distribution */}
        <div className="card-hover">
          <h3 className="text-xl font-bold mb-4 text-gradient">Section Distribution</h3>
          {analytics.sectionDistribution.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No section data available</p>
          ) : (
            <div className="space-y-3">
              {analytics.sectionDistribution.slice(0, 5).map((item) => (
                <div key={item.section} className="flex items-center justify-between">
                  <span className="text-gray-300">Section {item.section}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-dark/50 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${(item.count / analytics.usersByRole.student) * 100}%`
                        }}
                      />
                    </div>
                    <span className="text-primary font-bold w-12 text-right">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Popular Assignments */}
      <div className="card-hover">
        <h3 className="text-xl font-bold mb-4 text-gradient">Popular Assignments</h3>
        {analytics.popularAssignments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No assignments created yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Assignment</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Teacher</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Sections</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Teams</th>
                </tr>
              </thead>
              <tbody>
                {analytics.popularAssignments.map((assignment, index) => (
                  <tr key={index} className="border-b border-gray-800">
                    <td className="py-3 px-4 text-gray-300">{assignment.title}</td>
                    <td className="py-3 px-4 text-gray-400">{assignment.teacher}</td>
                    <td className="py-3 px-4 text-gray-400">{assignment.sections.join(', ')}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="badge-primary">{assignment.teamCount}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    appName: 'CollabSpace',
    appUrl: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
    maxFileSize: import.meta.env.VITE_MAX_FILE_SIZE || '10485760',
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
    enableRegistration: true,
    enableEmailNotifications: true
  })

  const formatBytes = (bytes) => {
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(2)} MB`
  }

  return (
    <div>
      <h1 className="section-heading">System Settings</h1>

      {/* Platform Information */}
      <div className="card-hover mb-6">
        <h3 className="text-xl font-bold mb-4 text-gradient">Platform Information</h3>
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Application Name
              </label>
              <input
                type="text"
                value={settings.appName}
                disabled
                className="input-field w-full opacity-60 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Application URL
              </label>
              <input
                type="text"
                value={settings.appUrl}
                disabled
                className="input-field w-full opacity-60 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Supabase URL
            </label>
            <input
              type="text"
              value={settings.supabaseUrl}
              disabled
              className="input-field w-full opacity-60 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* File Upload Settings */}
      <div className="card-hover mb-6">
        <h3 className="text-xl font-bold mb-4 text-gradient">File Upload Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Maximum File Size
            </label>
            <div className="flex items-center gap-4">
              <input
                type="text"
                value={formatBytes(settings.maxFileSize)}
                disabled
                className="input-field w-full max-w-xs opacity-60 cursor-not-allowed"
              />
              <span className="text-sm text-gray-500">
                ({settings.maxFileSize} bytes)
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Configure in environment variables: VITE_MAX_FILE_SIZE
            </p>
          </div>

          <div className="bg-dark/30 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-300 mb-2">Supported File Types</h4>
            <div className="flex flex-wrap gap-2">
              {['PDF', 'PPT', 'PPTX', 'ZIP', 'IPYNB', 'DOC', 'DOCX'].map(type => (
                <span key={type} className="badge-primary text-xs">{type}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Storage Buckets */}
      <div className="card-hover mb-6">
        <h3 className="text-xl font-bold mb-4 text-gradient">Supabase Storage Buckets</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-dark/30 p-3 rounded-lg">
            <div>
              <p className="font-medium text-gray-300">assignment-files</p>
              <p className="text-sm text-gray-500">Teacher assignment resources and instructions</p>
            </div>
            <span className="badge-secondary">Private</span>
          </div>

          <div className="flex items-center justify-between bg-dark/30 p-3 rounded-lg">
            <div>
              <p className="font-medium text-gray-300">submissions</p>
              <p className="text-sm text-gray-500">Student team submissions</p>
            </div>
            <span className="badge-secondary">Private</span>
          </div>

          <div className="flex items-center justify-between bg-dark/30 p-3 rounded-lg">
            <div>
              <p className="font-medium text-gray-300">avatars</p>
              <p className="text-sm text-gray-500">User profile pictures</p>
            </div>
            <span className="badge-primary">Public</span>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          Storage buckets are configured in Supabase Dashboard → Storage
        </p>
      </div>

      {/* Database Information */}
      <div className="card-hover mb-6">
        <h3 className="text-xl font-bold mb-4 text-gradient">Database Schema</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between bg-dark/30 p-2 rounded">
            <span className="text-gray-300">profiles</span>
            <span className="text-gray-500">User information</span>
          </div>
          <div className="flex items-center justify-between bg-dark/30 p-2 rounded">
            <span className="text-gray-300">assignments</span>
            <span className="text-gray-500">Teacher assignments</span>
          </div>
          <div className="flex items-center justify-between bg-dark/30 p-2 rounded">
            <span className="text-gray-300">assignment_phases</span>
            <span className="text-gray-500">Submission deadlines</span>
          </div>
          <div className="flex items-center justify-between bg-dark/30 p-2 rounded">
            <span className="text-gray-300">teams</span>
            <span className="text-gray-500">Student teams</span>
          </div>
          <div className="flex items-center justify-between bg-dark/30 p-2 rounded">
            <span className="text-gray-300">team_members</span>
            <span className="text-gray-500">Team membership</span>
          </div>
          <div className="flex items-center justify-between bg-dark/30 p-2 rounded">
            <span className="text-gray-300">team_invitations</span>
            <span className="text-gray-500">Team invitations</span>
          </div>
          <div className="flex items-center justify-between bg-dark/30 p-2 rounded">
            <span className="text-gray-300">chat_messages</span>
            <span className="text-gray-500">Team chat messages</span>
          </div>
          <div className="flex items-center justify-between bg-dark/30 p-2 rounded">
            <span className="text-gray-300">files</span>
            <span className="text-gray-500">File references</span>
          </div>
          <div className="flex items-center justify-between bg-dark/30 p-2 rounded">
            <span className="text-gray-300">submissions</span>
            <span className="text-gray-500">Team submissions</span>
          </div>
          <div className="flex items-center justify-between bg-dark/30 p-2 rounded">
            <span className="text-gray-300">notifications</span>
            <span className="text-gray-500">User notifications</span>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          Schema defined in SUPABASE_SETUP.sql and SUPABASE_SECURITY_FIXES.sql
        </p>
      </div>

      {/* System Information */}
      <div className="card-hover">
        <h3 className="text-xl font-bold mb-4 text-gradient">System Information</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500 mb-1">Frontend Framework</p>
            <p className="text-gray-300 font-medium">React 18.3 + Vite 5.4</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Backend</p>
            <p className="text-gray-300 font-medium">Supabase (PostgreSQL)</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Styling</p>
            <p className="text-gray-300 font-medium">TailwindCSS 3.4</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">State Management</p>
            <p className="text-gray-300 font-medium">Zustand</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Routing</p>
            <p className="text-gray-300 font-medium">React Router v7</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Icons</p>
            <p className="text-gray-300 font-medium">Lucide React</p>
          </div>
        </div>
      </div>

      {/* Configuration Note */}
      <div className="card bg-blue-500/10 border border-blue-500/20 mt-6">
        <div className="flex items-start gap-3">
          <Settings className="w-5 h-5 text-blue-400 mt-1" />
          <div>
            <h4 className="font-semibold text-blue-400 mb-1">Configuration</h4>
            <p className="text-sm text-gray-300">
              Most settings are configured through environment variables (.env file) and Supabase Dashboard.
              To modify settings, update your .env file and restart the development server.
            </p>
            <p className="text-sm text-gray-400 mt-2">
              See .env.example for all available configuration options.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
