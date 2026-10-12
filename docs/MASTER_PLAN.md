# NABA ACADEMY — MASTER IMPLEMENTATION PLAN
**أكاديمية نبأ للتعلم الإلكتروني**

---

## 1. Project Overview & Architecture

### System Identity
- **Name:** Naba Academy (أكاديمية نبأ للتعلم الإلكتروني)
- **Domain:** Higher Education / Integrated E-Learning & Student Information System (SIS/LMS)

### System Architecture
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS (Single Page Application with global centralized i18n & RTL/LTR support)
- **Future Backend:** Modular Monolith architecture
- **API Protocol:** REST API (JSON payloads, standardized status envelopes)
- **Primary Database:** PostgreSQL (relational integrity, transactional consistency)
- **Caching & Ephemeral Storage:** Redis (sessions, caching, rate limiting)
- **Asynchronous Execution:** Background Worker (job queues, report exports, notifications)
- **Media & File Storage:** Private S3-compatible Object Storage (secure pre-signed URLs)

### Core Authorization & Access Model
- **Security Paradigm:** Role + Permission + Scope + Resource Ownership
- **Primary v1 Roles:**
  - `system_admin`: System-wide administration, security auditing, configuration.
  - `department_head`: Departmental academic governance, faculty supervision, curriculum reviews.
  - `instructor`: Course management, lecturing, gradebook entries, attendance, student assessments.
  - `student`: Active learner, course enrollment, submissions, transcripts, academic requests.
- **Identity Lifecycle Continuity:** `alumni` is the **same** user account retained after graduation status change; it is not a duplicated authentication identity.

### Explicit Non-Goals for Version 1
- **No AI / Gemini features** in v1.
- **No Two-Factor Authentication (2FA)** in v1.
- **No Single Sign-On (SSO)** in v1.
- **No National SSO (e.g. Nafath)** in v1.

---

## 2. Core Product Domains

1. **Identity & Access:** Account lifecycle, credentials, RBAC + scoping, profile management.
2. **Academic Structure:** Colleges, departments, majors, study plans, degree requirements.
3. **Admissions:** Application intake, document verification, acceptance workflows, student ID issuance.
4. **Student Records:** Academic standings, term GPA/CGPA histories, transcripts, status changes.
5. **Registration:** Course catalogs, section scheduling, prerequisite enforcement, add/drop windows.
6. **Courses & Learning:** Course delivery, syllabi, modules, interactive lessons, digital materials.
7. **Attendance:** Live and asynchronous lecture tracking, absence quotas, automatic warnings.
8. **Assessments:** Quizzes, midterms, finals, secure exam environments, question banks.
9. **Assignments:** Homework submission, rubric-based grading, deadline cutoffs.
10. **Grades & Gradebook:** Continuous assessment records, final grade approval workflows, grade distribution.
11. **Appeals & Violations:** Academic grade appeals, disciplinary tracking, academic integrity cases.
12. **Finance:** Tuition fees, payment schedules, receipts, scholarship waivers, append-only ledger.
13. **Graduation Project:** Proposal submission, supervisor assignment, milestone evaluation.
14. **Field Training:** Internship placement, supervisor evaluations, attendance hours verification.
15. **Graduation:** Audit clearance, certificate generation, degree conferral.
16. **Documents:** Official transcript requests, enrollment letters, digital verification stamps.
17. **Communication:** Announcements, direct messaging, discussion boards, office hours.
18. **Library:** Digital repository, academic references, catalog search, book reservations.
19. **Notifications:** System alerts, academic deadline reminders, push/in-app notifications.
20. **Support & Complaints:** Helpdesk ticketing, technical issues, administrative escalations.
21. **Surveys:** Course evaluations, instructor feedback, institutional quality surveys.
22. **Policies & Consent:** Student handbook acceptance, privacy terms, academic honesty charters.
23. **Alumni:** Graduate profiles, career updates, employment surveys, alumni networking.
24. **Reporting:** Institutional KPIs, enrollment statistics, academic performance reports.
25. **Audit:** Immutable append-only audit trail for all academic, administrative, and access actions.
26. **Security:** Session tracking, failed login tracking, rate limiting, IP security logs.
27. **Operations:** System health checks, scheduled maintenance modes, background jobs monitoring.

---

## 3. Implementation History & Completed Steps

### STEP 01 — Technical Audit
- **Status:** `COMPLETE`
- **Results:**
  - Audited existing Google AI Studio React/Vite frontend codebase.
  - Confirmed SPA structure, verified current mock-data state across views.
  - Identified requirement for centralized internationalization, unified type definitions, and backend decoupling.

### STEP 02 — Routing Repair and V1 Scope Cleanup
- **Status:** `COMPLETE`
- **Results:**
  - Public library routed to `PublicLibraryPage`.
  - Email verification routed to `VerifyOtpPage`.
  - Application tracking routed to `ApplicationStatusPage`.
  - Unscoped v1 routes removed (active 2FA routes, SSO routes, unneeded PDF export stubs).
  - Connected key views: `StudentLessonPage`, `StudentQuizPage`, `StudentExamPrecheckPage`, `StudentExamAttemptPage`, `StudentTranscriptPage`.
  - Connected instructor views: `InstructorCourseStudentsPage`, `InstructorCourseLecturesPage`, `InstructorCourseAssignmentsPage`.

### STEP 03 — UI Feedback and Mobile Foundation
- **Status:** `COMPLETE`
- **Results:**
  - Complete elimination of native browser dialogs: `alert()`, `window.alert`, `window.confirm`, `window.prompt`.
  - Implemented centralized `ToastViewport` and programmatic `useToast()` feedback engine.
  - Implemented centralized accessible `ConfirmationDialog` for destructive/critical actions.
  - Responsive tables, touch targets, and mobile navigation foundation verified.

### STEP 04 — Centralized Internationalization (i18n)
- **Status:** `COMPLETE AND CLOSED`
- **Scope & Delivery:**
  - `STEP 04C-1`: Centralized i18n infrastructure (`I18nProvider`, `useTranslation`, dictionary loader).
  - `STEP 04C-2`: Public & Auth portals migration.
  - `STEP 04C-3`: Student Portal migration (23 views).
  - `STEP 04C-4`: Instructor Portal migration (18 views).
  - `STEP 04C-5`: Department Head Portal migration (15 views).
  - `STEP 04C-6`: Admin Portal migration (19 views).
  - `STEP 04C-7`: Alumni Portal migration (11 views).
  - `STEP 04C-8`: Global i18n Audit & Shared Components migration.
  - `STEP 04C-9`: Full Source Audit, Final Build & Export Verification.
- **Verified Metrics:**
  - Relevant frontend source files audited: 153
  - Direct static UI translation ternaries remaining: 0
  - Hardcoded localizable UI violations: 0
  - Legitimate domain-data localization: 155 (preserved `titleAr`/`titleEn` records)
  - Legitimate RTL/LTR directionality: 24 (icon mapping)
  - Legitimate formatting locale selection: 7 (`Intl` formatters)
  - Legitimate route language mechanics: 3 (locale toggle URLs)
  - Portal regressions: Public/Auth (PASS), Student (PASS), Instructor (PASS), Department (PASS), Admin (PASS), Alumni (PASS)
  - Dictionary AR/EN key parity: PASS (0 missing English keys, 0 missing Arabic keys, 0 structural mismatches)
  - Verification: `tsc --noEmit` (PASS), `npm run lint` (PASS), `npm run build` (PASS), `compile_applet` (PASS)

---

## 4. Implementation Roadmap (Future Steps)

### STEP 05 — Frontend Type System and API Contract Preparation
- **STEP 05A — Shared Frontend Type Foundation (NEXT):** Core domain interfaces, shared schemas, pagination/filter/envelope types in `src/types/`.
- **STEP 05B — Public/Auth/Student Type Migration:** Decouple hardcoded mock structures in public, authentication, and student flows.
- **STEP 05C — Instructor/Department/Admin/Alumni Type Migration:** Type migration for faculty, academic governance, administration, and alumni portals.
- **STEP 05D — API Contracts and Final Type Audit:** Unified REST API contracts, client fetcher layer interfaces, zero-any verification.

### STEP 06 — Backend Foundation
- Architecture setup, Express/Fastify modular monolith scaffold, PostgreSQL migrations, Docker configuration, configuration management.

### STEP 07 — Identity & Access Backend
- User authentication, JWT with secure HTTP-only cookies, password hashing, RBAC middleware, session revocation.

### STEP 08 — Academic Structure Backend
- Colleges, departments, majors, degree pathways, academic calendar endpoints and data models.

### STEP 09 — Admissions Backend & Flow
- Public application intake, document uploads, application status review, administrative decisions, matriculation.

### STEP 10 — Student Records Backend
- Cumulative GPAs, term records, academic standings, official transcripts calculation and digital records.

### STEP 11 — Registration Engine
- Schedule builder, section capacity locking, prerequisite graph evaluation, add/drop validation.

### STEP 12 — Courses & Learning Delivery
- Course syllabus, module hierarchies, lesson content delivery, multimedia resource streaming.

### STEP 13 — Attendance Tracking
- Session attendance logging, automated absence calculation, student warning triggers.

### STEP 14 — Assessments System
- Quiz and exam builders, question bank management, grading rubrics, timed attempt state machines.

### STEP 15 — Exam Monitoring
- Exam integrity validation, browser focus logging, attempt anomaly detection.

### STEP 16 — Assignments Engine
- Assignment briefs, student file submissions, deadline handling, instructor grading workflows.

### STEP 17 — Gradebook & Approval
- Continuous assessment aggregation, final grade curve/adjustment, dean/department approval workflows.

### STEP 18 — Appeals & Violations
- Academic grade appeals, formal dispute workflows, disciplinary committee records.

### STEP 19 — Finance & Ledger
- Fee schedule generation, append-only double-entry ledger, receipt generation, payment status tracking.

### STEP 20 — Graduation Project & Field Training
- Capstone proposal workflow, internship site approvals, supervisor milestone sign-offs.

### STEP 21 — Graduation Clearance
- Automated degree audit, graduation clearance checklists, conferral status, digital diploma issuance.

### STEP 22 — Official Documents
- Verifiable digital transcripts, student enrollment certificates with cryptographically verifiable QR codes.

### STEP 23 — Communication & Messaging
- Institutional broadcasts, department announcements, instructor-student direct messaging.

### STEP 24 — Digital Library Backend
- Academic catalog, research papers, digital material reservations, search indexing.

### STEP 25 — Notifications & Calendar
- Unified notification engine, deadline dispatchers, calendar feed generation (iCal/JSON).

### STEP 26 — Support, Complaints & Surveys
- Student helpdesk ticket dispatch, anonymous course evaluation surveys, institutional feedback analytics.

### STEP 27 — Alumni Portal & Network
- Graduate directory, employment status tracking, alumni event registration.

### STEP 28 — Institutional Reporting
- Management dashboards, accreditation metric generators, enrollment funnels, academic KPI reports.

### STEP 29 — Operations & Security Hardening
- Health-check endpoints, rate-limit policies, audit log integrity, automated database backup strategies.

### STEP 30 — Performance, Accessibility, Responsive QA & i18n Regression
- Full Lighthouse audit, WCAG AA compliance verification, high-density screen testing, bilingual regression audit.

### STEP 31 — UAT & Production Readiness
- End-to-end user acceptance testing, mock data teardown, staging deployment, launch readiness sign-off.
