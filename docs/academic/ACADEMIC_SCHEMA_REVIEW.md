# Academic Schema Review

**Status: provisional code prepared; no academic schema migration has been approved or executed outside isolated local tests.** The earlier v1 proposals remain review artifacts and differ from the provisional development schema described here.

## Current versus proposed

| Area | Current documented implementation | v1 proposal | Result |
|---|---|---|---|
| Identity/student academic data | Existing `users` record has legacy `department_id`, `department_ar`, `department_en`, `college_ar`, and `college_en` fields. | Preserve these fields and add a separate normalized profile link. | Backward compatibility is required; legacy IDs/text cannot be treated as catalog FKs. |
| Student profile endpoint | `GET /api/v1/students/me/academic-profile` is implemented, student-only, no-store, and returns the five flat legacy fields. | Add nullable `academicStructure` only after a normalized placement exists; do not change route, legacy fields, or envelope. | Endpoint behavior must remain stable and an unlinked profile must not be fabricated. |
| Catalog | No catalog tables or data exist in the live environment by implication. | Additive colleges, departments, configurable credential levels, and academic programs; read code is default-disabled. | Provisional code only; blocked from live enablement pending schema approval and execution. |
| Student placement | No operational normalized link is identified. | `student_academic_placements` stores dated program history; one open/current row per user. | Provisional history model; no backfill or write API; role eligibility and non-overlap require service policy. |
| Program/credential meaning | Existing frontend contract is separate and uses `titleAr`/`titleEn` and `degreeAr`/`degreeEn`. | Catalog uses `nameAr`/`nameEn` and `credentialLevel`. | Keep contracts distinct; do not reinterpret existing degree labels or publish an unapproved vocabulary. |
| Terms, courses, offerings | No operational academic scheduling API is identified. | Additive academic terms, independent course definitions, and term-specific course offerings. | Foundation only; no enrollment, roster, teaching assignment, or registration behavior. |
| Other academic operations | No enrollment, learning, submission, exam, grading, or progress API is listed as implemented. | Not included in this provisional foundation. | Requires separate requirements, schema/API proposals, and authorization design. |

## Candidate v1 integrity review

The proposal has a coherent relational chain:

```text
users <- student_academic_profiles -> academic_programs -> departments -> colleges
```

The program is the only placement FK; department and college should be derived rather than duplicated on the student profile. The proposed FKs use `ON DELETE RESTRICT`, which protects referenced rows from physical deletion. Catalog codes are nonblank and case-insensitively unique at their defined scope, including inactive/soft-deleted records, so identifiers are not reused. Partial uniqueness by active status is intentionally not proposed.

Additional implementation requirements before approval:

- Application reads must filter `deleted_at IS NULL`; a soft-deleted catalog row is inactive.
- A service transaction must prevent active children from remaining under inactive/deleted parents.
- Placement writes must verify an active student role and an active, non-deleted catalog path; FKs alone do not provide these checks.
- `updated_at` requires ORM/application update behavior or an explicitly approved trigger; a default only initializes the column.
- UUID and query validation, pagination bounds, stable ordering, and the agreed success/error envelopes must match backend conventions.
- Query/index behavior must be confirmed using representative explain plans before production use.
- The migration must preserve every existing user academic column and must not backfill normalized links automatically.
- Local migration tests use a disposable PostgreSQL instance; Neon was not contacted.

## Compatibility and API mismatches to preserve

- The current profile controller returns a flat payload. General API documentation describes envelopes for standard endpoints, but the proposal explicitly preserves this existing endpoint's response. Confirm deployed clients before any envelope change.
- The current profile endpoint's fields are not equivalent to the proposal's normalized catalog representation. Keep `departmentId` as its current legacy value.
- The frontend academic contract uses `title*` and `degree*`; the proposal uses catalog `name*` and `credentialLevel`. A future integration needs an explicit adapter and verified source data.
- The new catalog endpoint proposal calls for paginated standard envelopes. It is not safe to add database-backed routes before the tables and role semantics exist.
- The proposal omits terms, courses, sections, enrollment, assessments, and results; those concepts cannot be safely filled in by extending this migration without approved requirements.

## TypeORM migration and endpoint readiness

The review SQL must not be run directly. A timestamped TypeORM migration (`backend/src/database/migrations/1793299914088-CreateAcademicFoundation.ts`) is prepared for isolated development under provisional assumptions. It is not approved for production. It is additive, seeds no catalog rows, does not alter `users`, and refuses to drop tables containing data during rollback.

When approved, migration review must verify:

- Additive-only DDL; no changes or removal of legacy user academic fields.
- Explicit names for constraints and indexes and consistent TypeORM `up`/`down`.
- FK ordering and `ON DELETE RESTRICT`; no cascade that erases academic history.
- Case-insensitive uniqueness and scope exactly as approved.
- Driver support for UUID generation and any extension/function prerequisites in the target environment.
- Whether rollback is safe only before data exists; after writes, prefer forward corrective migrations and an approved recovery plan.
- Migration tests run only against a disposable isolated PostgreSQL database, never Neon.

## Safe conclusion

Catalog read routes are implemented with sessions, role guards, validation, stable sorting, search, pagination, and standard response envelopes, but remain disabled by default. Selector lists return active rows; an ID lookup can return inactive, non-deleted catalog ancestry with statuses for historical interpretation. Soft-deleted records are hidden. The routes are not safe to enable where the schema has not been separately approved and deployed. The only operational/live academic API remains the existing own-profile read, which exposes legacy data only; normalized placement history has no read route yet. Do not create real catalog rows, guess links, execute SQL against Neon, or use live data as a test fixture.
