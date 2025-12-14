-- Fix: Add INSERT policy for team_members table
-- Issue: Students cannot add members to teams due to missing RLS policy

-- Allow students to insert team members (for their own teams)
CREATE POLICY "Students can add team members"
  ON team_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'student'
    )
  );

-- Allow students to update team member status (e.g., leaving a team)
CREATE POLICY "Students can update team member status"
  ON team_members FOR UPDATE
  USING (
    student_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM teams t
      WHERE t.id = team_members.team_id
      AND t.created_by = auth.uid()
    )
  );

-- Allow team creators to delete team members
CREATE POLICY "Team creators can remove team members"
  ON team_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM teams t
      WHERE t.id = team_members.team_id
      AND t.created_by = auth.uid()
    )
  );
