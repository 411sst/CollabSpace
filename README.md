# CollabSpace

A team collaboration platform built for academic projects — real-time chat, multi-phase assignments, and self-forming teams.

**Live demo → [collabsapce.vercel.app](https://collabsapce.vercel.app)**

---

## What it does

- **Students** form teams, invite teammates, submit work per phase, and chat in real time
- **Teachers** create multi-phase assignments with separate deadlines and monitor team progress
- **Admins** manage users, view system analytics, and control platform settings
- Secure by default — 50+ Row Level Security policies ensure users only see what they're allowed to

---

## Features

### Students
- Self-forming teams with an invitation system (one team per assignment)
- Real-time team chat powered by PostgreSQL LISTEN/NOTIFY
- Phase-aware submissions — upload PDFs, presentations, notebooks, or ZIPs per review deadline
- Email notifications for invitations, deadline reminders, and team changes

### Teachers
- Multi-phase assignments (Review 1, Review 2, Final, etc.) with independent deadlines
- Section-based assignment distribution and team size constraints
- File sharing for instructions and resources
- Submission overview with grading and feedback support

### Admins
- User management (manual creation or self-registration)
- System-wide analytics and usage stats
- Platform configuration

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18.3 + Vite 5.4 |
| Backend | Supabase (PostgreSQL, Auth, Realtime, Storage) |
| Styling | TailwindCSS 3.4 |
| State | Zustand |
| Routing | React Router v7 |
| Deployment | Vercel + Supabase |

---

## Quick start

```bash
git clone <your-repo-url>
cd CollabSpace
npm install

# Copy and fill in your Supabase credentials
cp .env.example .env

npm run dev
# → http://localhost:5173
```

**Database setup:**
1. Run `database/SUPABASE_SETUP.sql` in the Supabase SQL editor
2. Run `database/SUPABASE_SECURITY_FIXES.sql` for additional RLS policies
3. Create three storage buckets in the Supabase dashboard:
   - `assignment-files` (private)
   - `submissions` (private)
   - `avatars` (public)

**Environment variables** (`.env`):
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**First admin account:** register normally, then set `role = 'admin'` on your row in the `profiles` table via the Supabase dashboard.

---

## Deployment

```bash
npm i -g vercel
vercel --prod
```

After deploying, add your Vercel URL to **Supabase → Authentication → URL Configuration** (Site URL + Redirect URLs).

---

## License

MIT
