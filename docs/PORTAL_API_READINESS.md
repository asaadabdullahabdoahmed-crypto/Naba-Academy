# Teacher and Administrator Portal API Readiness

The Teacher and Administrator portals must not present placeholder content as live academic or administrative records. The following endpoints are the only relevant operational contracts currently implemented:

| Endpoint | Available data | Authorization |
|---|---|---|
| `GET /api/v1/auth/me` | The authenticated user's identity, account status, verification/login timestamps, and assigned roles. | Authenticated session |
| `GET /api/v1/auth/sessions` | The authenticated user's own active sessions. | Authenticated session |
| `DELETE /api/v1/auth/sessions/:id` and `POST /api/v1/auth/sessions/logout-others` | Revoke the authenticated user's own sessions. | Authenticated session and CSRF/origin checks |
| `GET /health` | API, database, Redis, and object-storage availability statuses. | Public health probe; response intentionally excludes sensitive diagnostics |

No instructor assignment, section roster, submissions, grading, attendance, exams, announcements, or faculty-profile API is implemented. Teacher academic operations therefore remain unavailable; the current student's academic-profile route is student-only and is not reused for teachers.

No system-wide user directory, student registry, user provisioning, role/permission administration, admissions, finance, academic catalog, or administrative audit-log API is implemented. `GET /auth/me` is a self-profile contract and must not be used to imply access to other accounts.

The academic catalog schema remains unapproved and has not been applied to Neon. Provisional TypeORM migration/entity code and session-protected catalog read endpoints are prepared for isolated development; endpoint access is guarded by `ACADEMIC_CATALOG_READS_ENABLED=false` by default. Do not enable the flag until the schema is approved and deployed in the target environment. No catalog data is seeded. The selectors are prepared but are not mounted into an administrative workflow, and no academic write endpoint is available.

The only operational/live academic API remains the student's legacy self-profile read. Terms, courses, offerings, enrollment, learning, assessments, grading, teacher assignments, and administrative academic operations remain unavailable. Local disposable PostgreSQL verification does not imply a live Neon integration.

For the domain and schema decision log, approval gates, and resumable implementation checkpoint, see `docs/academic/ACADEMIC_DOMAIN_MODEL.md`, `docs/academic/ACADEMIC_SCHEMA_REVIEW.md`, `docs/academic/ACADEMIC_MIGRATION_PLAN.md`, and `docs/academic/ACADEMIC_PHASE_CHECKPOINT.md`.
