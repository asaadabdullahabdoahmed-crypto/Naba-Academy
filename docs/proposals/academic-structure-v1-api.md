# Academic Structure v1 API Proposal

**Status:** Approval-gated review proposal. The legacy student academic-profile endpoint remains the only operational/live academic API. Provisional catalog read code has been added behind a default-off feature flag; it is not live-ready until the schema and vocabulary are approved and deployed.

**Base path:** `/api/v1`
**Data source:** Proposed schema in `academic-structure-v1-migration.sql`. No catalog records are seeded.

The provisional development implementation uses a separate TypeORM migration with a credential-level reference table, dated placement history, terms, courses, and term-specific offerings. It remains approval-gated and the catalog-read feature flag is off by default; this proposal's current-only placement shape is retained here as a historical review artifact, not as the implementation schema.

Implementation boundary: paginated catalog reads return active rows only; `includeInactive` is rejected. Program ID lookup can return inactive, non-deleted catalog records for historical interpretation. The existing student profile remains legacy-only, and no catalog or placement write operation is provided.

## Relationships and profile linking

`colleges` own departments; departments own academic programs. A student's normalized current placement is an optional one-to-one `student_academic_profiles` row linking the existing `users.id` to an `academic_programs.id`. Department and college are derived through that program, avoiding duplicated or inconsistent foreign keys. This verifies the structural path `user -> program -> department -> college`; it does not by itself prove that the linked user has the `student` role. Any future assignment operation must enforce student eligibility and ownership in the service layer.

The existing `users.department_id`, `department_ar`, `department_en`, `college_ar`, and `college_en` columns remain unchanged for compatibility. `department_id` is a nullable `VARCHAR(100)`, not a foreign key to the proposed UUID department IDs. Existing rows are not assigned a program by matching free-form names or IDs: their values may be stale, ambiguous, or use a different identifier namespace. Until an institution-approved crosswalk is reviewed, those profiles remain unlinked and the existing response fields remain available as legacy values.

The existing `GET /api/v1/students/me/academic-profile` is implemented and currently returns only those five legacy fields. Its route, field names, values, and current response envelope must not be changed as part of this proposal. Add the normalized field compatibly; clients must tolerate it being absent during rollout and `null` for unlinked users. The current backend controller returns a flat payload, while the general API standard documents success envelopes; confirm the deployed/consumer contract before changing envelope behavior. Do not silently wrap this existing response.

The proposed profile table represents only one current placement. It does not record transfers, effective dates, prior programs, admissions, enrollment, or degree conferral. Requirements for historical student-program assignments must be decided before implementing any write/transfer workflow; do not overwrite a placement when a history record is required.

The project requirements name colleges, departments, majors, programs, study plans, and degree requirements as related but distinct concepts. This proposal models only colleges, departments, and academic programs. Before implementation, the institution/product owner must confirm whether `academic_programs` represents a major, a degree pathway, or another approved catalog concept; do not treat it as a study plan or degree-requirements model.

## Authorization and transport

- Every endpoint requires a valid session; missing or invalid sessions return `401`.
- Catalog reads require one of `system_admin`, `department_head`, `instructor`, or `student`; an authenticated user without an allowed active role receives `403`.
- `includeInactive=true` is restricted to `system_admin`; soft-deleted records are never returned by these routes. The `department_head` role is scoped in the identity model; confirm whether/how that scope applies before adding department-private data. These proposed catalog summaries contain no private records.
- The existing `GET /students/me/academic-profile` remains student-only and is `Cache-Control: no-store`.
- Responses use the project's standard success/error envelopes. List routes use the standard `page`/`pageSize` pagination metadata.
- New catalog endpoints use the standard success/error envelopes and pagination metadata. This envelope rule does not retroactively alter the existing student endpoint.
- Invalid UUID/query values return the standard validation error; missing or filtered-out records return the standard not-found error. `includeInactive` does not expose soft-deleted records.
- This proposal adds no self-service academic assignment or catalog mutation route. Any later assignment flow must authorize its scope, verify that the target user is a student, and record an auditable change before it is exposed.

## Proposed endpoints

| Method and path | Access | Contract |
|---|---|---|
| `GET /api/v1/academic/colleges` | All four canonical roles | Paginated active college summaries. `includeInactive` is system-admin-only. |
| `GET /api/v1/academic/colleges/:collegeId/departments` | All four canonical roles | Paginated departments belonging to a visible college. |
| `GET /api/v1/academic/departments/:departmentId/programs` | All four canonical roles | Paginated programs belonging to a visible department. |
| `GET /api/v1/academic/programs/:programId` | All four canonical roles | One visible program, with its department and college summaries. |
| `GET /api/v1/students/me/academic-profile` | Student | Existing endpoint; preserve the five legacy fields and add normalized placement compatibly when linked. |

### Catalog summary fields

College: `id`, `code`, `nameAr`, `nameEn`, `status`.

Department: `id`, `collegeId`, `code`, `nameAr`, `nameEn`, `status`.

Program: `id`, `departmentId`, `code`, `nameAr`, `nameEn`, `credentialLevel`, `status`.

**Credential terminology is unresolved.** Do not treat the proposal's former list (`certificate`, `diploma`, `associate`, `bachelor`, `postgraduate_diploma`, `master`, `doctorate`) as approved or seed it. Existing requirements use broad undergraduate/postgraduate terms, while mock/UI strings include differing degree/diploma labels; none is an authoritative institutional data dictionary. The institution must approve the exact codes, definitions, and bilingual display labels before constraining the database or publishing a closed API union. Until then, the API field is a string sourced only from approved catalog data; no catalog data is proposed here.

These are new catalog contracts, not replacements for the existing `src/contracts/academic.ts` program contract (`titleAr/titleEn`, `degreeAr/degreeEn`). Coordinate any frontend mapping explicitly; do not rename or reinterpret fields in the existing contract under this proposal.

### Student profile response

Keep the current flat legacy fields unchanged and add an optional-during-rollout `academicStructure`. The object below describes the **data payload only**, not a change to the existing endpoint's response envelope. IDs and names are illustrative wire-shape placeholders, not proposed institutional records.

```json
{
  "departmentId": "legacy department identifier or null",
  "departmentAr": "legacy department name or null",
  "departmentEn": "legacy department name or null",
  "collegeAr": "legacy college name or null",
  "collegeEn": "legacy college name or null",
  "academicStructure": {
    "program": {
      "id": "uuid",
      "code": "institution-approved code",
      "nameAr": "program name",
      "nameEn": "program name",
      "credentialLevel": "institution-approved value"
    },
    "department": { "id": "uuid", "code": "code", "nameAr": "name", "nameEn": "name" },
    "college": { "id": "uuid", "code": "code", "nameAr": "name", "nameEn": "name" }
  }
}
```

`academicStructure` is `null` when the student's profile has no verified program link. It may be absent from older server responses during rollout. Behavior for a linked program that is later made inactive or soft-deleted must be specified before implementation; do not silently substitute legacy text or imply that an inactive placement is current.

## Confirmed schema review and required safeguards

- The FK chain is `departments.college_id -> colleges.id`, `academic_programs.department_id -> departments.id`, `student_academic_profiles.user_id -> users.id`, and nullable `student_academic_profiles.academic_program_id -> academic_programs.id`. Derive college and department through the program; do not add duplicate profile FKs.
- `ON DELETE RESTRICT` protects referenced catalog rows and users from physical deletion. Soft deletion is separate: callers must filter `deleted_at IS NULL`, and `deleted_at` requires `status = 'inactive'`. Parent deactivation/deletion cannot be enforced by a simple row constraint; a transactional catalog service must prevent an active child from being orphaned under an inactive/deleted parent.
- Codes are nonblank, trimmed, case-insensitively unique in their intended scope, including inactive and soft-deleted rows. This intentionally prevents identifier reuse. The composite unique indexes also cover the child-side FK lookup, so separate `college_id`/`department_id` indexes are redundant. Keep a partial profile `academic_program_id` index for non-null reverse lookups.
- The database cannot ensure `student_academic_profiles.user_id` has a student role with the current role-assignment schema. Enforce that in any authorized write service; new placements must also target active, non-deleted catalog rows. The current profile GET already requires the student role.
- `updated_at DEFAULT now()` initializes the value but does not update it on SQL `UPDATE`; use TypeORM `UpdateDateColumn`/application updates or explicitly approve a database trigger. Do not assume the SQL default is an update mechanism.

## Implementation plan (approval-gated)

1. **Pre-migration decisions:** Confirm whether `academic_programs` means a major, degree pathway, or other catalog concept; ratify credential-level codes and bilingual labels; decide whether this table is current placement only or whether transfer/effective-date history is needed; approve code uniqueness/reuse and inactive/deleted-link display policies; verify the legacy-to-catalog crosswalk approach and record counts without modifying data.
2. **Migration:** After explicit Neon approval, translate the reviewed DDL into a timestamped TypeORM `MigrationInterface` under `backend/src/database/migrations/`. Add entities and repositories in the same implementation stage. Keep all existing `users.*` fields and rows; create no seed/catalog rows and do not auto-link users. Review FK/index behavior and migration SQL before any execution.
3. **API:** Add read-only catalog routes with canonical envelopes, UUID/query validation, filtering/pagination, session/role checks, and integration tests. Extend the existing student controller response additively, retaining its current five fields, route, student-only guard, no-store header, and response format. Do not add catalog or profile write endpoints without approved authorization, audit, and history requirements.
4. **Frontend:** Add separate catalog transport contracts rather than changing existing academic contracts. Consume normalized placement when present; retain legacy display fallback when `academicStructure` is absent/null. Do not add catalog options or real records before institution-approved catalog data exists.
5. **Testing:** Cover migration up/down on an isolated PostgreSQL database; FK and uniqueness violations (including case variants), soft-delete filtering, deletion restrictions, and active-child lifecycle; API roles/status/pagination/envelopes and current-profile backward compatibility; frontend absent/null/present response states. Run static checks and focused tests, with no production/Neon execution as part of proposal approval.
6. **Rollback:** Before any real data is written, revert only via the reviewed TypeORM down migration if it is lossless and approved. Once catalog or profile data exists, dropping these tables is destructive; prefer a forward corrective migration, and use a verified backup/restore only under an approved recovery plan. Do not run the commented SQL drops as an operational rollback.

**Exact next step before Neon approval:** obtain institutional sign-off on what an academic program represents, the credential vocabulary, current-vs-historical placement scope, identifier reuse, and inactive-link policies; then have the database owner review the final TypeORM migration and query plan. No Neon connection, catalog insert, or migration execution is part of this proposal review.
