# CollabSpace Architecture

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │    Admin     │  │   Teacher    │  │   Student    │     │
│  │  Dashboard   │  │  Dashboard   │  │  Dashboard   │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
│                  ┌─────────▼─────────┐                      │
│                  │   React Router    │                      │
│                  │   (Protected)     │                      │
│                  └─────────┬─────────┘                      │
│                            │                                 │
│                  ┌─────────▼─────────┐                      │
│                  │  Supabase Client  │                      │
│                  │  (Auth + API)     │                      │
│                  └─────────┬─────────┘                      │
│                            │                                 │
└────────────────────────────┼─────────────────────────────────┘
                             │ HTTPS/WebSocket
                             │
┌────────────────────────────▼─────────────────────────────────┐
│                     Supabase Backend                         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Auth Layer  │  │   Realtime   │  │   Storage    │     │
│  │  (JWT)       │  │  (WebSocket) │  │  (S3-like)   │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
│                  ┌─────────▼─────────┐                      │
│                  │   Row Level       │                      │
│                  │   Security (RLS)  │                      │
│                  └─────────┬─────────┘                      │
│                            │                                 │
│                  ┌─────────▼─────────┐                      │
│                  │   PostgreSQL DB   │                      │
│                  │   (10 tables)     │                      │
│                  └───────────────────┘                      │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Database Schema Diagram

### Visual Schema Representation

```
┌────────────────────────────────────────────────────────────────────┐
│                         PROFILES (Users)                           │
├────────────────────────────────────────────────────────────────────┤
│ PK  id (UUID)                                                      │
│ UK  email                                                          │
│     first_name, last_name, role, student_id, section, avatar_url  │
└──┬───────────────────────────────────┬────────────────┬────────────┘
   │ Creates                           │ Grades         │ Notifies
   │                                   │                │
   ▼                                   ▼                ▼
┌────────────────────────┐  ┌───────────────────┐  ┌───────────────┐
│    ASSIGNMENTS         │  │   SUBMISSIONS     │  │ NOTIFICATIONS │
├────────────────────────┤  ├───────────────────┤  ├───────────────┤
│ PK id                  │  │ PK id             │  │ PK id         │
│ FK teacher_id →        │  │ FK phase_id →     │  │ FK user_id →  │
│    title, description  │  │ FK team_id →      │  │    type,      │
│    sections[]          │  │ FK submitted_by → │  │    title,     │
│    min/max_team_size   │  │ FK graded_by →    │  │    message    │
│    deadline            │  │    grade,         │  │    is_read    │
└──┬───────────┬─────────┘  │    feedback       │  └───────────────┘
   │           │             └───────────────────┘
   │           │
   │ Has Phases│ Has Teams
   │           │
   ▼           ▼
┌──────────────────────┐  ┌─────────────────────────┐
│ ASSIGNMENT_PHASES    │  │        TEAMS            │
│ (Weak Entity)        │  │                         │
├──────────────────────┤  ├─────────────────────────┤
│ PK id                │  │ PK id                   │
│ FK assignment_id →   │  │ FK assignment_id →      │
│ UK (assignment_id,   │  │ FK created_by →         │
│     phase_number)    │  │ UK (assignment_id,      │
│    phase_name        │  │     team_name)          │
│    deadline          │  │    team_name            │
└──────────────────────┘  └──┬──────────┬───────────┘
                             │          │
                    Has Members        Has Chat
                             │          │
                             ▼          ▼
┌────────────────────────┐  ┌──────────────────────┐
│    TEAM_MEMBERS        │  │   CHAT_MESSAGES      │
│  (Junction Table)      │  │                      │
├────────────────────────┤  ├──────────────────────┤
│ PK id                  │  │ PK id                │
│ FK team_id →           │  │ FK team_id →         │
│ FK student_id →        │  │ FK sender_id →       │
│ UK (team_id,           │  │    message           │
│     student_id)        │  │    created_at        │
│    status              │  └──────────────────────┘
│    joined_at           │
└────────────────────────┘
          │
          │ Related to
          │
          ▼
┌────────────────────────┐
│  TEAM_INVITATIONS      │
├────────────────────────┤
│ PK id                  │
│ FK team_id →           │
│ FK from_student_id →   │
│ FK to_student_id →     │
│ UK (team_id,           │
│     to_student_id)     │
│    status              │
│    responded_at        │
└────────────────────────┘

┌────────────────────────┐
│        FILES           │
├────────────────────────┤
│ PK id                  │
│ FK assignment_id →     │
│ FK phase_id →          │
│ FK team_id →           │
│ FK uploaded_by →       │
│    file_name, file_url │
│    file_type, file_size│
│    file_category       │
└────────────────────────┘
```

### Legend
- PK = Primary Key
- FK = Foreign Key
- UK = Unique Constraint
- → = References

---

## Application Architecture

### Component Hierarchy

```
App.jsx (Main Router)
│
├── Landing.jsx (Public)
│
├── Auth Pages (Public)
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── ForgotPassword.jsx
│   └── ResetPassword.jsx
│
└── Protected Routes
    ├── AdminDashboard.jsx
    │   ├── Home (Stats)
    │   ├── Users (Management)
    │   ├── Analytics (Charts)
    │   └── Settings (Config)
    │
    ├── TeacherDashboard.jsx
    │   ├── Home (Overview)
    │   ├── Assignments (CRUD)
    │   ├── Teams (Monitoring)
    │   └── Analytics (Class Stats)
    │
    └── StudentDashboard.jsx
        ├── Home (Overview)
        ├── Assignments (View)
        ├── My Teams (Management)
        └── Chat (Collaboration)
```

---

## Data Flow

### Authentication Flow

```
User Action → React Form → Supabase Auth
                              ↓
                          JWT Token
                              ↓
                     Zustand Store (Persist)
                              ↓
                    Protected Route Check
                              ↓
                    Role-Based Dashboard
```

### Data Query Flow

```
Component → supabase.from('table')
              ↓
         RLS Policy Check
              ↓
         PostgreSQL Query
              ↓
         Filter by User Role
              ↓
         Return Authorized Data
              ↓
         Render in UI
```

### Real-time Subscription Flow

```
Component Mount
    ↓
Subscribe to Table Changes
    ↓
PostgreSQL Triggers Notification
    ↓
WebSocket Push to Client
    ↓
State Update (React)
    ↓
Re-render Component
```

---

## Technology Stack Details

### Frontend Stack

```
┌─────────────────────────────────────────┐
│           React 18.3.1                  │
│         (Component Library)             │
└──────────────┬──────────────────────────┘
               │
        ┌──────┴──────┐
        │             │
┌───────▼───────┐  ┌──▼──────────┐
│  React Router │  │   Zustand   │
│    v7.9.4     │  │   (State)   │
│  (Routing)    │  │             │
└───────────────┘  └─────────────┘
        │
┌───────▼──────────────────────────────────┐
│          TailwindCSS 3.4.14              │
│           (Styling)                      │
└──────────────────────────────────────────┘
        │
┌───────▼──────────────────────────────────┐
│    Lucide React + React Hot Toast        │
│     (Icons & Notifications)              │
└──────────────────────────────────────────┘
```

### Backend Stack

```
┌─────────────────────────────────────────┐
│         Supabase Platform               │
└──┬───────┬──────────┬──────────┬───────┘
   │       │          │          │
   ▼       ▼          ▼          ▼
┌──────┐ ┌────┐  ┌─────────┐ ┌────────┐
│ Auth │ │ DB │  │Realtime │ │Storage │
└──────┘ └─┬──┘  └─────────┘ └────────┘
           │
           ▼
   ┌───────────────┐
   │  PostgreSQL   │
   │    14+        │
   └───────────────┘
```

### Build & Deploy Stack

```
┌────────────────────────────────────┐
│        Vite 5.4.0                  │
│   (Build Tool + Dev Server)        │
└────────────┬───────────────────────┘
             │
        ┌────┴────┐
        │         │
    ┌───▼───┐  ┌─▼──────┐
    │ SWC   │  │Rollup  │
    │(Fast) │  │(Bundle)│
    └───────┘  └────────┘
        │
        ▼
┌────────────────────┐
│   Vercel Deploy    │
│  (CDN + Hosting)   │
└────────────────────┘
```

---

## Security Architecture

### Multi-Layer Security

```
┌──────────────────────────────────────────────────────┐
│ Layer 1: Client-Side Validation                     │
│  - Form validation                                   │
│  - File type/size checks                             │
│  - Route protection                                  │
└──────────────────┬───────────────────────────────────┘
                   │
┌──────────────────▼───────────────────────────────────┐
│ Layer 2: Supabase Auth                              │
│  - JWT token verification                            │
│  - Email verification                                │
│  - Session management                                │
└──────────────────┬───────────────────────────────────┘
                   │
┌──────────────────▼───────────────────────────────────┐
│ Layer 3: Row Level Security (RLS)                   │
│  - User can only see their data                      │
│  - Role-based access control                         │
│  - 50+ granular policies                             │
└──────────────────┬───────────────────────────────────┘
                   │
┌──────────────────▼───────────────────────────────────┐
│ Layer 4: Database Constraints                       │
│  - CHECK constraints                                 │
│  - FOREIGN KEY constraints                           │
│  - UNIQUE constraints                                │
│  - NOT NULL constraints                              │
└──────────────────────────────────────────────────────┘
```

---

## Scalability Considerations

### Horizontal Scalability

```
┌─────────────────────────────────────┐
│      Load Balancer (Vercel)        │
└──────┬──────────────────┬───────────┘
       │                  │
   ┌───▼────┐        ┌────▼───┐
   │Region 1│        │Region 2│
   │ (CDN)  │        │ (CDN)  │
   └───┬────┘        └────┬───┘
       │                  │
       └────────┬─────────┘
                │
         ┌──────▼──────┐
         │  Supabase   │
         │  (Managed)  │
         │             │
         │ - Auto-scale│
         │ - Replication│
         │ - Backup    │
         └─────────────┘
```

### Performance Optimization

**Frontend:**
- Code splitting (React.lazy)
- Image optimization
- CDN caching
- Vite's optimized builds

**Backend:**
- Connection pooling (PostgreSQL)
- Query optimization with indexes
- Materialized views for analytics
- Realtime subscriptions (WebSocket)

**Database:**
- 25+ strategic indexes
- Query plan optimization
- Partial indexes for common filters
- Prepared statements

---

## Deployment Architecture

### Production Environment

```
┌─────────────────────────────────────────────────┐
│              Vercel (Frontend)                  │
├─────────────────────────────────────────────────┤
│ - Global CDN                                    │
│ - Auto-scaling                                  │
│ - HTTPS/SSL                                     │
│ - Environment variables                         │
└──────────────┬──────────────────────────────────┘
               │ HTTPS
               │
┌──────────────▼──────────────────────────────────┐
│          Supabase (Backend)                     │
├─────────────────────────────────────────────────┤
│ - PostgreSQL cluster                            │
│ - Auto backups (daily)                          │
│ - Point-in-time recovery                        │
│ - SSL connections                               │
│ - DDoS protection                               │
└─────────────────────────────────────────────────┘
```

### Development Environment

```
┌─────────────────────────────────────┐
│    Developer Machine                │
├─────────────────────────────────────┤
│ - Vite dev server (localhost:5173) │
│ - Hot Module Replacement (HMR)     │
│ - ESLint + Prettier                 │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│    Supabase Project (Cloud)         │
│  - Development database              │
│  - Test data                         │
│  - Separate from production          │
└─────────────────────────────────────┘
```

---

## API Endpoints (Supabase Auto-Generated)

### REST API

All CRUD operations automatically available:

```
GET    /rest/v1/profiles
POST   /rest/v1/profiles
PATCH  /rest/v1/profiles?id=eq.<uuid>
DELETE /rest/v1/profiles?id=eq.<uuid>

(Same pattern for all 10 tables)
```

### Realtime API

```
WebSocket: wss://[project-id].supabase.co/realtime/v1

Channels:
- realtime:public:chat_messages
- realtime:public:notifications
- realtime:public:team_members
```

### Authentication API

```
POST /auth/v1/signup
POST /auth/v1/token (login)
POST /auth/v1/logout
POST /auth/v1/recover (password reset)
GET  /auth/v1/user (get current user)
```

### Storage API

```
POST /storage/v1/object/[bucket]/[path]
GET  /storage/v1/object/public/[bucket]/[path]
DELETE /storage/v1/object/[bucket]/[path]
```

---

## Monitoring & Observability

### Supabase Dashboard Metrics

- **Database:**
  - Connection pool usage
  - Query performance
  - Table sizes
  - Index efficiency

- **Authentication:**
  - Active users
  - Sign-ups per day
  - Failed login attempts

- **Storage:**
  - Bucket sizes
  - Download bandwidth
  - Upload counts

- **API:**
  - Request counts
  - Response times
  - Error rates

---

## Summary

CollabSpace demonstrates a **production-ready architecture** with:

✅ **3-Tier Architecture:** Client → API → Database
✅ **Microservices-style:** Separate auth, realtime, storage services
✅ **Secure by Default:** Multi-layer security with RLS
✅ **Scalable:** CDN, connection pooling, auto-scaling
✅ **Observable:** Built-in monitoring and logging
✅ **Maintainable:** Clear separation of concerns
✅ **Modern Stack:** React + PostgreSQL + Edge deployment

This architecture supports the educational collaboration use case while demonstrating enterprise-grade database design principles.
