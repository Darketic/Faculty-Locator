# Graph Report - Final SE project  (2026-10-27)

## Corpus Check
- 40 files · ~21,728 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: .example 1, (none) 1, .prisma 1)

## Summary
- 216 nodes · 409 edges · 14 communities (8 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `68d23be6`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- scripts
- package.json
- next
- Faculty Locator & Cabin Availability Management System
- Toast.tsx
- Functionality Audit Report: Faculty Locator & Cabin Availability Management System
- auth.ts
- layout.tsx
- next.config.js
- compilerOptions

## God Nodes (most connected - your core abstractions)
1. `next` - 24 edges
2. `prisma` - 16 edges
3. `Faculty Locator & Cabin Availability Management System` - 16 edges
4. `DemoBanner()` - 15 edges
5. `compilerOptions` - 15 edges
6. `computeProfessorStatus()` - 14 edges
7. `lucide-react` - 13 edges
8. `react` - 13 edges
9. `getCurrentUser()` - 12 edges
10. `scripts` - 10 edges

## Surprising Connections (you probably didn't know these)
- `GET()` --calls--> `getCurrentUser()`  [EXTRACTED]
  src/app/api/auth/me/route.ts → src/lib/auth.ts
- `GET()` --calls--> `computeProfessorStatus()`  [EXTRACTED]
  src/app/api/faculty/[id]/route.ts → src/lib/status.ts
- `GET()` --calls--> `computeProfessorStatus()`  [EXTRACTED]
  src/app/api/faculty/availability/route.ts → src/lib/status.ts
- `POST()` --calls--> `getCurrentUser()`  [EXTRACTED]
  src/app/api/faculty/availability/route.ts → src/lib/auth.ts
- `GET()` --calls--> `computeProfessorStatus()`  [EXTRACTED]
  src/app/api/faculty/route.ts → src/lib/status.ts

## Import Cycles
- None detected.

## Communities (14 total, 6 thin omitted)

### Community 0 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, build, dev, lint, prisma:generate, prisma:migrate, prisma:push, prisma:seed (+2 more)

### Community 1 - "package.json"
Cohesion: 0.06
Nodes (42): dependencies, bcryptjs@^2.4.3, clsx@^2.1.1, jose@^5.9.6, lucide-react@^0.460.0, next@^14.2.20, @prisma/client@^5.22.0, react@^18.3.1 (+34 more)

### Community 2 - "next"
Cohesion: 0.17
Nodes (15): vitest, GET(), POST(), GET(), GET(), GET(), GET(), globalForPrisma (+7 more)

### Community 3 - "Faculty Locator & Cabin Availability Management System"
Cohesion: 0.08
Nodes (25): 10. Entity-Relationship (ER) Diagram, 11. Use-Case Diagram, 12. Installation & Setup Instructions (Windows), 13. Demonstration Accounts, 14. Testing Procedures, 15. Limitations & Future Enhancements, 1. Abstract, 2. Problem Statement (+17 more)

### Community 6 - "Toast.tsx"
Cohesion: 0.16
Nodes (29): lucide-react, next, react, FacultyProfileContent(), FacultyProfilePage(), LoginPage(), InteractiveMapPage(), MapContent() (+21 more)

### Community 7 - "Functionality Audit Report: Faculty Locator & Cabin Availability Management System"
Cohesion: 0.18
Nodes (10): 1. Executive Summary, 2. Authentication & Authorization Controls, 3. Student Dashboard & Faculty Directory Controls, 4. Professor Dashboard & Availability Controls, 5. Interactive Floor Map Controls, 6. Faculty Profile Controls, 7. Global Navigation & Sidebar Controls, 8. Automated Test Suite Execution Summary (+2 more)

### Community 9 - "auth.ts"
Cohesion: 0.17
Nodes (17): POST(), GET(), POST(), DELETE(), PUT(), DAYS, GET(), POST() (+9 more)

### Community 20 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+9 more)

## Knowledge Gaps
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `Toast.tsx` to `package.json`, `next`, `logout/route.ts`, `auth.ts`, `layout.tsx`?**
  _High betweenness centrality (0.221) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.06060606060606061 - nodes in this community are weakly interconnected._
- **Why does `scripts` connect `scripts` to `package.json`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Should `Faculty Locator & Cabin Availability Management System` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `Toast.tsx` to `package.json`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._