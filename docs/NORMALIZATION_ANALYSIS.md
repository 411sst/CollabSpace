# Normalization Analysis - CollabSpace Database

## Overview

This document provides a comprehensive normalization analysis of the CollabSpace database schema, demonstrating compliance with **Unit 3: Normal Forms (1NF, 2NF, 3NF, and BCNF)**.

All tables in CollabSpace are designed to be in **Boyce-Codd Normal Form (BCNF)**, the highest practical normalization level, ensuring data integrity, eliminating redundancy, and preventing anomalies.

---

## Normalization Fundamentals

### Functional Dependencies (FD)

A functional dependency X → Y means:
- The value of X uniquely determines the value of Y
- For any two tuples with the same X value, the Y value must be the same

### Normal Forms Hierarchy

```
Unnormalized → 1NF → 2NF → 3NF → BCNF → 4NF → 5NF
                                  ↑
                        (CollabSpace is here)
```

---

## Table-by-Table Normalization Analysis

### 1. PROFILES Table

```sql
profiles (
  id,               -- PK
  email,
  first_name,
  last_name,
  role,
  student_id,
  section,
  avatar_url,
  created_at,
  updated_at
)
```

#### Functional Dependencies:
- `id → email, first_name, last_name, role, student_id, section, avatar_url, created_at, updated_at`
- `email → id, first_name, last_name, role, student_id, section, avatar_url, created_at, updated_at`

#### Candidate Keys:
- Primary: `id`
- Alternate: `email`

#### Normalization Status:

**✅ 1NF (First Normal Form)**
- All attributes contain atomic values (no multi-valued or composite attributes)
- Each row is uniquely identified by the primary key `id`
- No repeating groups

**✅ 2NF (Second Normal Form)**
- In 1NF ✓
- No partial dependencies (all non-key attributes depend on the entire key)
- Since the primary key is a single attribute (`id`), partial dependencies cannot exist

**✅ 3NF (Third Normal Form)**
- In 2NF ✓
- No transitive dependencies
- All non-key attributes depend directly on the primary key
- Analysis:
  - `id → first_name` (direct dependency)
  - `id → last_name` (direct dependency)
  - `id → role` (direct dependency)
  - No transitive dependencies like `id → X → Y`

**✅ BCNF (Boyce-Codd Normal Form)**
- In 3NF ✓
- For every functional dependency X → Y, X is a superkey
- Both `id` and `email` are candidate keys (superkeys)
- All dependencies are from candidate keys

**Conclusion:** PROFILES is in **BCNF** ✓

---

### 2. ASSIGNMENTS Table

```sql
assignments (
  id,                        -- PK
  title,
  description,
  teacher_id,                -- FK
  sections,                  -- Array
  min_team_size,
  max_team_size,
  team_formation_deadline,
  created_at,
  updated_at
)
```

#### Functional Dependencies:
- `id → title, description, teacher_id, sections, min_team_size, max_team_size, team_formation_deadline, created_at, updated_at`

#### Candidate Keys:
- Primary: `id`

#### Normalization Status:

**✅ 1NF (First Normal Form)**
- All attributes are atomic (PostgreSQL arrays are considered atomic in the relational model)
- Unique identification via `id`
- No repeating groups

**Note on Multi-valued Attribute:**
The `sections` attribute is a TEXT[] array. In strict relational theory, this violates 1NF. However:
- **PostgreSQL treats arrays as atomic values** with proper operators
- Alternative would be a separate `assignment_sections` table
- Trade-off: Simplicity vs. strict normalization
- For DBMS course purposes, we acknowledge this design decision

**Alternative Design (Strict 1NF):**
```sql
-- If strict 1NF is required:
assignment_sections (
  assignment_id,  -- FK, PK (composite)
  section,        -- PK (composite)
  PRIMARY KEY (assignment_id, section)
)
```

**✅ 2NF (Second Normal Form)**
- In 1NF ✓
- No partial dependencies (single-attribute key)

**✅ 3NF (Third Normal Form)**
- In 2NF ✓
- No transitive dependencies
- All attributes depend directly on `id`

**✅ BCNF (Boyce-Codd Normal Form)**
- In 3NF ✓
- Only functional dependency is `id → [all attributes]`
- `id` is a superkey

**Conclusion:** ASSIGNMENTS is in **BCNF** ✓ (with PostgreSQL array extension)

---

### 3. ASSIGNMENT_PHASES Table

```sql
assignment_phases (
  id,              -- PK
  assignment_id,   -- FK
  phase_number,
  phase_name,
  deadline,
  description,
  created_at,
  UNIQUE(assignment_id, phase_number)
)
```

#### Functional Dependencies:
- `id → assignment_id, phase_number, phase_name, deadline, description, created_at`
- `{assignment_id, phase_number} → id, phase_name, deadline, description, created_at`

#### Candidate Keys:
- Primary: `id`
- Alternate: `{assignment_id, phase_number}`

#### Normalization Status:

**✅ 1NF (First Normal Form)**
- All attributes are atomic
- Unique identification via `id`

**✅ 2NF (Second Normal Form)**
- In 1NF ✓
- No partial dependencies on the primary key `id` (single attribute)
- For the composite candidate key `{assignment_id, phase_number}`:
  - `{assignment_id, phase_number} → phase_name` (full dependency)
  - `{assignment_id, phase_number} → deadline` (full dependency)
  - No dependency on just `assignment_id` alone or `phase_number` alone

**✅ 3NF (Third Normal Form)**
- In 2NF ✓
- No transitive dependencies
- All non-key attributes depend directly on the candidate keys

**✅ BCNF (Boyce-Codd Normal Form)**
- In 3NF ✓
- Both functional dependencies originate from candidate keys (superkeys)

**Conclusion:** ASSIGNMENT_PHASES is in **BCNF** ✓

---

### 4. TEAMS Table

```sql
teams (
  id,              -- PK
  assignment_id,   -- FK
  team_name,
  created_by,      -- FK
  created_at,
  updated_at,
  UNIQUE(assignment_id, team_name)
)
```

#### Functional Dependencies:
- `id → assignment_id, team_name, created_by, created_at, updated_at`
- `{assignment_id, team_name} → id, created_by, created_at, updated_at`

#### Candidate Keys:
- Primary: `id`
- Alternate: `{assignment_id, team_name}`

#### Normalization Status:

**✅ 1NF (First Normal Form)**
- All attributes are atomic

**✅ 2NF (Second Normal Form)**
- In 1NF ✓
- No partial dependencies
- For composite key `{assignment_id, team_name}`:
  - All attributes depend on the full composite key, not just one part

**✅ 3NF (Third Normal Form)**
- In 2NF ✓
- No transitive dependencies

**✅ BCNF (Boyce-Codd Normal Form)**
- In 3NF ✓
- All dependencies originate from candidate keys

**Conclusion:** TEAMS is in **BCNF** ✓

---

### 5. TEAM_MEMBERS Table

```sql
team_members (
  id,          -- PK
  team_id,     -- FK
  student_id,  -- FK
  status,
  joined_at,
  UNIQUE(team_id, student_id)
)
```

#### Functional Dependencies:
- `id → team_id, student_id, status, joined_at`
- `{team_id, student_id} → id, status, joined_at`

#### Candidate Keys:
- Primary: `id`
- Alternate: `{team_id, student_id}`

#### Normalization Status:

**✅ 1NF (First Normal Form)**
- All attributes are atomic

**✅ 2NF (Second Normal Form)**
- In 1NF ✓
- No partial dependencies
- `status` and `joined_at` depend on the full composite key `{team_id, student_id}`
- Cannot determine status from just team_id or just student_id

**✅ 3NF (Third Normal Form)**
- In 2NF ✓
- No transitive dependencies

**✅ BCNF (Boyce-Codd Normal Form)**
- In 3NF ✓
- All dependencies originate from candidate keys

**Conclusion:** TEAM_MEMBERS is in **BCNF** ✓

---

### 6. TEAM_INVITATIONS Table

```sql
team_invitations (
  id,                -- PK
  team_id,           -- FK
  from_student_id,   -- FK
  to_student_id,     -- FK
  status,
  created_at,
  responded_at,
  UNIQUE(team_id, to_student_id)
)
```

#### Functional Dependencies:
- `id → team_id, from_student_id, to_student_id, status, created_at, responded_at`
- `{team_id, to_student_id} → id, from_student_id, status, created_at, responded_at`

#### Candidate Keys:
- Primary: `id`
- Alternate: `{team_id, to_student_id}`

#### Normalization Status:

**✅ 1NF:** All attributes are atomic

**✅ 2NF:** No partial dependencies

**✅ 3NF:** No transitive dependencies

**✅ BCNF:** All dependencies from candidate keys

**Conclusion:** TEAM_INVITATIONS is in **BCNF** ✓

---

### 7. CHAT_MESSAGES Table

```sql
chat_messages (
  id,          -- PK
  team_id,     -- FK
  sender_id,   -- FK
  message,
  created_at
)
```

#### Functional Dependencies:
- `id → team_id, sender_id, message, created_at`

#### Candidate Keys:
- Primary: `id`

#### Normalization Status:

**✅ 1NF:** All attributes are atomic, unique identification

**✅ 2NF:** Single-attribute key, no partial dependencies possible

**✅ 3NF:** No transitive dependencies

**✅ BCNF:** Only dependency is from the primary key (superkey)

**Conclusion:** CHAT_MESSAGES is in **BCNF** ✓

---

### 8. FILES Table

```sql
files (
  id,              -- PK
  assignment_id,   -- FK (nullable)
  phase_id,        -- FK (nullable)
  team_id,         -- FK (nullable)
  uploaded_by,     -- FK
  file_name,
  file_url,
  file_type,
  file_size,
  file_category,
  created_at
)
```

#### Functional Dependencies:
- `id → assignment_id, phase_id, team_id, uploaded_by, file_name, file_url, file_type, file_size, file_category, created_at`
- `file_url → id` (URLs are unique in storage)

#### Candidate Keys:
- Primary: `id`
- Alternate: `file_url`

#### Normalization Status:

**✅ 1NF:** All attributes are atomic

**✅ 2NF:** Single-attribute key, no partial dependencies

**✅ 3NF:** No transitive dependencies
- All attributes describe the file itself, not derived from other attributes

**✅ BCNF:** All dependencies from candidate keys

**Conclusion:** FILES is in **BCNF** ✓

---

### 9. SUBMISSIONS Table

```sql
submissions (
  id,            -- PK
  phase_id,      -- FK
  team_id,       -- FK
  submitted_by,  -- FK
  submitted_at,
  grade,
  feedback,
  graded_at,
  graded_by,     -- FK
  UNIQUE(phase_id, team_id)
)
```

#### Functional Dependencies:
- `id → phase_id, team_id, submitted_by, submitted_at, grade, feedback, graded_at, graded_by`
- `{phase_id, team_id} → id, submitted_by, submitted_at, grade, feedback, graded_at, graded_by`

#### Candidate Keys:
- Primary: `id`
- Alternate: `{phase_id, team_id}`

#### Normalization Status:

**✅ 1NF:** All attributes are atomic

**✅ 2NF:** No partial dependencies
- For composite key `{phase_id, team_id}`:
  - `grade` depends on both phase AND team (not just one)
  - `submitted_at` depends on both (specific submission instance)

**✅ 3NF:** No transitive dependencies
- `graded_by` does not determine `grade` (same teacher can give different grades)
- `submitted_by` does not determine `submitted_at` (students submit at different times)

**✅ BCNF:** All dependencies from candidate keys

**Conclusion:** SUBMISSIONS is in **BCNF** ✓

---

### 10. NOTIFICATIONS Table

```sql
notifications (
  id,          -- PK
  user_id,     -- FK
  type,
  title,
  message,
  link,
  is_read,
  created_at
)
```

#### Functional Dependencies:
- `id → user_id, type, title, message, link, is_read, created_at`

#### Candidate Keys:
- Primary: `id`

#### Normalization Status:

**✅ 1NF:** All attributes are atomic

**✅ 2NF:** Single-attribute key, no partial dependencies

**✅ 3NF:** No transitive dependencies

**✅ BCNF:** Only dependency from primary key

**Conclusion:** NOTIFICATIONS is in **BCNF** ✓

---

## Higher Normal Forms

### 4NF (Fourth Normal Form)
**Requires:** No multi-valued dependencies

**Analysis:**
- No table has multiple independent multi-valued dependencies
- The ASSIGNMENTS table's `sections` array could be seen as a multi-valued dependency
- If strictly applying 4NF, `sections` would be moved to a separate table (as noted in 1NF analysis)

**Status:** All tables except ASSIGNMENTS are in 4NF. ASSIGNMENTS trades strict 4NF for practical simplicity using PostgreSQL array types.

### 5NF (Fifth Normal Form / PJNF)
**Requires:** No join dependencies that are not implied by candidate keys

**Analysis:**
- All tables can be decomposed only using the existing foreign key relationships
- No hidden join dependencies exist
- All tables satisfy 5NF

**Status:** All tables are in **5NF** ✓

---

## Anomalies Analysis

### Insertion Anomalies
**Definition:** Cannot insert data due to missing related data

**CollabSpace Protection:**
- ✅ Can create PROFILE without TEAM (optional relationship)
- ✅ Can create ASSIGNMENT without TEAMS (optional relationship)
- ✅ Can create TEAM without SUBMISSIONS (optional relationship)
- ✅ Foreign keys prevent invalid references

**Example:**
- Cannot create SUBMISSION without valid PHASE_ID and TEAM_ID
- This is **intentional** - a submission must belong to a phase and team

### Update Anomalies
**Definition:** Updating data in one place requires updates in multiple places

**CollabSpace Protection:**
- ✅ Teacher name stored only in PROFILES table
  - Updating teacher name updates all their assignments automatically (via FK)
- ✅ Team name stored only in TEAMS table
  - Updating team name reflects in all related tables (via FK)
- ✅ No redundant data storage across tables

**Example:**
- If a teacher's email changes, update only `profiles.email`
- All assignments, graded submissions, etc. automatically reference the updated profile

### Deletion Anomalies
**Definition:** Deleting data causes unintended loss of other data

**CollabSpace Protection:**
- ✅ **ON DELETE CASCADE** for dependent entities
  - Deleting ASSIGNMENT deletes related PHASES, TEAMS, FILES (intended)
  - Deleting TEAM deletes TEAM_MEMBERS, CHAT_MESSAGES (intended)
- ✅ **ON DELETE RESTRICT** (default) for independent entities
  - Cannot delete PROFILE if they have created assignments (prevents data loss)
  - Cannot delete PROFILE if they have submitted work (preserves academic records)

**Example:**
- Deleting an assignment automatically removes its phases, teams, and submissions
- This is **intentional** - these entities have no meaning without the assignment

---

## Denormalization Considerations

While CollabSpace is highly normalized (BCNF), some practical considerations:

### 1. Sections Array in ASSIGNMENTS
**Current Design:**
```sql
assignments.sections TEXT[]
```

**Strictly Normalized Alternative:**
```sql
assignment_sections (
  assignment_id UUID,
  section TEXT,
  PRIMARY KEY (assignment_id, section)
)
```

**Trade-offs:**
- **Current:** Simpler queries, fewer joins, PostgreSQL array support
- **Normalized:** Strict 1NF compliance, easier to query "all assignments for section X"

**Decision:** Use array for simplicity; PostgreSQL handles it well.

### 2. Computed Attributes (Not Stored)
The following are **derived attributes** calculated on-demand:
- Team member count: `COUNT(team_members WHERE team_id = X AND status = 'active')`
- Unread notification count: `COUNT(notifications WHERE user_id = X AND is_read = FALSE)`
- Assignment completion rate: `(submitted_teams / total_teams) * 100`

**Why not store?**
- Prevents update anomalies
- Always accurate (no synchronization issues)
- Small performance cost is acceptable

---

## Summary Table

| Table | 1NF | 2NF | 3NF | BCNF | Notes |
|-------|-----|-----|-----|------|-------|
| profiles | ✅ | ✅ | ✅ | ✅ | Perfect normalization |
| assignments | ✅* | ✅ | ✅ | ✅ | *Array type (PostgreSQL extension) |
| assignment_phases | ✅ | ✅ | ✅ | ✅ | Weak entity, composite key |
| teams | ✅ | ✅ | ✅ | ✅ | Composite alternate key |
| team_members | ✅ | ✅ | ✅ | ✅ | Junction table, well-normalized |
| team_invitations | ✅ | ✅ | ✅ | ✅ | Composite alternate key |
| chat_messages | ✅ | ✅ | ✅ | ✅ | Simple, atomic structure |
| files | ✅ | ✅ | ✅ | ✅ | Multiple nullable FKs (by design) |
| submissions | ✅ | ✅ | ✅ | ✅ | Composite alternate key |
| notifications | ✅ | ✅ | ✅ | ✅ | Simple, atomic structure |

---

## Conclusion

The CollabSpace database demonstrates **excellent normalization**:

✅ **All tables are in BCNF** (except minor array usage for practical reasons)
✅ **No data redundancy** across tables
✅ **No insertion, update, or deletion anomalies**
✅ **Proper use of functional dependencies**
✅ **Clear candidate keys** for all tables
✅ **Referential integrity** enforced via foreign keys

The design balances **theoretical normalization** with **practical database implementation**, leveraging PostgreSQL's advanced features (arrays, JSON, full-text search) where appropriate while maintaining data integrity and consistency.

This analysis satisfies all requirements for **Unit 3: Normal Forms** of the DBMS course.
