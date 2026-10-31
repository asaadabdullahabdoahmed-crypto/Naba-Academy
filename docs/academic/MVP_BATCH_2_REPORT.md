# MVP Batch 2 — Admin and Teacher Functional Foundation

Date: 2026-10-31 (Asia/Aden)
Repository: `asaadabdullahabdoahmed-crypto/Naba-Academy`
Branch: `backup/naba-mvp-20261030`
Implementation baseline: `55671136c894786dd000c29068ffb85560e77016`
Delivery: reviewed local development checkpoint; no push, merge or deployment. The commit containing this report is the authorized checkpoint, with implementation baseline `5567113` as its parent.

## 1. Completed Admin features

- Real backend-backed course catalog with bounded pagination, code/name search and department filtering from returned reference data.
- Course detail with university (when linked), college and department hierarchy; no invented credits, prerequisites or institutional values.
- Course offering references with term names, stored dates/status, bounded pagination and search by offering/term code or name.
- Academic term browser with search, paging, recorded dates and status. No inferred current-term, calendar-window or registration decisions.
- Existing academic structure viewer, health, account/session features and student functionality preserved.
- Admin course, detail and term routes mounted inside the existing role-protected portal layout.

## 2. Completed Teacher features

- Teacher course catalog, course reference details, offering reference browsing/search/paging and academic term browsing using the same real backend reads.
- Teacher navigation and manifest use **Course Catalog**, not **My Assigned Courses**. A course offering is not represented as an enrolled section or verified teacher assignment.
- Arabic/English labels and names, loading/empty/error/retry, forbidden, expired-session, missing-record and disabled states.
- Requests cancel on navigation/filter changes; obsolete results cannot overwrite the active page. Auth changes clear rendered reference data. No academic requests occur with the frontend gate disabled.
- Roster, content, assignments, attendance, grading and examinations continue to use unavailable workflow routes; no student data exposure or fabricated instructor ownership.

## API and authorization boundary

| GET endpoint (under `/api/v1`) | Contract |
|---|---|
| `/academic/courses` | Page of visible active courses; `page`, `pageSize`, `search`, optional `departmentId` |
| `/academic/courses/:courseId` | One visible active course with reference hierarchy names |
| `/academic/courses/:courseId/offerings` | Page of non-deleted offering references and non-deleted terms; `page`, `pageSize`, `search`, optional `termId` |
| `/academic/terms` | Page of non-deleted terms, including recorded planned/active/completed/cancelled status |
| `/academic/terms/:termId` | One non-deleted term reference |

All new reads require `SessionAuthGuard` and `RolesGuard` with `system_admin`, `department_head` or `instructor`. Session validation remains delegated to the existing identity service. The role lookup binds the server-derived user, excludes revoked assignments and constrains assignment time to the present. A client-provided role or owner header grants nothing. Students retain their existing endpoints and are denied these new routes.

These are non-private shared reference reads. The existing exact-scope + permission + ownership policy remains required for future management and private teacher operations. No permissions are seeded, scope inheritance is invented, course-offering assignment restriction removed, or global-administrator bypass added.

All endpoints return `Cache-Control: no-store`, use explicit response projections and existing API envelopes, bind query values, and exclude hidden/inactive course ancestry. Search treats `%`, `_` and backslash as literal characters. DTOs reject unknown fields, malformed UUIDs and out-of-range page sizes. An invisible course returns 404 before offering lookup; offering queries also recheck ancestry. No mutation routes were added.

Existing `ACADEMIC_CATALOG_READS_ENABLED=false` and `VITE_ACADEMIC_CATALOG_READS_ENABLED=false` remain unchanged. All five reads fail closed before academic repository access when the backend gate is off. No new flags, schema, migrations, reference data or dependency changes.

## 3. Complete source manifest

27 added/modified files

| File | Change |
|---|---|
| `backend/src/modules/academic/academic.module.ts` | Modified |
| `backend/src/modules/academic/application/teaching-catalog.service.spec.ts` | Added |
| `backend/src/modules/academic/application/teaching-catalog.service.ts` | Added |
| `backend/src/modules/academic/presentation/controllers/teaching-catalog.controller.e2e.spec.ts` | Added |
| `backend/src/modules/academic/presentation/controllers/teaching-catalog.controller.ts` | Added |
| `backend/src/modules/academic/presentation/dto/teaching-catalog-query.dto.ts` | Added |
| `docs/PORTAL_API_READINESS.md` | Modified |
| `docs/academic/ACADEMIC_PHASE_CHECKPOINT.md` | Modified |
| `docs/academic/MVP_BATCH_2_REPORT.md` | Added |
| `src/App.tsx` | Modified |
| `src/components/academic/AcademicCourseReference.tsx` | Added |
| `src/components/academic/AcademicReferenceBrowser.test.tsx` | Added |
| `src/components/academic/AcademicReferenceBrowser.tsx` | Added |
| `src/config/portalNavigation.ts` | Modified |
| `src/contracts/teachingCatalog.ts` | Added |
| `src/data/routeManifest.test.ts` | Modified |
| `src/data/routeManifest.ts` | Modified |
| `src/hooks/useAcademicReference.ts` | Added |
| `src/i18n/dictionaries/ar.ts` | Modified |
| `src/i18n/dictionaries/en.ts` | Modified |
| `src/services/teachingCatalogClient.test.ts` | Added |
| `src/services/teachingCatalogClient.ts` | Added |
| `src/views/admin/AdminCoursesPage.tsx` | Modified |
| `src/views/admin/AdminDashboardPage.tsx` | Modified |
| `src/views/instructor/InstructorCourseDetailPage.tsx` | Modified |
| `src/views/instructor/InstructorCoursesPage.tsx` | Modified |
| `src/views/instructor/InstructorDashboardPage.tsx` | Modified |

## 4. Tests and verification

| Check | Result |
|---|---|
| Frontend `npm test` | PASS — 7 files, 35 tests |
| Portal role access `node --import tsx --test src/security/portal-access.test.ts` | PASS — 3 tests |
| Focused backend Jest command below | PASS — 7 suites, 46 tests |
| Frontend `npm run lint` | PASS |
| Backend `npm run lint` | PASS |
| Frontend `npm run build` | PASS — existing large-chunk advisory remains (about 1.65 MB JavaScript before gzip) |
| Backend `npm run build` | PASS |
| Offline TypeORM metadata + PostgreSQL course query generation | PASS — 18 entity mappings; no connection initialized |
| `git diff --check` | PASS |

Backend command (from `backend`):

```bash
npm test -- --runInBand modules/academic/application/teaching-catalog.service.spec.ts modules/academic/presentation/controllers/teaching-catalog.controller.e2e.spec.ts modules/academic/application/academic-authorization.service.spec.ts modules/academic/student-academic-profile.controller.spec.ts modules/academic/student-academic-profile.controller.e2e.spec.ts modules/identity/presentation/guards/roles.guard.spec.ts modules/identity/presentation/guards/session-auth.guard.spec.ts
```

The new HTTP suite exercises real guard classes with mocked session validation and role repositories. The service suite checks query boundaries, projections, flag-off short-circuiting, deleted ancestry, stable pagination, literal-search parameters, missing records and term/offering reference behavior through repository/query-builder doubles. Frontend tests exercise both portals, navigation, detail/offerings, filtering, paging/search reset, Arabic, disabled/empty/error distinctions, auth denial, session refresh and obsolete-request cancellation. Existing student profile/history and scoped-authorization regressions pass.

No database execution, local PostgreSQL integration, full-session browser flow or device visual test was performed. PostgreSQL/Docker are unavailable here. Offline metadata generation is not proof of database query execution. Tests temporarily set gates only inside isolated test doubles; no application environment was enabled.

The environment provides Node 24.22.1; project manifests still target Node 22. Reverify on Node 22 before release. Lockfile installs used `--ignore-scripts`; package manifests/locks are unchanged. No production configuration, secrets or environment files were read to obtain database access.

## 5. Remaining blockers

- Full MVP acceptance remains incomplete. This batch delivers reference browsing, not operational academic management or teaching assignments.
- The provisional schema is not approved for Neon and no target schema/data was inspected. Both feature flags remain off; deployed reference browsing is intentionally unavailable.
- Authoritative sections, teacher-to-section assignment, enrollment/roster, assignment lifecycle and approved permission codes/grants are missing. Existing teacher denial for `course_offering` scopes remains intact.
- Academic management writes require approved lifecycle, scope, audit and history integrity rules. Grading/exams/content/attendance services remain absent.
- Real PostgreSQL integration, browser/session/device checks and approved non-production data are needed before any activation. Existing bundle-size advisory and Node 22 release verification remain open.
- Cloud Shell working-tree-only files `backend/dump.rdb` and `status --short` were not accessed, copied, modified or removed. The user confirmed academic source is already in the baseline.

## 6. Readiness for the next batch

Ready for code review and the next development batch. Start with explicit section/assignment domain and permission decisions, implement authoritative assignment/enrollment foundations behind restricted gates, and add disposable PostgreSQL authorization/integrity tests before teacher private-record workflows. Reuse these reference APIs/UI rather than rebuilding them.

Not approved or ready for production activation, migrations, merge, push or deployment. The reviewed 27-file Batch 2 implementation is preserved by the local development commit containing this report on `backup/naba-mvp-20261030`. Use `git log -1 --format=%H` in this unchanged checkpoint checkout to obtain its hash.


## Batch 2 review and safe checkpoint evidence

Review date: 2026-10-31 (Asia/Aden). Scope: preserve and verify Batch 2 only; no Batch 3.

- The full 27-file manifest above exactly matched all modified and untracked files at review start; every file was present as a regular file. No unrelated file was included. Reports were updated for the checkpoint; implementation source was preserved unchanged during this review.
- Inspected the final tracked diff and all new source/tests, including both API and UI paths. No accidental scope changes, suspected embedded credentials, production targets/credentials, unsafe HTML injection, authorization bypasses or academic mutations were found in the reviewed additions. A focused credential-pattern scan covered private keys, GitHub/AWS/Google tokens, JWTs and credential-bearing URLs and reported no matches; this is a scoped review, not a proof that all historical repository content is secret-free.
- Existing academic authorization, student ownership and placement queries, session/role guards, frontend portal guard, migration files, environment example, configuration, package manifests and lockfiles remain identical to the implementation baseline. Both academic flags remain false by default. Course/term visibility does not grant private-record access or teaching ownership.
- Fresh verification, all exit 0: frontend `npm test` (7 files / 35 tests), portal access Node tests (3 tests), documented focused backend command (7 suites / 46 tests), frontend/backend type-checks, frontend/backend builds, offline TypeORM metadata/course-query generation (18 entities; no initialized connection), and diff whitespace checks. Total automated test cases: 84.
- Existing frontend large-chunk advisory remains. Runtime is Node 24.22.1, while Node 22 is the declared release target. PostgreSQL/Docker remain unavailable. No actual PostgreSQL query execution, database migration, SQL query-plan/load verification, browser/session/device workflow or visual rendering verification is claimed.
- No source feature changes or new features were introduced during review. No production Neon/Render contact or changes, production migrations, feature enablement, push, merge or deployment. Default commit hooks have no active scripts; no custom hooks path or commit signing is configured.
- The reviewed payload is safe for the explicitly authorized local development checkpoint; production readiness and the existing next-batch blockers are unchanged.
