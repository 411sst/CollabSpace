-- =====================================================
-- HOTFIX: Remove Infinite Recursion Policy
-- =====================================================
-- If you ran USER_DELETION_FIX.sql and now have authentication issues,
-- run this SQL to fix the infinite recursion problem.
--
-- Error you're seeing:
--   "infinite recursion detected in policy for relation profiles"
--
-- This happens because the original script created a bad RLS policy
-- that queries the profiles table while checking permissions on profiles.
-- =====================================================

-- Remove the problematic policy
DROP POLICY IF EXISTS "Only admins can call delete_user_safely" ON profiles;

-- That's it! Your authentication should work now.
-- The delete_user_safely() function still works - it uses SECURITY DEFINER
-- which already gives it the necessary privileges.

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Run this to verify the policy was removed:
-- SELECT policyname FROM pg_policies WHERE tablename = 'profiles';
--
-- You should NOT see "Only admins can call delete_user_safely" in the list.
-- =====================================================
