# Academic Management Phase Checkpoint

**Latest checkpoint date:** 2026-10-31 (Asia/Aden)
**Source baseline:** `backup/naba-mvp-20261030` at `55671136c894786dd000c29068ffb85560e77016`
**Acceptance status: INCOMPLETE.** Batch 2 now adds disabled, read-only Admin/Teacher course, term, and offering reference APIs/UI. Full teaching assignments, private academic workflows and management writes remain unavailable. See the current Batch 2 entry below; dated October 30 entries are historical snapshots.

**Previous checkpoint summary:** The provisional university → college → department → program read hierarchy, student current-placement display, admin read-only catalog browser, and isolated verification are implemented. Full management writes, complete placement history/audit, teacher assignment scope, and unresolved institutional policies are not implemented. Target schema approval and rollout remain blocked. No Neon or shared/live database operation was performed.

## Batch 2 review and safe local checkpoint — 2026-10-31

- Verified all 27 files against the exact `MVP_BATCH_2_REPORT.md` manifest; implementation source is unchanged during this review. The report and this checkpoint record the new review evidence.
- Reviewed tracked additions/removals and all new API/UI/test source for accidental changes, credentials and authorization regressions. No blocking finding or suspected credential was found; focused credential-pattern scan returned no matches.
- Existing academic authorization/ownership services, student self-read implementation, session/role guards, frontend portal guard, migrations, configuration, false flag defaults and package manifests/locks match baseline `5567113` byte-for-byte.
- Fresh runs passed: frontend 7 files / 35 tests, portal role access 3 tests, backend 7 suites / 46 tests, both type-checks and builds, offline TypeORM metadata/course-query generation and diff whitespace checks. The existing large-chunk warning and Node 24 versus declared Node 22 verification limit remain.
- PostgreSQL/Docker are unavailable; real database execution, browser/session/device behavior and production readiness remain unverified. No flags were enabled and no production service or migration was accessed.
- The containing commit preserves this reviewed 27-file set as the user-authorized local development checkpoint on `backup/naba-mvp-20261030`, with parent `5567113`. Its hash is available from `git log -1 --format=%H` in this checkpoint checkout. No push, merge, deployment or Batch 3 work is authorized or performed.
- Detailed scope, evidence and remaining blockers: `MVP_BATCH_2_REPORT.md` (review section).

## Production compatibility continuation — 2026-11-01

- Resumed from commit `3fadceed7399a526a11853fbc2ace0d48b5a27e3` on `backup/naba-mvp-20261030`; reviewed the existing uncommitted changes before continuing. The student self-read policy now accepts any active student role assignment (global or scoped), but still requires an active verified principal and exact owner match. HTTP regressions cover scoped students, missing roles, revoked sessions, and no disclosure. No role, permission, scope inheritance, or cross-student access was added.
- Backend catalog and teaching-catalog services check the backend flag before repository query construction; the frontend checks its flag by exact `true`. Configuration defaults the backend flag to false and rejects invalid boolean values. Tests cover all 11 academic-catalog read methods without repository access when disabled; teaching-catalog tests cover the corresponding short-circuit.
- PostgreSQL 16.15 integration with synthetic fixtures passed on a disposable loopback-only database (`naba_academic_test`, port 55439). TypeORM migrations/repository reads exercised by the integration test completed, and the database was empty after cleanup. A Node 22.23.4 Nest startup smoke test against the same disposable PostgreSQL and Redis returned health `ok`; the database remained empty, consistent with `synchronize=false` and `dropSchema=false`. All temporary containers were stopped and removed.
- Node 22.23.4 verification passed: backend lint/type-check and build; 11 backend suites / 79 tests, including integration and configuration checks; frontend lint/type-check, build, and 7 files / 35 tests. The frontend build retains the existing large-chunk advisory. `git diff --check` passed. An initial test invocation from the repository root passed Jest's `--runInBand` option to Vitest and failed before tests ran; rerunning the applicable commands from `backend/` passed.
- Updated the authorization and production-readiness descriptions to match scoped student assignments. Save the verified compatibility changes as one local commit. Preserve unrelated untracked `backend/dump.rdb` and `tatus --short`; do not include either in that commit.

### Remaining commit and release gates

| Gate | Required before proceeding |
|---|---|
| Compatibility change commit | Commit only the intended authorization, tests, configuration test, and checkpoint/readiness documentation. Keep `backend/dump.rdb` and `tatus --short` out of the index. Do not push this local checkpoint. |
| Institutional/schema approval | Record the existing domain decisions; resolve placement interval overlap, code reuse and catalog lifecycle, academic audit requirements, section/enrollment/teacher-assignment boundaries, and missing assessment/grade workflows. The current schema remains provisional and is not a complete academic management schema. |
| Target database preflight | No production schema, migration history, extensions, grants, existing data compatibility, backup/restore, or lock behavior was inspected. Require owner/DBA review and a production-like isolated rehearsal before any target change. Do not contact Neon or run a production migration as part of this checkpoint. |
| Release/deployment approval | Render settings, auto-deploy behavior, deployment health/rollback configuration, and production environment values were not inspected. Verify them only through an explicitly approved non-production process; preserve both academic flags as off until schema, data, authorization, and release approvals are complete. |
| User-facing acceptance | Real browser/device/session UX, production-scale search/pagination plans, operational monitoring, and post-deploy verification remain untested. The local Nest health check is not deployment acceptance. |

No Neon/Render access, production migration, flag enablement, push, merge, or deployment occurred. Batch 3 was not started.

## MVP Batch 2 — Admin and Teacher Functional Foundation

- Implemented against verified backup HEAD `5567113` in a separate clean local checkout; the user confirmed Cloud Shell academic source is committed/pushed. Cloud Shell itself was not accessed or changed. Its `backend/dump.rdb` and unrelated `status --short` file remain outside this checkout.
- Reused existing React portal layouts, authentication, API envelope/client, NestJS session/role guards, TypeORM academic entities and disabled catalog gates. Existing completed hierarchy/profile/history APIs were not rebuilt.
- Added five **reference-only** GET contracts: course list/detail, course offerings, term list/detail. Admin/department-head/instructor access uses validated sessions and active canonical role assignments; anonymous, student and unrelated roles are denied. No private data or teacher assignment is inferred from catalog visibility.
- Admin has searchable paginated courses, department filtering, course hierarchy details, offering references, and term browsing. Teacher has the same shared catalog reference workflow under Teacher routes with explicit assignment/roster boundaries. Course labels no longer claim assigned courses. Arabic/English rendering and server-provided dates/status are supported.
- Request handling distinguishes loading, successful empty results, disabled backend/frontend, forbidden, expired session, missing record and retryable error. Aborted/obsolete responses cannot replace current filters/pages. No academic request is issued while the frontend gate is off.
- New endpoints read the **existing** provisional entities only; no entity/schema/migration changes or seeds. Both gates remain false by default and no environment was enabled. Management writes, sections, assignment, roster and grading remain blocked by the existing policy boundary.
- Verification: frontend **7 files / 35 tests passed**; portal access **3 tests passed**; focused backend **7 suites / 46 tests passed**. Both type-checks and production builds passed; Vite retains the large-chunk warning. Offline TypeORM metadata/SQL generation passed (18 entities, no initialized connection). `git diff --check` passed.
- The HTTP suite uses real session and role guard classes with mocked session validation and role repositories. Service tests use repository/query-builder doubles; frontend tests use client/fetch doubles. These results are not a real-database, full-session, browser/device or deployment verification. PostgreSQL/Docker are unavailable in this execution environment; no database integration test or migration was run.
- Node `24.22.1` was available; the declared project target remains Node 22. Lockfile dependencies were installed with lifecycle scripts disabled. No manifests/lockfiles/dependencies were changed.
- At implementation completion, no production Neon/Render contact, migrations, feature enablement, commits, pushes, merges or deployments had occurred; HEAD was `5567113` and edits were uncommitted. The subsequent review/checkpoint entry above supersedes this historical Git state.
- Next: decide and model authoritative sections/teacher assignments plus explicit scoped permission grants and assignment lifecycle, then verify against disposable PostgreSQL before enabling any private teacher/admin workflow. No global-admin scope bypass is introduced.
- Full endpoint contracts, verification commands, source manifest and blockers: `MVP_BATCH_2_REPORT.md`.

## Recorded student placement history — 2026-10-30

- Added `GET /api/v1/students/me/academic-placement-history`, using the authenticated session user ID only; extra owner query parameters are rejected by the existing strict validation pipe. The endpoint retains `SessionAuthGuard`, `RolesGuard` with the student role, resource-level self-ownership authorization, and `Cache-Control: no-store`.
- Results are bounded by the existing pagination DTO (default 20, maximum 100), filtered by `placement.userId`, hide placements with soft-deleted catalog ancestry, include available catalog details plus `effective_from`, `effective_to`, and `recorded_at`, and sort by effective start descending, recorded timestamp descending, then ID descending. Existing current-placement/profile response behavior is unchanged; the catalog read feature flag remains default-off.
- The student profile now displays a separately labeled **recorded academic placement history**, including loading, disabled, empty, error, and authorization states with retry and pagination. The copy explicitly states that recorded rows do not constitute an approved transfer history.
- Focused backend verification: `npm --prefix backend test -- --runInBand modules/academic/application/academic-catalog.service.spec.ts modules/academic/student-academic-profile.controller.spec.ts modules/academic/student-academic-profile.controller.e2e.spec.ts` — exit 0, 3 suites/23 tests passed. Coverage includes denied access, authenticated self-read/data isolation, no owner ID input, query owner binding, deterministic sort keys, empty results, and feature-disabled behavior.
- `npm --prefix backend run lint` — exit 0. `npm run lint` — exit 0. `git diff --check` — exit 0. A first frontend type-check caught redundant state comparisons in pagination buttons; they were removed and the final type-check passed.
- No migration or database was run or accessed. No Neon/Render access, production data changes, commit, push, or deployment occurred. UI browser rendering and real database query plans remain unverified.

## Academic defect and readiness continuation — 2026-10-30

- **University validation query:** `listColleges` now obtains the filtered page first and validates the university separately only when the page count is zero. Nonempty results no longer pay for a redundant `findOne`; the fallback preserves the existing 404 for missing/inactive/deleted universities and for an active university with zero matching colleges. API envelope/status behavior is unchanged.
- **Soft deletion:** direct university-by-ID lookup excludes `deleted_at` rows; list and related hierarchy queries also exclude deleted universities/parents. Inactive, non-deleted by-ID hierarchy details remain readable where required for historical interpretation. Focused tests cover direct deleted-university filtering; prior integration tests covered inactive university behavior, not a real deleted row end-to-end.
- **Authorization at this earlier checkpoint:** the self-placement query was already filtered by the authenticated user ID; scoped permissions and policy tests were not yet implemented. The subsequent “Provisional authorization foundation continuation” below records the current implementation and remaining blocked workflows.
- **Placement history:** current schema permits one open row and validates `effective_to > effective_from`, but does not prohibit overlapping closed ranges. Half-open intervals and transactional/exclusion enforcement remain a proposal only because inclusivity, retroactive corrections, and transfer rules are unapproved; no placement write API exists.
- **Academic audit:** documented a tamper-evident ledger design proposal and isolated PostgreSQL test requirements in `NEON_PRODUCTION_READINESS.md`. It is not implemented or tested. Role separation, external checkpoints, event payload privacy, retention, and audit correction rules require approval.
- **Rollback:** prior `ACCESS EXCLUSIVE` lock/transaction hardening remains in both migrations. Mock-based rollback checks passed 4/4 in this focused run; no real PostgreSQL lock-contention test was run. No migration execution is authorized or attempted.
- **Focused verification:** `npm --prefix backend test -- --runInBand modules/academic/application/academic-catalog.service.spec.ts modules/academic/student-academic-profile.controller.spec.ts modules/academic/student-academic-profile.controller.e2e.spec.ts modules/academic/presentation/controllers/academic-catalog.controller.e2e.spec.ts modules/identity/presentation/guards/roles.guard.spec.ts database/migrations/academic-migration.rollback.spec.ts` — exit 0, 6 suites/25 tests passed. `npm --prefix backend run lint` — exit 0. `git diff --check` — exit 0. An initial run exposed a nested-test placement mistake; it was corrected before the successful run. `ACADEMIC_TEST_DATABASE_URL` was unset; no database integration test or migration was run.
- **Files changed in this continuation:** `backend/src/modules/academic/application/academic-catalog.service.ts`, `backend/src/modules/academic/application/academic-catalog.service.spec.ts`, new `backend/src/modules/academic/student-academic-profile.controller.e2e.spec.ts`, `docs/academic/NEON_PRODUCTION_READINESS.md`, and this checkpoint. All other pre-existing worktree modifications were preserved.

## Provisional authorization foundation continuation — 2026-10-30

- Added `AcademicAuthorizationService` over existing identity role assignments and role-permission grants. It requires an active, email-verified session principal; exact, non-global scope; one active/non-revoked/not-future-dated role assignment; an active persisted academic scope/hierarchy; and a matching permission grant. Ambiguous/missing scope or grant denies. No new roles, grants, endpoints, or production feature enablement were added.
- Applied student self-ownership enforcement to both existing `/students/me/academic-profile` and `/students/me/academic-placement` reads. The authenticated principal remains sourced from `@CurrentUser`; service queries remain constrained by that user ID. `RolesGuard` additionally excludes future-dated role assignments.
- Teacher access is explicitly denied for `course_offering` scopes; a course offering is not a verified section assignment. No section, teacher-assignment, roster, or enrollment entities/endpoints exist. No academic management write endpoint exists, so missing permissions block all future writes until an approved exact permission grant is supplied.
- Scope types and identity role assignments have no explicit assignment expiry or role-active flag beyond revocation and `assigned_at`; this limitation is documented. Institutional permission matrix, scope inheritance, assignment expiry and data retention are not approved.
- **Focused verification:** `npm --prefix backend test -- --runInBand modules/academic/application/academic-authorization.service.spec.ts modules/academic/application/academic-catalog.service.spec.ts modules/academic/student-academic-profile.controller.spec.ts modules/academic/student-academic-profile.controller.e2e.spec.ts modules/academic/presentation/controllers/academic-catalog.controller.e2e.spec.ts modules/identity/presentation/guards/roles.guard.spec.ts modules/identity/presentation/guards/session-auth.guard.spec.ts database/migrations/academic-migration.rollback.spec.ts` — exit 0, 8 suites/38 tests passed. `npm --prefix backend run lint` — exit 0. `npm --prefix backend run build` — exit 0. `git diff --check` — exit 0. Initial test runs exposed test mock/type issues; corrected before the final passing run.
- After adding an explicit global-admin-without-local-scope assertion, `npm --prefix backend test -- --runInBand modules/academic/application/academic-authorization.service.spec.ts` — exit 0, 1 suite/11 tests passed; the final `npm --prefix backend run lint` and `git diff --check` also exited 0.
- No migrations or database tests were run; `ACADEMIC_TEST_DATABASE_URL` was unset. No Neon/shared database access occurred.
- Authorization specification: `docs/academic/ACADEMIC_AUTHORIZATION.md`; readiness and this checkpoint were updated. Existing unrelated changes and untracked files remain preserved.
- **Files changed in this authorization continuation:** `backend/src/modules/academic/academic.module.ts`, new `application/academic-authorization.service.ts` and its spec, `student-academic-profile.controller.ts` and its unit/HTTP specs, `backend/src/modules/identity/presentation/guards/roles.guard.ts` and its spec, new session guard spec, `docs/academic/ACADEMIC_AUTHORIZATION.md`, `ACADEMIC_DOMAIN_MODEL.md`, `NEON_PRODUCTION_READINESS.md`, and this checkpoint.

## Migration rollback hardening continuation — 2026-10-30

- The interrupted `ACCESS EXCLUSIVE` lock edit had **not** been applied when resumed. Both provisional academic migration `down` methods now acquire the necessary locks before checking data and retain them through DDL in the same transaction. The university rollback locks `colleges` before `universities`; the foundation rollback locks dependent tables child-first before parent tables.
- Each migration reuses an active TypeORM transaction or owns a transaction for direct invocation, rolling back its own transaction on refusal/error. The TypeORM CLI defaults to a transactional revert; production procedure must not override this with `-t none`. These locks block reads and writes, so rollback remains destructive and is not an approved production recovery strategy.
- Added database-free rollback tests for lock/check/DDL ordering, data-refusal rollback, and transaction ownership. Verification: `npm --prefix backend test -- --runInBand database/migrations/academic-migration.rollback.spec.ts` — exit 0, 1 suite/4 tests passed; `npm --prefix backend run lint` — exit 0; `git diff --check` — exit 0. `ACADEMIC_TEST_DATABASE_URL` was unset, so no database integration run or migration execution was attempted in this continuation. No Neon or shared database was contacted.

## Continuation verification — 2026-10-30

- Integrated the verified current-placement read and the read-only Admin Academic Structure browser into the student/admin routes. The admin page now has retry controls for catalog, filter, and detail read failures; the Arabic/English admin navigation label is “الهيكل الأكاديمي” / “Academic Structure”.
- Backend catalog pages preserve the ratified pagination metadata (`totalItems`, `totalPages`, `hasNext`, `hasPrevious`) through the frontend API client.
- Added a focused frontend test command using Vitest and Testing Library. **3 test files, 6 tests passed**, covering hierarchical selector dependent resets, loading/empty/error/retry states, responsive grid classes, Arabic/English disabled labels, route registration, and pagination-envelope preservation.
- Targeted academic backend verification: **6 suites, 20 tests passed**, including isolated PostgreSQL migrations and Nest HTTP contract tests. Backend lint/build and frontend lint/build passed. Vite reports a large JavaScript chunk advisory (>500 kB).
- On isolated PostgreSQL 16 at `127.0.0.1:55432`, the TypeORM CLI applied identity, academic-foundation, and university migrations in order; `migration:show` confirmed all three applied. The academic integration suite also exercised migration rollback/data-protection and read behavior. The disposable container was stopped and removed; no live/shared database was used.
- Local backend runtime smoke test returned health HTTP 200 with database and Redis up. An unauthenticated catalog request was rejected (HTTP 403), confirming the route is protected. The Vite dev server returned the SPA entry point for `/admin/departments` (HTTP 200); no browser/device rendering test was available.
- The catalog flags were enabled only in the local development processes for smoke testing; production defaults remain off. No catalog rows, production data, or institution-specific values were created.

## Resume audit — 2026-10-30

The latest durable checkpoint before this continuation was **Academic Production Readiness Review** (2026-10-29 19:56 UTC). The prior checkpointed work remains complete as described below. The current worktree additionally contains an uncheckpointed hierarchy expansion; these changes were present at resume and are being preserved:

| Work item | Resume status |
|---|---|
| Provisional college → department → program catalog, guarded read APIs, typed client/selectors, legacy student profile read, and initial isolated PostgreSQL coverage | **Completed in the previous checkpoint**; not repeated. |
| Optional university parent, additive migration, university and hierarchy-detail/read APIs, and normalized current-placement self-read | **Completed and verified in this continuation.** |
| Admin read-only academic catalog browser and route/navigation wiring; student verified-placement display | **Completed and verified in frontend type-check/build.** |
| Expanded backend/API/profile tests and both academic migrations in isolated PostgreSQL | **Completed and verified in this continuation.** |
| Current-turn build/test/checkpoint milestone updates | **Completed.** |
| Catalog writes, student-placement writes, institutional data, and live rollout | **Not implemented / blocked pending approval.** |

At resume, HEAD remained `c7408c8996b24f56632e7a1226218fd1dd55de31` on `main`; the worktree contained existing modifications and untracked files, including `backend/dump.rdb`. No changes were reverted or cleaned. The isolated PostgreSQL 16 container `naba-academic-localtest` on loopback port `55432` was used for the final tests and CLI migration rehearsal. Its test database was `naba_academic_test`; the disposable container had no persistent volume and was removed when stopped. No Neon connection or live migration occurred.

The final worktree inspection also found Arabic/English admin navigation label edits in `src/i18n/dictionaries/ar.ts` and `src/i18n/dictionaries/en.ts`; these were preserved and not modified in this continuation.

## Repository and runtime checkpoint

- Repository: `asaadabdullahabdoahmed-crypto/Naba-Academy`
- Branch: `main`, tracking `origin/main`
- HEAD: `c7408c8996b24f56632e7a1226218fd1dd55de31` (`feat(academic): prepare provisional catalog foundation`), tracking `origin/main` at review time.
- Current worktree contains a pre-existing modification to `.env.example` and untracked `backend/dump.rdb`. Neither was opened, altered, staged, or removed during this review; preserve both.
- Root and backend package manifests require Node `22.x`. The available runtime was Node `v24.22.1` with npm `12.2.1`; no nvm installation was found at the checked user path. Dependencies are present in the workspace.
- The project has a React/Vite frontend and a NestJS/TypeORM backend. Backend scripts include build, lint, Jest, and TypeORM migration commands. Do not run migration commands against a configured shared/live target.
- Relevant environment-variable names were inspected and the academic flags are documented. No application or production secret values were read or printed; disposable local test credentials were passed only to the isolated test process.

## Completed functionality and verified contracts

- Backend academic module exposes the authenticated student's own `GET /api/v1/students/me/academic-profile`.
- That endpoint requires a valid session and the `student` role, sets `Cache-Control: no-store`, and returns exactly the five existing legacy academic fields from the authenticated user.
- A focused controller test checks that only those five fields are returned.
- Catalog endpoints are implemented in code: list/retrieve universities, list colleges optionally filtered by university, retrieve a college, list credential levels, list departments by college, retrieve a department, list programs by department, and retrieve a program.
- Catalog reads require a session plus one of the canonical roles (`system_admin`, `department_head`, `instructor`, `student`), validate UUIDs and bounded pagination/search, and return the standard response envelope.
- Catalog access fails closed with `503` unless `ACADEMIC_CATALOG_READS_ENABLED=true`; the setting defaults to false. `includeInactive` is not accepted. Selector lists show active records; program lookup by stable ID may return inactive, non-deleted catalog ancestry and statuses for historical interpretation.
- College catalog reads reject a missing/inactive university filter and exclude active colleges linked to inactive/deleted universities; existing unlinked colleges remain readable.
- The legacy student profile behavior remains unchanged. A separate `GET /api/v1/students/me/academic-placement` is student-only, no-store, and returns the current placement (or null); placement history and all writes remain unavailable.
- The provisional schema includes universities, nullable `colleges.university_id`, departments, configurable credential levels, programs, dated placements, terms, courses, and course offerings. No university linkage is backfilled; no values are seeded and `users` is unchanged.
- The typed client is integrated into the read-only Admin Academic Structure page and the student's verified-placement display. University/college/department/program and credential selectors are presentation-only and never save records. The frontend flag defaults to false.
- Current readiness documentation identifies no operational catalog, instructor assignment, sections/rosters, enrollment, learning, submissions, grading, exams, student registry, or administrative academic APIs.
- The existing academic structure SQL/API files remain historical review proposals; the new TypeORM migration is separate and provisional. No catalog data is seeded; legacy free-form fields are not a verified crosswalk.
- Production-readiness review classified the provisional migration as **NO-GO** for Neon execution or feature enablement. The migration is not a complete academic management schema.
- Existing project ADRs explicitly require server-side academic truth, fine-grained role + permission + scope + ownership, append-only audit, and preservation of academic history. The provisional placement schema and role guard do not yet meet all those requirements.
- Identified production blockers include overlap prevention for placement intervals, durable business-code reservation after physical deletion, parent/child lifecycle enforcement, distinction between offerings and sections, course prerequisite/curriculum rules, enrollment and teacher assignments, assessment/submission/grade schemas and audit, scoped authorization, API pagination contract alignment, production-like migration/recovery rehearsal, and missing institutional policy decisions.

## Portal implementation matrix (academic API availability)

| Portal | Operational academic capability | Not available / blocked |
|---|---|---|
| Student | Own legacy academic-profile read (operational); current normalized placement display is integrated but default-disabled. | Placement history, terms, courses, enrollment, learning, assessments, examinations, grades, progress, and calendar APIs. |
| Teacher | No academic operations API identified. | Assigned sections, rosters, learning content, submissions, exams, grading, feedback, and progress. |
| Administrator | Read-only catalog browser is integrated but default-disabled; no academic writes/API are available. | Catalog management/writes, terms/offerings, teacher assignment, placement review, lifecycle operations, and academic audit APIs. |

This matrix describes academic capability only. The admin page is a viewer, not a catalog-management workflow; the selectors do not authorize placement writes. Existing unrelated portal/auth functionality must remain intact.

## Domain decisions validated against current proposals

- Provisional development assumption: optional university → college → department → defined study-pathway program; `college.university_id` is nullable and no linkage is inferred. Credential levels are configurable reference rows with no seeded vocabulary.
- Provisional placement history uses effective dates and allows at most one open/current row per user. It does not prevent overlaps among closed historical ranges; future writes must enforce non-overlap transactionally.
- Academic terms, course definitions, and term-specific offerings are separate; no enrollment, teaching assignment, or registration policy is implemented.
- Existing user academic fields remain unchanged; `departmentId` is legacy text and cannot be treated as the proposed UUID FK.
- No institution-specific names, catalog records, student placements, grades, credential dictionary, or crosswalk are invented.
- Whether a university is an official hierarchy level, program versus major/degree pathway, credential vocabulary, placement history semantics, inactive/deleted behavior, code reuse, and department-head scope remain approval questions.
- Terms, course offerings, enrollment, learning, assignments, examinations, grades, and progress are outside the approved v1 proposal.

## Changed files in this continuation

- `docs/academic/ACADEMIC_DOMAIN_MODEL.md` — current/proposed domain boundary, integrity and lifecycle rules, compatibility, and unresolved decisions.
- `docs/academic/ACADEMIC_SCHEMA_REVIEW.md` — current-vs-proposed contract/schema review and migration-readiness constraints.
- `docs/academic/ACADEMIC_MIGRATION_PLAN.md` — approval gates, safe migration sequence, compatibility, rollback, and exact next action.
- `docs/academic/ACADEMIC_PHASE_CHECKPOINT.md` — this durable continuation checkpoint.
- `backend/src/database/migrations/1793299914088-CreateAcademicFoundation.ts` — additive provisional schema; data-containing rollback refuses to drop tables.
- `backend/src/database/migrations/1793362429913-AddUniversityCatalog.ts` — additive university table and nullable college relationship; no existing college linkage is inferred.
- `backend/src/modules/academic/infrastructure/persistence/academic-catalog.entity.ts` — TypeORM mappings for the eight new tables.
- `backend/src/modules/academic/application/academic-catalog.service.ts` — default-gated catalog reads and inactive ID-detail support.
- `backend/src/modules/academic/presentation/` — validated query DTO and controller, with auth, DTO, and HTTP-contract tests.
- `backend/src/config/configuration.ts`, `backend/src/config/env.validation.ts`, `backend/src/config/env.validation.spec.ts`, and `.env.example` — default-off backend feature gate.
- `backend/src/modules/academic/migration.integration.spec.ts` — local-only PostgreSQL migration and real repository read test, guarded to loopback and database name `naba_academic_test`.
- `src/contracts/academicCatalog.ts` and `src/services/academicCatalogClient.ts` — typed university/catalog/current-placement contracts and API client.
- `src/components/academic/AcademicCatalogSelectors.tsx` and `src/components/academic/UniversitySelector.tsx` — presentation-only catalog selectors.
- `src/components/academic/AcademicCatalogSelectors.test.tsx`, `src/data/routeManifest.test.ts`, and `src/services/apiClient.test.ts` — focused frontend selector, route, and pagination tests.
- `vitest.config.ts`, `package.json`, and `package-lock.json` — frontend test runner and test dependencies.
- `src/views/admin/AdminAcademicStructurePage.tsx`, `src/App.tsx`, `src/config/portalNavigation.ts`, and `src/data/routeManifest.ts` — read-only admin catalog integration and route/navigation entries.
- `src/views/student/StudentProfilePage.tsx` — gated current-placement display alongside unchanged legacy fields.
- `src/i18n/dictionaries/ar.ts` and `src/i18n/dictionaries/en.ts` — admin navigation label localized as “الهيكل الأكاديمي” / “Academic Structure”.
- `docs/PORTAL_API_READINESS.md` and the existing academic proposals — status clarified; proposals remain unapproved review artifacts.
- `docs/academic/ACADEMIC_APPROVAL_DECISIONS.md` — Arabic decision register with status classification, recommended defaults, role impacts, and approval flags.
- `docs/academic/NEON_PRODUCTION_READINESS.md` — migration risks, missing schema dependencies, implementation classification, and production no-go gate.
- `docs/academic/ACADEMIC_DOMAIN_MODEL.md` and `ACADEMIC_MIGRATION_PLAN.md` — unresolved transfer policy and catalog implementation rollout wording aligned with the review.
- `docs/PORTAL_API_READINESS.md` — distinguishes provisional disabled catalog GET code from operational/live APIs.

## Tests and checks

- Current focused backend tests: **6 suites, 20 tests passed** (unit, HTTP/DTO/profile, and isolated PostgreSQL integration tests).
- Frontend focused tests: **3 files, 6 tests passed**. They verify selector hierarchy resets, loading/empty/error/retry UI, responsive grid classes, localized disabled-state text, route/navigation metadata, and pagination metadata preservation.
- PostgreSQL 16 integration: identity, academic-foundation, and university migrations; TypeORM metadata, nine academic tables, university linkage, legacy user-field preservation, FK/code constraints, placement history, hierarchy reads/filtering, inactive detail reads, and HTTP route/envelope/cache-control contracts passed on loopback-only `naba_academic_test`. The CLI migration rehearsal applied all three migrations in order and confirmed their status. Test guards were stubbed in the HTTP fixture; this did not validate a real browser session or production authentication flow.
- Backend type-check and NestJS build passed. Frontend type-check and Vite production build passed; Vite reported a large-chunk advisory (bundle >500 kB). The test dependency installation reported seven npm audit advisories (six moderate, one high); they were not investigated or remediated in this academic change.
- `git diff --check` passed.
- A local backend HTTP smoke test returned health HTTP 200 and rejected an unauthenticated catalog request with HTTP 403. The local development catalog flags were explicitly enabled only for this smoke test; no live/shared API was contacted and production flags remain off.
- The prior checkpoint's 7-suite/35-test result is historical and not counted as current-turn verification.

## Pending work and blockers

1. Obtain institutional decisions listed in `ACADEMIC_DOMAIN_MODEL.md` and `ACADEMIC_MIGRATION_PLAN.md`.
2. Obtain the exact approvals in `ACADEMIC_APPROVAL_DECISIONS.md`; migration readiness is **NO-GO** until then.
3. Keep both catalog feature flags off; no Neon migration or production data access was performed.
4. No catalog rows, placements, course offerings, or credential values are seeded; no academic writes exist.
5. Teacher academic APIs and administrative academic writes remain unavailable per `docs/PORTAL_API_READINESS.md`.
6. Node 22 is the declared project runtime, but only Node 24 was available in this environment.

## Safety record

- Neon contacted: **No**
- Provisional migration prepared: **Yes**
- Migration executed against Neon/shared/live data: **No**
- Local test migrations executed: **Yes**, only in disposable PostgreSQL 16 at `127.0.0.1:55432`; identity, academic foundation, and university migrations were applied and confirmed, then the container was stopped and removed. No persistent data or volume was used.
- Backend catalog feature flag: **Off by default**
- Frontend catalog selector flag: **Off by default**
- Live academic data read or changed: **No**
- Application/production secrets exposed: **No**
- Commit, push, or deployment performed: **No**
- Pre-existing untracked `backend/dump.rdb` preserved: **Yes**

## Next exact development phase

Record institutional decisions from `ACADEMIC_APPROVAL_DECISIONS.md`; revise the migration for approved history/audit/scope/lifecycle and complete missing course-section/enrollment domains; align pagination contracts; then rehearse on an isolated production-like database and obtain separate target-environment execution approval. Do not enable catalog reads or execute any Neon migration before those gates.
