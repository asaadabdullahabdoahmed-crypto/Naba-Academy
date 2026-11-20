# Teacher and Administrator Portal API Readiness

The Teacher and Administrator portals must not present placeholder content as live academic or administrative records. The following identity and health contracts are operational independently of the restricted academic catalog:

| Endpoint | Available data | Authorization |
|---|---|---|
| `GET /api/v1/auth/me` | The authenticated user's identity, account status, verification/login timestamps, and assigned roles. | Authenticated session |
| `GET /api/v1/auth/sessions` | The authenticated user's own active sessions. | Authenticated session |
| `DELETE /api/v1/auth/sessions/:id` and `POST /api/v1/auth/sessions/logout-others` | Revoke the authenticated user's own sessions. | Authenticated session and CSRF/origin checks |
| `GET /health` | API, database, Redis, and object-storage availability statuses. | Public health probe; response intentionally excludes sensitive diagnostics |

MVP Batch 2 adds provisional read-only course, term, and offering reference APIs for administrators, department heads, and instructors. Batch 3 adds development-only section, teacher-assignment, roster, and enrollment APIs plus role-specific screens. The latter are separately blocked by `ACADEMIC_OPERATIONS_ENABLED=false` by default; they are not live merely because routes or screens exist. Submissions, grading, attendance, exams, announcements, and faculty-profile APIs remain unimplemented.

No operational/live system-wide user directory, student registry, user provisioning, role/permission administration, admissions, finance, or administrative audit-log API is available. Provisional academic catalog GET routes exist in code but are disabled pending schema approval and deployment. They cover universities, colleges, departments, programs, credential levels, the authenticated student's current placement and recorded placement history, and the Batch 2 reference reads below. `GET /auth/me` is a self-profile contract and must not be used to imply access to other accounts.

The academic catalog schema remains unapproved and has not been applied to Neon. Provisional TypeORM migrations/entities and session-protected catalog read endpoints are prepared for isolated development; endpoint access is guarded by `ACADEMIC_CATALOG_READS_ENABLED=false` by default. Do not enable the flag until the schema is approved and deployed in the target environment. No catalog data is seeded. The Admin Academic Structure page is a read-only viewer, and the Student Profile can display a normalized current placement; both require their catalog flag and backend API to be enabled. Batch 3 operations tables and write endpoints were exercised only in isolated development; no academic writes are available by default or in production.

## MVP Batch 2 reference contracts — implemented, disabled

| Endpoint | Available data | Authorization |
|---|---|---|
| `GET /api/v1/academic/courses` | Active courses with visible active department/college/university ancestry; bounded search, pagination, optional `departmentId` filter | Session plus `system_admin`, `department_head`, or `instructor` |
| `GET /api/v1/academic/courses/:courseId` | Visible active course and reference hierarchy names | Same |
| `GET /api/v1/academic/courses/:courseId/offerings` | Non-deleted offering references with stored term dates/status; search, pagination, optional `termId` filter | Same; no assignment/roster/private-record access |
| `GET /api/v1/academic/terms` | Non-deleted term names, stored status, start/end dates; search and pagination | Same |
| `GET /api/v1/academic/terms/:termId` | Non-deleted term reference details | Same |

All five reads fail closed before querying academic repositories unless the existing `ACADEMIC_CATALOG_READS_ENABLED` gate is explicitly enabled in an approved target. All return `Cache-Control: no-store`. Unknown query fields, owner IDs, malformed UUIDs and unbounded pagination are rejected. Students are not granted these new routes; their existing self-read and hierarchy contracts are unchanged.

These are shared catalog reference reads. Role access here grants no teaching ownership, enrollment, private student data, or administrative write permission. Current/completed/cancelled term and offering statuses are displayed as recorded; no current-term or registration-window policy is inferred. There is no new schema, migration, data seed, permission grant or feature flag.

Admin `/admin/courses`, `/admin/courses/:courseId`, `/admin/terms` and Teacher `/instructor/courses`, `/instructor/courses/:courseId`, `/instructor/terms` use these real APIs. The Teacher navigation now says **Course Catalog**, not **My Assigned Courses**. Both portals remain unavailable by default under `VITE_ACADEMIC_CATALOG_READS_ENABLED=false`. Existing Admin Academic Structure and student functionality are preserved. See `academic/MVP_BATCH_2_REPORT.md` for verification limits and the source manifest.

## MVP Batch 3 operations — implemented, default-disabled

| Capability | API group | Audience and boundary |
|---|---|---|
| Section search/list/detail/create/update/open/close | `/api/v1/academic/sections` | `system_admin` or `department_head` route roles; exact department-scoped permission required in the service. |
| Teacher assignment and roster | `/api/v1/academic/sections/:sectionId/teachers` and `/students` | Department administrator manages; instructor reads only an actively assigned section and its active roster. |
| Admin enrollment/cancellation | `/api/v1/academic/sections/:sectionId/enrollments`, `/api/v1/academic/enrollments/:enrollmentId` | Department-scoped enrollment permission. |
| Teacher's assigned sections | `/api/v1/academic/sections/my` | Authenticated instructor with active section assignment. |
| Student availability and self-service enrollment | `/api/v1/academic/sections/available`, `/api/v1/students/me/academic-enrollments` | Authenticated student; identity is session-derived and ownership, role and active placement are verified. |

All operations API methods are blocked unless `ACADEMIC_OPERATIONS_ENABLED=true`; it defaults to false. The feature gate is independent of the catalog flag. The additive operations migration and synthetic PostgreSQL integration test ran only on a disposable loopback database. No live Neon integration, production permission seeding, feature activation, or rollout is implied. See `docs/academic/MVP_BATCH_3_REPORT.md` for exact routes, safeguards, tests, and limitations.

The only currently operational/live academic API remains the student's legacy self-profile read. The new catalog and current-placement APIs are not live integrations; Batch 3 operations are implemented but disabled by default and have not been deployed. Learning, assessments, grading, and related workflows remain unavailable. Local disposable PostgreSQL verification does not imply a live Neon integration.

For the domain and schema decision log, approval gates, and resumable implementation checkpoint, see `docs/academic/ACADEMIC_DOMAIN_MODEL.md`, `docs/academic/ACADEMIC_SCHEMA_REVIEW.md`, `docs/academic/ACADEMIC_MIGRATION_PLAN.md`, and `docs/academic/ACADEMIC_PHASE_CHECKPOINT.md`.
