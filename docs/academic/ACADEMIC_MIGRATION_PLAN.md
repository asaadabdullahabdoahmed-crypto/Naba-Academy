# Academic Migration Plan

**Status: PROVISIONAL MIGRATION PREPARED; LIVE USE BLOCKED FOR APPROVAL.** This is a safe local-development design, not authorization to execute against Neon or deploy. `docs/proposals/academic-structure-v1-migration.sql` is review SQL only and must not be run directly.

## Scope held for v1

The provisional TypeORM migrations cover an optional university parent for colleges, departments, configurable credential levels, academic programs, dated student placement history, academic terms, course definitions, and term-specific course offerings. The university migration leaves `colleges.university_id` nullable and does not backfill existing colleges. The schema does not include enrollment, teacher assignments, learning, assessment, grading, or student result history. No institutional data or seed values are included.

## Approval gates before live use or feature enablement

Obtain recorded institutional/product and database-owner decisions for:

1. Whether a university is a formal hierarchy level, whether colleges may remain unlinked, and how the university-to-college relation is governed.
2. The meaning and ownership of `academic_programs` (major, degree pathway, or another concept).
3. Approved credential-level codes and Arabic/English labels, plus lifecycle/retirement rules for the configurable reference table. No vocabulary values are seeded.
4. Placement history semantics, effective-date boundaries, and a transactional no-overlap policy.
5. The behavior of student reads when the linked program or a parent catalog record becomes inactive or deleted.
6. Code uniqueness and reuse policy; the proposal reserves codes forever, including after soft deletion.
7. Parent/child catalog lifecycle rules and any scoped department-head operations.
8. Any future process for verifying and approving a legacy-to-catalog crosswalk.
9. The deployed legacy profile response/envelope compatibility requirements.

Until those gates are resolved, no schema component or API should be treated as production-ready. `ACADEMIC_CATALOG_READS_ENABLED` must remain false, no inferred catalog data or user-to-program mapping is allowed, and no new write API is authorized.

## Migration implementation sequence after approval

1. Reconfirm current `main` and migration conventions without disturbing local work.
2. Review and amend the provisional additive TypeORM migrations at `backend/src/database/migrations/1793299914088-CreateAcademicFoundation.ts` and `1793362429913-AddUniversityCatalog.ts` against the approved design.
3. Confirm entities are registered through Nest's `autoLoadEntities` and the academic module's `TypeOrmModule.forFeature`.
4. Preserve all existing `users` academic columns and rows. Do not seed catalog data or auto-link users.
5. Keep the already implemented catalog read service disabled until the approved schema is deployed; review its response contract and authorization behavior against production policy. Implement no writes without audited policy.
6. Test `up` and the data-protecting `down` only on a disposable isolated PostgreSQL instance. Include FK, uniqueness, lifecycle, soft-delete, and query tests.
7. Review generated SQL and query plans; document compatibility and deployment ordering.
8. Obtain separate explicit authorization before any execution against Neon. Never run Neon migrations as part of local verification.

## Compatibility and deployment order

- Deploy additive schema before code that queries it.
- Keep the legacy profile endpoint and its five fields available throughout rollout.
- New clients tolerate an absent or `null` `academicStructure` during a staged rollout.
- Do not enable catalog UI choices until approved catalog records are loaded through an explicitly authorized process.
- Do not expose a new assignment or catalog-write path until role/object authorization, validation, audit, and history policy are approved.

## Rollback and recovery

- Before academic data has been written, a reviewed, tested TypeORM `down` may be considered only if the database owner approves it.
- The provisional rollback methods acquire `ACCESS EXCLUSIVE` table locks before checking for data and hold them through the guarded DDL in one transaction. Locks are requested child-first to match FK-dependent writes. A migration-runner transaction is reused; direct calls create and own a transaction.
- TypeORM CLI migration reverts default to one transaction, including migration-ledger removal. Do not override this with `-t none`; use a planned maintenance window because `ACCESS EXCLUSIVE` also blocks reads while locks are held.
- After catalog or placement data exists, dropping tables is destructive and is not the default rollback. Prefer a forward corrective migration or an approved, verified backup/restore recovery plan.
- Never run the commented `DROP TABLE` statements in the proposal against a shared or production database.
- Do not reset, drop, or repurpose any database for migration testing.

## Current execution record

- TypeORM academic migration prepared: **Yes**, provisional additive design.
- Migration executed against Neon/shared/live data: **No**.
- Both migration `up`/`down` paths executed in isolated PostgreSQL 16 tests: **Yes**, test fixtures only; `naba_academic_test` was empty after cleanup.
- Neon contacted by this phase: **No**.
- Academic seed/backfill/user mapping performed: **No**.
- Read APIs implemented: **Yes**, but default-disabled; no live integration.

## Exact next action

Record institutional answers to the nine approval gates above, beginning with whether the optional university hierarchy is valid. Review both provisional migrations with the database owner, then separately approve any target-environment schema rollout before enabling the catalog feature flag. Do not represent the prepared catalog APIs or selectors as live functionality.
