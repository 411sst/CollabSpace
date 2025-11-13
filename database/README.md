# Database Setup Guide

This folder contains all database-related files for CollabSpace.

---

## 📁 Files

### 1. `SUPABASE_SETUP.sql`
**Purpose:** Complete database schema setup
**Size:** 372 lines
**Contains:**
- All 10 table definitions
- Primary keys, foreign keys, and constraints
- Triggers and functions
- Performance indexes
- Initial Row Level Security (RLS) policies

### 2. `SUPABASE_SECURITY_FIXES.sql`
**Purpose:** Enhanced security policies
**Size:** 186 lines
**Contains:**
- Additional RLS policies for granular access control
- Secure function definitions with proper search_path
- Complete access control for all user roles

---

## 🚀 Quick Setup

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login
3. Click "New Project"
4. Fill in:
   - **Name:** CollabSpace
   - **Database Password:** (save this securely)
   - **Region:** Choose closest to you
5. Wait 2-3 minutes for database provisioning

### Step 2: Run Database Schema

1. Go to your Supabase Dashboard
2. Navigate to: **SQL Editor** (left sidebar)
3. Click **"New Query"**
4. Copy entire contents of `SUPABASE_SETUP.sql`
5. Paste into SQL Editor
6. Click **"Run"** (or press Ctrl/Cmd + Enter)
7. Wait for completion (should see "Success" message)

### Step 3: Apply Security Fixes

1. In SQL Editor, click **"New Query"** again
2. Copy entire contents of `SUPABASE_SECURITY_FIXES.sql`
3. Paste into SQL Editor
4. Click **"Run"**
5. Verify success

### Step 4: Create Storage Buckets

1. Navigate to: **Storage** (left sidebar)
2. Click **"Create a new bucket"**
3. Create these 3 buckets:

   **Bucket 1: assignment-files**
   - Name: `assignment-files`
   - Public: ❌ No (Private)
   - File size limit: 10 MB
   - Allowed MIME types: All

   **Bucket 2: submissions**
   - Name: `submissions`
   - Public: ❌ No (Private)
   - File size limit: 10 MB
   - Allowed MIME types: PDF, PPT, PPTX, ZIP, IPYNB

   **Bucket 3: avatars**
   - Name: `avatars`
   - Public: ✅ Yes (Public)
   - File size limit: 2 MB
   - Allowed MIME types: Images only

### Step 5: Configure Storage Policies

For each bucket, add these policies via Dashboard:

**For assignment-files:**
```sql
-- Teachers can upload
CREATE POLICY "Teachers can upload files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'assignment-files' AND
  auth.role() = 'authenticated'
);

-- Authenticated users can read
CREATE POLICY "Authenticated users can read"
ON storage.objects FOR SELECT
USING (bucket_id = 'assignment-files' AND auth.role() = 'authenticated');
```

**For submissions:**
```sql
-- Students can upload
CREATE POLICY "Students can upload submissions"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'submissions' AND
  auth.role() = 'authenticated'
);

-- Team members and teachers can read
CREATE POLICY "Users can read submissions"
ON storage.objects FOR SELECT
USING (bucket_id = 'submissions' AND auth.role() = 'authenticated');
```

**For avatars (public):**
```sql
-- Anyone can view
CREATE POLICY "Public avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Users can upload own avatar
CREATE POLICY "Users upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
```

### Step 6: Get API Credentials

1. Navigate to: **Settings > API** (left sidebar)
2. Copy these values:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`
3. Add to `.env` file in project root

### Step 7: Create First Admin Account

1. Register through the application UI (use role: Student)
2. Go to Supabase Dashboard → **Table Editor** → **profiles**
3. Find your account row
4. Click to edit
5. Change `role` from `student` to `admin`
6. Click **Save**
7. Log out and log back in to the application

---

## 📊 Database Schema Overview

### Tables (10 total)

```
1. profiles          - User accounts (extends Supabase Auth)
2. assignments       - Teacher-created projects
3. assignment_phases - Multi-phase deadlines (weak entity)
4. teams             - Student groups per assignment
5. team_members      - Team membership (junction table)
6. team_invitations  - Invitation system
7. chat_messages     - Real-time team chat
8. files             - File storage references
9. submissions       - Team submissions per phase
10. notifications    - User notification system
```

### Key Features

✅ **10 Tables** with Row Level Security
✅ **25+ Indexes** for performance
✅ **50+ RLS Policies** for access control
✅ **2 Triggers** (auto-profile creation, timestamp updates)
✅ **2 Functions** (handle_new_user, update_updated_at)
✅ **All in BCNF** (Boyce-Codd Normal Form)

---

## 🔐 Security Features

### Row Level Security (RLS)

Every table has RLS enabled with granular policies:

- **Students** can only see their section's assignments
- **Teachers** can only modify their own assignments
- **Team members** can only view their team's chat
- **Users** can only update their own profile
- **Admins** have elevated privileges (configured in policies)

### Authentication

- Email/password authentication via Supabase Auth
- Email verification required
- Secure password reset flow
- JWT token-based sessions
- Role-based access control (admin, teacher, student)

---

## 🛠️ Troubleshooting

### Common Issues

**Issue: "relation already exists" error**
```
Solution: Tables already exist. Either:
1. Drop existing tables first (⚠️ data loss), or
2. This is a fresh install - ignore if setup completed successfully
```

**Issue: RLS policies preventing access**
```
Solution: Ensure you're authenticated and check:
1. User role is set correctly in profiles table
2. Policies are applied (run SUPABASE_SECURITY_FIXES.sql)
3. Check Supabase logs for detailed error
```

**Issue: Storage bucket not accessible**
```
Solution:
1. Verify bucket exists in Storage section
2. Check storage policies are configured
3. Ensure file MIME type is allowed
```

**Issue: Triggers not firing**
```
Solution:
1. Verify triggers exist: SELECT * FROM pg_trigger;
2. Re-run SUPABASE_SETUP.sql if missing
3. Check function definitions are secure (search_path set)
```

---

## 📖 Documentation References

For detailed information about the database design:

- **[ER_DIAGRAM.md](../docs/ER_DIAGRAM.md)** - Entity-Relationship model
- **[DATABASE_DESIGN.md](../docs/DATABASE_DESIGN.md)** - Keys, constraints, triggers, indexes
- **[NORMALIZATION_ANALYSIS.md](../docs/NORMALIZATION_ANALYSIS.md)** - Normal forms analysis
- **[SQL_SHOWCASE.md](../docs/SQL_SHOWCASE.md)** - Example queries
- **[TRANSACTION_MANAGEMENT.md](../docs/TRANSACTION_MANAGEMENT.md)** - ACID, concurrency, locking

---

## 🔄 Database Maintenance

### Backups

Supabase provides:
- **Automatic daily backups** (retained for 7 days on free tier)
- **Point-in-time recovery** (up to 7 days)
- **Manual backup via pg_dump** (recommended for production)

### Migrations

For schema changes:
1. Test changes in development project first
2. Create migration SQL file
3. Apply to production during low-traffic period
4. Verify with SELECT queries
5. Monitor for errors in Dashboard > Logs

### Performance Monitoring

Check performance metrics in Supabase Dashboard:
- **Database > Logs** - Query performance
- **Database > Pooler** - Connection usage
- **Database > Roles** - Active queries
- Consider adding indexes if queries are slow

---

## 💡 Tips for DBMS Presentation

When presenting the database:

1. **Show the schema** - Use Table Editor in Dashboard
2. **Demonstrate RLS** - Try accessing data with different user roles
3. **Highlight normalization** - Point out BCNF compliance
4. **Show relationships** - Use the ER diagram documentation
5. **Explain indexes** - Show why each index improves performance
6. **Demo transactions** - Show ACID properties in action

---

## ✅ Setup Verification Checklist

After setup, verify everything works:

- [ ] All 10 tables exist in Table Editor
- [ ] Triggers are present (check pg_trigger)
- [ ] Functions are defined (check routines)
- [ ] RLS is enabled on all tables
- [ ] Storage buckets are created (3 total)
- [ ] Can register new user through app
- [ ] Auto-profile creation works (check profiles table)
- [ ] Can create assignment as teacher
- [ ] Can create team as student
- [ ] Real-time chat works
- [ ] File upload works

---

## 📞 Support

If you encounter issues:

1. Check Supabase Dashboard > **Logs** for errors
2. Review RLS policies in **Authentication > Policies**
3. Verify table structure in **Table Editor**
4. Check function definitions in **Database > Functions**

---

**Database setup complete! 🚀**

Your CollabSpace database is now ready for production use.
