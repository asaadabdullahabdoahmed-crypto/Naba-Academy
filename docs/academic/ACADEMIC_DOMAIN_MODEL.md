# Academic Domain Model

**Status: provisional implementation for isolated development; not an institution-approved data model.** The current user request authorizes preparatory code only. It does not authorize live schema execution, data imports, or write APIs.

## Current implementation boundary

- The operational academic API is `GET /api/v1/students/me/academic-profile`. Provisional, feature-gated catalog GET APIs and a student-only current-placement read are also implemented, but are not operational until the approved schema is deployed and the backend flag is explicitly enabled.
- That endpoint is student-only and returns the existing legacy fields: `departmentId`, `departmentAr`, `departmentEn`, `collegeAr`, and `collegeEn`.
- The values come from the existing identity/user record. `departmentId` is legacy text, not a verified FK to a proposed academic department.
- Provisional TypeORM migrations describe an optional university → college → department → program catalog, configurable credential levels, dated placements, terms, courses, and course offerings. The migrations have only been exercised on disposable local PostgreSQL.
- Catalog read routes are implemented behind `ACADEMIC_CATALOG_READS_ENABLED=false` by default. They are not operational in an environment without the approved schema and explicit feature enablement. No catalog records are seeded.
- The admin academic-structure page is integrated as a read-only catalog browser; the student profile can display a verified current placement. Both remain disabled by default and do not write data.
- Courses, terms, sections, enrollment, learning, assessment, examination, and grade APIs are not represented by this v1 proposal and must not be inferred to exist.

## Proposed concepts and ownership

| Concept | Proposed responsibility and relationship | Key/lifecycle notes | Approval status |
|---|---|---|---|
| University | Optional institution-controlled parent of colleges. | UUID primary key; case-insensitive stable code; bilingual nonblank names; active/inactive status; timestamps and soft-delete timestamp. Existing colleges remain unlinked unless separately approved and verified. | **New provisional assumption:** whether this level belongs in the institutional hierarchy and whether every college must link to one require approval. |
| College | Institution-controlled catalog parent; optionally belongs to a university and owns departments. | UUID primary key; nullable `university_id` FK for compatibility; case-insensitive code unique across all rows; bilingual nonblank names; active/inactive status; timestamps and soft-delete timestamp. Referenced rows are not physically deleted. | Shape proposed; the university relationship, institutional vocabulary, and lifecycle still require approval. |
| Department | Institution-controlled child of one college; owns academic programs. | UUID primary key; `college_id` FK; code unique case-insensitively within the college; bilingual names; same status and deletion policy. | Shape proposed; lifecycle and parent-deactivation behavior require an approved administrative policy. |
| Credential level | Configurable bilingual reference record, referenced by programs; no vocabulary values are seeded. | UUID key; stable case-insensitive code; active/inactive lifecycle and soft deletion; referenced levels cannot be physically deleted. | **Provisional shape only:** vocabulary and labels require institutional approval. |
| Academic program | A defined study pathway in the isolated-development assumption; child of one department and linked to a credential reference. | UUID primary key; department and credential FKs; case-insensitive code uniqueness within department; bilingual names. | **Provisional meaning only:** institution must approve whether “program” means this, a major, or another pathway. |
| Student academic placement | Dated history linking an existing user to a program. | UUID key; user and program FKs use `ON DELETE RESTRICT`; at most one row with no `effective_to` per user; legacy fields remain intact. | **Provisional history shape:** overlap prevention, transfer rules, and student-role eligibility require approved write policy. |
| Academic term | Time-bounded institution-controlled catalog item, distinct from a course. | UUID key; stable code; start/end dates; planned/active/completed/cancelled lifecycle and soft deletion. | **Provisional shape only:** term vocabulary and calendar policies require approval. |
| Course | Department-owned catalog definition, independent of terms. | UUID key; stable code unique case-insensitively within department; bilingual names; active/inactive lifecycle. | **Provisional foundation only:** curriculum and credit semantics are not modeled. |
| Course offering | Course instance in an academic term; multiple offering codes may exist for a course-term pair. | UUID key; course and term FKs use `ON DELETE RESTRICT`; code unique within that pair; planned/open/closed/cancelled lifecycle. | **Provisional foundation only:** enrollment, capacity, teacher assignment, and registration policies are not modeled. |

The earlier v1 review SQL covered colleges, departments, programs, and one current placement. The provisional migrations add an optional university grouping, credential levels, dated placement history, terms, courses, and term-specific offerings under current development assumptions. They do not add a separate major, study plan, degree requirement, enrollment, learning module, assignment, submission, examination, attempt, grade, or progress entity; those remain unsupported until requirements and lifecycle rules are approved.

## Identity, keys, and data integrity in the proposal

- IDs are UUIDs. Catalog codes are trimmed, nonblank, case-insensitively unique in their scope and remain reserved after deactivation or soft deletion.
- Names are bilingual and nonblank. Status is `active` or `inactive`; a soft-deleted catalog record must be inactive.
- `colleges.university_id` is nullable; `departments.college_id`, `academic_programs.department_id`, `academic_programs.credential_level_id`, and the placement user/program FKs are required. Course offerings reference a course and academic term independently.
- Catalog and profile FKs restrict physical deletion. Soft deletion is separate and requires read queries to exclude deleted rows.
- The child-leading composite unique indexes also support the proposed FK lookups. The proposed profile program index is partial and covers non-null program links.
- `updated_at DEFAULT now()` initializes a value; it does not maintain the value on arbitrary SQL updates. A future TypeORM implementation must use its update-date behavior or an explicitly approved database mechanism.
- The database cannot establish that a linked `users.id` has an active student role with the described role-assignment model. Any future placement write must check student eligibility in the service layer.
- A transactional catalog service must prevent an active child from being left under an inactive or deleted parent. A row-level check alone does not enforce that cross-row lifecycle rule.
- The schema allows at most one current placement but does not prevent overlapping closed historical date ranges. Any future transfer workflow must validate non-overlap transactionally and record an auditable history.

## Placement and historical preservation

The provisional schema allows dated placement history, not admissions, enrollment, or degree conferral. Its history shape does not authorize a transfer workflow. Therefore:

- Do not overwrite or create a normalized placement based on legacy names or identifiers.
- Do not infer identity between legacy `departmentId` and a proposed UUID department ID.
- Keep all current free-form user academic fields and the existing profile response intact.
- A transfer/history write workflow still requires approved effective-date semantics, authorization, and audit requirements.
- Behavior for a linked program that later becomes inactive or soft-deleted is unresolved. A read must not silently represent it as a valid current placement or substitute unverified legacy text.

## Program and credential terminology

The proposal does not establish whether “program” is a major, a degree pathway, or another institutional unit. It also does not approve any credential-level codes or bilingual labels. Earlier example values are expressly not an approved dictionary.

Until the institution approves definitions and codes:

- Keep `credentialLevel` open as a string only in proposal-level contracts.
- Do not add a closed application enum, database check constraint, seed record, UI option list, or program-to-degree inference.
- Do not present an existing mock `degree` or `program` label as verified catalog data.

## Authorization and API representation

- The current self-profile endpoint remains authenticated, student-only, flat, and `Cache-Control: no-store`; it returns only the legacy fields today.
- The separate `GET /api/v1/students/me/academic-placement` response is student-only, no-store, and returns the current normalized placement (or `current: null`) only when catalog reads are enabled. It does not change the existing legacy profile response.
- Catalog read routes use the session and role guards for canonical academic roles, pagination, search, UUID validation, and standard response envelopes. They are default-disabled; do not enable until an approved schema is deployed.
- The provisional authorization foundation adds student self-ownership checks and a reusable scoped-permission policy over existing identity assignments/grants. It does not enable catalog writes or teacher/admin operations; see `ACADEMIC_AUTHORIZATION.md`.
- Paginated selector routes return active, non-deleted rows only. ID lookups may return inactive, non-deleted catalog records with status for historical interpretation; soft-deleted rows remain hidden. `includeInactive` is deliberately not accepted.
- University routes list/retrieve universities and list their linked colleges; college listing can be optionally filtered by `universityId`. College linkage remains nullable, and no existing college is backfilled.
- There is no normalized placement-history endpoint; only the current open placement is readable by its authenticated student.
- No cross-student profile read, placement assignment, catalog mutation, or teacher/admin academic privilege is currently established by this model.
- Role checks must be paired with record/object scope for any future student placement or teacher course data. Public catalog summaries do not imply access to private student records.

## Compatibility commitments

1. Retain the five legacy profile fields and their current values and route.
2. Do not map legacy free text to catalog IDs without an institution-approved, verified crosswalk.
3. Keep the existing frontend academic contract (`titleAr`/`titleEn`, `degreeAr`/`degreeEn`) distinct from the proposed API catalog field names; use explicit mapping only when real catalog data and an approved contract exist.
4. Do not wrap the legacy profile in a new response envelope without confirming its deployed consumer contract.
5. Do not expose placeholder catalog, enrollment, progress, assessment, or grade data as real records.

## Decisions requiring approval

The schema/API work remains blocked until the institution/product owner resolves:

1. Whether the optional university → college relationship belongs in the official hierarchy and whether colleges may remain unlinked.
2. Whether academic program means a major, degree pathway, or another approved catalog concept.
3. Credential-level codes, definitions, and Arabic/English labels.
4. Whether the provisional dated placement history is accepted; define interval boundaries, non-overlap enforcement, retroactive corrections, transfer reasons, and immutable audit events.
5. How inactive/deleted programs affect existing placements and what should be returned to students.
6. Whether codes may ever be reused (the current proposal says no, including after soft deletion).
7. Catalog parent/child deactivation policy and the scope of department-head administration.
8. An approved legacy-to-catalog crosswalk process, if legacy records are ever to be linked.

No institution names, catalog records, placements, or academic results are created or assumed here.
