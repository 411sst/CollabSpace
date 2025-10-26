import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Users, Briefcase, BarChart3, MessageSquare, FileUp, Bell } from 'lucide-react'
import { useEffect } from 'react'

const Landing = () => {
  const { user, profile } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect authenticated users to their dashboard
    if (user && profile) {
      navigate(`/${profile.role}`)
    }
  }, [user, profile, navigate])

  const features = [
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Team Formation',
      description: 'Create and manage project teams with ease. Students form their own teams with smart invitation system.'
    },
    {
      icon: <Briefcase className="w-8 h-8" />,
      title: 'Assignment Management',
      description: 'Teachers create multi-phase assignments with custom deadlines and team requirements.'
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: 'Real-time Chat',
      description: 'Built-in team chat for seamless collaboration. Stay connected with your teammates.'
    },
    {
      icon: <FileUp className="w-8 h-8" />,
      title: 'File Sharing',
      description: 'Upload and share PDFs, presentations, notebooks, and more. 10MB per file.'
    },
    {
      icon: <Bell className="w-8 h-8" />,
      title: 'Smart Notifications',
      description: 'Email notifications for invitations, deadlines, and important updates.'
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Analytics Dashboard',
      description: 'Track progress, participation, and performance across all projects.'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Hero Section */}
      <nav className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gradient">CollabSpace</h1>
          <div className="flex gap-4">
            <Link to="/login" className="btn-ghost">
              Login
            </Link>
            <Link to="/register" className="btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <header className="container mx-auto px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            <span className="text-gradient">Collaborate</span> Better,
            <br />
            Achieve More Together
          </h1>
          <p className="text-xl text-gray-300 mb-8 animate-slide-up">
            A no-nonsense platform for educational team collaboration.
            Form teams, manage assignments, and work together seamlessly.
          </p>
          <div className="flex gap-4 justify-center animate-slide-up">
            <Link to="/register" className="btn-primary text-lg px-8 py-3">
              Start Collaborating
            </Link>
            <a href="#features" className="btn-outline text-lg px-8 py-3">
              Learn More
            </a>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">
          Everything You Need to <span className="text-gradient">Collaborate</span>
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="card-hover animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="text-primary mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Roles Section */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">
          Built for <span className="text-gradient">Everyone</span>
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="card-hover text-center">
            <div className="text-6xl mb-4">👨‍🎓</div>
            <h3 className="text-2xl font-bold mb-3 text-primary">Students</h3>
            <p className="text-gray-400 mb-4">
              Form teams, collaborate on assignments, and submit projects together.
            </p>
            <ul className="text-left text-gray-400 space-y-2">
              <li>• Join and create teams</li>
              <li>• Real-time team chat</li>
              <li>• Track deadlines</li>
              <li>• Submit assignments</li>
            </ul>
          </div>

          <div className="card-hover text-center">
            <div className="text-6xl mb-4">👩‍🏫</div>
            <h3 className="text-2xl font-bold mb-3 text-secondary">Teachers</h3>
            <p className="text-gray-400 mb-4">
              Create assignments, monitor progress, and guide students effectively.
            </p>
            <ul className="text-left text-gray-400 space-y-2">
              <li>• Create multi-phase assignments</li>
              <li>• Monitor team formation</li>
              <li>• Track submissions</li>
              <li>• Provide feedback</li>
            </ul>
          </div>

          <div className="card-hover text-center">
            <div className="text-6xl mb-4">👨‍💼</div>
            <h3 className="text-2xl font-bold mb-3 text-primary">Admins</h3>
            <p className="text-gray-400 mb-4">
              Manage users, monitor system usage, and maintain the platform.
            </p>
            <ul className="text-left text-gray-400 space-y-2">
              <li>• Manage all users</li>
              <li>• System analytics</li>
              <li>• Platform oversight</li>
              <li>• Configuration control</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="card max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">
            Ready to <span className="text-gradient">Get Started?</span>
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Join CollabSpace today and transform the way your teams collaborate.
          </p>
          <Link to="/register" className="btn-primary text-lg px-12 py-4 inline-block">
            Create Your Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 border-t border-gray-800">
        <div className="text-center text-gray-400">
          <p>&copy; 2024 CollabSpace. Built for better collaboration.</p>
        </div>
      </footer>
    </div>
  )
}

export default Landing
