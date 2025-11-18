-- =====================================================
-- USER DELETION FIX
-- Run this SQL to enable proper user deletion
-- =====================================================

-- Function to safely delete a user and all their related data
CREATE OR REPLACE FUNCTION public.delete_user_safely(user_id UUID)
RETURNS JSON
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_role TEXT;
  assignment_count INTEGER;
  result JSON;
BEGIN
  -- Check if user exists
  SELECT role INTO user_role FROM profiles WHERE id = user_id;

  IF user_role IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;

  -- Prevent deletion of teachers who have created assignments
  IF user_role = 'teacher' THEN
    SELECT COUNT(*) INTO assignment_count
    FROM assignments
    WHERE teacher_id = user_id;

    IF assignment_count > 0 THEN
      RETURN json_build_object(
        'success', false,
        'error', 'Cannot delete teacher with existing assignments. Please delete or reassign their assignments first.',
        'assignment_count', assignment_count
      );
    END IF;
  END IF;

  -- Start deletion process
  -- 1. Delete user's notifications
  DELETE FROM notifications WHERE user_id = user_id;

  -- 2. Delete chat messages sent by user
  DELETE FROM chat_messages WHERE sender_id = user_id;

  -- 3. Update submissions where user was grader (set to NULL instead of deleting)
  UPDATE submissions SET graded_by = NULL WHERE graded_by = user_id;

  -- 4. Delete submissions submitted by user
  DELETE FROM submissions WHERE submitted_by = user_id;

  -- 5. Delete files uploaded by user
  DELETE FROM files WHERE uploaded_by = user_id;

  -- 6. Delete team invitations involving the user
  DELETE FROM team_invitations WHERE from_student_id = user_id OR to_student_id = user_id;

  -- 7. Remove user from teams (delete team_members records)
  DELETE FROM team_members WHERE student_id = user_id;

  -- 8. Delete teams created by the user (if they're empty or orphaned)
  DELETE FROM teams WHERE created_by = user_id;

  -- 9. Finally, delete the profile
  DELETE FROM profiles WHERE id = user_id;

  -- Return success
  RETURN json_build_object(
    'success', true,
    'message', 'User deleted successfully',
    'deleted_user_id', user_id
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_user_safely(UUID) TO authenticated;

-- RPC policy: Only admins can delete users
CREATE POLICY "Only admins can call delete_user_safely"
  ON profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- ALTERNATIVE: Add ON DELETE CASCADE to foreign keys
-- =====================================================
-- Run these if you want automatic cascading deletes instead
-- WARNING: This will automatically delete related data

-- Drop existing foreign key constraints and recreate with CASCADE
-- Note: Only run these if you want automatic cascading behavior

/*
-- Notifications (CASCADE is good here)
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE notifications ADD CONSTRAINT notifications_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Chat messages (CASCADE is good here)
ALTER TABLE chat_messages DROP CONSTRAINT IF EXISTS chat_messages_sender_id_fkey;
ALTER TABLE chat_messages ADD CONSTRAINT chat_messages_sender_id_fkey
  FOREIGN KEY (sender_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Team members (CASCADE is good here)
ALTER TABLE team_members DROP CONSTRAINT IF EXISTS team_members_student_id_fkey;
ALTER TABLE team_members ADD CONSTRAINT team_members_student_id_fkey
  FOREIGN KEY (student_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Team invitations (CASCADE is good here)
ALTER TABLE team_invitations DROP CONSTRAINT IF EXISTS team_invitations_from_student_id_fkey;
ALTER TABLE team_invitations ADD CONSTRAINT team_invitations_from_student_id_fkey
  FOREIGN KEY (from_student_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE team_invitations DROP CONSTRAINT IF EXISTS team_invitations_to_student_id_fkey;
ALTER TABLE team_invitations ADD CONSTRAINT team_invitations_to_student_id_fkey
  FOREIGN KEY (to_student_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Files (SET NULL might be better to preserve records)
ALTER TABLE files DROP CONSTRAINT IF EXISTS files_uploaded_by_fkey;
ALTER TABLE files ADD CONSTRAINT files_uploaded_by_fkey
  FOREIGN KEY (uploaded_by) REFERENCES profiles(id) ON DELETE SET NULL;

-- Submissions submitted_by (SET NULL might be better)
ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_submitted_by_fkey;
ALTER TABLE submissions ADD CONSTRAINT submissions_submitted_by_fkey
  FOREIGN KEY (submitted_by) REFERENCES profiles(id) ON DELETE SET NULL;

-- Submissions graded_by (SET NULL is better)
ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_graded_by_fkey;
ALTER TABLE submissions ADD CONSTRAINT submissions_graded_by_fkey
  FOREIGN KEY (graded_by) REFERENCES profiles(id) ON DELETE SET NULL;

-- Teams created_by (RESTRICT is better - prevent deletion if they have teams)
ALTER TABLE teams DROP CONSTRAINT IF EXISTS teams_created_by_fkey;
ALTER TABLE teams ADD CONSTRAINT teams_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE RESTRICT;

-- Assignments teacher_id (RESTRICT is better - prevent deletion if they have assignments)
ALTER TABLE assignments DROP CONSTRAINT IF EXISTS assignments_teacher_id_fkey;
ALTER TABLE assignments ADD CONSTRAINT assignments_teacher_id_fkey
  FOREIGN KEY (teacher_id) REFERENCES profiles(id) ON DELETE RESTRICT;
*/

-- =====================================================
-- COMPLETED!
-- =====================================================
-- You can now use the delete_user_safely() function
-- or uncomment the CASCADE statements above for automatic cascading
