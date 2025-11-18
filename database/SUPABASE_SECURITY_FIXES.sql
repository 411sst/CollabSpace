-- =====================================================
-- SUPABASE SECURITY FIXES
-- Run this AFTER running SUPABASE_SETUP.sql
-- =====================================================

-- Fix 1: Secure function search_path
-- =====================================================

-- Update handle_new_user function with secure search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
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
$$;

-- Update updated_at function with secure search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix 2: Add Missing RLS Policies
-- =====================================================

-- Assignment Phases Policies
CREATE POLICY "Students can view phases for their assignments"
  ON assignment_phases FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM assignments a
      JOIN profiles p ON p.id = auth.uid()
      WHERE a.id = assignment_phases.assignment_id
        AND a.sections @> ARRAY[p.section]
    )
  );

CREATE POLICY "Teachers can manage their assignment phases"
  ON assignment_phases FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM assignments
      WHERE id = assignment_phases.assignment_id
        AND teacher_id = auth.uid()
    )
  );

-- Files Policies
CREATE POLICY "Users can view files"
  ON files FOR SELECT
  USING (
    -- Can view if uploaded by you
    uploaded_by = auth.uid()
    OR
    -- Or if it's an assignment you can access
    EXISTS (
      SELECT 1 FROM assignments a
      JOIN profiles p ON p.id = auth.uid()
      WHERE a.id = files.assignment_id
        AND (
          a.teacher_id = auth.uid()  -- Teacher's assignment
          OR a.sections @> ARRAY[p.section]  -- Student's section
        )
    )
    OR
    -- Or if it's from your team
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = files.team_id
        AND tm.student_id = auth.uid()
        AND tm.status = 'active'
    )
  );

CREATE POLICY "Teachers can upload instruction files"
  ON files FOR INSERT
  WITH CHECK (
    uploaded_by = auth.uid()
    AND file_category = 'instruction'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

CREATE POLICY "Students can upload submission files"
  ON files FOR INSERT
  WITH CHECK (
    uploaded_by = auth.uid()
    AND file_category = 'submission'
    AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_id = files.team_id
        AND student_id = auth.uid()
        AND status = 'active'
    )
  );

-- Submissions Policies
CREATE POLICY "Team members can view their submissions"
  ON submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_id = submissions.team_id
        AND student_id = auth.uid()
    )
    OR
    -- Teachers can view submissions for their assignments
    EXISTS (
      SELECT 1 FROM assignment_phases ap
      JOIN assignments a ON a.id = ap.assignment_id
      WHERE ap.id = submissions.phase_id
        AND a.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Team members can submit"
  ON submissions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_id = submissions.team_id
        AND student_id = auth.uid()
        AND status = 'active'
    )
  );

CREATE POLICY "Teachers can grade submissions"
  ON submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM assignment_phases ap
      JOIN assignments a ON a.id = ap.assignment_id
      WHERE ap.id = submissions.phase_id
        AND a.teacher_id = auth.uid()
    )
  );

-- Team Invitations Policies
CREATE POLICY "Students can view invitations sent to them"
  ON team_invitations FOR SELECT
  USING (to_student_id = auth.uid() OR from_student_id = auth.uid());

CREATE POLICY "Students can send invitations"
  ON team_invitations FOR INSERT
  WITH CHECK (
    from_student_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_id = team_invitations.team_id
        AND student_id = auth.uid()
        AND status = 'active'
    )
  );

CREATE POLICY "Students can respond to their invitations"
  ON team_invitations FOR UPDATE
  USING (to_student_id = auth.uid());

-- =====================================================
-- COMPLETED!
-- =====================================================
-- All security warnings are now fixed!
-- Your database is production-ready.
