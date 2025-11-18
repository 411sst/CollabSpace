# Transaction Management and Concurrency Control

## Overview

This document covers **Unit 4: Database Transactions, Concurrency Control, and Locking** concepts as implemented in CollabSpace using PostgreSQL/Supabase.

Topics covered:
- ✅ Transaction properties (ACID)
- ✅ Transaction states and lifecycle
- ✅ Concurrency problems and solutions
- ✅ Locking mechanisms
- ✅ Isolation levels
- ✅ Deadlock handling
- ✅ Practical transaction examples

---

## 1. ACID Properties

CollabSpace leverages PostgreSQL's ACID compliance to ensure data integrity.

### 1.1 Atomicity

**Definition:** A transaction is an indivisible unit - either all operations succeed or all fail.

**Example: Creating a Team with Initial Members**

```sql
BEGIN;

-- Operation 1: Create team
INSERT INTO teams (id, assignment_id, team_name, created_by)
VALUES (
  gen_random_uuid(),
  'assignment-uuid',
  'Team Alpha',
  'creator-student-uuid'
);

-- Operation 2: Add creator as first member
INSERT INTO team_members (team_id, student_id, status)
VALUES (
  (SELECT id FROM teams WHERE team_name = 'Team Alpha' LIMIT 1),
  'creator-student-uuid',
  'active'
);

-- Operation 3: Create notification
INSERT INTO notifications (user_id, type, title, message)
VALUES (
  'creator-student-uuid',
  'team',
  'Team Created',
  'You successfully created Team Alpha'
);

COMMIT;  -- All operations succeed together
-- OR
ROLLBACK;  -- All operations are undone if any fails
```

**Guarantee:** If the notification insert fails, the team and member insert are also rolled back. The database never ends up in a state where a team exists without a creator being a member.

---

### 1.2 Consistency

**Definition:** A transaction must leave the database in a valid state, respecting all constraints.

**Example: Team Size Constraints**

```sql
BEGIN;

-- This will succeed if team has fewer than max_team_size members
INSERT INTO team_members (team_id, student_id, status)
VALUES ('team-uuid', 'new-student-uuid', 'active');

-- Constraint check (enforced by application or trigger)
DO $$
DECLARE
  current_count INTEGER;
  max_allowed INTEGER;
BEGIN
  SELECT COUNT(*) INTO current_count
  FROM team_members
  WHERE team_id = 'team-uuid' AND status = 'active';

  SELECT a.max_team_size INTO max_allowed
  FROM teams t
  JOIN assignments a ON t.assignment_id = a.id
  WHERE t.id = 'team-uuid';

  IF current_count > max_allowed THEN
    RAISE EXCEPTION 'Team size exceeds maximum of %', max_allowed;
  END IF;
END $$;

COMMIT;
```

**Constraints Enforced:**
- CHECK constraints (role, status values)
- UNIQUE constraints (composite keys)
- FOREIGN KEY constraints (referential integrity)
- NOT NULL constraints (required fields)

---

### 1.3 Isolation

**Definition:** Concurrent transactions must not interfere with each other.

**Example: Two Students Joining the Last Spot in a Team**

**Student A's Transaction:**
```sql
BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;

-- Check if team has space
SELECT COUNT(*) FROM team_members
WHERE team_id = 'team-uuid' AND status = 'active';
-- Result: 4 members (max is 5)

-- Join team
INSERT INTO team_members (team_id, student_id, status)
VALUES ('team-uuid', 'student-A-uuid', 'active');

COMMIT;
```

**Student B's Transaction (concurrent):**
```sql
BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;

-- Check if team has space
SELECT COUNT(*) FROM team_members
WHERE team_id = 'team-uuid' AND status = 'active';
-- Result: 4 members (max is 5)

-- Try to join team
INSERT INTO team_members (team_id, student_id, status)
VALUES ('team-uuid', 'student-B-uuid', 'active');

COMMIT;  -- This will fail due to serialization conflict
```

**Result:** Only one student succeeds. The other gets a serialization error and must retry. This prevents the team from having 6 members.

---

### 1.4 Durability

**Definition:** Once a transaction commits, changes are permanent even if system crashes.

**PostgreSQL Guarantees:**
- **Write-Ahead Logging (WAL):** Changes written to disk before commit acknowledgment
- **Checkpoints:** Periodic flushing of dirty pages to disk
- **Crash Recovery:** Replays WAL to restore committed transactions after crash

**Example: Submission Grading**

```sql
BEGIN;

UPDATE submissions
SET
  grade = 85.50,
  feedback = 'Excellent work!',
  graded_at = NOW(),
  graded_by = 'teacher-uuid'
WHERE phase_id = 'phase-uuid'
  AND team_id = 'team-uuid';

COMMIT;
-- After commit, even if the server crashes, the grade is saved
```

---

## 2. Transaction States

A transaction progresses through these states:

```
┌─────────┐
│ Active  │ ─────────┐
└────┬────┘           │
     │                │
     ▼                │
┌─────────────┐       │
│ Partially   │       │
│ Committed   │       │
└────┬────────┘       │
     │                │
     ▼                ▼
┌──────────┐    ┌──────────┐
│Committed │    │  Failed  │
└──────────┘    └────┬─────┘
                     │
                     ▼
                ┌─────────┐
                │ Aborted │
                └─────────┘
```

### State Descriptions

1. **Active:** Transaction is executing operations
2. **Partially Committed:** All operations completed, but not yet written to disk
3. **Committed:** Transaction successfully completed and changes are durable
4. **Failed:** Transaction encountered an error and cannot proceed
5. **Aborted:** Transaction rolled back, database restored to pre-transaction state

---

## 3. Concurrency Problems

### 3.1 Lost Update Problem

**Scenario:** Two transactions read the same data and both update it, causing one update to be lost.

**Example Without Locking:**

```sql
-- Transaction T1: Student A reads team member count
T1: SELECT COUNT(*) FROM team_members WHERE team_id = 'X';  -- Result: 3

-- Transaction T2: Student B reads team member count
T2: SELECT COUNT(*) FROM team_members WHERE team_id = 'X';  -- Result: 3

-- T1: Adds a member (now 4)
T1: INSERT INTO team_members (team_id, student_id) VALUES ('X', 'A');

-- T2: Adds a member (now 5, but T2 thinks it's 4)
T2: INSERT INTO team_members (team_id, student_id) VALUES ('X', 'B');

-- Problem: Both think they added the 4th member, but there are now 5!
```

**Solution: Row-Level Locking**

```sql
BEGIN;

-- Lock the team row for update
SELECT COUNT(*) FROM team_members
WHERE team_id = 'X' AND status = 'active'
FOR UPDATE;  -- Acquires exclusive lock

-- Other transactions must wait until this commits
INSERT INTO team_members (team_id, student_id, status)
VALUES ('X', 'student-uuid', 'active');

COMMIT;  -- Releases lock
```

---

### 3.2 Dirty Read Problem

**Scenario:** A transaction reads uncommitted changes from another transaction.

**Example:**

```sql
-- Transaction T1: Updates a grade (not committed)
T1: BEGIN;
T1: UPDATE submissions SET grade = 95 WHERE id = 'submission-X';

-- Transaction T2: Reads the uncommitted grade
T2: BEGIN;
T2: SELECT grade FROM submissions WHERE id = 'submission-X';  -- Reads 95

-- T1: Realizes mistake and rolls back
T1: ROLLBACK;

-- Problem: T2 read a grade (95) that never actually existed!
```

**Solution: Isolation Level READ COMMITTED (PostgreSQL default)**

```sql
-- T2 with proper isolation
BEGIN TRANSACTION ISOLATION LEVEL READ COMMITTED;
SELECT grade FROM submissions WHERE id = 'submission-X';
-- Only sees committed data, not T1's uncommitted changes
COMMIT;
```

---

### 3.3 Non-Repeatable Read Problem

**Scenario:** A transaction reads the same data twice and gets different results.

**Example:**

```sql
-- Transaction T1: Reads team member count
T1: BEGIN;
T1: SELECT COUNT(*) FROM team_members WHERE team_id = 'X';  -- Result: 3

-- Transaction T2: Adds a member and commits
T2: BEGIN;
T2: INSERT INTO team_members (team_id, student_id) VALUES ('X', 'new-student');
T2: COMMIT;

-- T1: Reads count again in same transaction
T1: SELECT COUNT(*) FROM team_members WHERE team_id = 'X';  -- Result: 4

-- Problem: Same query returned different results in same transaction!
```

**Solution: Isolation Level REPEATABLE READ**

```sql
BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ;

SELECT COUNT(*) FROM team_members WHERE team_id = 'X';  -- Result: 3

-- Even if T2 inserts and commits, T1 still sees consistent snapshot

SELECT COUNT(*) FROM team_members WHERE team_id = 'X';  -- Still 3

COMMIT;
```

---

### 3.4 Phantom Read Problem

**Scenario:** A transaction re-executes a query and sees new rows that weren't there before.

**Example:**

```sql
-- Transaction T1: Counts students in section CS-A
T1: BEGIN;
T1: SELECT COUNT(*) FROM profiles WHERE section = 'CS-A';  -- Result: 20

-- Transaction T2: Adds a new student to CS-A
T2: BEGIN;
T2: INSERT INTO profiles (section, ...) VALUES ('CS-A', ...);
T2: COMMIT;

-- T1: Counts again
T1: SELECT COUNT(*) FROM profiles WHERE section = 'CS-A';  -- Result: 21

-- Problem: New row "appeared" (phantom) in the result set!
```

**Solution: Isolation Level SERIALIZABLE**

```sql
BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SELECT COUNT(*) FROM profiles WHERE section = 'CS-A';  -- Result: 20

-- Even if T2 inserts and commits, T1 sees consistent snapshot

SELECT COUNT(*) FROM profiles WHERE section = 'CS-A';  -- Still 20

COMMIT;
```

---

## 4. Isolation Levels

PostgreSQL supports four standard isolation levels:

| Isolation Level | Dirty Read | Non-Repeatable Read | Phantom Read | Performance |
|----------------|------------|---------------------|--------------|-------------|
| READ UNCOMMITTED* | Possible | Possible | Possible | Highest |
| READ COMMITTED (default) | Prevented | Possible | Possible | High |
| REPEATABLE READ | Prevented | Prevented | Prevented** | Medium |
| SERIALIZABLE | Prevented | Prevented | Prevented | Lowest |

\* PostgreSQL treats READ UNCOMMITTED as READ COMMITTED
\** PostgreSQL REPEATABLE READ also prevents phantom reads (stronger than SQL standard)

### 4.1 READ COMMITTED (Default)

**Guarantees:**
- Only sees committed data
- Each statement sees a fresh snapshot of committed data

**Use Case:** Most CollabSpace operations

```sql
BEGIN TRANSACTION ISOLATION LEVEL READ COMMITTED;

-- Sees only committed grades
SELECT * FROM submissions WHERE grade IS NOT NULL;

COMMIT;
```

---

### 4.2 REPEATABLE READ

**Guarantees:**
- Consistent snapshot throughout transaction
- No non-repeatable reads or phantom reads

**Use Case:** Generating reports that must be consistent

```sql
BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ;

-- Take snapshot of current state
SELECT COUNT(*) FROM teams;
SELECT AVG(grade) FROM submissions;
SELECT COUNT(*) FROM chat_messages;

-- All queries see the same consistent snapshot
-- Even if other transactions commit changes

COMMIT;
```

---

### 4.3 SERIALIZABLE

**Guarantees:**
- Transactions execute as if they ran serially (one after another)
- Prevents all concurrency anomalies

**Use Case:** Critical operations requiring absolute consistency

```sql
BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;

-- Check team size
SELECT COUNT(*) FROM team_members WHERE team_id = 'X';

-- Add member only if under limit
INSERT INTO team_members (team_id, student_id)
VALUES ('X', 'new-student');

COMMIT;
-- If another transaction modifies the same data, this will fail with serialization error
```

---

## 5. Locking Mechanisms

### 5.1 Lock Types

#### Table-Level Locks

| Lock Mode | Conflicts With | Use Case |
|-----------|----------------|----------|
| ACCESS SHARE | ACCESS EXCLUSIVE | SELECT queries |
| ROW SHARE | EXCLUSIVE, ACCESS EXCLUSIVE | SELECT FOR UPDATE |
| ROW EXCLUSIVE | SHARE, EXCLUSIVE, ACCESS EXCLUSIVE | INSERT, UPDATE, DELETE |
| SHARE | ROW EXCLUSIVE, EXCLUSIVE, ACCESS EXCLUSIVE | CREATE INDEX |
| EXCLUSIVE | All except ACCESS SHARE | DDL operations |
| ACCESS EXCLUSIVE | All | ALTER TABLE, DROP TABLE |

#### Row-Level Locks

| Lock Mode | Command | Purpose |
|-----------|---------|---------|
| FOR UPDATE | SELECT ... FOR UPDATE | Exclusive lock for update |
| FOR NO KEY UPDATE | SELECT ... FOR NO KEY UPDATE | Lock row, allow key reads |
| FOR SHARE | SELECT ... FOR SHARE | Shared lock, prevent updates |
| FOR KEY SHARE | SELECT ... FOR KEY SHARE | Shared lock, allow non-key updates |

---

### 5.2 Explicit Locking Examples

#### SELECT FOR UPDATE

```sql
BEGIN;

-- Lock team row to prevent concurrent modifications
SELECT * FROM teams
WHERE id = 'team-uuid'
FOR UPDATE;

-- Other transactions trying to UPDATE this team will wait
-- Now safely modify team members
INSERT INTO team_members (team_id, student_id)
VALUES ('team-uuid', 'new-member-uuid');

COMMIT;  -- Releases lock
```

#### SELECT FOR SHARE

```sql
BEGIN;

-- Lock submission for reading (prevents updates but allows other readers)
SELECT * FROM submissions
WHERE id = 'submission-uuid'
FOR SHARE;

-- Multiple transactions can hold FOR SHARE lock simultaneously
-- But no transaction can UPDATE until all release

COMMIT;
```

#### NOWAIT Option

```sql
BEGIN;

-- Try to lock, but don't wait if locked
SELECT * FROM teams
WHERE id = 'team-uuid'
FOR UPDATE NOWAIT;
-- If locked, immediately raises error instead of waiting

COMMIT;
```

#### SKIP LOCKED Option

```sql
BEGIN;

-- Lock available rows, skip locked ones
SELECT * FROM submissions
WHERE grade IS NULL
FOR UPDATE SKIP LOCKED
LIMIT 10;

-- Useful for work queues: multiple graders can pick submissions in parallel

COMMIT;
```

---

### 5.3 Practical Locking Example: Safe Team Join

```sql
CREATE OR REPLACE FUNCTION safe_join_team(
  p_team_id UUID,
  p_student_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_current_count INTEGER;
  v_max_size INTEGER;
BEGIN
  -- Start transaction with locking
  BEGIN

    -- Lock the team row to prevent concurrent joins
    SELECT
      (SELECT COUNT(*) FROM team_members WHERE team_id = p_team_id AND status = 'active'),
      a.max_team_size
    INTO v_current_count, v_max_size
    FROM teams t
    JOIN assignments a ON t.assignment_id = a.id
    WHERE t.id = p_team_id
    FOR UPDATE OF t;  -- Locks the team row

    -- Check if team is full
    IF v_current_count >= v_max_size THEN
      RAISE EXCEPTION 'Team is full (% / %)', v_current_count, v_max_size;
    END IF;

    -- Add student to team
    INSERT INTO team_members (team_id, student_id, status)
    VALUES (p_team_id, p_student_id, 'active')
    ON CONFLICT (team_id, student_id) DO NOTHING;

    RETURN TRUE;

  EXCEPTION
    WHEN OTHERS THEN
      -- Transaction will rollback automatically
      RAISE NOTICE 'Failed to join team: %', SQLERRM;
      RETURN FALSE;
  END;
END;
$$ LANGUAGE plpgsql;
```

**Usage:**
```sql
SELECT safe_join_team('team-uuid', 'student-uuid');
```

---

## 6. Deadlock Handling

### 6.1 What is a Deadlock?

A **deadlock** occurs when two or more transactions are waiting for each other to release locks, creating a circular dependency.

**Example Deadlock Scenario:**

```sql
-- Transaction T1
BEGIN;
UPDATE teams SET team_name = 'New Name 1' WHERE id = 'team-A';
-- T1 holds lock on team-A

-- Transaction T2 (concurrent)
BEGIN;
UPDATE teams SET team_name = 'New Name 2' WHERE id = 'team-B';
-- T2 holds lock on team-B

-- T1 tries to update team-B
UPDATE teams SET team_name = 'Another Name' WHERE id = 'team-B';
-- T1 waits for T2 to release lock on team-B

-- T2 tries to update team-A
UPDATE teams SET team_name = 'Yet Another Name' WHERE id = 'team-A';
-- T2 waits for T1 to release lock on team-A

-- DEADLOCK: T1 waits for T2, T2 waits for T1!
```

---

### 6.2 PostgreSQL Deadlock Detection

PostgreSQL automatically detects deadlocks:
- **Detection:** Periodic check for circular wait conditions
- **Resolution:** Aborts one transaction (the "victim")
- **Error:** `ERROR: deadlock detected`

**Example Error Message:**
```
ERROR: deadlock detected
DETAIL: Process 1234 waits for ShareLock on transaction 5678;
blocked by process 5678.
Process 5678 waits for ShareLock on transaction 1234;
blocked by process 1234.
HINT: See server log for query details.
```

---

### 6.3 Preventing Deadlocks

#### Strategy 1: Lock Ordering

Always acquire locks in the same order across all transactions.

**Good (Consistent Order):**
```sql
-- Always lock teams in ID order
BEGIN;
SELECT * FROM teams WHERE id IN ('team-A', 'team-B')
ORDER BY id  -- Ensures consistent lock order
FOR UPDATE;
-- Perform updates
COMMIT;
```

**Bad (Inconsistent Order):**
```sql
-- T1 locks team-A then team-B
-- T2 locks team-B then team-A
-- Potential deadlock!
```

---

#### Strategy 2: Use Timeouts

Set lock wait timeouts to prevent indefinite waiting.

```sql
-- Set timeout for this transaction
SET LOCAL lock_timeout = '5s';

BEGIN;
SELECT * FROM teams WHERE id = 'team-uuid' FOR UPDATE;
-- If can't acquire lock within 5 seconds, raise error
COMMIT;
```

---

#### Strategy 3: Minimize Transaction Time

Keep transactions short to reduce lock hold time.

**Good:**
```sql
-- Prepare data outside transaction
-- ...

-- Quick transaction
BEGIN;
INSERT INTO submissions (...) VALUES (...);
COMMIT;
```

**Bad:**
```sql
BEGIN;
-- Long-running computation inside transaction
-- ...complex business logic for 10 seconds...
-- Holds locks for entire duration
INSERT INTO submissions (...) VALUES (...);
COMMIT;
```

---

#### Strategy 4: Retry Logic

Implement automatic retry for deadlock victims.

```javascript
// JavaScript example in application layer
async function executeWithRetry(transactionFn, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await transactionFn();
    } catch (error) {
      if (error.code === '40P01' && attempt < maxRetries) {
        // 40P01 is PostgreSQL deadlock error code
        console.log(`Deadlock detected, retrying (${attempt}/${maxRetries})...`);
        await sleep(100 * attempt);  // Exponential backoff
        continue;
      }
      throw error;
    }
  }
}
```

---

## 7. CollabSpace Transaction Examples

### 7.1 Creating an Assignment with Phases

```sql
BEGIN;

-- Insert assignment
INSERT INTO assignments (
  id, title, description, teacher_id, sections,
  min_team_size, max_team_size, team_formation_deadline
)
VALUES (
  gen_random_uuid(), 'DBMS Project', 'Build a database application',
  'teacher-uuid', ARRAY['CS-A', 'CS-B'], 2, 5,
  NOW() + INTERVAL '7 days'
)
RETURNING id INTO assignment_id;

-- Insert phases
INSERT INTO assignment_phases (assignment_id, phase_number, phase_name, deadline)
VALUES
  (assignment_id, 1, 'Proposal', NOW() + INTERVAL '14 days'),
  (assignment_id, 2, 'Review 1', NOW() + INTERVAL '28 days'),
  (assignment_id, 3, 'Final Submission', NOW() + INTERVAL '42 days');

-- Notify students
INSERT INTO notifications (user_id, type, title, message, link)
SELECT
  p.id, 'assignment', 'New Assignment: DBMS Project',
  'A new assignment has been posted for your section',
  '/assignments/' || assignment_id
FROM profiles p
WHERE p.role = 'student' AND p.section = ANY(ARRAY['CS-A', 'CS-B']);

COMMIT;
```

**Why transaction?** Ensures assignment, phases, and notifications are created atomically. If any step fails, none of the changes are applied.

---

### 7.2 Submitting an Assignment Phase

```sql
BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ;

-- Check if already submitted
IF EXISTS (
  SELECT 1 FROM submissions
  WHERE phase_id = 'phase-uuid' AND team_id = 'team-uuid'
) THEN
  RAISE EXCEPTION 'Already submitted for this phase';
END IF;

-- Upload file record
INSERT INTO files (
  assignment_id, phase_id, team_id, uploaded_by,
  file_name, file_url, file_type, file_size, file_category
)
VALUES (
  'assignment-uuid', 'phase-uuid', 'team-uuid', 'student-uuid',
  'submission.pdf', 'https://storage/.../submission.pdf',
  'application/pdf', 2048576, 'submission'
);

-- Create submission record
INSERT INTO submissions (
  phase_id, team_id, submitted_by, submitted_at
)
VALUES (
  'phase-uuid', 'team-uuid', 'student-uuid', NOW()
);

-- Notify team members
INSERT INTO notifications (user_id, type, title, message, link)
SELECT
  tm.student_id, 'submission', 'Submission Uploaded',
  'Your team has submitted the assignment phase',
  '/assignments/assignment-uuid'
FROM team_members tm
WHERE tm.team_id = 'team-uuid' AND tm.status = 'active';

COMMIT;
```

**Why REPEATABLE READ?** Ensures consistent view throughout submission process. Prevents duplicate submissions even with concurrent attempts.

---

### 7.3 Grading Multiple Submissions

```sql
BEGIN;

-- Lock submissions for grading (prevents concurrent grading of same submission)
SELECT id FROM submissions
WHERE phase_id = 'phase-uuid' AND grade IS NULL
FOR UPDATE SKIP LOCKED
LIMIT 10;

-- Grade them
UPDATE submissions s
SET
  grade = (
    CASE
      WHEN s.id = 'sub-1' THEN 95.0
      WHEN s.id = 'sub-2' THEN 87.5
      WHEN s.id = 'sub-3' THEN 92.0
      -- ...
      ELSE s.grade
    END
  ),
  feedback = (
    CASE
      WHEN s.id = 'sub-1' THEN 'Excellent work!'
      WHEN s.id = 'sub-2' THEN 'Good effort, minor issues.'
      WHEN s.id = 'sub-3' THEN 'Very thorough!'
      -- ...
      ELSE s.feedback
    END
  ),
  graded_at = NOW(),
  graded_by = 'teacher-uuid'
WHERE s.id IN ('sub-1', 'sub-2', 'sub-3', ...);

-- Notify students
INSERT INTO notifications (user_id, type, title, message, link)
SELECT
  tm.student_id, 'grade', 'Assignment Graded',
  'Your submission has been graded',
  '/assignments/assignment-uuid'
FROM submissions s
JOIN team_members tm ON s.team_id = tm.team_id
WHERE s.id IN ('sub-1', 'sub-2', 'sub-3', ...)
  AND tm.status = 'active';

COMMIT;
```

**Why SKIP LOCKED?** Allows multiple teachers to grade submissions in parallel without conflicts. Each teacher locks and grades different submissions.

---

## 8. Supabase Transaction Handling

Supabase client provides transaction support through PostgreSQL:

### 8.1 RPC Functions (Recommended)

```javascript
// Define PostgreSQL function with transaction
CREATE OR REPLACE FUNCTION create_team_with_members(
  p_assignment_id UUID,
  p_team_name TEXT,
  p_creator_id UUID,
  p_member_ids UUID[]
) RETURNS UUID AS $$
DECLARE
  v_team_id UUID;
  v_member_id UUID;
BEGIN
  -- Insert team
  INSERT INTO teams (assignment_id, team_name, created_by)
  VALUES (p_assignment_id, p_team_name, p_creator_id)
  RETURNING id INTO v_team_id;

  -- Insert creator as member
  INSERT INTO team_members (team_id, student_id, status)
  VALUES (v_team_id, p_creator_id, 'active');

  -- Insert other members
  FOREACH v_member_id IN ARRAY p_member_ids
  LOOP
    INSERT INTO team_members (team_id, student_id, status)
    VALUES (v_team_id, v_member_id, 'active');
  END LOOP;

  RETURN v_team_id;
END;
$$ LANGUAGE plpgsql;

// Call from JavaScript
const { data, error } = await supabase.rpc('create_team_with_members', {
  p_assignment_id: 'assignment-uuid',
  p_team_name: 'Team Alpha',
  p_creator_id: currentUserId,
  p_member_ids: ['member-1', 'member-2']
});
```

---

## Summary

CollabSpace demonstrates comprehensive transaction management:

✅ **ACID Properties:** Atomicity, Consistency, Isolation, Durability
✅ **Concurrency Control:** Prevents lost updates, dirty reads, non-repeatable reads, phantoms
✅ **Isolation Levels:** READ COMMITTED (default), REPEATABLE READ, SERIALIZABLE
✅ **Locking:** Row-level locks (FOR UPDATE, FOR SHARE), table-level locks
✅ **Deadlock Handling:** Detection, prevention strategies, retry logic
✅ **Practical Examples:** Team creation, submission, grading with proper transaction boundaries

**Key Takeaways:**
- Use appropriate isolation levels based on consistency requirements
- Apply explicit locking (FOR UPDATE) for critical operations
- Keep transactions short to minimize lock contention
- Implement retry logic for deadlock victims
- Leverage PostgreSQL's robust concurrency control mechanisms

This satisfies requirements for **Unit 4: Database Transactions, Concurrency Control, Locking** of the DBMS course.
