# Entity-Relationship (ER) Model - CollabSpace

## ER Diagram Overview

This document describes the complete Entity-Relationship model for CollabSpace, demonstrating the database design principles covered in **Unit 1: E-R Model, reducing ER to a relational schema**.

---

## Entities and Attributes

### 1. **PROFILE** (User Entity)
Strong entity representing all system users.

**Attributes:**
- `id` (UUID) - **Primary Key**, inherited from auth.users
- `email` (TEXT) - **Unique**, **Not Null**
- `first_name` (TEXT) - **Not Null**
- `last_name` (TEXT) - **Not Null**
- `role` (TEXT) - **Not Null**, constrained to {'admin', 'teacher', 'student'}
- `student_id` (TEXT) - Partial key for students
- `section` (TEXT) - Partial key for students
- `avatar_url` (TEXT) - Optional profile image
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp

**Entity Type:** Strong Entity
**Key:** Simple key (id)

---

### 2. **ASSIGNMENT**
Strong entity representing projects created by teachers.

**Attributes:**
- `id` (UUID) - **Primary Key**
- `title` (TEXT) - **Not Null**
- `description` (TEXT) - **Not Null**
- `teacher_id` (UUID) - **Foreign Key** → profiles(id)
- `sections` (TEXT[]) - Multi-valued attribute (array of sections)
- `min_team_size` (INTEGER) - **Not Null**, CHECK > 0
- `max_team_size` (INTEGER) - **Not Null**, CHECK >= min_team_size
- `team_formation_deadline` (TIMESTAMP) - **Not Null**
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp

**Entity Type:** Strong Entity
**Key:** Simple key (id)

---

### 3. **ASSIGNMENT_PHASE**
Weak entity dependent on ASSIGNMENT, representing submission phases.

**Attributes:**
- `id` (UUID) - **Primary Key**
- `assignment_id` (UUID) - **Foreign Key** → assignments(id), **Identifying relationship**
- `phase_number` (INTEGER) - **Partial Key**, **Not Null**
- `phase_name` (TEXT) - **Not Null**
- `deadline` (TIMESTAMP) - **Not Null**
- `description` (TEXT) - Optional phase description
- `created_at` (TIMESTAMP) - Creation timestamp

**Entity Type:** Weak Entity (depends on ASSIGNMENT)
**Key:** Composite key (assignment_id, phase_number)
**Identifying Relationship:** HAS_PHASES

---

### 4. **TEAM**
Strong entity representing student groups for assignments.

**Attributes:**
- `id` (UUID) - **Primary Key**
- `assignment_id` (UUID) - **Foreign Key** → assignments(id)
- `team_name` (TEXT) - **Not Null**
- `created_by` (UUID) - **Foreign Key** → profiles(id)
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp

**Entity Type:** Strong Entity
**Key:** Composite unique (assignment_id, team_name)

---

### 5. **TEAM_MEMBER**
Bridge entity for many-to-many relationship between TEAM and PROFILE.

**Attributes:**
- `id` (UUID) - **Primary Key**
- `team_id` (UUID) - **Foreign Key** → teams(id)
- `student_id` (UUID) - **Foreign Key** → profiles(id)
- `status` (TEXT) - Constrained to {'active', 'left'}, default 'active'
- `joined_at` (TIMESTAMP) - Membership timestamp

**Entity Type:** Associative Entity (Bridge/Junction)
**Key:** Composite unique (team_id, student_id)

---

### 6. **TEAM_INVITATION**
Entity representing invitations between students.

**Attributes:**
- `id` (UUID) - **Primary Key**
- `team_id` (UUID) - **Foreign Key** → teams(id)
- `from_student_id` (UUID) - **Foreign Key** → profiles(id)
- `to_student_id` (UUID) - **Foreign Key** → profiles(id)
- `status` (TEXT) - Constrained to {'pending', 'accepted', 'rejected'}
- `created_at` (TIMESTAMP) - Invitation creation
- `responded_at` (TIMESTAMP) - Response timestamp

**Entity Type:** Strong Entity
**Key:** Composite unique (team_id, to_student_id)

---

### 7. **CHAT_MESSAGE**
Entity for team communication.

**Attributes:**
- `id` (UUID) - **Primary Key**
- `team_id` (UUID) - **Foreign Key** → teams(id)
- `sender_id` (UUID) - **Foreign Key** → profiles(id)
- `message` (TEXT) - **Not Null**
- `created_at` (TIMESTAMP) - Message timestamp

**Entity Type:** Strong Entity
**Key:** Simple key (id)

---

### 8. **FILE**
Entity for file storage references.

**Attributes:**
- `id` (UUID) - **Primary Key**
- `assignment_id` (UUID) - **Foreign Key** → assignments(id), optional
- `phase_id` (UUID) - **Foreign Key** → assignment_phases(id), optional
- `team_id` (UUID) - **Foreign Key** → teams(id), optional
- `uploaded_by` (UUID) - **Foreign Key** → profiles(id), **Not Null**
- `file_name` (TEXT) - **Not Null**
- `file_url` (TEXT) - **Not Null**
- `file_type` (TEXT) - **Not Null**
- `file_size` (INTEGER) - **Not Null**, in bytes
- `file_category` (TEXT) - Constrained to {'instruction', 'submission', 'resource'}
- `created_at` (TIMESTAMP) - Upload timestamp

**Entity Type:** Strong Entity
**Key:** Simple key (id)

---

### 9. **SUBMISSION**
Entity tracking team submissions for assignment phases.

**Attributes:**
- `id` (UUID) - **Primary Key**
- `phase_id` (UUID) - **Foreign Key** → assignment_phases(id)
- `team_id` (UUID) - **Foreign Key** → teams(id)
- `submitted_by` (UUID) - **Foreign Key** → profiles(id)
- `submitted_at` (TIMESTAMP) - Submission timestamp
- `grade` (DECIMAL(5,2)) - Numerical grade (0.00-100.00)
- `feedback` (TEXT) - Teacher feedback
- `graded_at` (TIMESTAMP) - Grading timestamp
- `graded_by` (UUID) - **Foreign Key** → profiles(id)

**Entity Type:** Strong Entity
**Key:** Composite unique (phase_id, team_id)

---

### 10. **NOTIFICATION**
Entity for user notifications.

**Attributes:**
- `id` (UUID) - **Primary Key**
- `user_id` (UUID) - **Foreign Key** → profiles(id)
- `type` (TEXT) - Constrained to {'assignment', 'invitation', 'deadline', 'team', 'submission', 'grade'}
- `title` (TEXT) - **Not Null**
- `message` (TEXT) - **Not Null**
- `link` (TEXT) - Optional navigation link
- `is_read` (BOOLEAN) - Default FALSE
- `created_at` (TIMESTAMP) - Notification creation

**Entity Type:** Strong Entity
**Key:** Simple key (id)

---

## Relationships

### 1. **CREATES** (PROFILE → ASSIGNMENT)
- **Type:** One-to-Many (1:N)
- **Participation:** Teacher (Total), Assignment (Partial)
- **Cardinality:** One teacher creates many assignments
- **Foreign Key:** `assignments.teacher_id` REFERENCES `profiles.id`

### 2. **HAS_PHASES** (ASSIGNMENT → ASSIGNMENT_PHASE)
- **Type:** One-to-Many (1:N), **Identifying Relationship**
- **Participation:** Assignment (Total), Phase (Total)
- **Cardinality:** One assignment has many phases
- **Foreign Key:** `assignment_phases.assignment_id` REFERENCES `assignments.id`
- **Cascade:** ON DELETE CASCADE (weak entity)

### 3. **BELONGS_TO** (TEAM → ASSIGNMENT)
- **Type:** Many-to-One (N:1)
- **Participation:** Team (Total), Assignment (Partial)
- **Cardinality:** Many teams belong to one assignment
- **Foreign Key:** `teams.assignment_id` REFERENCES `assignments.id`

### 4. **FOUNDED_BY** (TEAM → PROFILE)
- **Type:** Many-to-One (N:1)
- **Participation:** Team (Total), Student (Partial)
- **Cardinality:** One student creates many teams
- **Foreign Key:** `teams.created_by` REFERENCES `profiles.id`

### 5. **MEMBER_OF** (PROFILE ↔ TEAM) via TEAM_MEMBER
- **Type:** Many-to-Many (M:N)
- **Participation:** Student (Partial), Team (Partial)
- **Cardinality:** Students join multiple teams, teams have multiple students
- **Bridge Entity:** `team_members`
- **Foreign Keys:**
  - `team_members.team_id` REFERENCES `teams.id`
  - `team_members.student_id` REFERENCES `profiles.id`

### 6. **INVITES** (PROFILE → TEAM_INVITATION)
- **Type:** One-to-Many (1:N)
- **Participation:** Student (Partial), Invitation (Total)
- **Foreign Key:** `team_invitations.from_student_id` REFERENCES `profiles.id`

### 7. **INVITED_TO** (PROFILE → TEAM_INVITATION)
- **Type:** One-to-Many (1:N)
- **Participation:** Student (Partial), Invitation (Total)
- **Foreign Key:** `team_invitations.to_student_id` REFERENCES `profiles.id`

### 8. **INVITATION_FOR** (TEAM → TEAM_INVITATION)
- **Type:** One-to-Many (1:N)
- **Participation:** Team (Partial), Invitation (Total)
- **Foreign Key:** `team_invitations.team_id` REFERENCES `teams.id`

### 9. **SENDS** (PROFILE → CHAT_MESSAGE)
- **Type:** One-to-Many (1:N)
- **Participation:** Student (Partial), Message (Total)
- **Foreign Key:** `chat_messages.sender_id` REFERENCES `profiles.id`

### 10. **POSTED_IN** (CHAT_MESSAGE → TEAM)
- **Type:** Many-to-One (N:1)
- **Participation:** Message (Total), Team (Partial)
- **Foreign Key:** `chat_messages.team_id` REFERENCES `teams.id`

### 11. **UPLOADS** (PROFILE → FILE)
- **Type:** One-to-Many (1:N)
- **Participation:** User (Partial), File (Total)
- **Foreign Key:** `files.uploaded_by` REFERENCES `profiles.id`

### 12. **SUBMITS** (TEAM → SUBMISSION)
- **Type:** One-to-Many (1:N)
- **Participation:** Team (Partial), Submission (Partial)
- **Foreign Key:** `submissions.team_id` REFERENCES `teams.id`

### 13. **SUBMISSION_FOR** (ASSIGNMENT_PHASE → SUBMISSION)
- **Type:** One-to-Many (1:N)
- **Participation:** Phase (Partial), Submission (Partial)
- **Foreign Key:** `submissions.phase_id` REFERENCES `assignment_phases.id`

### 14. **GRADES** (PROFILE → SUBMISSION)
- **Type:** One-to-Many (1:N)
- **Participation:** Teacher (Partial), Submission (Partial)
- **Foreign Key:** `submissions.graded_by` REFERENCES `profiles.id`

### 15. **NOTIFIES** (NOTIFICATION → PROFILE)
- **Type:** Many-to-One (N:1)
- **Participation:** Notification (Total), User (Partial)
- **Foreign Key:** `notifications.user_id` REFERENCES `profiles.id`

---

## ER Diagram (Textual Representation)

```
┌─────────────┐
│   PROFILE   │──────────CREATES────────┐
│  (Strong)   │                         │
└──────┬──────┘                         ▼
       │                          ┌─────────────┐
       │                          │ ASSIGNMENT  │
       │                          │  (Strong)   │
       │                          └──────┬──────┘
       │                                 │
       │                           HAS_PHASES (Identifying)
       │                                 │
       │                                 ▼
       │                          ┌──────────────────┐
       │                          │ ASSIGNMENT_PHASE │
       │                          │     (Weak)       │
       │                          └──────────────────┘
       │                                 │
       │                          SUBMISSION_FOR
       │                                 │
       │                                 ▼
       │                          ┌─────────────┐
       │                          │ SUBMISSION  │◄──── GRADES ────┐
       │                          │  (Strong)   │                 │
       │                          └──────┬──────┘                 │
       │                                 │                        │
       │                              SUBMITS                     │
       │                                 │                        │
       │                                 ▼                        │
       ├──────FOUNDED_BY───────►  ┌──────────┐                   │
       │                          │   TEAM   │                   │
       │                          │ (Strong) │                   │
       │                          └────┬─────┘                   │
       │                               │                         │
       │                          MEMBER_OF                      │
       │                               │                         │
       ├──────────────────────►┌──────▼──────┐                  │
       │                       │ TEAM_MEMBER │                  │
       │                       │ (Assoc Ent) │                  │
       │                       └─────────────┘                  │
       │                                                         │
       ├──────INVITES─────────►┌─────────────────┐              │
       │                       │ TEAM_INVITATION │              │
       ├──────INVITED_TO──────►│    (Strong)     │              │
       │                       └─────────────────┘              │
       │                                                         │
       ├──────SENDS───────────►┌──────────────┐                 │
       │                       │ CHAT_MESSAGE │                 │
       │                       │   (Strong)   │                 │
       │                       └──────────────┘                 │
       │                                                         │
       ├──────UPLOADS─────────►┌──────────┐                     │
       │                       │   FILE   │                     │
       │                       │ (Strong) │                     │
       │                       └──────────┘                     │
       │                                                         │
       │◄──────NOTIFIES────────┌──────────────┐                 │
       │                       │ NOTIFICATION │                 │
       │                       │   (Strong)   │                 │
       │                       └──────────────┘                 │
       │                                                         │
       └─────────────────────────────────────────────────────────┘
```

---

## Cardinality Summary

| Relationship | Entity 1 | Cardinality | Entity 2 | Type |
|-------------|----------|-------------|----------|------|
| CREATES | PROFILE (Teacher) | 1:N | ASSIGNMENT | 1-M |
| HAS_PHASES | ASSIGNMENT | 1:N | ASSIGNMENT_PHASE | 1-M (Identifying) |
| BELONGS_TO | TEAM | N:1 | ASSIGNMENT | M-1 |
| FOUNDED_BY | TEAM | N:1 | PROFILE (Student) | M-1 |
| MEMBER_OF | PROFILE (Student) | M:N | TEAM | M-M |
| INVITES | PROFILE (Student) | 1:N | TEAM_INVITATION | 1-M |
| INVITED_TO | PROFILE (Student) | 1:N | TEAM_INVITATION | 1-M |
| SENDS | PROFILE | 1:N | CHAT_MESSAGE | 1-M |
| UPLOADS | PROFILE | 1:N | FILE | 1-M |
| SUBMITS | TEAM | 1:N | SUBMISSION | 1-M |
| SUBMISSION_FOR | ASSIGNMENT_PHASE | 1:N | SUBMISSION | 1-M |
| GRADES | PROFILE (Teacher) | 1:N | SUBMISSION | 1-M |
| NOTIFIES | NOTIFICATION | N:1 | PROFILE | M-1 |

---

## Reducing ER to Relational Schema

### Mapping Rules Applied:

#### 1. **Strong Entities → Tables**
Each strong entity becomes a table with its attributes.
- PROFILE → `profiles` table
- ASSIGNMENT → `assignments` table
- TEAM → `teams` table
- CHAT_MESSAGE → `chat_messages` table
- FILE → `files` table
- SUBMISSION → `submissions` table
- NOTIFICATION → `notifications` table
- TEAM_INVITATION → `team_invitations` table

#### 2. **Weak Entities → Tables with Composite Keys**
Weak entity includes the primary key of its owner as a foreign key.
- ASSIGNMENT_PHASE → `assignment_phases` table
  - Composite unique key: (assignment_id, phase_number)
  - ON DELETE CASCADE enforces existence dependency

#### 3. **1:N Relationships → Foreign Keys**
The "many" side table gets a foreign key to the "one" side.
- CREATES: `assignments.teacher_id` → `profiles.id`
- BELONGS_TO: `teams.assignment_id` → `assignments.id`
- FOUNDED_BY: `teams.created_by` → `profiles.id`
- SENDS: `chat_messages.sender_id` → `profiles.id`
- NOTIFIES: `notifications.user_id` → `profiles.id`

#### 4. **M:N Relationships → Junction Tables**
Binary many-to-many relationships require a bridge table.
- MEMBER_OF → `team_members` table
  - Foreign keys: `team_id`, `student_id`
  - Additional attributes: `status`, `joined_at`
  - Composite unique key: (team_id, student_id)

#### 5. **Multi-valued Attributes → Arrays**
PostgreSQL supports array types directly.
- `assignments.sections` (TEXT[]) - array of section names

#### 6. **Derived Attributes**
Not stored in database; calculated on-demand in application layer.
- Team member count (COUNT query on team_members)
- Assignment completion rate (calculated from submissions)
- Unread notification count (COUNT with is_read = FALSE)

---

## Participation Constraints

### Total Participation (Mandatory)
- Every ASSIGNMENT must have a TEACHER (assignments.teacher_id NOT NULL)
- Every ASSIGNMENT_PHASE must belong to an ASSIGNMENT (identifying relationship)
- Every TEAM must belong to an ASSIGNMENT (teams.assignment_id NOT NULL)
- Every TEAM_MEMBER must reference a TEAM and STUDENT
- Every CHAT_MESSAGE must have a SENDER and TEAM

### Partial Participation (Optional)
- Not all PROFILEs are in TEAMs (only students)
- Not all TEAMs have SUBMISSIONS (may not have submitted yet)
- Not all ASSIGNMENTS have SUBMISSIONS (newly created)

---

## Integrity Constraints

### 1. **Key Constraints**
- Primary keys: UUID, auto-generated, NOT NULL, UNIQUE
- Composite unique keys enforce uniqueness across multiple columns

### 2. **Referential Integrity**
- All foreign keys have REFERENCES constraints
- ON DELETE CASCADE for weak entities and dependent data
- Prevents orphaned records

### 3. **Domain Constraints**
- CHECK constraints on role, status, type fields
- Size constraints: `max_team_size >= min_team_size`
- Positive values: `min_team_size > 0`

### 4. **Semantic Constraints**
- Enforced via Row Level Security (RLS) policies
- Students can only create teams for assignments in their section
- Teachers can only grade submissions for their assignments
- Team members must be active to send messages

---

## Summary

This ER model demonstrates:
- ✅ **10 entities** (8 strong, 1 weak, 1 associative)
- ✅ **15 relationships** (1:N, M:N, identifying)
- ✅ **Proper normalization** (covered in NORMALIZATION_ANALYSIS.md)
- ✅ **Complete reduction** to relational schema
- ✅ **Referential integrity** with foreign keys
- ✅ **Participation constraints** (total/partial)
- ✅ **Domain constraints** via CHECK and data types

The design follows best practices for relational database modeling and is optimized for the educational collaboration domain.
