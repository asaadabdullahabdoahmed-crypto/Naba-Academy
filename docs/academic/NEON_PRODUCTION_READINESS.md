# Neon Academic Production Readiness Review

**Review baseline:** Commit `c7408c8996b24f56632e7a1226218fd1dd55de31` (`feat(academic): prepare provisional catalog foundation`), checked on `main` tracking `origin/main`.

**Decision:** **NO-GO for production migration or feature enablement.** The current migration is an isolated-development foundation. Do not connect to Neon, execute migrations, create academic records, or set `ACADEMIC_CATALOG_READS_ENABLED=true` as part of this review.

## Evidence and scope

Reviewed:

- `docs/academic/ACADEMIC_PHASE_CHECKPOINT.md`
- `docs/academic/ACADEMIC_DOMAIN_MODEL.md`
- `docs/academic/ACADEMIC_SCHEMA_REVIEW.md`
- `docs/academic/ACADEMIC_MIGRATION_PLAN.md`
- `backend/src/database/migrations/1726920000000-CreateIdentityFoundation.ts`
- `backend/src/database/migrations/1793299914088-CreateAcademicFoundation.ts`
- Academic TypeORM entities, catalog service/controller/DTO, tests, and existing session/role assignment code
- `docs/ARCHITECTURE_DECISIONS.md`, `docs/MASTER_PLAN.md`, `docs/STEP_INDEX.md`, `docs/DATABASE_ARCHITECTURE.md`, and `docs/API_CONTRACTS.md`

No live database or Neon was contacted. The checkout already contained unrelated local changes to `.env.example` and untracked `backend/dump.rdb`; both were preserved and not inspected as data.

## Classification summary

| Classification | Findings |
|---|---|
| **APPROVED BY EXISTING REQUIREMENTS** | PostgreSQL/TypeORM migrations; preserve legacy student fields; server-side academic truth; fine-grained role + permission + scope + ownership; append-only audit and historical preservation. Requirements are documented, but several are not implemented in the provisional schema. |
| **IMPLEMENTED AND TESTED** | Nine-table provisional foundation, catalog read paths, current-placement self-read, and read-only portal integration were tested on disposable local PostgreSQL 16 and local HTTP runtime; legacy fields remained unchanged. This is not production approval. |
| **RECOMMENDED — NEEDS APPROVAL** | Program and credential semantics, code reservation, term/calendar policy, lifecycle of inactive records, transfer-history rules, and the final meaning of offering/section. |
| **BLOCKED** | Prerequisites/curriculum versions, sections, enrollments, teacher assignments, assignments/examinations/submissions/grades, record-level authorization, immutable academic audit, non-overlapping placement history, and production rollout/recovery approval. |

## Provisional migration review

`1793299914088-CreateAcademicFoundation.ts` adds eight tables: `colleges`, `departments`, `credential_levels`, `academic_programs`, `student_academic_placements`, `academic_terms`, `courses`, and `course_offerings`. `1793362429913-AddUniversityCatalog.ts` adds `universities` and the nullable `colleges.university_id` FK without backfilling links. Neither migration alters `users` or seeds data. The existing identity migration timestamp `1726920000000` precedes them and creates `users`; it also requests the `pgcrypto` extension. The academic migration depends on that existing `users` table and `gen_random_uuid()`.

### Positive controls

- DDL is additive and uses explicit PK/FK/check/index names; physical FK deletion is generally restricted.
- Catalog codes have case-insensitive uniqueness within the coded scope and remain reserved while rows exist, including soft-deleted rows.
- Legacy user academic columns remain unchanged; no inferred backfill is present.
- Current placement uniqueness is enforced by a partial unique index (`effective_to IS NULL`).
- Term and course are separate from a course offering.
- Catalog pagination follows the documented metadata fields (`totalItems`, `totalPages`, `hasNext`, `hasPrevious`); the frontend client preserves the page metadata.
- `synchronize` and `dropSchema` remain false in the application and CLI data-source configuration.
- The migrations refuse unsafe data-bearing rollback; isolated PostgreSQL 16 integration tests and an ordered TypeORM CLI migration rehearsal passed.

### Production risks and required changes

| Priority | Risk | Why production is blocked / required action |
|---|---|---|
| **P0** | Domain scope is incomplete. | The roadmap marks Academic Structure, Student Records, Registration, Assessments, Assignments, and Gradebook as planned. This migration has no major/study-plan model, prerequisites, sections, enrollments, teacher assignments, submissions, examinations, grades, or final-grade workflow. Do not advertise a complete academic management schema. Approve scope and add separately reviewed migrations before those features. |
| **P0** | Academic authorization and audit are incomplete. | A provisional reusable policy now checks active session principal, exact student self-ownership, non-global role scope, explicit role-permission grant, and active catalog hierarchy; the two existing student self-read endpoints call the ownership policy. `RolesGuard` filters future-dated and revoked assignments. However, scoped permission codes/grants are not approved or seeded, no admin write endpoint exists, and no section/teacher-assignment or roster model exists. Instructors are denied course-offering scope because that is not a section. ADR-06/10 still require an append-only audit trail; placements have `created_by_user_id`/`recorded_at` only and lack reason/event history. Do not add write endpoints or enable production access before these gaps are resolved. |
| **P1** | Placement intervals can overlap. | The partial unique index prevents two open placements, and a check validates `effective_to > effective_from`, but two closed historical intervals can overlap or have gaps. Define half-open/closed boundaries and enforce non-overlap transactionally or using a PostgreSQL exclusion constraint (with an approved extension/operator strategy). Test concurrent transfers. |
| **P1** | Identifier non-reuse is not guaranteed after physical deletion. | Unique indexes reserve codes only while a row exists. A currently unreferenced catalog row can be physically deleted and its code reused. Choose permanent code reservation, prohibit physical deletion, or maintain a durable identifier registry. |
| **P1** | Catalog lifecycle is not cross-row safe. | Checks enforce row-local status/deleted consistency, but do not prevent active departments/programs/courses under inactive parents or new children under retired parents. Add transactional service rules/locks and audit; decide parent retirement behavior. |
| **P1** | `course_offerings` may be conflated with sections. | It has course + term + code + status, but no separate section, instructor, timetable, capacity, location, or seat-state model. The roadmap explicitly requires section scheduling. Decide whether this row is an offering or a section; the recommended design has one term-level offering and one-or-many sections. |
| **P1** | Referential integrity for the app role is not enforced by the placement FK. | `user_id` references any `users` row; a database FK cannot prove the user has a student role. Placement writes must verify an active student eligibility in the service and record actor/reason. No assignment API exists now. |
| **P1** | Migration rollback is destructive and blocks concurrent access. | The provisional `down` methods now acquire `ACCESS EXCLUSIVE` locks child-first before data checks and retain them through guarded DDL in one transaction, closing the check/drop race. These locks also block reads and writes; keep production rollback a no-go, require a reviewed maintenance window, and prefer a forward corrective migration or verified restore after data exists. The TypeORM CLI's default transactional revert also keeps migration-ledger removal atomic; do not override it with `-t none`. |
| **P1** | Existing migration dependencies need preflight. | This migration requires the identity migration's `users` table and a working `gen_random_uuid()`. Verify `typeorm_migrations` history, PostgreSQL version/function availability, extension state/permissions, schema/search path, migration owner, grants, and target schema before rollout. No Neon migration history was inspected in this review. |
| **P2** | Date/time and calendar semantics are incomplete. | Terms have start/end dates but no academic year/calendar, time zone, registration/grading windows, or policy on inclusive ends. Approve these before scheduling or registration. |
| **P2** | Credential reference semantics are incomplete. | The reference table is configurable and has no seeded values, which is good; but it is required on every program and has no effective dates, retirement policy, or distinction between credential level and award/degree type. Approval is required before data loads. |
| **P2** | Entity metadata does not fully mirror DDL. | The migration includes trimmed/nonblank code/name and deleted-status checks, while entity decorators do not represent every check; expression/partial indexes are marked `synchronize: false`. This is acceptable only because `synchronize=false` is mandatory. Add schema-drift assertions/documentation and never use TypeORM synchronize to reconcile production. |
| **P2** | Large-offset pagination and search may be expensive at scale. | The response metadata is aligned with `docs/API_CONTRACTS.md`; substring `ILIKE` and high-offset pages still need production-scale query plans and response/time limits. Consider keyset pagination or a lower page cap for large catalogs. |
| **P2** | Query performance has not been validated at production scale. | B-tree indexes support key/FK lookups, but substring `ILIKE '%term%'` is not served efficiently by the current indexes; add `pg_trgm`/search policy only after review. Exact count and high-offset pages can be expensive. Run `EXPLAIN (ANALYZE, BUFFERS)` on representative non-production data and set response/time limits. |
| **P2** | One FK lookup path is not indexed. | `student_academic_placements.created_by_user_id` has an FK but no supporting index. PostgreSQL does not automatically index referencing columns; add an index if actor-based audit queries or user deletion checks require it, and verify all FK-side index coverage. |
| **P2** | Test coverage is isolated, not a deployment rehearsal. | The integration test applies identity, academic, and university migrations and exercises a Nest HTTP contract with test guards replaced. It does not test grants/RLS, a real browser session over HTTP, concurrent placement/registration, production backup/restore, or upgrade from a Neon snapshot. |

## Academic audit trail proposal — not implemented

The current schema's `recorded_at` and `created_by_user_id` fields are not an audit trail. Before any academic write API, review an append-only `academic_audit_events` ledger with a database-generated sequence/time, actor and effective role/scope snapshot, action, resource type/id, approved reason code, request/trace ID, and immutable version references (or minimized before/after values where policy permits). Write the domain change and its audit event in the same transaction.

For tamper evidence, canonicalize event fields and chain each event hash to the previous hash within a serialized stream. The application role must not own the ledger and must have insert-only access; a dedicated writer function/role should append events, while triggers reject `UPDATE`, `DELETE`, and `TRUNCATE`. Periodically checkpoint the chain digest outside the database under separate credentials. A database owner/superuser can bypass in-database controls, so without the external checkpoint this is not tamper-proof against privileged operators. Do not copy unrestricted student PII into event payloads.

This proposal is not ready to migrate: actor/scope representation, retention, privacy/redaction, correction events, stream partitioning, key/checkpoint operations, and legal requirements need security, DBA, and academic-owner review. No audit table, trigger, writer, or write API exists. Before approval, add isolated PostgreSQL tests for same-transaction rollback, append-only grants, denied update/delete/truncate, concurrent per-stream sequencing, chain-integrity failure after mutation, and retention/checkpoint behavior. These tests are planned, not currently passing.

## Entity-by-entity readiness

| Entity/workflow | Classification | Review result |
|---|---|---|
| University | **IMPLEMENTED AND TESTED, PROVISIONAL** | The additive migration adds `universities` and a nullable college FK; no records or links are seeded. Institutional confirmation of this hierarchy remains required. |
| College, department | **IMPLEMENTED AND TESTED** | FK hierarchy and scoped code uniqueness are present. Lifecycle, immutable code reservation, parent retirement, and administrative approval remain open. |
| Academic program | **RECOMMENDED — NEEDS APPROVAL** | Current code treats it as a department-owned pathway. Institution must decide whether major, degree pathway, specialization, or curriculum plan are distinct. |
| Credential/degree levels | **RECOMMENDED — NEEDS APPROVAL** | Configurable reference table exists, no seeds. Vocabulary, award-type distinction, effective dates, and retirement behavior are missing. |
| Student academic profile/placement | **IMPLEMENTED AND TESTED** (current self-read) | The legacy profile endpoint is unchanged; a separate student-only current-placement read is tested and returns no placement when none exists. No placement-history read/write API, transfer API, or full history audit exists. |
| Transfers/history | **BLOCKED** | Interval overlap, correction, authorization, reason, actor, and effective-date rules are unresolved/unimplemented. |
| Academic terms/semesters | **RECOMMENDED — NEEDS APPROVAL** | Basic term table exists. Academic year, calendars, time zone, window dates, and current-term policy are missing. |
| Courses/prerequisites | **BLOCKED** | Course definition exists; prerequisites, curriculum versioning, credits, co-requisites, transfer credit, and cycle validation do not. |
| Offerings/sections/enrollment | **BLOCKED** | Offering table exists only as a minimal course-term-code row. Sections, capacity, schedule, enrollment lifecycle, waitlist, concurrency, and registration rules are absent. |
| Teacher assignment | **BLOCKED** | No assignment table/service; current role guard does not apply scopes or course ownership. |
| Assignments/exams/submissions/grades | **BLOCKED** | No backend tables/APIs/audit/publication rules; frontend contracts alone are not implemented services. |
| Roles/permissions/RLS | **PARTIAL / BLOCKED** for production object access | Catalog reads require session and canonical roles. Existing student self-reads now also enforce the authenticated user's ownership and active student role. A reusable scoped permission service is tested, but not applied to management endpoints because none exist and academic permission grants are not approved. Teacher section assignment and PostgreSQL RLS remain unavailable. |
| Legacy student data | **APPROVED BY EXISTING REQUIREMENTS** | Preserve old fields and profile route; migration complies by not altering/backfilling them. Any crosswalk or response extension needs explicit review. |
| Migration/recovery | **BLOCKED** | Local tests pass, but production preflight, migration-ledger reconciliation, backup/restore rehearsal, lock/maintenance plan, target grants, and explicit execution approval are absent. |

## Recommended approval sequence

1. Academic owner approves domain definitions and policies in `ACADEMIC_APPROVAL_DECISIONS.md`.
2. DBA reviews a revised migration addressing permanent code reservation, placement interval integrity, audit, lifecycle, FK indexes, and target PostgreSQL prerequisites.
3. Security owner reviews permission/scope/ownership and the explicit choice to use or not use RLS; add negative object-authorization tests.
4. Product/API owners align pagination and catalog compatibility contracts.
5. Rehearse migration and rollback/recovery on an isolated production-like database and backup; inspect plans and lock duration.
6. Only after separate, explicit change approval: deploy additive schema, verify migration ledger/health, load approved catalog records via an approved data process, then enable the catalog read flag. Keep writes disabled until their full policy/tests exist.

**Current finding:** no production readiness certificate, no Neon inspection or migration, and no production feature-flag enablement. Local development flags were enabled only for a smoke test against disposable PostgreSQL/Redis; the local services were stopped and removed. The Vite route smoke test confirmed SPA delivery, not browser rendering or device behavior.

## Provisional authorization foundation

See `ACADEMIC_AUTHORIZATION.md` for the precise enforcement contract and test evidence. The policy does not create permissions or institutional role rules. It denies global-only administration, requires an exact active scope and matching `role_permissions` grant, and refuses teacher access until a real section-assignment model exists. Student `/me` reads use the session user as owner and require an active student role assignment; the assignment may be scoped because these endpoints return only that student's own record. This is a safe development foundation, not production approval; actual isolated-PostgreSQL grants and authorization workflows remain unverified.
