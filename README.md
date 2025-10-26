# CollabSpace

```
   ______      ____        __    _____
  / ____/___  / / /____ _ / /_  / ___/____  ____ _ _____ ___
 / /   / __ \/ / // __ `// __ \ \__ \/ __ \/ __ `// ___// _ \
/ /___/ /_/ / / // /_/ // /_/ /___/ / /_/ / /_/ // /__ /  __/
\____/\____/_/_/ \__,_//_.___//____/ .___/\__,_/ \___/ \___/
                                  /_/
```

**Collaborate Better, Achieve More Together**

A modern, no-nonsense platform for educational team collaboration. Built with React, Supabase, and TailwindCSS.

---

## 🎨 Features

### For Students 👨‍🎓
- **Self-forming Teams** - Create and join teams with smart invitation system
- **Real-time Chat** - Built-in team chat for seamless collaboration
- **Assignment Tracking** - View assignments, deadlines, and submission status
- **File Sharing** - Upload and share PDFs, presentations, notebooks (10MB limit)
- **Notifications** - Email alerts for invitations, deadlines, and updates

### For Teachers 👩‍🏫
- **Assignment Management** - Create multi-phase assignments with custom deadlines
- **Team Monitoring** - Track team formation and student participation
- **Flexible Deadlines** - Set multiple review deadlines (Review 1, 2, 3, etc.)
- **Analytics Dashboard** - Monitor completion rates and student engagement
- **File Management** - Upload instructions, resources, and links

### For Admins 👨‍💼
- **User Management** - Add users manually or allow self-registration
- **System Analytics** - Track usage, popular assignments, and system health
- **Configuration Control** - Manage platform settings and permissions

---

## 🚀 Tech Stack

- **Frontend**: React 18.3 + Vite 5.4
- **Backend**: Supabase (PostgreSQL + Auth + Realtime + Storage)
- **Styling**: TailwindCSS 3.4 with custom color palette
- **State Management**: Zustand
- **Routing**: React Router v7
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Deployment**: Vercel (Frontend) + Supabase (Backend)

---

## 🎨 Custom Color Palette

CollabSpace uses a unique, modern color scheme:

- **Primary (Cyan)**: `#ADEDFF` - Actions, highlights
- **Secondary (Pink)**: `#F7A1D3` - Secondary actions, accents
- **Dark Purple**: `#1B0E1A` - Main background
- **Dark Brown**: `#291100` - Warm accents
- **Dark Green**: `#011502` - Deepest backgrounds

---

## 📋 Prerequisites

- **Node.js** 16+ and npm
- **Supabase Account** (free tier works)
- **Vercel Account** (optional, for deployment)

---

## ⚡ Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd group-pesu
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

#### Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for database to be provisioned

#### Run Database Schema
1. Copy contents of `SUPABASE_SETUP.sql`
2. Go to Supabase Dashboard > SQL Editor
3. Paste and run the SQL script
4. This creates all tables, policies, and triggers

#### Create Storage Buckets
1. Go to Supabase Dashboard > Storage
2. Create three buckets:
   - `assignment-files` (private)
   - `submissions` (private)
   - `avatars` (public)

#### Configure Email Templates
1. Go to Supabase Dashboard > Authentication > Email Templates
2. Customize the templates for:
   - Confirm Signup
   - Magic Link
   - Reset Password

### 4. Configure Environment Variables

Create a `.env` file in the root:

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_NAME=CollabSpace
VITE_APP_URL=http://localhost:5173
VITE_MAX_FILE_SIZE=10485760
```

Find your Supabase credentials:
- Dashboard > Settings > API
- Copy "Project URL" and "anon public" key

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 6. Create First Admin Account

1. Register through the app UI (use role: Student initially)
2. Go to Supabase Dashboard > Table Editor > profiles
3. Find your account and change `role` from `student` to `admin`
4. Sign out and sign in again

---

## 📁 Project Structure

```
group-pesu/
├── src/
│   ├── components/          # Reusable components
│   │   └── ProtectedRoute.jsx
│   ├── pages/
│   │   ├── Landing.jsx      # Landing page
│   │   ├── auth/            # Authentication pages
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   └── ResetPassword.jsx
│   │   └── dashboards/      # Role-based dashboards
│   │       ├── AdminDashboard.jsx
│   │       ├── TeacherDashboard.jsx
│   │       └── StudentDashboard.jsx
│   ├── lib/
│   │   └── supabase.js      # Supabase client & helpers
│   ├── store/
│   │   └── authStore.js     # Zustand auth state
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── .env.example             # Environment template
├── SUPABASE_SETUP.sql       # Database schema
├── tailwind.config.js       # Tailwind configuration
├── vite.config.js           # Vite configuration
└── package.json             # Dependencies
```

---

## 🔐 Authentication Flow

1. **Self-Registration**
   - Users sign up with email/password
   - Choose role: Student or Teacher
   - Email verification required
   - Students provide ID and section

2. **Admin Creation**
   - Register normally, then manually upgrade to admin
   - Admins can create accounts for others

3. **Login**
   - Email + password authentication
   - Automatic role-based redirect
   - Persistent sessions

4. **Password Reset**
   - Request reset via email
   - Secure token-based reset
   - New password confirmation

---

## 🗄️ Database Schema

### Core Tables

**profiles** - User information (extends auth.users)
- Stores: name, role, student_id, section, avatar

**assignments** - Teacher-created projects
- Multiple deadlines support (phases)
- Section-based distribution
- Team size constraints

**teams** - Student groups per assignment
- One student per team per assignment
- Team formation before deadline

**team_members** - Team membership tracking
- Status: active or left
- Join/leave before deadline

**team_invitations** - Invitation system
- Pending, accepted, or rejected
- Email notifications

**chat_messages** - Real-time team chat
- Team-specific channels
- Message history

**files** - File storage references
- Teachers: instructions, resources
- Students: submissions (PPT, PDF, ZIP, IPYNB)
- 10MB per file limit

**assignment_phases** - Multiple deadlines
- Review 1, Review 2, Final, etc.
- Phase-specific submissions

**submissions** - Team submissions per phase
- Grading support
- Feedback system

**notifications** - User alerts
- Assignment updates
- Team invitations
- Deadline reminders (24hr intervals when <1 week)

---

## 🚢 Deployment

### Deploy to Vercel

1. **Connect Repository**
   ```bash
   npm i -g vercel
   vercel login
   vercel
   ```

2. **Configure Environment Variables**
   - Go to Vercel Dashboard > Project > Settings > Environment Variables
   - Add all variables from `.env`

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Auto-Deployment**
   - Push to main branch → automatic deployment
   - Pull requests → preview deployments

### Update Supabase URLs

After deploying, update redirect URLs:
1. Supabase Dashboard > Authentication > URL Configuration
2. Add your Vercel URL to:
   - Site URL
   - Redirect URLs

---

## 📧 Email Notifications

CollabSpace sends emails for:

1. **New Assignment** - When teacher creates assignment
2. **Team Invitation** - When invited to join team
3. **Deadline Reminders** - Every 24hrs when <1 week left
4. **Team Member Joined/Left** - Team composition changes
5. **Submission Confirmation** - After successful submission

Configure in Supabase Dashboard > Authentication > Email Templates

---

## 🎯 User Roles & Permissions

### Admin
- ✅ View all users, assignments, teams
- ✅ System analytics and usage stats
- ✅ Create/manage users manually
- ✅ Platform configuration

### Teacher
- ✅ Create/edit own assignments
- ✅ Set multiple deadlines (phases)
- ✅ Upload instructions and resources
- ✅ Monitor team formation
- ✅ View submissions and grade
- ✅ Class-level analytics

### Student
- ✅ View assignments for their section
- ✅ Create teams and invite others
- ✅ Join one team per assignment
- ✅ Leave/join before deadline
- ✅ Real-time team chat
- ✅ Upload submissions (PPT, PDF, ZIP, IPYNB)
- ✅ View grades and feedback

---

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Build for production
npm run preview      # Preview production build locally
npm run lint         # Run ESLint
```

### Adding New Features

1. Create components in `src/components/`
2. Add pages in `src/pages/`
3. Update routes in `src/App.jsx`
4. Update database schema in `SUPABASE_SETUP.sql` if needed
5. Test thoroughly before deploying

---

## 🐛 Troubleshooting

### "Invalid API key" Error
- Check `.env` file exists and has correct Supabase credentials
- Restart dev server after changing `.env`

### Email Verification Not Working
- Check Supabase Dashboard > Authentication > Settings
- Ensure "Enable Email Confirmations" is ON
- Check email templates are configured

### File Upload Fails
- Ensure storage buckets are created in Supabase
- Check file size (10MB limit)
- Verify file type is allowed

### RLS Policy Errors
- Run `SUPABASE_SETUP.sql` completely
- Check policies in Supabase Dashboard > Authentication > Policies
- Ensure user is authenticated

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📝 License

[Add your license here]

---

## 🙏 Acknowledgments

- **Supabase** - Backend infrastructure
- **Vercel** - Deployment platform
- **TailwindCSS** - Styling framework
- **Lucide** - Icon library

---

## 📞 Support

- 📧 Email: [your-email@example.com]
- 🐛 Issues: [GitHub Issues](your-repo-url/issues)
- 📖 Docs: [Full Documentation](your-docs-url)

---

**Built with ❤️ for better collaboration**

Previous version archived in `backup-original-code` branch.
