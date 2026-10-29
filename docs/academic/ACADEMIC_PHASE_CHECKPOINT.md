# Academic Management Phase Checkpoint

**Checkpoint date:** 2026-10-29
**Status:** Provisional academic foundation, guarded catalog read API, and dormant typed selector are implemented for isolated development. Institutional approval and target schema rollout remain pending. No Neon or shared/live database operation was performed.

## Repository and runtime checkpoint

- Repository: `asaadabdullahabdoahmed-crypto/Naba-Academy`
- Branch: `main`, tracking `origin/main`
- HEAD: `31ce7d91de64324a06c8c2837f721e06e88739fd`
- Initial worktree state: clean except for untracked `backend/dump.rdb`. This file was not opened, altered, or removed; preserve it as pre-existing local work.
- Root and backend package manifests require Node `22.x`. The available runtime was Node `v24.22.1` with npm `12.2.1`; no nvm installation was found at the checked user path. Dependencies are present in the workspace.
- The project has a React/Vite frontend and a NestJS/TypeORM backend. Backend scripts include build, lint, Jest, and TypeORM migration commands. Do not run migration commands against a configured shared/live target.
- Relevant environment-variable names were inspected and the new academic flags are documented; no secret values were read or printed.

## Completed functionality and verified contracts

- Backend academic module exposes the authenticated student's own `GET /api/v1/students/me/academic-profile`.
- That endpoint requires a valid session and the `student` role, sets `Cache-Control: no-store`, and returns exactly the five existing legacy academic fields from the authenticated user.
- A focused controller test checks that only those five fields are returned.
- New catalog endpoints are implemented in code: colleges, credential levels, departments by college, programs by department, and program detail.
- Catalog reads require a session plus one of the canonical roles (`system_admin`, `department_head`, `instructor`, `student`), validate UUIDs and bounded pagination/search, and return the standard response envelope.
- Catalog access fails closed with `503` unless `ACADEMIC_CATALOG_READS_ENABLED=true`; the setting defaults to false. `includeInactive` is not accepted. Selector lists show active records; program lookup by stable ID may return inactive, non-deleted catalog ancestry and statuses for historical interpretation.
- Student profile behavior remains unchanged; there is no placement-history read endpoint or write operation.
- The provisional schema now includes colleges, departments, configurable credential levels, academic programs, dated student placement history, academic terms, courses, and term-specific course offerings. It does not seed values or alter `users`.
- A typed college/department/program selector and API client are prepared but not mounted into any route. The frontend flag defaults to false; selections are presentation-only and never saved.
- Current readiness documentation identifies no operational catalog, instructor assignment, sections/rosters, enrollment, learning, submissions, grading, exams, student registry, or administrative academic APIs.
- The existing academic structure SQL/API files remain historical review proposals; the new TypeORM migration is separate and provisional. No catalog data is seeded; legacy free-form fields are not a verified crosswalk.

## Portal implementation matrix (academic API availability)

| Portal | Operational academic capability | Not available / blocked |
|---|---|---|
| Student | Own legacy academic-profile read only (operational). Catalog read code is prepared but disabled and not mounted in the student portal. | Normalized placement/history, terms, courses, enrollment, learning, assessments, examinations, grades, progress, and calendar APIs. |
| Teacher | No academic operations API identified. | Assigned sections, rosters, learning content, submissions, exams, grading, feedback, and progress. |
| Administrator | No academic administration API identified. | Catalog management, terms/offerings, teacher assignment, placement review, lifecycle operations, and academic audit APIs. |

This matrix describes backend API readiness, not a claim that every portal screen has been independently audited. Existing unrelated portal/auth functionality must remain intact. The selector scaffold is not an administrator workflow and does not authorize placement writes.

## Domain decisions validated against current proposals

- Provisional development assumption: college → department → defined study-pathway program; credential levels are configurable reference rows with no seeded vocabulary.
- Provisional placement history uses effective dates and allows at most one open/current row per user. It does not prevent overlaps among closed historical ranges; future writes must enforce non-overlap transactionally.
- Academic terms, course definitions, and term-specific offerings are separate; no enrollment, teaching assignment, or registration policy is implemented.
- Existing user academic fields remain unchanged; `departmentId` is legacy text and cannot be treated as the proposed UUID FK.
- No institution-specific names, catalog records, student placements, grades, credential dictionary, or crosswalk are invented.
- Program versus major/degree pathway, credential vocabulary, current versus historical placements, inactive/deleted placement behavior, code reuse, and department-head scope remain approval questions.
- Terms, course offerings, enrollment, learning, assignments, examinations, grades, and progress are outside the approved v1 proposal.

## Changed files in this continuation

- `docs/academic/ACADEMIC_DOMAIN_MODEL.md` — current/proposed domain boundary, integrity and lifecycle rules, compatibility, and unresolved decisions.
- `docs/academic/ACADEMIC_SCHEMA_REVIEW.md` — current-vs-proposed contract/schema review and migration-readiness constraints.
- `docs/academic/ACADEMIC_MIGRATION_PLAN.md` — approval gates, safe migration sequence, compatibility, rollback, and exact next action.
- `docs/academic/ACADEMIC_PHASE_CHECKPOINT.md` — this durable continuation checkpoint.
- `backend/src/database/migrations/1793299914088-CreateAcademicFoundation.ts` — additive provisional schema; data-containing rollback refuses to drop tables.
- `backend/src/modules/academic/infrastructure/persistence/academic-catalog.entity.ts` — TypeORM mappings for the eight new tables.
- `backend/src/modules/academic/application/academic-catalog.service.ts` — default-gated catalog reads and inactive ID-detail support.
- `backend/src/modules/academic/presentation/` — validated query DTO and controller, with auth, DTO, and HTTP-contract tests.
- `backend/src/config/configuration.ts`, `backend/src/config/env.validation.ts`, `backend/src/config/env.validation.spec.ts`, and `.env.example` — default-off backend feature gate.
- `backend/src/modules/academic/migration.integration.spec.ts` — local-only PostgreSQL migration and real repository read test, guarded to loopback and database name `naba_academic_test`.
- `src/contracts/academicCatalog.ts`, `src/services/academicCatalogClient.ts`, and `src/components/academic/AcademicCatalogSelectors.tsx` — typed read client and dormant, presentation-only selector.
- `docs/PORTAL_API_READINESS.md` and the existing academic proposals — status clarified; proposals remain unapproved review artifacts.

## Tests and checks

- Backend: focused academic/API/profile/config tests passed — **7 suites, 35 tests**. This includes HTTP contract validation and PostgreSQL migration/repository tests.
- Local PostgreSQL: migration `up`, entity metadata, FK/code constraints, placement history, offering-term distinction, real catalog reads, inactive ID detail, and data-protecting `down` passed against a disposable PostgreSQL 16 container bound to loopback. The database was empty after cleanup; the container was stopped.
- Backend type-check and NestJS build passed.
- Frontend type-check and Vite production build passed. Vite reported the existing large-chunk advisory (bundle >500 kB).
- `git diff --check` passed.
- No live HTTP/API integration was attempted.
- Historical test/build counts from earlier sessions are not treated as current verification.

## Pending work and blockers

1. Obtain institutional decisions listed in `ACADEMIC_DOMAIN_MODEL.md` and `ACADEMIC_MIGRATION_PLAN.md`.
2. Resolve migration date-overlap enforcement and whether credential-level deactivation may coexist with active programs before any placement write flow.
3. Keep both catalog feature flags off until the schema is separately approved and deployed.
4. No catalog rows, placements, course offerings, or credential values are seeded; no academic writes exist.
5. Teacher and administrator academic APIs remain unavailable per `docs/PORTAL_API_READINESS.md`.
6. Node 22 is the declared project runtime, but only Node 24 was available in this environment.

## Safety record

- Neon contacted: **No**
- Provisional migration prepared: **Yes**
- Migration executed against Neon/shared/live data: **No**
- Local test migration executed: **Yes**, only in a disposable PostgreSQL 16 container bound to `127.0.0.1`; test database cleaned and container stopped.
- Backend catalog feature flag: **Off by default**
- Frontend catalog selector flag: **Off by default**
- Live academic data read or changed: **No**
- Secrets exposed: **No**
- Commit, push, or deployment performed: **No**
- Pre-existing untracked `backend/dump.rdb` preserved: **Yes**

## Next exact development phase

After recording institutional decisions, reconcile them with the provisional migration, review the final DDL, and obtain separate target-environment approval before any migration or feature-flag enablement. Then add approved placement/history writes and teacher/admin workflows only with object authorization and audit policy. Do not expose proposed catalog features as live or execute any Neon migration without explicit authorization.
