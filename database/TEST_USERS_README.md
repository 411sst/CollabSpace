# Creating Test Users for CollabSpace

This guide explains how to bulk-create test users for development and testing purposes.

## Overview

The test user dataset includes:
- **2 Admins** (Sarah Anderson, Michael Roberts)
- **3 Teachers** (Emily Johnson, David Williams, Jennifer Martinez)
- **20 Students** (10 in Section A, 10 in Section B)

All test users use standardized passwords for easy testing:
- Admins: `Admin@123`
- Teachers: `Teacher@123`
- Students: `Student@123`

## Files

- `database/test_users.csv` - CSV file with all test user data
- `scripts/bulk-create-users.js` - Node.js script to bulk create users
- `database/CREATE_TEST_USERS.sql` - SQL reference (see notes below)

## Method 1: Automated Bulk Creation (Recommended) ✅

This method uses the Supabase Admin API to properly create users with authentication.

### Prerequisites

1. **Node.js** installed (v16 or higher)
2. **Supabase Service Role Key** from your project

### Step 1: Get Your Service Role Key

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Project Settings** → **API**
4. Copy the `service_role` key (⚠️ **Keep this secret!**)

### Step 2: Configure Environment Variables

Add the service role key to your `.env` file:

```bash
# .env file
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Add this line
```

⚠️ **Security Warning**: Never commit your `.env` file or expose the service role key in frontend code!

### Step 3: Install Dependencies

```bash
npm install
```

This will install the required `dotenv` package along with other dependencies.

### Step 4: Run the Bulk Creation Script

```bash
npm run create-test-users
```

Or run directly:

```bash
node scripts/bulk-create-users.js
```

### What Happens

The script will:
1. ✅ Read `database/test_users.csv`
2. ✅ Create each user in Supabase Auth using Admin API
3. ✅ Auto-confirm their email addresses
4. ✅ Trigger automatic profile creation in the `profiles` table
5. ✅ Show progress for each user
6. ✅ Display a summary at the end

### Example Output

```
🚀 CollabSpace Bulk User Creation
==================================================
📖 Reading users from: /path/to/database/test_users.csv
✅ Found 25 users to create

Creating users...

✅ Created: admin1@collabspace.edu (admin)
✅ Created: admin2@collabspace.edu (admin)
✅ Created: teacher1@collabspace.edu (teacher)
...
✅ Created: student20@collabspace.edu (student)

==================================================
📊 Summary:
   Total:   25
   Created: 25 ✅
   Skipped: 0 ⏭️
   Failed:  0 ❌
==================================================

🎉 All users created successfully!
```

### Handling Existing Users

If a user already exists, the script will skip them:

```
⏭️  Skipped: admin1@collabspace.edu - User already exists
```

### Error Handling

If any users fail to create, the script will show specific error messages:

```
❌ Failed: student1@collabspace.edu - Invalid email format
```

Check the error messages and fix the CSV data if needed.

## Method 2: Manual Creation (Alternative)

If you prefer manual control or don't have Node.js:

### Option A: Supabase Dashboard UI

1. Go to **Authentication** → **Users** in Supabase Dashboard
2. Click **Add user**
3. Enter email, password, and user metadata
4. For each user, add metadata:
   ```json
   {
     "firstName": "Sarah",
     "lastName": "Anderson",
     "role": "admin"
   }
   ```
5. Click **Create user**
6. Repeat for all 25 users (tedious but works)

### Option B: Using Supabase CLI

If you have [Supabase CLI](https://supabase.com/docs/guides/cli) installed:

```bash
supabase functions deploy create-test-users
```

(You'll need to create an Edge Function for this - more complex)

## Method 3: SQL Approach (Not Recommended)

⚠️ **Note**: Direct SQL creation of auth users is not supported by Supabase for security reasons.

The `database/CREATE_TEST_USERS.sql` file documents this limitation and recommends using the Node.js script instead.

## Test User Credentials

### Admins (2)
| Email | Password | Name |
|-------|----------|------|
| admin1@collabspace.edu | Admin@123 | Sarah Anderson |
| admin2@collabspace.edu | Admin@123 | Michael Roberts |

### Teachers (3)
| Email | Password | Name |
|-------|----------|------|
| teacher1@collabspace.edu | Teacher@123 | Emily Johnson |
| teacher2@collabspace.edu | Teacher@123 | David Williams |
| teacher3@collabspace.edu | Teacher@123 | Jennifer Martinez |

### Students - Section A (10)
| Email | Password | Name | Student ID |
|-------|----------|------|------------|
| student1@collabspace.edu | Student@123 | Alex Thompson | CS2021001 |
| student2@collabspace.edu | Student@123 | Emma Davis | CS2021002 |
| student3@collabspace.edu | Student@123 | James Wilson | CS2021003 |
| student4@collabspace.edu | Student@123 | Olivia Brown | CS2021004 |
| student5@collabspace.edu | Student@123 | William Taylor | CS2021005 |
| student6@collabspace.edu | Student@123 | Sophia Moore | CS2021006 |
| student7@collabspace.edu | Student@123 | Benjamin Clark | CS2021007 |
| student8@collabspace.edu | Student@123 | Isabella Lewis | CS2021008 |
| student9@collabspace.edu | Student@123 | Lucas Walker | CS2021009 |
| student10@collabspace.edu | Student@123 | Mia Hall | CS2021010 |

### Students - Section B (10)
| Email | Password | Name | Student ID |
|-------|----------|------|------------|
| student11@collabspace.edu | Student@123 | Ethan Allen | CS2021011 |
| student12@collabspace.edu | Student@123 | Ava Young | CS2021012 |
| student13@collabspace.edu | Student@123 | Mason King | CS2021013 |
| student14@collabspace.edu | Student@123 | Charlotte Wright | CS2021014 |
| student15@collabspace.edu | Student@123 | Daniel Lopez | CS2021015 |
| student16@collabspace.edu | Student@123 | Amelia Hill | CS2021016 |
| student17@collabspace.edu | Student@123 | Henry Scott | CS2021017 |
| student18@collabspace.edu | Student@123 | Harper Green | CS2021018 |
| student19@collabspace.edu | Student@123 | Alexander Adams | CS2021019 |
| student20@collabspace.edu | Student@123 | Evelyn Baker | CS2021020 |

## Verifying User Creation

### Option 1: Supabase Dashboard

1. Go to **Authentication** → **Users**
2. You should see all 25 users listed
3. Each should have:
   - ✅ Confirmed email
   - ✅ User metadata (firstName, lastName, role, etc.)

### Option 2: Database Query

Run this SQL query in Supabase SQL Editor:

```sql
-- Check auth users count
SELECT COUNT(*) as auth_users_count
FROM auth.users;

-- Check profiles count
SELECT COUNT(*) as profiles_count
FROM profiles;

-- Check users by role
SELECT role, COUNT(*) as count
FROM profiles
GROUP BY role
ORDER BY role;
```

Expected results:
- `auth_users_count`: 25 (or more if you have other users)
- `profiles_count`: 25 (or more if you have other users)
- Role counts: admin: 2, teacher: 3, student: 20

### Option 3: Test Login

Try logging in with any test user:
1. Go to your app's login page
2. Use any test credential (e.g., `admin1@collabspace.edu` / `Admin@123`)
3. Verify you can log in successfully
4. Check that the user's role and profile data are correct

## Troubleshooting

### Error: "Missing environment variables"

**Solution**: Ensure `SUPABASE_SERVICE_ROLE_KEY` is set in your `.env` file.

### Error: "User already exists"

**Solution**: This is normal if you run the script multiple times. The script will skip existing users.

### Error: "Profile verification failed"

**Possible causes**:
1. The `handle_new_user()` trigger isn't working
2. Database permissions issue
3. Profile table RLS policies blocking insertion

**Solution**: Check the Supabase logs and ensure the trigger is properly configured.

### Error: "Cannot read CSV file"

**Solution**: Ensure `database/test_users.csv` exists and has the correct format.

### Error: "Rate limiting"

**Solution**: The script includes delays between user creations. If you still hit rate limits, increase the delay in `bulk-create-users.js` (line 154).

### Warning: "Leaked Password Protection Disabled"

**What it means**: Supabase can check passwords against known compromised passwords from data breaches.

**Solution Options**:

**Option 1 - Enable Before Creating Test Users** (Production-ready):
1. Enable "Leaked Password Protection" in Supabase Dashboard → Authentication → Policies
2. Update test passwords in `test_users.csv` to stronger ones (e.g., `SecureAdmin2024!Pass`)
3. Run the bulk creation script

**Option 2 - Enable After Creating Test Users** (Easier for Development):
1. Run the bulk creation script with current passwords
2. Enable "Leaked Password Protection" in Supabase Dashboard
3. ⚠️ Remember to change passwords before production

**Option 3 - Keep Disabled** (Development Only):
- Only acceptable for local development
- **Must enable** before production deployment

**More Details**: See `database/SUPABASE_SECURITY_CONFIG.md`

## Customizing Test Users

To add or modify test users:

1. Edit `database/test_users.csv`
2. Follow the CSV format:
   ```
   email,password,role,first_name,last_name,student_id,section
   ```
3. For admins/teachers: leave `student_id` and `section` empty
4. For students: provide both `student_id` and `section`
5. Run the script again

## Security Best Practices

1. ✅ **Never commit** `.env` file with real credentials
2. ✅ **Never expose** service role key in frontend code
3. ✅ **Use strong passwords** in production (not `Admin@123`!)
4. ✅ **Delete test users** from production databases
5. ✅ **Rotate service role key** if accidentally exposed
6. ✅ **Enable leaked password protection** in Supabase Dashboard (see warning above)
7. ✅ **Review security configuration** before production deployment

📖 **Complete Security Guide**: See `database/SUPABASE_SECURITY_CONFIG.md` for comprehensive security setup instructions.

## Deleting Test Users

To delete test users:

### Option 1: Admin Dashboard (UI)

1. Log in as admin
2. Go to Admin Dashboard → Users
3. Delete users one by one using the delete button

### Option 2: Bulk Delete (SQL)

```sql
-- Delete test users (be careful!)
DELETE FROM auth.users
WHERE email LIKE '%@collabspace.edu';
```

⚠️ **Warning**: This will permanently delete users and their data!

## Next Steps

After creating test users:

1. ✅ Test the login flow with different roles
2. ✅ Create sample assignments as a teacher
3. ✅ Form teams as students
4. ✅ Test all features with different user types
5. ✅ Verify RLS policies work correctly

## Support

If you encounter issues:

1. Check the [Supabase Documentation](https://supabase.com/docs)
2. Review the script output for specific error messages
3. Check Supabase logs in the Dashboard
4. Verify your database schema is up to date

---

**Happy Testing!** 🚀
