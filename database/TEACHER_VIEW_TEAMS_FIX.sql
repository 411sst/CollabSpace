-- Fix: Allow teachers to view teams for their assignments
-- Issue: Teachers can't see teams because there's no RLS policy allowing it

-- Add policy for teachers to view teams for their assignments
DROP POLICY IF EXISTS "Teachers can view teams for their assignments" ON teams;
CREATE POLICY "Teachers can view teams for their assignments"
  ON teams FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM assignments
      WHERE assignments.id = teams.assignment_id
        AND assignments.teacher_id = auth.uid()
    )
  );
