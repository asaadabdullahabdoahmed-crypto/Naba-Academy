# NABA ACADEMY — STEP INDEX & ROADMAP MATRIX

| Step | Title | Status | Depends On | Primary Deliverable |
| :--- | :--- | :---: | :--- | :--- |
| **01** | Technical Audit | `COMPLETE` | Initial Codebase | Baseline architectural and technical evaluation |
| **02** | Routing Repair and V1 Scope Cleanup | `COMPLETE` | STEP 01 | Broken routes fixed, v1 non-goal routes removed |
| **03** | UI Feedback and Mobile Foundation | `COMPLETE` | STEP 02 | Toast and Confirmation Dialog systems; native alert elimination |
| **04** | Centralized Internationalization | `COMPLETE` | STEP 03 | Complete i18n migration across all portals, views & shared components |
| **05A** | Shared Frontend Type Foundation | `COMPLETE` | STEP 04 | Unified domain interfaces, API response envelopes, and models in `src/types/` |
| **05B** | Public/Auth/Student Type Migration | `COMPLETE` | STEP 05A | Type-safe state integration for Public, Auth, and Student views |
| **05C** | Instructor/Department/Admin/Alumni Type Migration | `COMPLETE` | STEP 05B | Type-safe state integration for Faculty, Department, Admin, and Alumni views |
| **05D** | API Contracts and Final Type Audit | `COMPLETE` | STEP 05C | Strongly-typed API transport contracts layer under `src/contracts/`, zero-`any` audit |
| **06A** | NestJS Backend Skeleton | `COMPLETE` | STEP 05D | Modular monolith backend scaffold, health module, global pipes, filters, CORS under `backend/` |
| **06B** | Backend Configuration, Security & Observability | `COMPLETE` | STEP 06A | Environment configuration validation, security headers, logging & trace foundation |
| **06C** | PostgreSQL Persistence Foundation | `COMPLETE` | STEP 06B | PostgreSQL schema provisioning, TypeORM Data Mapper foundation, initial migration scripts |
| **06D** | Redis / Worker / Object Storage Foundation | `COMPLETE` | STEP 06C | Redis client, BullMQ job queue module, standalone worker process, S3-compatible private object storage adapter |
| **06E** | Backend Foundation Final Gate | `COMPLETE` | STEP 06D | End-to-end backend foundation verification, health anti-leakage audit, security and build gates |
| **06** | Backend Foundation | `COMPLETE` | STEP 05D | Modular monolith backend scaffold, database foundation, storage, worker foundation |
| **07A** | Identity Persistence Foundation | `COMPLETE` | STEP 06 | User, Role, Permission entities, RolePermission, UserRole, IdentityModule, initial migration |
| **07B** | Registration & Verification Services | `COMPLETE` | STEP 07A | Argon2 password hashing, secure token service, email sender, registration & verification logic |
| **07C** | Login, Session & Cookie Transport | `COMPLETE` | STEP 07B | Session management, HTTP-only cookie transport, CSRF protection, login & logout endpoints (07C-1: COMPLETE, 07C-2: COMPLETE, 07C-3: COMPLETE) |
| **07D** | Password Reset Workflows | `COMPLETE` | STEP 07C | Forgot password token generation, secure reset flows, session revocation, and email notifications |
| **07E** | Identity E2E & Security Hardening | `COMPLETE` | STEP 07D | Comprehensive backend E2E auth security suite, brute-force throttling, security regression gates |
| **07F** | Frontend Auth Integration | `NOT STARTED` | STEP 07E | Wire frontend views to real backend endpoints after backend authentication passes all security gates |
| **08** | Academic Structure Backend | `PLANNED` | STEP 07 | College, department, major, and curriculum data models and endpoints |
| **09** | Admissions | `PLANNED` | STEP 08 | Application submission, document intake, admission approval workflows |
| **10** | Student Records | `PLANNED` | STEP 09 | Term records, transcripts, academic standings, and student profile API |
| **11** | Registration | `PLANNED` | STEP 10 | Section scheduling, prerequisite engine, add/drop registration transactions |
| **12** | Learning | `PLANNED` | STEP 11 | Syllabi, course modules, lesson content streaming, student progress tracking |
| **13** | Attendance | `PLANNED` | STEP 12 | Live and recorded session attendance logging, automated warning system |
| **14** | Assessments | `PLANNED` | STEP 13 | Quiz & exam question banks, rubric scoring, timed examination engine |
| **15** | Exam Monitoring | `PLANNED` | STEP 14 | Secure test environment, attempt verification, focus anomaly tracking |
| **16** | Assignments | `PLANNED` | STEP 12 | Assignment submissions, file attachments, instructor grading workflows |
| **17** | Gradebook | `PLANNED` | STEP 14, 16 | Gradebook calculation, term weightings, official grade approval workflows |
| **18** | Appeals & Violations | `PLANNED` | STEP 17 | Academic grade appeals, disciplinary tracking, committee decisions |
| **19** | Finance | `PLANNED` | STEP 11 | Tuition calculations, payment ledger, invoice receipts, fee management |
| **20** | Graduation Project & Field Training | `PLANNED` | STEP 10 | Capstone project milestones, internship training site evaluations |
| **21** | Graduation | `PLANNED` | STEP 20 | Degree audit engine, graduation clearance checklist, certificate conferral |
| **22** | Documents | `PLANNED` | STEP 10, 21 | Official digital enrollment letters, verifiable transcript PDFs with QR verification |
| **23** | Communication | `PLANNED` | STEP 07 | Academic announcements, direct messaging, course discussion boards |
| **24** | Library | `PLANNED` | STEP 08 | Digital academic catalog, book reservations, reference search indexing |
| **25** | Notifications & Calendar | `PLANNED` | STEP 23 | In-app alerts, deadline notifications, centralized academic calendar |
| **26** | Support, Complaints & Surveys | `PLANNED` | STEP 07 | Helpdesk ticketing, administrative escalations, course feedback surveys |
| **27** | Alumni | `PLANNED` | STEP 21 | Graduate directory, career tracker, alumni network, employment surveys |
| **28** | Reporting | `PLANNED` | STEP 10, 19 | Executive management dashboards, enrollment stats, academic KPI analytics |
| **29** | Operations & Security | `PLANNED` | STEP 07, 28 | System health monitoring, audit trail integrity, backup and security policies |
| **30** | Performance, Accessibility, Responsive QA, i18n Regression | `PLANNED` | STEP 29 | Comprehensive cross-device QA, WCAG AA testing, load tests, i18n checks |
| **31** | UAT & Production Readiness | `PLANNED` | STEP 30 | User acceptance testing, staging verification, final production sign-off |
