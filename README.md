<<<<<<< HEAD
# Faculty Locator & Cabin Availability Management System
**Manipal University Jaipur — Software Engineering Project**

---

## 1. Abstract
The **Faculty Locator & Cabin Availability Management System** is a full-stack, enterprise-grade academic web application designed for students and faculty members of Manipal University Jaipur. The system solves the persistent problem of finding faculty members on campus by providing an interactive 40-room rectangular floor map, live cabin availability tracking, class schedule directories, and role-based access control. Built with Next.js, TypeScript, Tailwind CSS, Prisma ORM, and PostgreSQL, the platform enforces strict zero-dead-button functionality and synchronizes real-time cabin states between professors and students.

---

## 2. Problem Statement
In large academic campuses, faculty cabins are spread across numerous wings and corridors. Students frequently waste substantial time walking to faculty offices only to discover that the professor is in a lecture, attending a meeting, or away from campus. Traditional static notice boards, paper timetable charts, and static department websites fail to provide real-time occupancy information, leading to scheduling inefficiencies, missed consultations, and administrative friction.

---

## 3. Objectives
- Provide a centralized faculty directory searchable by name, designation, department, contact number, room, cabin, and table.
- Implement an interactive rectangular floor map representing all **40 rooms (301–340)**, **240 cabins (A–F)**, and **960 table positions (1–4)**.
- Empower professors to toggle their cabin availability status (**Available** / **Unavailable**) with immediate persistence in PostgreSQL.
- Broadcast live availability changes to students via background polling (every 10–12 seconds).
- Enforce strict role-based access control (RBAC) ensuring students cannot alter professor records.
- Reproduce the visual layout and design identity of the university's academic portal.

---

## 4. Scope
- **Target Audience:** University students, faculty members, and academic coordinators.
- **Physical Boundary:** Academic Block floors containing Rooms 301 through 340.
- **Data Scope:** 25+ deterministic demonstration faculty profiles, weekly class timetables (Monday–Saturday), cabin allocations, and live availability timestamps.

---

## 5. Existing System vs. Proposed System

| Dimension | Existing System | Proposed System |
| :--- | :--- | :--- |
| **Faculty Discovery** | Manual physical inspection or static PDF lists | Fast, multi-parameter search & department filters |
| **Availability Tracking** | Guesswork; knocked doors | Live Green / Red / Amber / Gray cabin status indicator |
| **Floor Plan Navigation** | Static corridor wall boards | Interactive 5×8 rectangular grid with room/cabin drilldowns |
| **Schedule Integration** | Fragmented timetable printouts | Direct weekly timetable view linked to each professor |
| **Data Persistence** | None (paper-based / static) | Persistent PostgreSQL database with Prisma ORM |

---

## 6. Functional Requirements
1. **User Authentication & Authorization:**
   - Registration with official college domain (`@jaipur.manipal.edu`).
   - Secure bcrypt password hashing and HTTP-only JWT sessions.
   - Distinct roles: `STUDENT` and `PROFESSOR`.
2. **Professor Availability Management:**
   - Prominent green ("I'm Available in My Cabin") and red ("I'm Unavailable") toggles.
   - Real-time write to PostgreSQL with timezone-aware timestamp and audit actor.
   - Automatic staleness detection for statuses older than 60 minutes.
3. **Interactive 40-Room Cabin Map:**
   - 5 rows × 8 columns grid representing Rooms 301 to 340.
   - Drilldown from Room → 6 Cabins (A–F) → 4 Tables (1–4).
   - Unique identifier format: `ROOM-CABIN-TABLE` (e.g., `301-A-1`).
   - Search-to-map integration ("Locate on Map" highlights room, cabin, and table).
4. **Faculty Search & Profiles:**
   - Search by name, department, designation, room, cabin, and email.
   - Weekly class schedule display (Monday through Saturday).
   - One-click copy for email and phone numbers.

---

## 7. Non-Functional Requirements
- **Performance:** Sub-100ms API response time; lightweight polling without full-page reloads.
- **Security:** HTTP-only cookies, JWT verification, role-based API protection, SQL injection prevention via Prisma.
- **Reliability:** PostgreSQL transactions prevent duplicate table assignments.
- **Zero Dead Buttons:** Every button, dropdown, search field, and link has an active, tested implementation.

---

## 8. Technology Stack
- **Frontend:** Next.js 14 (App Router), TypeScript, React, Tailwind CSS, Lucide React.
- **Backend:** Next.js Route Handlers, Server-Side Business Logic.
- **Database:** PostgreSQL 18 (Live instance on localhost:5432).
- **ORM:** Prisma ORM 5.22.
- **Authentication:** `jose` (JWT) & `bcryptjs` (Password Hashing).
- **Testing:** Vitest 2.1 & Headless / Real Browser Subagents.

---

## 9. System Architecture

```text
+--------------------------------------------------------------------------+
|                            CLIENT BROWSER                                |
|  - Student Dashboard   - Professor Dashboard   - 40-Room Floor Map       |
|  - Real-Time Polling   - Faculty Search        - Responsive Navigation   |
+------------------------------------+-------------------------------------+
                                     |  HTTP / REST (JSON)
                                     v
+--------------------------------------------------------------------------+
|                       NEXT.JS APPLICATION SERVER                         |
|  +-----------------------+  +----------------------+  +---------------+  |
|  | Auth & Session (JWT)  |  | Faculty Search API   |  | Map API       |  |
|  +-----------------------+  +----------------------+  +---------------+  |
|  | Role-Based RBAC Gate  |  | Availability Handler |  | Status Engine |  |
|  +-----------------------+  +----------------------+  +---------------+  |
+------------------------------------+-------------------------------------+
                                     |  Prisma Client
                                     v
+--------------------------------------------------------------------------+
|                       POSTGRESQL 18 DATABASE                             |
|  - users        - professors     - rooms (40)      - availability        |
|  - departments  - cabins (240)   - tables (960)    - class_schedules     |
+--------------------------------------------------------------------------+
```

---

## 10. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    User ||--o| Professor : "has profile"
    Department ||--o{ Professor : "employs"
    Professor ||--o| Availability : "has current"
    Professor ||--o| ProfessorAssignment : "assigned to"
    Professor ||--o{ ClassSchedule : "teaches"
    Room ||--|{ Cabin : "contains (6)"
    Cabin ||--|{ Table : "contains (4)"
    Table ||--o| ProfessorAssignment : "occupied by"

    User {
        int id PK
        string full_name
        string email UK
        string password_hash
        string role
        boolean email_verified
        datetime created_at
    }

    Department {
        int id PK
        string name UK
    }

    Professor {
        int id PK
        int user_id FK
        string faculty_id UK
        int department_id FK
        string designation
        string contact_number
        string office_hours
    }

    Room {
        int id PK
        int room_number UK
    }

    Cabin {
        int id PK
        int room_id FK
        string cabin_letter
    }

    Table {
        int id PK
        int cabin_id FK
        int table_number
    }

    ProfessorAssignment {
        int id PK
        int professor_id FK,UK
        int table_id FK,UK
        boolean is_active
        datetime assigned_at
    }

    Availability {
        int id PK
        int professor_id FK,UK
        boolean is_available
        datetime last_updated
        string updated_by
    }

    ClassSchedule {
        int id PK
        int professor_id FK
        string day_of_week
        string start_time
        string end_time
        string subject
        string section
        string classroom
    }
```

---

## 11. Use-Case Diagram

```mermaid
flowchart TD
    subgraph Actors
        S[Student]
        P[Professor]
    end

    subgraph System Functions
        UC1[Sign Up & Log In]
        UC2[Search Faculty by Name/Dept/Room]
        UC3[View Professor Profile & Timetable]
        UC4[Explore 40-Room Floor Map]
        UC5[Locate Professor Cabin on Map]
        UC6[Update Cabin Availability]
        UC7[View Personal Class Schedule]
    end

    S --> UC1
    S --> UC2
    S --> UC3
    S --> UC4
    S --> UC5

    P --> UC1
    P --> UC4
    P --> UC6
    P --> UC7
```

---

## 12. Installation & Setup Instructions (Windows)

### Prerequisites
- Node.js v18+ (tested on Node v24.16)
- PostgreSQL 18 running locally on port 5432
- Git (optional)

### Step 1: Clone or Navigate to the Workspace
```powershell
cd "c:\Users\luvya\Desktop\Final SE project"
```

### Step 2: Configure Environment Variables
Verify `.env` has the correct database connection:
```env
DATABASE_URL="postgresql://postgres:root@localhost:5432/faculty_locator?schema=public"
COLLEGE_EMAIL_DOMAIN="jaipur.manipal.edu"
JWT_SECRET="academic_faculty_locator_super_secure_jwt_secret_2026"
AVAILABILITY_STALE_MINUTES="60"
```

### Step 3: Install Dependencies
```powershell
npm install
```

### Step 4: Synchronize Database & Generate Prisma Client
```powershell
npx prisma generate
npx prisma db push
```

### Step 5: Seed Demonstration Data
Generates 40 rooms, 240 cabins, 960 tables, departments, 25 fictional faculty profiles, and class schedules:
```powershell
node prisma/seed.js
```

### Step 6: Start the Development Server
```powershell
npm run dev
```
Open **http://localhost:3000** in your browser.

---

## 13. Demonstration Accounts

| Role | Email Address | Password | Description |
| :--- | :--- | :--- | :--- |
| **Student** | `student.demo@jaipur.manipal.edu` | `Password@123` | Student account with search and map locator permissions |
| **Professor** | `ridhi.arora@jaipur.manipal.edu` | `Password@123` | Dr. Ridhi Arora (DOCSE, Room 301, Cabin A, Table 1) |
| **Professor 2** | `amit.sharma@jaipur.manipal.edu` | `Password@123` | Dr. Amit Sharma (HOD DOCSE, Room 301, Cabin A, Table 2) |

*Note: One-click demo login buttons are provided on both the Landing Page and the Login Page.*

---

## 14. Testing Procedures

Run the automated test suite with Vitest:
```powershell
npm test
```

### Automated Tests Overview:
1. **Map Integrity (`tests/map.test.ts`):** 40 rooms (301–340), 240 cabins (A–F), 960 tables (1–4), cabin rollups, staleness calculation.
2. **Authentication (`tests/auth.test.ts`):** College email validation, password hashing, JWT sessions, demo user verification.
3. **Availability (`tests/availability.test.ts`):** PostgreSQL write operations, availability toggle persistence, audit timestamps.
4. **Search & Constraints (`tests/search.test.ts`):** Partial search, department filtering, unique table assignment constraints, schedule structure.

---

## 15. Limitations & Future Enhancements
- **SMS / Email Alerts:** Push notifications via email when a professor marks themselves available could be added.
- **Live WebSocket Streaming:** While 10–12 second HTTP polling is lightweight and reliable, WebSockets or Server-Sent Events (SSE) can be introduced for zero-latency updates.
- **Biometric / RFID Check-In:** Hardware door sensor integration could automatically mark professors available when entering their cabins.
=======
# Faculty-Locator
muj faculty locator
>>>>>>> 003b27fdf03d2410841b9596a48f06f3b832b044
