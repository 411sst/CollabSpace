# Relational Algebra - CollabSpace Query Operations

## Overview

This document demonstrates **Relational Algebra** operations as covered in **Unit 1: Relational Operations (Algebra)** of the DBMS course. Relational algebra is a procedural query language that forms the theoretical foundation of SQL.

We'll demonstrate each operation with:
- **Formal notation** (mathematical symbols)
- **SQL equivalent** (practical implementation)
- **Result** (what data is returned)

---

## Relational Algebra Fundamentals

### Basic Notation

| Operation | Symbol | Description |
|-----------|--------|-------------|
| Selection | σ (sigma) | Select rows matching a condition |
| Projection | π (pi) | Select specific columns |
| Union | ∪ | Combine results from two relations |
| Intersection | ∩ | Common rows between two relations |
| Difference | − | Rows in first relation but not second |
| Cartesian Product | × | All possible combinations of rows |
| Join | ⨝ (bowtie) | Combine related rows from two relations |
| Rename | ρ (rho) | Rename relation or attributes |
| Assignment | ← | Assign result to temporary relation |
| Division | ÷ | Find tuples related to all tuples in another relation |

---

## 1. Unary Operations

Unary operations work on a single relation.

### 1.1 Selection (σ) - Filter Rows

**Definition:** Select tuples that satisfy a given condition.

**Notation:** σ<sub>condition</sub>(Relation)

#### Example 1: Find all students

**Relational Algebra:**
```
σ_role='student'(profiles)
```

**SQL Equivalent:**
```sql
SELECT * FROM profiles
WHERE role = 'student';
```

**Result:** All tuples from profiles where role equals 'student'

---

#### Example 2: Find assignments with deadline in next 7 days

**Relational Algebra:**
```
σ_team_formation_deadline ≤ NOW() + 7 days AND team_formation_deadline ≥ NOW()(assignments)
```

**SQL Equivalent:**
```sql
SELECT * FROM assignments
WHERE team_formation_deadline BETWEEN NOW() AND NOW() + INTERVAL '7 days';
```

---

#### Example 3: Complex condition with AND

**Relational Algebra:**
```
σ_role='student' AND section='CS-A'(profiles)
```

**SQL Equivalent:**
```sql
SELECT * FROM profiles
WHERE role = 'student' AND section = 'CS-A';
```

---

### 1.2 Projection (π) - Select Columns

**Definition:** Select specific attributes from a relation.

**Notation:** π<sub>attribute1, attribute2, ...</sub>(Relation)

#### Example 1: Get student names and sections

**Relational Algebra:**
```
π_first_name, last_name, section(σ_role='student'(profiles))
```

**SQL Equivalent:**
```sql
SELECT first_name, last_name, section
FROM profiles
WHERE role = 'student';
```

**Result:** Three columns (first_name, last_name, section) from student profiles

---

#### Example 2: Get assignment titles

**Relational Algebra:**
```
π_title(assignments)
```

**SQL Equivalent:**
```sql
SELECT DISTINCT title FROM assignments;
```

**Note:** Relational algebra eliminates duplicates by default; SQL needs DISTINCT

---

### 1.3 Rename (ρ) - Rename Relations/Attributes

**Definition:** Rename a relation or its attributes.

**Notation:** ρ<sub>new_name(attr1, attr2, ...)</sub>(Relation)

#### Example: Rename profiles to users

**Relational Algebra:**
```
ρ_users(id, email_address, fname, lname, user_role, sid, sec, avatar, created, updated)(profiles)
```

**SQL Equivalent:**
```sql
SELECT
  id,
  email AS email_address,
  first_name AS fname,
  last_name AS lname,
  role AS user_role,
  student_id AS sid,
  section AS sec,
  avatar_url AS avatar,
  created_at AS created,
  updated_at AS updated
FROM profiles;
```

---

## 2. Binary Operations

Binary operations combine two relations.

### 2.1 Union (∪) - Combine Results

**Definition:** Combine tuples from two relations with the same schema, eliminating duplicates.

**Notation:** R ∪ S

**Requirement:** R and S must have the same attributes (union-compatible)

#### Example: Find all users who created teams OR sent messages

**Relational Algebra:**
```
π_created_by(teams) ∪ π_sender_id(chat_messages)
```

**SQL Equivalent:**
```sql
SELECT created_by AS user_id FROM teams
UNION
SELECT sender_id AS user_id FROM chat_messages;
```

**Result:** Distinct user IDs who have either created teams or sent messages

---

### 2.2 Intersection (∩) - Common Results

**Definition:** Find tuples that exist in both relations.

**Notation:** R ∩ S

#### Example: Find students who are both team members AND message senders

**Relational Algebra:**
```
π_student_id(team_members) ∩ π_sender_id(chat_messages)
```

**SQL Equivalent:**
```sql
SELECT student_id FROM team_members
WHERE status = 'active'
INTERSECT
SELECT sender_id FROM chat_messages;
```

**Result:** Student IDs present in both relations

---

### 2.3 Difference (−) - Set Subtraction

**Definition:** Find tuples in first relation but not in second.

**Notation:** R − S

#### Example: Find students who have NOT joined any team

**Relational Algebra:**
```
π_id(σ_role='student'(profiles)) − π_student_id(team_members)
```

**SQL Equivalent:**
```sql
SELECT id FROM profiles WHERE role = 'student'
EXCEPT
SELECT student_id FROM team_members WHERE status = 'active';
```

**Result:** Student IDs not present in team_members

---

### 2.4 Cartesian Product (×) - All Combinations

**Definition:** Combine each tuple from R with each tuple from S.

**Notation:** R × S

**Result Size:** |R| × |S| tuples

#### Example: All possible student-team pairs (before filtering)

**Relational Algebra:**
```
σ_role='student'(profiles) × teams
```

**SQL Equivalent:**
```sql
SELECT *
FROM profiles
CROSS JOIN teams
WHERE profiles.role = 'student';
```

**Result:** Every student paired with every team (combinatorial explosion)

**Note:** Rarely used alone; typically followed by selection to filter relevant pairs

---

### 2.5 Join Operations (⨝)

Joins combine related tuples from two relations based on a condition.

#### 2.5.1 Natural Join (⨝)

**Definition:** Join on all common attributes with equality.

**Notation:** R ⨝ S

**Example:** Join teams with assignments (on assignment_id)

**Relational Algebra:**
```
teams ⨝ assignments
```

**SQL Equivalent:**
```sql
SELECT *
FROM teams
NATURAL JOIN assignments;
-- OR explicitly:
SELECT *
FROM teams t
JOIN assignments a ON t.assignment_id = a.id;
```

---

#### 2.5.2 Theta Join (⨝<sub>θ</sub>)

**Definition:** Join on an arbitrary condition θ.

**Notation:** R ⨝<sub>θ</sub> S

**Example:** Find submissions graded higher than 80

**Relational Algebra:**
```
submissions ⨝_submissions.grade > 80 assignment_phases
```

**SQL Equivalent:**
```sql
SELECT *
FROM submissions s
JOIN assignment_phases ap ON s.phase_id = ap.id
WHERE s.grade > 80;
```

---

#### 2.5.3 Equi Join

**Definition:** Theta join where condition is equality.

**Example:** Join team_members with profiles

**Relational Algebra:**
```
team_members ⨝_team_members.student_id = profiles.id profiles
```

**SQL Equivalent:**
```sql
SELECT *
FROM team_members tm
JOIN profiles p ON tm.student_id = p.id;
```

---

#### 2.5.4 Outer Joins

**Left Outer Join (⟕):** Include all tuples from left relation
**Right Outer Join (⟖):** Include all tuples from right relation
**Full Outer Join (⟗):** Include all tuples from both relations

**Example:** All students with their teams (including students without teams)

**Relational Algebra:**
```
profiles ⟕_profiles.id = team_members.student_id team_members
```

**SQL Equivalent:**
```sql
SELECT *
FROM profiles p
LEFT JOIN team_members tm ON p.id = tm.student_id
WHERE p.role = 'student';
```

---

## 3. Aggregate Functions

Aggregate functions compute values from groups of tuples.

### 3.1 Aggregation Notation

**Notation:** <sub>grouping_attrs</sub>G<sub>aggr_func(attr), ...</sub>(Relation)

Where:
- **grouping_attrs:** Attributes to group by
- **G:** Grouping operator
- **aggr_func:** COUNT, SUM, AVG, MIN, MAX

---

### 3.2 Example: Count teams per assignment

**Relational Algebra:**
```
assignment_id G_COUNT(id) AS team_count(teams)
```

**SQL Equivalent:**
```sql
SELECT assignment_id, COUNT(id) AS team_count
FROM teams
GROUP BY assignment_id;
```

---

### 3.3 Example: Average grade per student

**Relational Algebra:**
```
student_id G_AVG(grade) AS avg_grade(
  team_members ⨝ submissions
)
```

**SQL Equivalent:**
```sql
SELECT
  tm.student_id,
  AVG(s.grade) AS avg_grade
FROM team_members tm
JOIN submissions s ON tm.team_id = s.team_id
GROUP BY tm.student_id;
```

---

### 3.4 Example: Total members per team (with filter)

**Relational Algebra:**
```
team_id G_COUNT(student_id) AS member_count(
  σ_status='active'(team_members)
)
```

**SQL Equivalent:**
```sql
SELECT team_id, COUNT(student_id) AS member_count
FROM team_members
WHERE status = 'active'
GROUP BY team_id;
```

---

## 4. Complex Query Examples

### 4.1 Find Teams with All Required Members

**Query:** List teams that have at least min_team_size members

**Relational Algebra:**
```
π_team_id, team_name, member_count(
  σ_member_count >= min_team_size(
    (team_id G_COUNT(student_id) AS member_count(σ_status='active'(team_members)))
    ⨝_teams.id = team_members.team_id teams
    ⨝_teams.assignment_id = assignments.id assignments
  )
)
```

**SQL Equivalent:**
```sql
SELECT
  t.id AS team_id,
  t.team_name,
  COUNT(tm.student_id) AS member_count,
  a.min_team_size
FROM teams t
JOIN assignments a ON t.assignment_id = a.id
LEFT JOIN team_members tm ON t.id = tm.team_id AND tm.status = 'active'
GROUP BY t.id, t.team_name, a.min_team_size
HAVING COUNT(tm.student_id) >= a.min_team_size;
```

---

### 4.2 Find Students Who Joined All Teams for an Assignment

**Query:** Division operation - students in every team for a specific assignment

**Relational Algebra (Division):**
```
π_student_id, team_id(team_members) ÷ π_id(σ_assignment_id='X'(teams))
```

**SQL Equivalent:**
```sql
-- Find students who are members of ALL teams for assignment 'X'
SELECT tm.student_id
FROM team_members tm
WHERE tm.team_id IN (
  SELECT id FROM teams WHERE assignment_id = 'X'
)
GROUP BY tm.student_id
HAVING COUNT(DISTINCT tm.team_id) = (
  SELECT COUNT(*) FROM teams WHERE assignment_id = 'X'
);
```

**Note:** Division is rarely supported directly in SQL; implemented using NOT EXISTS pattern

---

### 4.3 Find Assignments with Above-Average Team Count

**Relational Algebra:**
```
π_title(
  σ_team_count > avg_teams(
    (assignment_id G_COUNT(id) AS team_count(teams))
    ⨝ assignments
    × (G_AVG(team_count) AS avg_teams(assignment_id G_COUNT(id) AS team_count(teams)))
  )
)
```

**SQL Equivalent:**
```sql
WITH team_counts AS (
  SELECT assignment_id, COUNT(*) AS team_count
  FROM teams
  GROUP BY assignment_id
),
average AS (
  SELECT AVG(team_count) AS avg_teams FROM team_counts
)
SELECT a.title
FROM assignments a
JOIN team_counts tc ON a.id = tc.assignment_id
CROSS JOIN average avg
WHERE tc.team_count > avg.avg_teams;
```

---

### 4.4 Find Students Who Submitted All Phases

**Query:** Students whose teams submitted for every phase of an assignment

**Relational Algebra:**
```
π_student_id(
  (π_student_id, phase_id(
    team_members ⨝ submissions
  ))
  ÷
  π_id(assignment_phases)
)
```

**SQL Equivalent:**
```sql
SELECT tm.student_id
FROM team_members tm
JOIN submissions s ON tm.team_id = s.team_id
JOIN assignment_phases ap ON s.phase_id = ap.id
WHERE ap.assignment_id = 'assignment-X'
GROUP BY tm.student_id
HAVING COUNT(DISTINCT ap.id) = (
  SELECT COUNT(*)
  FROM assignment_phases
  WHERE assignment_id = 'assignment-X'
);
```

---

## 5. Advanced Relational Algebra Concepts

### 5.1 Assignment (←)

**Definition:** Store intermediate results in temporary relations.

**Example:** Multi-step query

**Relational Algebra:**
```
R1 ← σ_role='student'(profiles)
R2 ← π_id, first_name, last_name, section(R1)
R3 ← R2 ⨝_R2.id = team_members.student_id team_members
Result ← π_first_name, last_name, section, team_id(R3)
```

**SQL Equivalent:**
```sql
WITH R1 AS (
  SELECT * FROM profiles WHERE role = 'student'
),
R2 AS (
  SELECT id, first_name, last_name, section FROM R1
),
R3 AS (
  SELECT * FROM R2 JOIN team_members ON R2.id = team_members.student_id
)
SELECT first_name, last_name, section, team_id FROM R3;
```

---

### 5.2 Semi-Join (⋉)

**Definition:** Return tuples from R that have matching tuples in S.

**Notation:** R ⋉<sub>θ</sub> S

**Example:** Find students who have sent messages

**Relational Algebra:**
```
profiles ⋉_profiles.id = chat_messages.sender_id chat_messages
```

**SQL Equivalent:**
```sql
SELECT p.*
FROM profiles p
WHERE EXISTS (
  SELECT 1 FROM chat_messages cm
  WHERE cm.sender_id = p.id
);
```

---

### 5.3 Anti-Join (▷)

**Definition:** Return tuples from R that do NOT have matching tuples in S.

**Notation:** R ▷<sub>θ</sub> S

**Example:** Find students who have NOT sent messages

**Relational Algebra:**
```
profiles ▷_profiles.id = chat_messages.sender_id chat_messages
```

**SQL Equivalent:**
```sql
SELECT p.*
FROM profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM chat_messages cm
  WHERE cm.sender_id = p.id
) AND p.role = 'student';
```

---

## 6. Query Optimization Examples

### 6.1 Optimization Rule: Push Selection Down

**Inefficient:**
```
π_team_name(σ_section='CS-A'(teams ⨝ assignments ⨝ profiles))
```

**Optimized:**
```
π_team_name(teams ⨝ assignments ⨝ σ_section='CS-A'(profiles))
```

**Why Better:** Filter profiles first (smaller intermediate relation)

---

### 6.2 Optimization Rule: Push Projection Down

**Inefficient:**
```
π_first_name, last_name(profiles ⨝ team_members)
```

**Optimized:**
```
π_first_name, last_name(π_id, first_name, last_name(profiles) ⨝ team_members)
```

**Why Better:** Reduce data transferred in join

---

### 6.3 Optimization Rule: Combine Selections

**Inefficient:**
```
σ_role='student'(σ_section='CS-A'(profiles))
```

**Optimized:**
```
σ_role='student' AND section='CS-A'(profiles)
```

**Why Better:** Single table scan instead of two

---

## 7. Practical Query Translations

### 7.1 Find Active Teams with Member Count

**Relational Algebra:**
```
π_team_name, assignment, member_count(
  teams
  ⨝_teams.assignment_id = assignments.id assignments
  ⨝_teams.id = member_stats.team_id (
    team_id G_COUNT(student_id) AS member_count(σ_status='active'(team_members))
  )
)
```

**SQL:**
```sql
SELECT
  t.team_name,
  a.title AS assignment,
  COUNT(tm.student_id) AS member_count
FROM teams t
JOIN assignments a ON t.assignment_id = a.id
LEFT JOIN team_members tm ON t.id = tm.team_id AND tm.status = 'active'
GROUP BY t.id, t.team_name, a.title;
```

---

### 7.2 Find Teachers with Their Assignment Counts

**Relational Algebra:**
```
π_first_name, last_name, assignment_count(
  σ_role='teacher'(profiles)
  ⟕_profiles.id = assignment_stats.teacher_id (
    teacher_id G_COUNT(id) AS assignment_count(assignments)
  )
)
```

**SQL:**
```sql
SELECT
  p.first_name,
  p.last_name,
  COUNT(a.id) AS assignment_count
FROM profiles p
LEFT JOIN assignments a ON p.id = a.teacher_id
WHERE p.role = 'teacher'
GROUP BY p.id, p.first_name, p.last_name;
```

---

### 7.3 Find Submissions with Complete Details

**Relational Algebra:**
```
π_assignment, phase_name, team_name, grade, feedback(
  submissions
  ⨝_submissions.phase_id = assignment_phases.id assignment_phases
  ⨝_assignment_phases.assignment_id = assignments.id assignments
  ⨝_submissions.team_id = teams.id teams
)
```

**SQL:**
```sql
SELECT
  a.title AS assignment,
  ap.phase_name,
  t.team_name,
  s.grade,
  s.feedback
FROM submissions s
JOIN assignment_phases ap ON s.phase_id = ap.id
JOIN assignments a ON ap.assignment_id = a.id
JOIN teams t ON s.team_id = t.id
WHERE s.grade IS NOT NULL;
```

---

## Summary

This document demonstrates:

✅ **Unary Operations:** Selection (σ), Projection (π), Rename (ρ)
✅ **Binary Operations:** Union (∪), Intersection (∩), Difference (−), Cartesian Product (×)
✅ **Join Operations:** Natural Join (⨝), Theta Join, Equi Join, Outer Joins
✅ **Aggregate Functions:** Grouping and aggregation (G)
✅ **Advanced Operations:** Division (÷), Semi-Join (⋉), Anti-Join (▷)
✅ **Query Optimization:** Selection push-down, projection push-down
✅ **SQL Translation:** Every relational algebra expression mapped to SQL

**Key Insights:**
- Relational algebra is **procedural** (how to compute)
- SQL is **declarative** (what to compute)
- Relational algebra forms the **theoretical foundation** of SQL
- Query optimizers use relational algebra **transformations** to improve performance

This satisfies requirements for **Unit 1: Relational Operations (Algebra)** of the DBMS course.
