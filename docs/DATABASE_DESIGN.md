# Database Design - Constraints, Keys, Triggers, and Functions

## Overview

This document provides a comprehensive analysis of database design elements in CollabSpace, covering:
- **Keys** (Primary, Foreign, Candidate, Composite)
- **Constraints** (Domain, Referential Integrity, Semantic)
- **Triggers** (Event-driven automation)
- **Functions** (Stored procedures and business logic)
- **Indexes** (Performance optimization)

These elements align with **Unit 1** (Database Design) and **Unit 2** (Triggers, Functions, Procedures) of the DBMS syllabus.

---

## 1. Keys

### 1.1 Primary Keys

All tables use **UUID (Universally Unique Identifier)** as primary keys for:
- Global uniqueness across distributed systems
- No sequential information leakage
- Easier data migration and replication

#### Primary Key Definitions

```sql
-- profiles
id UUID REFERENCES auth.users(id) PRIMARY KEY

-- assignments
id UUID DEFAULT uuid_generate_v4() PRIMARY KEY

-- assignment_phases
id UUID DEFAULT uuid_generate_v4() PRIMARY KEY

-- teams
id UUID DEFAULT uuid_generate_v4() PRIMARY KEY

-- team_members
id UUID DEFAULT uuid_generate_v4() PRIMARY KEY

-- team_invitations
id UUID DEFAULT uuid_generate_v4() PRIMARY KEY

-- files
id UUID DEFAULT uuid_generate_v4() PRIMARY KEY

-- chat_messages
id UUID DEFAULT uuid_generate_v4() PRIMARY KEY

-- submissions
id UUID DEFAULT uuid_generate_v4() PRIMARY KEY

-- notifications
id UUID DEFAULT uuid_generate_v4() PRIMARY KEY
```

**Benefits:**
- ✅ Unique identification
- ✅ No collisions even with concurrent inserts
- ✅ Indexed by default (B-tree index)
- ✅ Immutable (never changes)

---

### 1.2 Foreign Keys

Foreign keys enforce **referential integrity** between tables.

#### Foreign Key Definitions by Table

**ASSIGNMENTS:**
```sql
teacher_id UUID REFERENCES profiles(id) NOT NULL
```
- Ensures every assignment has a valid teacher
- Prevents deletion of teacher profiles with assignments

**ASSIGNMENT_PHASES:**
```sql
assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE NOT NULL
```
- Weak entity relationship
- Cascade delete: removing assignment removes all phases

**TEAMS:**
```sql
assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE NOT NULL
created_by UUID REFERENCES profiles(id) NOT NULL
```
- Team belongs to assignment and creator
- Cascade delete with assignment

**TEAM_MEMBERS:**
```sql
team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL
student_id UUID REFERENCES profiles(id) NOT NULL
```
- Junction table for many-to-many relationship
- Cascade delete with team

**TEAM_INVITATIONS:**
```sql
team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL
from_student_id UUID REFERENCES profiles(id) NOT NULL
to_student_id UUID REFERENCES profiles(id) NOT NULL
```
- Multiple foreign keys to same table (self-referencing via profiles)
- Cascade delete with team

**FILES:**
```sql
assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE
phase_id UUID REFERENCES assignment_phases(id) ON DELETE CASCADE
team_id UUID REFERENCES teams(id) ON DELETE CASCADE
uploaded_by UUID REFERENCES profiles(id) NOT NULL
```
- Multiple optional foreign keys (nullable)
- Allows files for assignments, phases, or teams

**CHAT_MESSAGES:**
```sql
team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL
sender_id UUID REFERENCES profiles(id) NOT NULL
```
- Messages belong to team and sender
- Cascade delete preserves data integrity

**SUBMISSIONS:**
```sql
phase_id UUID REFERENCES assignment_phases(id) ON DELETE CASCADE NOT NULL
team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL
submitted_by UUID REFERENCES profiles(id) NOT NULL
graded_by UUID REFERENCES profiles(id)
```
- Composite business key (phase_id, team_id)
- Multiple references to profiles table

**NOTIFICATIONS:**
```sql
user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL
```
- User-specific notifications
- Cascade delete for data privacy

---

### 1.3 Candidate Keys

**Candidate keys** are unique identifiers that could serve as primary keys.

#### Candidate Key Summary

| Table | Primary Key | Candidate Keys |
|-------|-------------|----------------|
| profiles | `id` | `email` |
| assignments | `id` | None (natural key not applicable) |
| assignment_phases | `id` | `{assignment_id, phase_number}` |
| teams | `id` | `{assignment_id, team_name}` |
| team_members | `id` | `{team_id, student_id}` |
| team_invitations | `id` | `{team_id, to_student_id}` |
| files | `id` | `file_url` (unique storage path) |
| chat_messages | `id` | None |
| submissions | `id` | `{phase_id, team_id}` |
| notifications | `id` | None |

---

### 1.4 Composite Keys

**Composite keys** ensure uniqueness across multiple columns.

```sql
-- assignment_phases: One team cannot submit multiple times for same phase
UNIQUE(assignment_id, phase_number)

-- teams: Unique team name per assignment
UNIQUE(assignment_id, team_name)

-- team_members: Student can join a team only once
UNIQUE(team_id, student_id)

-- team_invitations: One invitation per student per team
UNIQUE(team_id, to_student_id)

-- submissions: One submission per team per phase
UNIQUE(phase_id, team_id)
```

**Benefits:**
- Prevents duplicate entries
- Enforces business rules at database level
- Creates automatic indexes for faster queries

---

## 2. Constraints

### 2.1 Domain Constraints

Domain constraints limit the values an attribute can take.

#### CHECK Constraints

```sql
-- profiles: Role must be one of three values
role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'student'))

-- assignments: Team size validations
min_team_size INTEGER NOT NULL CHECK (min_team_size > 0)
max_team_size INTEGER NOT NULL CHECK (max_team_size >= min_team_size)

-- team_members: Status must be valid
status TEXT NOT NULL CHECK (status IN ('active', 'left')) DEFAULT 'active'

-- team_invitations: Status must be valid
status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending'

-- files: Category must be valid
file_category TEXT NOT NULL CHECK (file_category IN ('instruction', 'submission', 'resource'))

-- submissions: Grade range validation (implicit via DECIMAL(5,2))
grade DECIMAL(5,2)  -- Max 999.99

-- notifications: Type must be valid
type TEXT NOT NULL CHECK (type IN ('assignment', 'invitation', 'deadline', 'team', 'submission', 'grade'))
```

**Benefits:**
- Prevents invalid data at insertion
- Enforces business rules
- Documents allowed values
- Better than application-level validation (can't be bypassed)

---

### 2.2 NOT NULL Constraints

Ensures mandatory attributes always have values.

```sql
-- profiles
email TEXT NOT NULL
first_name TEXT NOT NULL
last_name TEXT NOT NULL
role TEXT NOT NULL

-- assignments
title TEXT NOT NULL
description TEXT NOT NULL
teacher_id UUID NOT NULL
sections TEXT[] NOT NULL
min_team_size INTEGER NOT NULL
max_team_size INTEGER NOT NULL
team_formation_deadline TIMESTAMP WITH TIME ZONE NOT NULL

-- assignment_phases
assignment_id UUID NOT NULL
phase_number INTEGER NOT NULL
phase_name TEXT NOT NULL
deadline TIMESTAMP WITH TIME ZONE NOT NULL

-- teams
assignment_id UUID NOT NULL
team_name TEXT NOT NULL
created_by UUID NOT NULL

-- team_members
team_id UUID NOT NULL
student_id UUID NOT NULL
status TEXT NOT NULL

-- chat_messages
team_id UUID NOT NULL
sender_id UUID NOT NULL
message TEXT NOT NULL

-- submissions
phase_id UUID NOT NULL
team_id UUID NOT NULL
submitted_by UUID NOT NULL

-- files
uploaded_by UUID NOT NULL
file_name TEXT NOT NULL
file_url TEXT NOT NULL
file_type TEXT NOT NULL
file_size INTEGER NOT NULL
file_category TEXT NOT NULL

-- notifications
user_id UUID NOT NULL
type TEXT NOT NULL
title TEXT NOT NULL
message TEXT NOT NULL
```

---

### 2.3 UNIQUE Constraints

Prevents duplicate values in columns or column combinations.

```sql
-- profiles: Email must be unique
email TEXT UNIQUE NOT NULL

-- assignment_phases: Unique phase number per assignment
UNIQUE(assignment_id, phase_number)

-- teams: Unique team name per assignment
UNIQUE(assignment_id, team_name)

-- team_members: Student joins team only once
UNIQUE(team_id, student_id)

-- team_invitations: One invitation per student per team
UNIQUE(team_id, to_student_id)

-- submissions: One submission per team per phase
UNIQUE(phase_id, team_id)
```

---

### 2.4 DEFAULT Constraints

Provides automatic values for attributes.

```sql
-- All tables: Automatic timestamp
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()

-- All tables with UUID: Auto-generate primary key
id UUID DEFAULT uuid_generate_v4() PRIMARY KEY

-- team_members: Active by default
status TEXT NOT NULL CHECK (status IN ('active', 'left')) DEFAULT 'active'

-- team_invitations: Pending by default
status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending'

-- notifications: Unread by default
is_read BOOLEAN DEFAULT FALSE
```

---

### 2.5 Referential Integrity Constraints

#### ON DELETE CASCADE

Automatically removes dependent records when parent is deleted.

```sql
-- Delete assignment → deletes phases, teams, files
assignments(id) ← assignment_phases(assignment_id) ON DELETE CASCADE
assignments(id) ← teams(assignment_id) ON DELETE CASCADE
assignments(id) ← files(assignment_id) ON DELETE CASCADE

-- Delete team → deletes members, invitations, messages, submissions
teams(id) ← team_members(team_id) ON DELETE CASCADE
teams(id) ← team_invitations(team_id) ON DELETE CASCADE
teams(id) ← chat_messages(team_id) ON DELETE CASCADE
teams(id) ← submissions(team_id) ON DELETE CASCADE

-- Delete phase → deletes submissions
assignment_phases(id) ← submissions(phase_id) ON DELETE CASCADE

-- Delete profile → deletes notifications (for privacy)
profiles(id) ← notifications(user_id) ON DELETE CASCADE
```

#### ON DELETE RESTRICT (Default)

Prevents deletion if dependent records exist.

```sql
-- Cannot delete profile if they created assignments
profiles(id) ← assignments(teacher_id)  -- Default RESTRICT

-- Cannot delete profile if they are team members
profiles(id) ← team_members(student_id)  -- Default RESTRICT

-- Cannot delete profile if they sent messages
profiles(id) ← chat_messages(sender_id)  -- Default RESTRICT
```

**Design Decision:**
- **CASCADE:** For ownership relationships (assignment owns phases)
- **RESTRICT:** For historical records (preserve academic history)

---

## 3. Triggers

Triggers are **event-driven** database objects that automatically execute in response to INSERT, UPDATE, or DELETE operations.

### 3.1 Trigger: Auto-create Profile on User Signup

**Purpose:** Automatically create a profile record when a user signs up via Supabase Auth.

```sql
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

**Details:**
- **Event:** AFTER INSERT on `auth.users`
- **Action:** Create corresponding profile record
- **NEW:** Refers to the newly inserted user record
- **raw_user_meta_data:** JSON field containing registration form data
- **SECURITY DEFINER:** Runs with creator's permissions (bypasses RLS)
- **SET search_path:** Security best practice (prevents function hijacking)

**Why needed?**
- Supabase Auth stores authentication data in `auth.users`
- Application data stored in `public.profiles`
- Trigger bridges the two schemas automatically

---

### 3.2 Trigger: Auto-update `updated_at` Timestamp

**Purpose:** Automatically update the `updated_at` column whenever a row is modified.

```sql
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

-- Apply to profiles table
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply to assignments table
CREATE TRIGGER update_assignments_updated_at
  BEFORE UPDATE ON assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply to teams table
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Details:**
- **Event:** BEFORE UPDATE on multiple tables
- **Action:** Set `updated_at` to current timestamp
- **NEW:** Refers to the new version of the row
- **RETURN NEW:** Required for BEFORE triggers (modified row is saved)

**Why needed?**
- Automatic audit trail
- Track last modification time
- No manual timestamp management in application code

---

### 3.3 Potential Custom Triggers (Demonstration)

These are not currently implemented but demonstrate trigger capabilities:

#### Auto-create Notifications

```sql
-- Hypothetical: Notify students when a new assignment is created
CREATE OR REPLACE FUNCTION notify_students_new_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, message, link)
  SELECT
    p.id,
    'assignment',
    'New Assignment: ' || NEW.title,
    'A new assignment has been posted for your section',
    '/assignments/' || NEW.id
  FROM profiles p
  WHERE p.role = 'student'
    AND p.section = ANY(NEW.sections);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_assignment_created
  AFTER INSERT ON assignments
  FOR EACH ROW
  EXECUTE FUNCTION notify_students_new_assignment();
```

#### Validate Team Size

```sql
-- Hypothetical: Prevent adding members beyond max_team_size
CREATE OR REPLACE FUNCTION check_team_size_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  current_count INTEGER;
  max_allowed INTEGER;
BEGIN
  -- Count current active members
  SELECT COUNT(*) INTO current_count
  FROM team_members
  WHERE team_id = NEW.team_id AND status = 'active';

  -- Get max team size from assignment
  SELECT a.max_team_size INTO max_allowed
  FROM teams t
  JOIN assignments a ON t.assignment_id = a.id
  WHERE t.id = NEW.team_id;

  -- Raise exception if limit exceeded
  IF current_count >= max_allowed THEN
    RAISE EXCEPTION 'Team has reached maximum size of % members', max_allowed;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_team_size_limit
  BEFORE INSERT ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION check_team_size_limit();
```

---

## 4. Functions

PostgreSQL functions encapsulate business logic and can be called from queries.

### 4.1 Function: handle_new_user()

**Signature:**
```sql
public.handle_new_user() RETURNS TRIGGER
```

**Purpose:** Create profile when user signs up (see Triggers section above)

**Security:**
- `SECURITY DEFINER`: Runs with function creator's privileges
- `SET search_path = public`: Prevents schema injection attacks

---

### 4.2 Function: update_updated_at_column()

**Signature:**
```sql
public.update_updated_at_column() RETURNS TRIGGER
```

**Purpose:** Update timestamp on row modification (see Triggers section above)

---

### 4.3 PostgreSQL Built-in Functions Used

#### UUID Generation

```sql
uuid_generate_v4()  -- Generate random UUID
gen_random_uuid()   -- Alternative UUID generator (PostgreSQL 13+)
```

#### Date/Time Functions

```sql
NOW()                                    -- Current timestamp
CURRENT_DATE                             -- Current date only
CURRENT_TIMESTAMP                        -- Current timestamp (alias for NOW())
INTERVAL '30 days'                       -- Time interval
date_column + INTERVAL '1 week'          -- Date arithmetic
EXTRACT(YEAR FROM timestamp_column)      -- Extract date part
AGE(timestamp1, timestamp2)              -- Time difference
```

#### String Functions

```sql
CONCAT(first_name, ' ', last_name)       -- String concatenation
first_name || ' ' || last_name           -- Concatenation operator
UPPER(text_column)                       -- Convert to uppercase
LOWER(text_column)                       -- Convert to lowercase
LENGTH(text_column)                      -- String length
SUBSTRING(text_column, 1, 10)            -- Extract substring
LIKE, ILIKE                              -- Pattern matching
```

#### Aggregate Functions

```sql
COUNT(*)                                 -- Count rows
COUNT(DISTINCT column)                   -- Count unique values
SUM(numeric_column)                      -- Sum values
AVG(numeric_column)                      -- Average
MIN(column), MAX(column)                 -- Min/Max values
STRING_AGG(column, ', ')                 -- Concatenate strings
ARRAY_AGG(column)                        -- Aggregate into array
```

#### Conditional Functions

```sql
COALESCE(column1, column2, 'default')    -- First non-null value
NULLIF(column1, column2)                 -- Return null if equal
CASE WHEN condition THEN result ELSE alternative END
```

#### Array Functions (PostgreSQL specific)

```sql
'CS-A' = ANY(sections)                   -- Check if value in array
sections @> ARRAY['CS-A']                -- Array contains
ARRAY_LENGTH(sections, 1)                -- Array length
```

#### JSON Functions (PostgreSQL specific)

```sql
raw_user_meta_data->>'firstName'         -- Extract JSON text value
raw_user_meta_data->'settings'           -- Extract JSON object
jsonb_extract_path_text(column, 'key')   -- Extract nested value
```

---

## 5. Indexes

Indexes improve query performance by creating fast lookup structures.

### 5.1 Automatic Indexes

PostgreSQL automatically creates indexes for:
- **Primary Keys** (B-tree index)
- **UNIQUE constraints** (B-tree index)

**Automatic indexes in CollabSpace:**
```sql
-- Primary key indexes (10 total)
profiles_pkey ON profiles(id)
assignments_pkey ON assignments(id)
assignment_phases_pkey ON assignment_phases(id)
teams_pkey ON teams(id)
team_members_pkey ON team_members(id)
team_invitations_pkey ON team_invitations(id)
files_pkey ON files(id)
chat_messages_pkey ON chat_messages(id)
submissions_pkey ON submissions(id)
notifications_pkey ON notifications(id)

-- Unique constraint indexes (6 total)
profiles_email_key ON profiles(email)
assignment_phases_assignment_id_phase_number_key ON assignment_phases(assignment_id, phase_number)
teams_assignment_id_team_name_key ON teams(assignment_id, team_name)
team_members_team_id_student_id_key ON team_members(team_id, student_id)
team_invitations_team_id_to_student_id_key ON team_invitations(team_id, to_student_id)
submissions_phase_id_team_id_key ON submissions(phase_id, team_id)
```

---

### 5.2 Custom Indexes for Performance

These indexes optimize common query patterns:

```sql
-- Profile lookups by role (admin/teacher/student filtering)
CREATE INDEX idx_profiles_role ON profiles(role);

-- Student queries by section (section-specific assignments)
CREATE INDEX idx_profiles_section ON profiles(section);

-- Teacher's assignments (dashboard queries)
CREATE INDEX idx_assignments_teacher ON assignments(teacher_id);

-- Assignment's teams (team listing)
CREATE INDEX idx_teams_assignment ON teams(assignment_id);

-- Team's members (membership queries)
CREATE INDEX idx_team_members_team ON team_members(team_id);

-- Student's teams (user dashboard)
CREATE INDEX idx_team_members_student ON team_members(student_id);

-- Team chat history (message retrieval)
CREATE INDEX idx_chat_messages_team ON chat_messages(team_id);

-- User's notifications (notification center)
CREATE INDEX idx_notifications_user ON notifications(user_id);

-- Unread notifications (efficient filtering)
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);
```

**Index Types:**
- **B-tree** (default): Equality and range queries (`=`, `<`, `>`, `BETWEEN`)
- **Hash**: Only equality queries (not used in CollabSpace)
- **GiST/GIN**: Full-text search, array operations (could be added for `sections[]`)

---

### 5.3 Index Usage Examples

#### Query: Find student's teams
```sql
SELECT t.team_name, a.title
FROM team_members tm
JOIN teams t ON tm.team_id = t.id
JOIN assignments a ON t.assignment_id = a.id
WHERE tm.student_id = 'student-uuid' AND tm.status = 'active';
```
**Indexes used:**
- `idx_team_members_student` (to find memberships)
- `teams_pkey` (to join teams)
- `assignments_pkey` (to join assignments)

#### Query: Find unread notifications
```sql
SELECT * FROM notifications
WHERE user_id = 'user-uuid' AND is_read = FALSE
ORDER BY created_at DESC;
```
**Index used:**
- `idx_notifications_unread` (composite index on both columns)

#### Query: Find teacher's assignments
```sql
SELECT * FROM assignments
WHERE teacher_id = 'teacher-uuid'
ORDER BY created_at DESC;
```
**Index used:**
- `idx_assignments_teacher`

---

## 6. Row Level Security (RLS)

Supabase implements **Row Level Security** to enforce access control at the database level.

### 6.1 RLS Policies Overview

All tables have RLS enabled:
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
-- ... (all 10 tables)
```

### 6.2 Sample RLS Policies

#### Profiles - View all, update own
```sql
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

#### Assignments - Teachers create, everyone views
```sql
CREATE POLICY "Everyone can view assignments"
  ON assignments FOR SELECT
  USING (true);

CREATE POLICY "Teachers can insert assignments"
  ON assignments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );
```

#### Chat Messages - Team members only
```sql
CREATE POLICY "Team members can view chat messages"
  ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_id = chat_messages.team_id
        AND student_id = auth.uid()
        AND status = 'active'
    )
  );
```

**Benefits:**
- ✅ Security enforced at database level (can't be bypassed)
- ✅ Automatic filtering (no manual WHERE clauses)
- ✅ Works with any client (web, mobile, API)
- ✅ Uses `auth.uid()` function (current user's ID)

---

## 7. Storage Buckets

Supabase Storage provides object storage with access control.

### 7.1 Bucket Configuration

**Three buckets:**
1. **assignment-files** (Private)
   - Teacher-uploaded instructions and resources
   - Policy: Authenticated users can read/write

2. **submissions** (Private)
   - Student submissions per phase
   - Policy: Team members can upload, teachers can read

3. **avatars** (Public)
   - User profile pictures
   - Policy: Anyone can view, users can upload own

### 7.2 Storage Policies (Dashboard-configured)

```plaintext
assignment-files:
  - INSERT: auth.role() = 'authenticated' AND role = 'teacher'
  - SELECT: auth.role() = 'authenticated'
  - DELETE: bucket_id = auth.uid() OR role = 'teacher'

submissions:
  - INSERT: auth.role() = 'authenticated' AND is_team_member()
  - SELECT: is_team_member() OR is_assignment_teacher()
  - DELETE: is_assignment_teacher()

avatars:
  - INSERT: bucket_id = auth.uid()
  - SELECT: true (public)
  - DELETE: bucket_id = auth.uid()
```

---

## Summary

CollabSpace demonstrates comprehensive database design:

✅ **Keys:** Primary (UUID), Foreign (referential integrity), Candidate, Composite
✅ **Constraints:** Domain (CHECK), NOT NULL, UNIQUE, DEFAULT, Referential Integrity
✅ **Triggers:** Auto-profile creation, auto-timestamp updates
✅ **Functions:** User handling, timestamp management, built-in PostgreSQL functions
✅ **Indexes:** 16 automatic + 9 custom = 25 total for performance
✅ **RLS:** Row-level security for multi-tenant access control
✅ **Storage:** Secure file management with policies

This design ensures:
- **Data Integrity:** Constraints prevent invalid data
- **Referential Integrity:** Foreign keys maintain relationships
- **Automation:** Triggers handle repetitive tasks
- **Performance:** Indexes optimize common queries
- **Security:** RLS enforces access control at database level

This satisfies requirements for **Unit 1** (Database Design) and **Unit 2** (Triggers, Functions, Procedures) of the DBMS course.
