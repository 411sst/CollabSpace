-- CollabSpace Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor after creating your project

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. PROFILES TABLE (extends auth.users)
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
  student_id TEXT, -- For students only
  section TEXT,    -- For students only (class/section)
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. ASSIGNMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS assignments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  teacher_id UUID REFERENCES profiles(id) NOT NULL,
  sections TEXT[] NOT NULL, -- Array of sections this assignment is for
  min_team_size INTEGER NOT NULL CHECK (min_team_size > 0),
  max_team_size INTEGER NOT NULL CHECK (max_team_size >= min_team_size),
  team_formation_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. ASSIGNMENT PHASES TABLE (Review 1, 2, 3, etc.)
-- =====================================================
CREATE TABLE IF NOT EXISTS assignment_phases (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE NOT NULL,
  phase_number INTEGER NOT NULL,
  phase_name TEXT NOT NULL, -- e.g., "Review 1", "Review 2", "Final Submission"
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(assignment_id, phase_number)
);

-- =====================================================
-- 4. TEAMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS teams (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE NOT NULL,
  team_name TEXT NOT NULL,
  created_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(assignment_id, team_name)
);

-- =====================================================
-- 5. TEAM MEMBERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS team_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES profiles(id) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'left')) DEFAULT 'active',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, student_id)
);

-- =====================================================
-- 6. TEAM INVITATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS team_invitations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  from_student_id UUID REFERENCES profiles(id) NOT NULL,
  to_student_id UUID REFERENCES profiles(id) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(team_id, to_student_id)
);

-- =====================================================
-- 7. FILES TABLE (Instructions & Submissions)
-- =====================================================
CREATE TABLE IF NOT EXISTS files (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
  phase_id UUID REFERENCES assignment_phases(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES profiles(id) NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL, -- in bytes
  file_category TEXT NOT NULL CHECK (file_category IN ('instruction', 'submission', 'resource')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 8. CHAT MESSAGES TABLE (Team Chat)
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 9. SUBMISSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  phase_id UUID REFERENCES assignment_phases(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  submitted_by UUID REFERENCES profiles(id) NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  grade DECIMAL(5,2), -- e.g., 95.50
  feedback TEXT,
  graded_at TIMESTAMP WITH TIME ZONE,
  graded_by UUID REFERENCES profiles(id),
  UNIQUE(phase_id, team_id)
);

-- =====================================================
-- 10. NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('assignment', 'invitation', 'deadline', 'team', 'submission', 'grade')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT, -- Optional link to relevant page
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Assignments policies
CREATE POLICY "Everyone can view assignments"
  ON assignments FOR SELECT
  USING (true);

CREATE POLICY "Teachers can insert assignments"
  ON assignments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

CREATE POLICY "Teachers can update own assignments"
  ON assignments FOR UPDATE
  USING (teacher_id = auth.uid());

-- Team policies
CREATE POLICY "Students can view teams for their assignments"
  ON teams FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN assignments a ON a.sections @> ARRAY[p.section]
      WHERE p.id = auth.uid() AND a.id = teams.assignment_id
    )
  );

CREATE POLICY "Students can create teams"
  ON teams FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'student'
    )
  );

-- Team members policies
CREATE POLICY "Users can view team members"
  ON team_members FOR SELECT
  USING (true);

-- Chat messages policies
CREATE POLICY "Team members can view chat messages"
  ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_id = chat_messages.team_id
        AND student_id = auth.uid()
        AND status = 'active'
    )
  );

CREATE POLICY "Team members can send messages"
  ON chat_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_id = chat_messages.team_id
        AND student_id = auth.uid()
        AND status = 'active'
    )
  );

-- Notifications policies
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role, student_id, section)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'firstName',
    NEW.raw_user_meta_data->>'lastName',
    NEW.raw_user_meta_data->>'role',
    NEW.raw_user_meta_data->>'studentId',
    NEW.raw_user_meta_data->>'section'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at
  BEFORE UPDATE ON assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STORAGE BUCKETS
-- =====================================================

-- IMPORTANT: Storage buckets and policies must be created in Supabase Dashboard UI
-- SQL-based bucket creation is no longer supported in newer Supabase versions

-- Step 1: Create Buckets in Supabase Dashboard > Storage:
--   1. "assignment-files" (private)
--   2. "submissions" (private)
--   3. "avatars" (public)

-- Step 2: Create Storage Policies in Dashboard > Storage > [bucket] > Policies:
--
-- For "assignment-files" bucket:
--   - Policy: "Authenticated users can upload"
--     Operation: INSERT
--     Policy: auth.role() = 'authenticated'
--   - Policy: "Users can read their files"
--     Operation: SELECT
--     Policy: auth.role() = 'authenticated'
--
-- For "submissions" bucket:
--   - Policy: "Team members can upload"
--     Operation: INSERT
--     Policy: auth.role() = 'authenticated'
--   - Policy: "Users can read submissions"
--     Operation: SELECT
--     Policy: auth.role() = 'authenticated'
--
-- For "avatars" bucket (public):
--   - Policy: "Public can view avatars"
--     Operation: SELECT
--     Policy: true
--   - Policy: "Users can upload own avatar"
--     Operation: INSERT
--     Policy: auth.uid() = bucket_id

-- =====================================================
-- CREATE DEFAULT ADMIN ACCOUNT
-- =====================================================

-- After running this schema, create your first admin account:
-- 1. Sign up through the app UI or Supabase Dashboard
-- 2. Then run this query to make them admin:
-- UPDATE profiles SET role = 'admin' WHERE email = 'your-admin-email@example.com';

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_section ON profiles(section);
CREATE INDEX idx_assignments_teacher ON assignments(teacher_id);
CREATE INDEX idx_teams_assignment ON teams(assignment_id);
CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_student ON team_members(student_id);
CREATE INDEX idx_chat_messages_team ON chat_messages(team_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);

-- =====================================================
-- COMPLETED!
-- =====================================================
-- Your CollabSpace database is now ready!
-- Next steps:
-- 1. Create storage buckets in Supabase Dashboard
-- 2. Create your first admin account
-- 3. Configure email templates in Supabase Auth settings
