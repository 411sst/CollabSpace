# User Deletion Fix

## Problem

When attempting to delete users from the admin dashboard, you're experiencing a **500 Internal Server Error**. This occurs because:

1. **Foreign Key Constraints**: Users have relationships with other tables (teams, messages, assignments, etc.) without `ON DELETE CASCADE` configured
2. **Incomplete Deletion**: The original code only tried to delete from the `profiles` table, which fails when foreign key constraints exist
3. **No Auth Cleanup**: The `auth.users` record remains even after profile deletion attempts

## Root Cause

The database schema has multiple tables referencing `profiles(id)`:
- `assignments.teacher_id` → prevents teacher deletion if they have assignments
- `teams.created_by` → prevents deletion if user created teams
- `team_members.student_id` → prevents deletion if user is a team member
- `team_invitations` → prevents deletion if user has pending invitations
- `chat_messages.sender_id` → prevents deletion if user sent messages
- `files.uploaded_by` → prevents deletion if user uploaded files
- `submissions.submitted_by/graded_by` → prevents deletion if user has submissions

When trying to delete a user without handling these relationships, PostgreSQL throws an error due to foreign key constraint violations.

## Solution

We've implemented a **safe user deletion function** that:

1. ✅ Checks if the user exists
2. ✅ Prevents deletion of teachers with existing assignments
3. ✅ Deletes all user notifications
4. ✅ Deletes chat messages sent by the user
5. ✅ Updates submissions (sets graded_by to NULL if user was grader)
6. ✅ Deletes submissions submitted by the user
7. ✅ Deletes files uploaded by the user
8. ✅ Deletes team invitations
9. ✅ Removes user from all teams
10. ✅ Deletes teams created by the user
11. ✅ Finally deletes the profile

## How to Apply the Fix

### Step 1: Run the SQL Migration

1. Open your Supabase Dashboard
2. Go to **SQL Editor**
3. Copy and paste the contents of `USER_DELETION_FIX.sql`
4. Click **Run**

This will create the `delete_user_safely()` PostgreSQL function.

### Step 2: Deploy the Frontend Changes

The `AdminDashboard.jsx` has been updated to use the new deletion function instead of directly deleting from the profiles table.

Changes made:
- Updated `handleDeleteUser()` function to call `supabase.rpc('delete_user_safely')`
- Added proper error handling for function responses
- Added missing `Briefcase` icon import

### Step 3: Test the Fix

1. Log in as an admin
2. Navigate to Admin Dashboard → Users
3. Try deleting a test user
4. Verify that:
   - Users without dependencies delete successfully
   - Teachers with assignments show an appropriate error message
   - All related data is properly cleaned up

## Additional Options

### Option A: Use Automatic Cascading (Alternative)

If you prefer automatic cascading deletes instead of the function approach, uncomment the `ALTER TABLE` statements at the bottom of `USER_DELETION_FIX.sql`. This will:

- Automatically delete notifications, chat messages, team memberships, and invitations
- Set uploaded_by/submitted_by/graded_by to NULL for files and submissions
- Prevent deletion if user has teams or assignments (RESTRICT)

**Warning**: Automatic cascading can delete data without explicit confirmation. The function approach gives more control.

### Option B: Auth User Deletion (Advanced)

To also delete the user from Supabase Auth (`auth.users` table), you need to:

1. Create a Supabase Edge Function with admin privileges
2. Call `supabase.auth.admin.deleteUser(userId)` from the Edge Function
3. Update the frontend to call the Edge Function

This is more complex and requires setting up Supabase Edge Functions with service role keys.

## What Changed

### Files Modified:
- ✅ `src/pages/dashboards/AdminDashboard.jsx` - Updated user deletion handler
- ✅ `database/USER_DELETION_FIX.sql` - New SQL migration file
- ✅ `database/USER_DELETION_README.md` - This documentation

### Database Changes:
- ✅ Created `delete_user_safely(UUID)` function
- ✅ Added RPC permission for authenticated users

## Testing Checklist

- [ ] SQL function created successfully in Supabase
- [ ] Can delete users without dependencies
- [ ] Teachers with assignments show appropriate error
- [ ] Related data (notifications, messages, etc.) is cleaned up
- [ ] No 500 errors occur during deletion
- [ ] Frontend shows appropriate success/error messages

## Troubleshooting

### Error: "function delete_user_safely does not exist"
**Solution**: Make sure you ran the `USER_DELETION_FIX.sql` in your Supabase SQL Editor.

### Error: "permission denied for function delete_user_safely"
**Solution**: The RPC policy requires admin role. Make sure your user has `role = 'admin'` in the profiles table.

### Error: "Cannot delete teacher with existing assignments"
**Solution**: This is intentional. Delete or reassign the teacher's assignments first, or manually remove the teacher_id references.

## Notes

- ⚠️ User deletion is **irreversible**
- ⚠️ This does NOT delete the auth.users record (requires admin API/Edge Function)
- ⚠️ Teachers with assignments cannot be deleted (by design)
- ✅ All user data is properly cleaned up before profile deletion
- ✅ Function returns detailed error messages for troubleshooting
