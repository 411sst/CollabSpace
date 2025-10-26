import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Home, Briefcase, Users, BarChart3, LogOut, Plus, Calendar, Upload, X, Loader2, Edit, Trash2, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

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
            <p className="text-gray-200 font-medium">{profile?.first_name} {profile?.last_name}</p>
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

// Teacher Home Dashboard
const TeacherHome = () => {
  const { profile } = useAuthStore()
  const [stats, setStats] = useState({
    totalAssignments: 0,
    totalTeams: 0,
    totalStudents: 0,
    recentAssignments: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [profile])

  const fetchStats = async () => {
    if (!profile?.id) return

    try {
      setLoading(true)

      // Fetch teacher's assignments with team data
      const { data: assignments, error: assignmentsError } = await supabase
        .from('assignments')
        .select(`
          *,
          teams (
            id,
            team_members (
              id,
              status,
              student_id
            )
          )
        `)
        .eq('teacher_id', profile.id)
        .order('created_at', { ascending: false })

      if (assignmentsError) throw assignmentsError

      // Calculate statistics
      const totalAssignments = assignments?.length || 0
      const totalTeams = assignments?.reduce((sum, a) => sum + (a.teams?.length || 0), 0) || 0

      // Get unique students
      const studentIds = new Set()
      assignments?.forEach(assignment => {
        assignment.teams?.forEach(team => {
          team.team_members
            ?.filter(m => m.status === 'active')
            .forEach(member => studentIds.add(member.student_id))
        })
      })

      setStats({
        totalAssignments,
        totalTeams,
        totalStudents: studentIds.size,
        recentAssignments: assignments?.slice(0, 3) || []
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="section-heading">Teacher Dashboard</h1>
      <p className="text-gray-400 mb-6">Welcome back, {profile?.first_name}! Here's your teaching overview.</p>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="card-hover">
          <Briefcase className="w-8 h-8 mb-3 text-secondary" />
          <h3 className="text-lg font-semibold mb-2 text-gray-400">Total Assignments</h3>
          <p className="text-3xl font-bold text-secondary">{stats.totalAssignments}</p>
          <p className="text-sm text-gray-400 mt-2">Created by you</p>
        </div>
        <div className="card-hover">
          <Users className="w-8 h-8 mb-3 text-primary" />
          <h3 className="text-lg font-semibold mb-2 text-gray-400">Teams Formed</h3>
          <p className="text-3xl font-bold text-primary">{stats.totalTeams}</p>
          <p className="text-sm text-gray-400 mt-2">Across all assignments</p>
        </div>
        <div className="card-hover">
          <BarChart3 className="w-8 h-8 mb-3 text-secondary" />
          <h3 className="text-lg font-semibold mb-2 text-gray-400">Active Students</h3>
          <p className="text-3xl font-bold text-secondary">{stats.totalStudents}</p>
          <p className="text-sm text-gray-400 mt-2">Participating in teams</p>
        </div>
      </div>

      {stats.recentAssignments.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4 text-gradient">Recent Assignments</h2>
          <div className="space-y-3">
            {stats.recentAssignments.map((assignment) => (
              <div key={assignment.id} className="flex items-center justify-between bg-dark/30 p-3 rounded-lg">
                <div>
                  <p className="text-gray-300 font-medium">{assignment.title}</p>
                  <p className="text-sm text-gray-500">Sections: {assignment.sections.join(', ')}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-primary">{assignment.teams?.length || 0} teams</p>
                  <p className="text-xs text-gray-500">{formatDate(assignment.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.totalAssignments === 0 && (
        <div className="card text-center py-12">
          <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400 text-lg">No assignments created yet</p>
          <p className="text-gray-500 text-sm mt-2">Create your first assignment to get started</p>
        </div>
      )}
    </div>
  )
}

const TeacherAssignments = () => {
  const { profile } = useAuthStore()
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sections: '',
    min_team_size: 2,
    max_team_size: 5,
    team_formation_deadline: '',
    phases: [{ phase_number: 1, phase_name: 'Review 1', deadline: '', description: '' }]
  })

  useEffect(() => {
    fetchAssignments()
  }, [profile])

  const fetchAssignments = async () => {
    if (!profile?.id) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('assignments')
        .select(`
          *,
          assignment_phases (
            id,
            phase_number,
            phase_name,
            deadline,
            description
          )
        `)
        .eq('teacher_id', profile.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setAssignments(data || [])
    } catch (error) {
      console.error('Error fetching assignments:', error)
      toast.error('Failed to load assignments')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAssignment = async (e) => {
    e.preventDefault()
    if (!formData.title || !formData.sections || !formData.team_formation_deadline) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setSubmitting(true)
      const sectionsArray = formData.sections.split(',').map(s => s.trim()).filter(s => s)

      // Create assignment
      const { data: assignment, error: assignmentError } = await supabase
        .from('assignments')
        .insert([{
          title: formData.title,
          description: formData.description,
          teacher_id: profile.id,
          sections: sectionsArray,
          min_team_size: parseInt(formData.min_team_size),
          max_team_size: parseInt(formData.max_team_size),
          team_formation_deadline: formData.team_formation_deadline
        }])
        .select()
        .single()

      if (assignmentError) throw assignmentError

      // Create phases
      const phasesData = formData.phases
        .filter(p => p.phase_name && p.deadline)
        .map(p => ({
          assignment_id: assignment.id,
          phase_number: p.phase_number,
          phase_name: p.phase_name,
          deadline: p.deadline,
          description: p.description || null
        }))

      if (phasesData.length > 0) {
        const { error: phasesError } = await supabase
          .from('assignment_phases')
          .insert(phasesData)

        if (phasesError) throw phasesError
      }

      toast.success('Assignment created successfully!')
      setShowCreateModal(false)
      resetForm()
      fetchAssignments()
    } catch (error) {
      console.error('Error creating assignment:', error)
      toast.error(error.message || 'Failed to create assignment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteAssignment = async (assignmentId) => {
    if (!confirm('Are you sure you want to delete this assignment? This will also delete all associated teams and data.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', assignmentId)

      if (error) throw error
      toast.success('Assignment deleted successfully')
      fetchAssignments()
    } catch (error) {
      console.error('Error deleting assignment:', error)
      toast.error('Failed to delete assignment')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      sections: '',
      min_team_size: 2,
      max_team_size: 5,
      team_formation_deadline: '',
      phases: [{ phase_number: 1, phase_name: 'Review 1', deadline: '', description: '' }]
    })
  }

  const addPhase = () => {
    setFormData({
      ...formData,
      phases: [...formData.phases, {
        phase_number: formData.phases.length + 1,
        phase_name: `Review ${formData.phases.length + 1}`,
        deadline: '',
        description: ''
      }]
    })
  }

  const removePhase = (index) => {
    setFormData({
      ...formData,
      phases: formData.phases.filter((_, i) => i !== index)
    })
  }

  const updatePhase = (index, field, value) => {
    const newPhases = [...formData.phases]
    newPhases[index] = { ...newPhases[index], [field]: value }
    setFormData({ ...formData, phases: newPhases })
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="section-heading mb-0">My Assignments</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-secondary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Assignment
        </button>
      </div>

      {assignments.length === 0 ? (
        <div className="card text-center py-12">
          <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400 text-lg">No assignments created yet</p>
          <p className="text-gray-500 text-sm mt-2">Create your first assignment to get started</p>
        </div>
      ) : (
        <div className="space-y-6">
          {assignments.map((assignment) => (
            <div key={assignment.id} className="card-hover">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-secondary mb-2">{assignment.title}</h3>
                  <p className="text-gray-400 mb-3">{assignment.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span>📚 Sections: {assignment.sections.join(', ')}</span>
                    <span>👥 Team Size: {assignment.min_team_size}-{assignment.max_team_size}</span>
                    <span>📅 Formation Deadline: {formatDate(assignment.team_formation_deadline)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDeleteAssignment(assignment.id)}
                    className="btn-ghost text-red-400 hover:bg-red-400/10"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {assignment.assignment_phases && assignment.assignment_phases.length > 0 && (
                <div className="border-t border-gray-800 pt-4">
                  <h4 className="font-semibold text-primary mb-3">Submission Phases</h4>
                  <div className="space-y-2">
                    {assignment.assignment_phases
                      .sort((a, b) => a.phase_number - b.phase_number)
                      .map((phase) => (
                        <div key={phase.id} className="flex items-center justify-between bg-dark/30 p-3 rounded-lg">
                          <div>
                            <span className="font-medium text-gray-300">{phase.phase_name}</span>
                            {phase.description && (
                              <p className="text-sm text-gray-500 mt-1">{phase.description}</p>
                            )}
                          </div>
                          <span className="text-sm text-gray-400">{formatDate(phase.deadline)}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="card max-w-2xl w-full my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gradient">Create New Assignment</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  resetForm()
                }}
                className="text-gray-400 hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Assignment title"
                  className="input-field w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Assignment description"
                  className="input-field w-full h-24"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Sections (comma-separated) *
                  </label>
                  <input
                    type="text"
                    value={formData.sections}
                    onChange={(e) => setFormData({ ...formData, sections: e.target.value })}
                    placeholder="e.g., A, B, C"
                    className="input-field w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Team Formation Deadline *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.team_formation_deadline}
                    onChange={(e) => setFormData({ ...formData, team_formation_deadline: e.target.value })}
                    className="input-field w-full"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Min Team Size
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.min_team_size}
                    onChange={(e) => setFormData({ ...formData, min_team_size: e.target.value })}
                    className="input-field w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Max Team Size
                  </label>
                  <input
                    type="number"
                    min={formData.min_team_size}
                    value={formData.max_team_size}
                    onChange={(e) => setFormData({ ...formData, max_team_size: e.target.value })}
                    className="input-field w-full"
                  />
                </div>
              </div>

              <div className="border-t border-gray-800 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-primary">Submission Phases</h3>
                  <button
                    type="button"
                    onClick={addPhase}
                    className="btn-ghost text-sm flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add Phase
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.phases.map((phase, index) => (
                    <div key={index} className="bg-dark/30 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-400">Phase {phase.phase_number}</span>
                        {formData.phases.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePhase(index)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="grid md:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={phase.phase_name}
                          onChange={(e) => updatePhase(index, 'phase_name', e.target.value)}
                          placeholder="Phase name"
                          className="input-field w-full"
                        />
                        <input
                          type="datetime-local"
                          value={phase.deadline}
                          onChange={(e) => updatePhase(index, 'deadline', e.target.value)}
                          className="input-field w-full"
                        />
                      </div>
                      <input
                        type="text"
                        value={phase.description}
                        onChange={(e) => updatePhase(index, 'description', e.target.value)}
                        placeholder="Phase description (optional)"
                        className="input-field w-full mt-2"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    resetForm()
                  }}
                  className="btn-ghost flex-1"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-secondary flex-1 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Assignment'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const TeacherTeams = () => {
  const { profile } = useAuthStore()
  const [assignments, setAssignments] = useState([])
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAssignments()
  }, [profile])

  useEffect(() => {
    if (selectedAssignment) {
      fetchTeams()
    }
  }, [selectedAssignment])

  const fetchAssignments = async () => {
    if (!profile?.id) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('assignments')
        .select('id, title, sections, min_team_size, max_team_size')
        .eq('teacher_id', profile.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setAssignments(data || [])
      if (data && data.length > 0) {
        setSelectedAssignment(data[0].id)
      }
    } catch (error) {
      console.error('Error fetching assignments:', error)
      toast.error('Failed to load assignments')
    } finally {
      setLoading(false)
    }
  }

  const fetchTeams = async () => {
    if (!selectedAssignment) return

    try {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          team_members (
            id,
            status,
            joined_at,
            profiles (
              id,
              first_name,
              last_name,
              student_id,
              section
            )
          )
        `)
        .eq('assignment_id', selectedAssignment)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTeams(data || [])
    } catch (error) {
      console.error('Error fetching teams:', error)
      toast.error('Failed to load teams')
    }
  }

  const getActiveMembers = (team) => {
    return team.team_members?.filter(m => m.status === 'active') || []
  }

  const getAssignmentDetails = () => {
    return assignments.find(a => a.id === selectedAssignment)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    )
  }

  if (assignments.length === 0) {
    return (
      <div>
        <h1 className="section-heading">Student Teams</h1>
        <div className="card text-center py-12">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400 text-lg">No assignments created yet</p>
          <p className="text-gray-500 text-sm mt-2">Create an assignment first to view teams</p>
        </div>
      </div>
    )
  }

  const assignmentInfo = getAssignmentDetails()

  return (
    <div>
      <h1 className="section-heading">Student Teams</h1>

      {/* Assignment Selector */}
      <div className="card mb-6">
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Select Assignment
        </label>
        <select
          value={selectedAssignment || ''}
          onChange={(e) => setSelectedAssignment(e.target.value)}
          className="input-field w-full max-w-md"
        >
          {assignments.map((assignment) => (
            <option key={assignment.id} value={assignment.id}>
              {assignment.title}
            </option>
          ))}
        </select>
        {assignmentInfo && (
          <div className="mt-3 text-sm text-gray-500">
            <span>Sections: {assignmentInfo.sections.join(', ')}</span>
            <span className="ml-4">Team Size: {assignmentInfo.min_team_size}-{assignmentInfo.max_team_size}</span>
          </div>
        )}
      </div>

      {teams.length === 0 ? (
        <div className="card text-center py-12">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400 text-lg">No teams formed yet</p>
          <p className="text-gray-500 text-sm mt-2">Students haven't created teams for this assignment</p>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-400">
            Total Teams: <span className="text-primary font-semibold">{teams.length}</span>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {teams.map((team) => {
              const activeMembers = getActiveMembers(team)
              const isValidSize = assignmentInfo &&
                activeMembers.length >= assignmentInfo.min_team_size &&
                activeMembers.length <= assignmentInfo.max_team_size

              return (
                <div key={team.id} className="card-hover">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-secondary mb-1">{team.team_name}</h3>
                      <p className="text-sm text-gray-500">
                        Created {new Date(team.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`badge ${isValidSize ? 'badge-primary' : 'badge-secondary bg-red-500/10 text-red-400'}`}>
                        {activeMembers.length} {activeMembers.length === 1 ? 'member' : 'members'}
                      </span>
                    </div>
                  </div>

                  {!isValidSize && assignmentInfo && (
                    <div className="mb-3 p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400">
                      ⚠️ Team size must be between {assignmentInfo.min_team_size}-{assignmentInfo.max_team_size}
                    </div>
                  )}

                  <div className="border-t border-gray-800 pt-4">
                    <h4 className="text-sm font-semibold text-gray-400 mb-3">Team Members</h4>
                    <div className="space-y-2">
                      {activeMembers.map((member) => (
                        <div key={member.id} className="flex items-center gap-3 bg-dark/30 p-3 rounded">
                          <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-bold">
                            {member.profiles?.first_name?.[0]}{member.profiles?.last_name?.[0]}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-300">
                              {member.profiles?.first_name} {member.profiles?.last_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {member.profiles?.student_id} • Section {member.profiles?.section}
                            </p>
                          </div>
                          <span className="text-xs text-gray-500">
                            Joined {new Date(member.joined_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

const TeacherAnalytics = () => {
  const { profile } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState({
    totalAssignments: 0,
    totalTeams: 0,
    totalStudents: 0,
    assignmentDetails: []
  })

  useEffect(() => {
    fetchAnalytics()
  }, [profile])

  const fetchAnalytics = async () => {
    if (!profile?.id) return

    try {
      setLoading(true)

      // Fetch assignments with team data
      const { data: assignments, error: assignmentsError } = await supabase
        .from('assignments')
        .select(`
          *,
          teams (
            id,
            team_members (
              id,
              status,
              student_id
            )
          ),
          assignment_phases (
            id,
            phase_name,
            deadline
          )
        `)
        .eq('teacher_id', profile.id)

      if (assignmentsError) throw assignmentsError

      // Calculate statistics
      const totalAssignments = assignments?.length || 0
      const totalTeams = assignments?.reduce((sum, a) => sum + (a.teams?.length || 0), 0) || 0

      // Get unique students
      const studentIds = new Set()
      assignments?.forEach(assignment => {
        assignment.teams?.forEach(team => {
          team.team_members
            ?.filter(m => m.status === 'active')
            .forEach(member => studentIds.add(member.student_id))
        })
      })
      const totalStudents = studentIds.size

      // Process assignment details
      const assignmentDetails = assignments?.map(assignment => {
        const teams = assignment.teams || []
        const activeTeams = teams.filter(team => {
          const activeMembers = team.team_members?.filter(m => m.status === 'active') || []
          return activeMembers.length >= assignment.min_team_size &&
                 activeMembers.length <= assignment.max_team_size
        })

        const studentsInTeams = new Set()
        teams.forEach(team => {
          team.team_members
            ?.filter(m => m.status === 'active')
            .forEach(m => studentsInTeams.add(m.student_id))
        })

        const nextDeadline = assignment.assignment_phases
          ?.filter(p => new Date(p.deadline) > new Date())
          .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))[0]

        return {
          id: assignment.id,
          title: assignment.title,
          sections: assignment.sections,
          totalTeams: teams.length,
          validTeams: activeTeams.length,
          studentsParticipating: studentsInTeams.size,
          teamFormationDeadline: assignment.team_formation_deadline,
          nextDeadline: nextDeadline,
          minTeamSize: assignment.min_team_size,
          maxTeamSize: assignment.max_team_size
        }
      }) || []

      setAnalytics({
        totalAssignments,
        totalTeams,
        totalStudents,
        assignmentDetails
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
      toast.error('Failed to load analytics')
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

  const isDeadlinePassed = (deadline) => {
    return new Date(deadline) < new Date()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="section-heading">Class Analytics</h1>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="card-hover text-center">
          <Briefcase className="w-12 h-12 mx-auto mb-3 text-secondary" />
          <h3 className="text-lg font-semibold mb-2 text-gray-400">Total Assignments</h3>
          <p className="text-4xl font-bold text-secondary">{analytics.totalAssignments}</p>
        </div>

        <div className="card-hover text-center">
          <Users className="w-12 h-12 mx-auto mb-3 text-primary" />
          <h3 className="text-lg font-semibold mb-2 text-gray-400">Total Teams</h3>
          <p className="text-4xl font-bold text-primary">{analytics.totalTeams}</p>
        </div>

        <div className="card-hover text-center">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 text-secondary" />
          <h3 className="text-lg font-semibold mb-2 text-gray-400">Active Students</h3>
          <p className="text-4xl font-bold text-secondary">{analytics.totalStudents}</p>
        </div>
      </div>

      {/* Assignment Details */}
      {analytics.assignmentDetails.length === 0 ? (
        <div className="card text-center py-12">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400 text-lg">No analytics available yet</p>
          <p className="text-gray-500 text-sm mt-2">Create assignments to see analytics</p>
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-bold mb-4 text-gradient">Assignment Breakdown</h2>
          <div className="space-y-4">
            {analytics.assignmentDetails.map((assignment) => {
              const formationPassed = isDeadlinePassed(assignment.teamFormationDeadline)
              const completionRate = assignment.totalTeams > 0
                ? Math.round((assignment.validTeams / assignment.totalTeams) * 100)
                : 0

              return (
                <div key={assignment.id} className="card-hover">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-secondary mb-2">{assignment.title}</h3>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span>📚 Sections: {assignment.sections.join(', ')}</span>
                        <span>👥 Team Size: {assignment.minTeamSize}-{assignment.maxTeamSize}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-dark/30 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Teams Formed</p>
                      <p className="text-2xl font-bold text-primary">{assignment.totalTeams}</p>
                    </div>

                    <div className="bg-dark/30 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Valid Teams</p>
                      <p className="text-2xl font-bold text-secondary">{assignment.validTeams}</p>
                    </div>

                    <div className="bg-dark/30 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Participants</p>
                      <p className="text-2xl font-bold text-primary">{assignment.studentsParticipating}</p>
                    </div>

                    <div className="bg-dark/30 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Completion</p>
                      <p className="text-2xl font-bold text-secondary">{completionRate}%</p>
                    </div>
                  </div>

                  <div className="border-t border-gray-800 pt-4">
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 mb-1">Team Formation Deadline</p>
                        <p className={`font-medium ${formationPassed ? 'text-red-400' : 'text-gray-300'}`}>
                          {formatDate(assignment.teamFormationDeadline)}
                          {formationPassed && ' (Passed)'}
                        </p>
                      </div>
                      {assignment.nextDeadline && (
                        <div>
                          <p className="text-gray-500 mb-1">Next Submission</p>
                          <p className="font-medium text-gray-300">
                            {assignment.nextDeadline.phase_name} - {formatDate(assignment.nextDeadline.deadline)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {assignment.totalTeams > 0 && assignment.validTeams < assignment.totalTeams && (
                    <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs text-yellow-400">
                      ⚠️ {assignment.totalTeams - assignment.validTeams} team(s) don't meet size requirements
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default TeacherDashboard
