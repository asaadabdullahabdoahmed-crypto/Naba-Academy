# Academic Migration Plan

**Status: PROVISIONAL MIGRATION PREPARED; LIVE USE BLOCKED FOR APPROVAL.** This is a safe local-development design, not authorization to execute against Neon or deploy. `docs/proposals/academic-structure-v1-migration.sql` is review SQL only and must not be run directly.

## Scope held for v1

The provisional TypeORM migration covers colleges, departments, configurable credential levels, academic programs, dated student placement history, academic terms, course definitions, and term-specific course offerings. It does not include enrollment, teacher assignments, learning, assessment, grading, or student result history. No data or seed values are included.

## Approval gates before live use or feature enablement

Obtain recorded institutional/product and database-owner decisions for:

1. The meaning and ownership of `academic_programs` (major, degree pathway, or another concept).
2. Approved credential-level codes and Arabic/English labels, plus lifecycle/retirement rules for the configurable reference table. No vocabulary values are seeded.
3. Placement history semantics, effective-date boundaries, and a transactional no-overlap policy.
4. The behavior of student reads when the linked program or a parent catalog record becomes inactive or deleted.
5. Code uniqueness and reuse policy; the proposal reserves codes forever, including after soft deletion.
6. Parent/child catalog lifecycle rules and any scoped department-head operations.
7. Any future process for verifying and approving a legacy-to-catalog crosswalk.
8. The deployed legacy profile response/envelope compatibility requirements.

Until those gates are resolved, no schema component or API should be treated as production-ready. `ACADEMIC_CATALOG_READS_ENABLED` must remain false, no inferred catalog data or user-to-program mapping is allowed, and no new write API is authorized.

## Migration implementation sequence after approval

1. Reconfirm current `main` and migration conventions without disturbing local work.
2. Review and amend the provisional additive TypeORM migration at `backend/src/database/migrations/1793299914088-CreateAcademicFoundation.ts` against the approved design.
3. Confirm entities are registered through Nest's `autoLoadEntities` and the academic module's `TypeOrmModule.forFeature`.
4. Preserve all existing `users` academic columns and rows. Do not seed catalog data or auto-link users.
5. Implement catalog read services only when the schema and authorization contract are available; implement no writes without audited policy.
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
- After catalog or placement data exists, dropping tables is destructive and is not the default rollback. Prefer a forward corrective migration or an approved, verified backup/restore recovery plan.
- Never run the commented `DROP TABLE` statements in the proposal against a shared or production database.
- Do not reset, drop, or repurpose any database for migration testing.

## Current execution record

- TypeORM academic migration prepared: **Yes**, provisional additive design.
- Migration executed against Neon/shared/live data: **No**.
- Migration `up`/`down` executed in isolated local PostgreSQL tests: **Yes**, test fixtures only; the database was empty after cleanup.
- Neon contacted by this phase: **No**.
- Academic seed/backfill/user mapping performed: **No**.
- Read APIs implemented: **Yes**, but default-disabled; no live integration.

## Exact next action

Record institutional answers to the eight approval gates above. Review the provisional migration with the database owner, then separately approve any target-environment schema rollout before enabling the catalog feature flag. Do not represent the prepared catalog APIs or selectors as live functionality.
