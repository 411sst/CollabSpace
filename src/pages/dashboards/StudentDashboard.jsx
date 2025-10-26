import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Home, Briefcase, Users, MessageSquare, LogOut, Calendar, UserPlus, Send, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'

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
            <p className="text-gray-200 font-medium">{profile?.first_name} {profile?.last_name}</p>
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

const StudentAssignments = () => {
  const { profile } = useAuthStore()
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAssignments()
  }, [profile])

  const fetchAssignments = async () => {
    if (!profile?.section) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('assignments')
        .select(`
          *,
          assignment_phases (
            id,
            phase_name,
            phase_number,
            deadline,
            description
          ),
          profiles!assignments_teacher_id_fkey (
            first_name,
            last_name
          )
        `)
        .contains('sections', [profile.section])
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

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isDeadlinePassed = (deadline) => {
    return new Date(deadline) < new Date()
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
      <h1 className="section-heading">My Assignments</h1>

      {assignments.length === 0 ? (
        <div className="card text-center py-12">
          <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400 text-lg">No assignments found for your section</p>
          <p className="text-gray-500 text-sm mt-2">Check back later or contact your teacher</p>
        </div>
      ) : (
        <div className="space-y-6">
          {assignments.map((assignment) => (
            <div key={assignment.id} className="card-hover">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-primary mb-2">{assignment.title}</h3>
                  <p className="text-gray-400 mb-3">{assignment.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span>👨‍🏫 {assignment.profiles?.first_name} {assignment.profiles?.last_name}</span>
                    <span>👥 Team Size: {assignment.min_team_size}-{assignment.max_team_size}</span>
                    <span>📚 Sections: {assignment.sections.join(', ')}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-800 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-secondary">Team Formation Deadline</h4>
                  <span className={`text-sm ${isDeadlinePassed(assignment.team_formation_deadline) ? 'text-red-400' : 'text-primary'}`}>
                    <Calendar className="w-4 h-4 inline mr-1" />
                    {formatDate(assignment.team_formation_deadline)}
                  </span>
                </div>

                {assignment.assignment_phases && assignment.assignment_phases.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-secondary mb-2">Submission Phases</h4>
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
                            <span className={`text-sm ${isDeadlinePassed(phase.deadline) ? 'text-red-400' : 'text-gray-400'}`}>
                              {formatDate(phase.deadline)}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const StudentTeams = () => {
  const { profile } = useAuthStore()
  const [teams, setTeams] = useState([])
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [teamName, setTeamName] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchTeamsAndAssignments()
  }, [profile])

  const fetchTeamsAndAssignments = async () => {
    if (!profile?.id) return

    try {
      setLoading(true)

      // Fetch student's teams
      const { data: teamsData, error: teamsError } = await supabase
        .from('team_members')
        .select(`
          *,
          teams (
            id,
            team_name,
            created_at,
            assignment_id,
            assignments (
              title,
              description
            ),
            team_members (
              id,
              status,
              profiles (
                id,
                first_name,
                last_name,
                student_id
              )
            )
          )
        `)
        .eq('student_id', profile.id)
        .eq('status', 'active')

      if (teamsError) throw teamsError

      // Fetch available assignments for creating teams
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('assignments')
        .select('*')
        .contains('sections', [profile.section])
        .gte('team_formation_deadline', new Date().toISOString())
        .order('created_at', { ascending: false })

      if (assignmentsError) throw assignmentsError

      setTeams(teamsData || [])
      setAssignments(assignmentsData || [])
    } catch (error) {
      console.error('Error fetching teams:', error)
      toast.error('Failed to load teams')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTeam = async () => {
    if (!teamName.trim() || !selectedAssignment) {
      toast.error('Please enter a team name and select an assignment')
      return
    }

    try {
      setCreating(true)

      // Create team
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .insert([{
          assignment_id: selectedAssignment,
          team_name: teamName.trim(),
          created_by: profile.id
        }])
        .select()
        .single()

      if (teamError) throw teamError

      // Add creator as team member
      const { error: memberError } = await supabase
        .from('team_members')
        .insert([{
          team_id: teamData.id,
          student_id: profile.id,
          status: 'active'
        }])

      if (memberError) throw memberError

      toast.success('Team created successfully!')
      setShowCreateModal(false)
      setTeamName('')
      setSelectedAssignment(null)
      fetchTeamsAndAssignments()
    } catch (error) {
      console.error('Error creating team:', error)
      toast.error(error.message || 'Failed to create team')
    } finally {
      setCreating(false)
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="section-heading mb-0">My Teams</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          Create Team
        </button>
      </div>

      {teams.length === 0 ? (
        <div className="card text-center py-12">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400 text-lg">You're not part of any teams yet</p>
          <p className="text-gray-500 text-sm mt-2">Create a team or wait for an invitation</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {teams.map((member) => {
            const team = member.teams
            return (
              <div key={member.id} className="card-hover">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-primary mb-1">{team.team_name}</h3>
                    <p className="text-sm text-gray-500">{team.assignments?.title}</p>
                  </div>
                  <span className="badge-primary">Active</span>
                </div>

                <div className="border-t border-gray-800 pt-4">
                  <h4 className="text-sm font-semibold text-secondary mb-3">Team Members ({team.team_members?.filter(m => m.status === 'active').length})</h4>
                  <div className="space-y-2">
                    {team.team_members
                      ?.filter(m => m.status === 'active')
                      .map((tm) => (
                        <div key={tm.id} className="flex items-center gap-3 bg-dark/30 p-2 rounded">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                            {tm.profiles?.first_name?.[0]}{tm.profiles?.last_name?.[0]}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-300">
                              {tm.profiles?.first_name} {tm.profiles?.last_name}
                            </p>
                            <p className="text-xs text-gray-500">{tm.profiles?.student_id}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-gradient">Create New Team</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Team Name
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Enter team name"
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Assignment
                </label>
                <select
                  value={selectedAssignment || ''}
                  onChange={(e) => setSelectedAssignment(e.target.value)}
                  className="input-field w-full"
                >
                  <option value="">Select an assignment</option>
                  {assignments.map((assignment) => (
                    <option key={assignment.id} value={assignment.id}>
                      {assignment.title}
                    </option>
                  ))}
                </select>
                {assignments.length === 0 && (
                  <p className="text-sm text-gray-500 mt-2">No assignments available for team formation</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setTeamName('')
                  setSelectedAssignment(null)
                }}
                className="btn-ghost flex-1"
                disabled={creating}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTeam}
                disabled={creating || !teamName.trim() || !selectedAssignment}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Team'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const StudentChat = () => {
  const { profile } = useAuthStore()
  const [teams, setTeams] = useState([])
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    fetchTeams()
  }, [profile])

  useEffect(() => {
    if (selectedTeam) {
      fetchMessages()
      subscribeToMessages()
    }
  }, [selectedTeam])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchTeams = async () => {
    if (!profile?.id) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          *,
          teams (
            id,
            team_name,
            assignments (
              title
            )
          )
        `)
        .eq('student_id', profile.id)
        .eq('status', 'active')

      if (error) throw error

      setTeams(data || [])
      if (data && data.length > 0 && !selectedTeam) {
        setSelectedTeam(data[0].teams)
      }
    } catch (error) {
      console.error('Error fetching teams:', error)
      toast.error('Failed to load teams')
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async () => {
    if (!selectedTeam?.id) return

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          profiles (
            first_name,
            last_name
          )
        `)
        .eq('team_id', selectedTeam.id)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
      toast.error('Failed to load messages')
    }
  }

  const subscribeToMessages = () => {
    if (!selectedTeam?.id) return

    const channel = supabase
      .channel(`chat:${selectedTeam.id}`)
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `team_id=eq.${selectedTeam.id}`
        },
        async (payload) => {
          // Fetch the complete message with profile data
          const { data, error } = await supabase
            .from('chat_messages')
            .select(`
              *,
              profiles (
                first_name,
                last_name
              )
            `)
            .eq('id', payload.new.id)
            .single()

          if (!error && data) {
            setMessages((prev) => [...prev, data])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedTeam?.id) return

    try {
      setSending(true)
      const { error } = await supabase
        .from('chat_messages')
        .insert([{
          team_id: selectedTeam.id,
          sender_id: profile.id,
          message: newMessage.trim()
        }])

      if (error) throw error
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const formatMessageTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()

    if (isToday) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (teams.length === 0) {
    return (
      <div>
        <h1 className="section-heading">Team Chat</h1>
        <div className="card text-center py-12">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400 text-lg">No teams available for chat</p>
          <p className="text-gray-500 text-sm mt-2">Join a team to start chatting</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)]">
      {/* Team List Sidebar */}
      <div className="w-64 flex-shrink-0">
        <h2 className="text-xl font-bold mb-4 text-gradient">Your Teams</h2>
        <div className="space-y-2">
          {teams.map((member) => {
            const team = member.teams
            return (
              <button
                key={team.id}
                onClick={() => setSelectedTeam(team)}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  selectedTeam?.id === team.id
                    ? 'bg-primary/10 border-l-4 border-primary'
                    : 'bg-dark/30 hover:bg-dark/50'
                }`}
              >
                <p className="font-semibold text-gray-200 truncate">{team.team_name}</p>
                <p className="text-xs text-gray-500 truncate">{team.assignments?.title}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-dark/30 rounded-lg overflow-hidden">
        {/* Chat Header */}
        <div className="border-b border-gray-800 p-4">
          <h2 className="text-xl font-bold text-primary">{selectedTeam?.team_name}</h2>
          <p className="text-sm text-gray-500">{selectedTeam?.assignments?.title}</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwnMessage = message.sender_id === profile.id
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                    <div className={`rounded-lg p-3 ${
                      isOwnMessage
                        ? 'bg-primary/20 text-gray-200'
                        : 'bg-dark/50 text-gray-300'
                    }`}>
                      {!isOwnMessage && (
                        <p className="text-xs font-semibold text-secondary mb-1">
                          {message.profiles?.first_name} {message.profiles?.last_name}
                        </p>
                      )}
                      <p className="break-words">{message.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatMessageTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="border-t border-gray-800 p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="input-field flex-1"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="btn-primary px-6 flex items-center gap-2"
            >
              {sending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default StudentDashboard
