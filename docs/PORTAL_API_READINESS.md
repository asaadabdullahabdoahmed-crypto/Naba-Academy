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

The academic catalog proposal in `docs/proposals/academic-structure-v1-api.md` is explicitly unapproved and unimplemented. Any catalog-backed Teacher/Admin workflows remain blocked pending schema and API approval. No schema migration, account creation, or production/Neon data access is required for these portal improvements.
