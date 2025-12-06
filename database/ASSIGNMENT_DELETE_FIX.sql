-- Fix: Add DELETE policy for assignments table
-- Issue: Teachers cannot delete assignments due to missing RLS policy

-- Add policy to allow teachers to delete their own assignments
CREATE POLICY "Teachers can delete own assignments"
  ON assignments FOR DELETE
  USING (teacher_id = auth.uid());
