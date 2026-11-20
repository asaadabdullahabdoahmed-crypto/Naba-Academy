# MVP Batch 3 — Academic Operations

Date: 2026-11-04
Repository: `asaadabdullahabdoahmed-crypto/Naba-Academy`
Branch: `backup/naba-mvp-20261030`
Starting `HEAD`: `e4f066871cfb8149ddec63a47a40c068aa3f4b5d`

## Outcome and Git state

The development MVP now implements section management, teacher assignments, student enrollment/cancellation, audit history, scoped backend APIs, and role-specific API-backed interfaces. This is not a production release. The implementation uses provisional workflow decisions explicitly approved for isolated development, but still requires institutional, authorization, schema, operations, and user-acceptance review before deployment.

The worktree already contained Batch 3 implementation/documentation changes when this continuation resumed. Those changes and the pre-existing edits to `ACADEMIC_PHASE_CHECKPOINT.md` were preserved and updated. `HEAD` remains the starting commit; nothing was committed, pushed, merged, or deployed. Unrelated untracked `backend/dump.rdb` and `tatus --short` were preserved and not staged. Other tracked/untracked Batch 3 changes remain in the worktree.

The 2026-11-04 recovery review confirmed the existing routes, entities, migration, service-level authorization, transactional enrollment/capacity checks, and default-off feature flag. It fixed two integration defects: student cancellation now tolerates the absent optional DELETE body used by its client, and admin section-creation errors are rendered even when no section is selected. The new admin regression test is included in Vitest discovery. The hierarchy, API contracts, and unresolved approval boundary were preserved.

## Database model and migration

Added TypeORM entities and additive migration `1793618000000-CreateAcademicOperations.ts` for:

| Entity/table | Purpose and lifecycle |
|---|---|
| `AcademicSectionEntity` / `academic_sections` | Offering-scoped section code, positive capacity, planned/open/closed status, JSON schedule, enrollment window and creator/updater accountability. Case-insensitive code uniqueness is scoped to the offering. |
| `AcademicTeacherSectionAssignmentEntity` / `academic_teacher_section_assignments` | Active/revoked teacher assignments with assigner, timestamps, revoker, and one-active-assignment uniqueness. Revocation preserves history. |
| `AcademicStudentEnrollmentEntity` / `academic_student_enrollments` | Active/cancelled enrollment with enrolling/cancelling actors and timestamps; one active enrollment per student/section. Cancellation preserves history; re-enrollment creates a new row. |
| `AcademicOperationAuditEventEntity` / `academic_operation_audit_events` | Append-only section/assignment/enrollment event, actor, target, department and JSON details. |

The migration adds foreign keys, checks, partial/lookup indexes, and supports rollback only when all four tables are empty; it refuses to erase recorded academic history. It was applied and rolled back only by the integration fixture against a verified, empty, loopback-only PostgreSQL 16 disposable database named `naba_academic_operations_test`. No production or shared database was accessed. The database and container were removed after verification.

Enrollment/cancellation transactions lock the offering and section rows in a consistent order. This serializes capacity checks and same-offering conflicts across concurrent requests. Database uniqueness remains a second integrity boundary. `synchronize` and `dropSchema` were not enabled.

## Backend API

All paths are below `/api/v1`; session validation and route-role guards apply. Every operations route is blocked unless the server-only `ACADEMIC_OPERATIONS_ENABLED` flag is explicitly true. It defaults to false and was never enabled outside the isolated test configuration.

| Capability | Endpoint |
|---|---|
| List, inspect, create, update, open, close sections | `GET /academic/sections`, `GET /academic/sections/:sectionId`, `POST /academic/sections`, `PATCH /academic/sections/:sectionId`, `POST /academic/sections/:sectionId/open`, `POST /academic/sections/:sectionId/close` |
| Teacher assignments | `GET/POST /academic/sections/:sectionId/teachers`, `DELETE /academic/sections/:sectionId/teachers/:teacherUserId` |
| Section roster and admin enrollment | `GET /academic/sections/:sectionId/students`, `POST /academic/sections/:sectionId/enrollments`, `DELETE /academic/enrollments/:enrollmentId` |
| Teacher's assigned sections | `GET /academic/sections/my` |
| Student availability and self-service | `GET /academic/sections/available`, `GET/POST /students/me/academic-enrollments`, `DELETE /students/me/academic-enrollments/:enrollmentId` |

Pagination is bounded (maximum 100). DTO validation covers UUIDs, positive capacity, bounded text, schedule metadata, paired/ordered enrollment-window boundaries, status, and page limits.

## Authorization and enforced business rules

- Admin section, assignment, and enrollment writes require the relevant persisted permission and an exact active department-scoped role assignment for the section's course department. Supplied department IDs are filters only. Global role visibility does not grant department ownership.
- Teacher reads require `academic.sections.read`, a currently active instructor role for the department, and a non-revoked assignment to the exact section. Roster queries return only active enrollment rows.
- Student operations derive identity from the authenticated session, require an active verified student and active student role, require an active placement in the section department, and restrict enrollment reads/cancellation to the student’s own records.
- Assignment revocation, section closure, cancellation and enrollment lifecycle are audited. Section closure does not erase enrollment or assignment history.
- Enrollment requires an open offering and section, valid active hierarchy, available capacity, and an active configured section window. Missing window bounds mean closed. Duplicate active enrollment in the same section and active enrollment in another section of the same offering are rejected.
- Partial section updates validate the resulting enrollment window against the unchanged persisted boundary; clearing the window requires clearing both boundaries.
- Prerequisites, credit limits, timetable conflicts, financial rules, waitlists and other unapproved policies remain unimplemented. No roles or permission grants are seeded by the migration.

## Frontend

Integrated English/Arabic interfaces with real APIs:

- **Admin:** section filtering/list, create/edit, capacity/status, window/schedule entry, teacher assignment/removal and enrollment/cancellation.
- **Teacher:** active assigned sections and authorized enrolled-student roster.
- **Student:** available-section discovery, eligibility/capacity/window messages, enrollment, own enrollment history and cancellation.

Pages include loading, empty, retry, request/authorization/feature-disabled errors, and action status. Success state follows a successful API response. New admin route/navigation and instructor/student flows are connected. No production mock data was added.

## Historical verification recorded on 2026-11-02 (not rerun in this continuation)

The checks below are historical evidence from the prior Batch 3 implementation session. They are retained for provenance and are not represented as fresh 2026-11-04 verification.

| Check | Result |
|---|---|
| Backend academic/config regression tests | **PASS — 14 suites, 96 tests.** Includes feature gate, request validation, migration rollback protection, scoped authorization, revoked teacher assignment, student-profile regression, and frontend-independent API behavior. The two database integration suites were skipped in this invocation. |
| Academic operations integration on disposable PostgreSQL 16 | **PASS — 1 suite, 1 test.** Synthetic data verified department/section isolation, active assignment enforcement, atomic final-seat capacity, enrollment/cancellation history, duplicate and same-offering rejection, database constraints, enrollment windows, and partial-window-update validation. The separate legacy academic migration integration suite was not run. |
| Frontend test suite | **PASS — 8 files, 38 tests.** |
| Backend type-check and TypeScript compile | **PASS** using the configured type-check and `npx tsc -p tsconfig.build.json --outDir /tmp/naba-academic-operations-backend-build`. Emitted files stayed outside the repository. |
| Frontend TypeScript check | **PASS** using `npm run lint`. |
| Frontend production build | **PASS** to `/tmp/naba-academic-operations-frontend-build`; Vite reports the existing large-chunk advisory (>500 kB). |
| `git diff --check` | **PASS** after the final documentation edits. |

The project declares Node 22; the available runtime was Node 24.22.1. Frontend UI tests cover student flow/API-client behavior but do not constitute browser/session testing or dedicated admin/teacher component coverage. The PostgreSQL test uses synthetic identities and a test-only connection URL guarded to loopback and the exact database name.

## Current recovery verification — 2026-11-04

| Check actually run in this continuation | Result |
|---|---|
| Focused backend tests: operations controller/service, config validation, migration rollback | **PASS — 5 suites, 34 tests.** Includes regression for self-cancellation with no request body. |
| Focused frontend tests: admin operations error state, student registration flow, API client | **PASS — 3 files, 5 tests.** |
| Frontend TypeScript check (`npm run lint`) | **PASS.** |
| Backend TypeScript check (`npm --prefix backend exec -- tsc --noEmit -p tsconfig.json --tsBuildInfoFile /tmp/naba-academic-operations-typecheck.tsbuildinfo`) | **PASS.** |
| `git diff --check` | **PASS.** |

`npm --prefix backend run lint` could not write the repository-local `backend/dist/tsconfig.tsbuildinfo` because that existing directory is not writable by this user; the equivalent type-check completed successfully with its build-info redirected to `/tmp`. The PostgreSQL integration test, full test suites, production builds, and full browser/session acceptance were **not run in this continuation**. Prior isolated-PostgreSQL and full-suite results above remain historical and must not be treated as freshly reproduced. No database URL was set or used.

### Longer checks for a user to run

Run these only in the intended local development environment; the integration test requires a newly provisioned, disposable loopback PostgreSQL database with the exact database name and must not target Neon/shared/production:

```sh
npm test
npm --prefix backend test -- --runInBand
npm run build
npm --prefix backend run build
ACADEMIC_OPERATIONS_TEST_DATABASE_URL=postgresql://USERNAME:PASSWORD@127.0.0.1:PORT/naba_academic_operations_test \
  npm --prefix backend test -- --runInBand src/modules/academic/academic-operations.integration.spec.ts
```

The PostgreSQL test is skipped when the dedicated test URL is unset and rejects non-loopback hosts, production/staging mode, or any database name other than `naba_academic_operations_test`.

## Changed implementation and documentation

- Backend config and default-off environment example: `.env.example`, `backend/src/config/configuration.ts`, `configuration.spec.ts`, `env.validation.ts`, `env.validation.spec.ts`.
- Backend module/service/API/DTO/tests: `backend/src/modules/academic/academic.module.ts`, `application/academic-operations.service.ts`, `application/academic-operations.service.spec.ts`, `academic-operations.integration.spec.ts`, `presentation/controllers/academic-operations.controller.ts`, its spec, and `presentation/dto/academic-operations.dto.ts`.
- Persistence: `backend/src/modules/academic/infrastructure/persistence/academic-operations.entity.ts`, `backend/src/database/migrations/1793618000000-CreateAcademicOperations.ts`, and `academic-migration.rollback.spec.ts`.
- Frontend contracts/client: `src/contracts/academicOperations.ts`, `src/services/academicOperationsClient.ts`, `src/services/apiClient.ts`, `src/services/apiClient.test.ts`.
- Frontend pages/routes: `src/views/admin/AdminAcademicOperationsPage.tsx` and its test, `src/views/instructor/InstructorSectionsPage.tsx`, `src/views/student/StudentRegistrationPage.tsx` and its test, `src/App.tsx`, `src/config/portalNavigation.ts`, `src/data/routeManifest.ts`, and `vitest.config.ts`.
- 2026-11-04 recovery fix: `backend/src/modules/academic/presentation/controllers/academic-operations.controller.ts` and its spec accept/test bodyless self-cancellation; `src/views/admin/AdminAcademicOperationsPage.tsx` and its test expose failed create requests; Vitest now discovers the admin test.
- Documentation: `docs/academic/MVP_BATCH_3_REPORT.md`, `docs/academic/ACADEMIC_PHASE_CHECKPOINT.md`, `docs/academic/ACADEMIC_DOMAIN_MODEL.md`, `docs/academic/ACADEMIC_SCHEMA_REVIEW.md`, `docs/academic/ACADEMIC_MIGRATION_PLAN.md`, `docs/academic/ACADEMIC_AUTHORIZATION.md`, and `docs/PORTAL_API_READINESS.md`.

The list above identifies Batch 3 source/test/documentation scope. Pre-existing unrelated artifacts were not changed or staged.

## Remaining limitations and release status

- The interfaces request the first page of up to 100 records but do not yet expose page navigation.
- Admin department, course-offering, teacher, and student identifiers are entered directly; lookup/search selectors are not implemented.
- Broader admin workflow and teacher page component coverage, plus real-browser/session testing, remain outstanding; the new admin test covers only failed section creation.
- Review operational audit retention/privacy, time-zone policy, concurrency/load behavior at production scale, permission assignment procedures, migration recovery, monitoring, and user acceptance.
- Existing academic read/catalog feature flags remain unchanged. Production `ACADEMIC_OPERATIONS_ENABLED` is not activated.

**Production readiness: NO-GO.** No production Neon/Render access, production migration, flag activation, deployment, merge, or commit occurred. The development implementation and isolated checks do not provide production-release approval.

**Recommended next step:** review the permission model and provisional term/window/section policies with institutional owners, add admin/teacher selector and pagination UX plus corresponding component tests, then conduct an approved production-like migration/recovery rehearsal before any separate release decision.
