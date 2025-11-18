-- =====================================================
-- CREATE TEST USERS (SQL Approach - Alternative)
-- =====================================================
-- NOTE: This approach requires Supabase Admin API access
-- For local/development, use the Node.js script instead
--
-- If you have access to pg_net extension, you can use this
-- Otherwise, use scripts/bulk-create-users.js
-- =====================================================

-- Function to create a test user via Supabase Admin API
-- WARNING: This requires service role key and pg_net extension
CREATE OR REPLACE FUNCTION create_test_user_via_api(
  p_email TEXT,
  p_password TEXT,
  p_first_name TEXT,
  p_last_name TEXT,
  p_role TEXT,
  p_student_id TEXT DEFAULT NULL,
  p_section TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  -- NOTE: This is a placeholder function
  -- Supabase doesn't allow direct auth.users creation via SQL
  -- Use the Node.js script (scripts/bulk-create-users.js) instead

  RAISE NOTICE 'Cannot create auth users via SQL. Use Node.js script instead.';
  RAISE NOTICE 'Email: %, Role: %', p_email, p_role;

  RETURN json_build_object(
    'success', false,
    'error', 'SQL-based user creation not supported. Use Node.js script.'
  );
END;
$$;

-- =====================================================
-- ALTERNATIVE: Manual Profile Creation (Development Only)
-- =====================================================
-- WARNING: This creates profiles without auth.users records
-- Users won't be able to log in unless you create them via Supabase Auth UI
-- Use this ONLY if you manually create auth users first
-- =====================================================

-- Create profiles for existing auth users (if auth users already exist)
-- You must create auth users via Supabase Dashboard > Authentication first

/*
-- Example: If you already created auth users in Supabase Dashboard,
-- and just need to create/update their profiles:

INSERT INTO profiles (id, email, first_name, last_name, role)
VALUES
  -- Replace 'YOUR_AUTH_USER_ID' with actual UUID from auth.users
  ('YOUR_AUTH_USER_ID', 'admin1@collabspace.edu', 'Sarah', 'Anderson', 'admin')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role = EXCLUDED.role;
*/

-- =====================================================
-- RECOMMENDED APPROACH
-- =====================================================
-- Use the Node.js bulk import script:
--
--   1. Ensure you have Node.js installed
--   2. Add SUPABASE_SERVICE_ROLE_KEY to .env file
--   3. Run: npm install
--   4. Run: node scripts/bulk-create-users.js
--
-- This will:
--   - Create users in auth.users table
--   - Auto-confirm their emails
--   - Trigger profile creation automatically
--   - Provide detailed progress output
-- =====================================================

-- Test user data reference
COMMENT ON FUNCTION create_test_user_via_api IS
'Test Users to Create:
- 2 Admins: admin1@collabspace.edu, admin2@collabspace.edu
- 3 Teachers: teacher1-3@collabspace.edu
- 20 Students: student1-20@collabspace.edu (10 in Section A, 10 in Section B)

All passwords: Admin@123, Teacher@123, Student@123 respectively

CSV file: database/test_users.csv
Node.js script: scripts/bulk-create-users.js
';
