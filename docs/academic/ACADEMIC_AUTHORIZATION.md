# Academic Authorization Foundation

**Status:** Provisional authorization foundation plus user-approved, default-disabled Batch 3 development workflows. The added code is not institutional production approval; no production flag, role grant, migration, or deployment was activated.

## Trust boundary and enforcement

- `SessionAuthGuard` validates the server-side session and attaches the database-loaded user; it rejects missing, expired, revoked sessions and non-active/unverified accounts. Never derive identity from request parameters, headers, or frontend state.
- `RolesGuard` remains the coarse role gate. It accepts only non-revoked role assignments whose `assigned_at` is not in the future. Role checks do not imply permission, resource ownership, or a wider scope.
- `AcademicAuthorizationService.assertStudentOwns` checks an active, verified session principal, exact owner identity, and an active `student` role assignment regardless of its scope. It is applied to the existing `/students/me/academic-profile` and `/students/me/academic-placement` reads. Their APIs continue deriving user ID from `@CurrentUser`; there is no user-ID route parameter. Self-ownership does not grant access to another student's data or to scoped management operations.
- `AcademicAuthorizationService.assertScopedPermission` is the reusable backend policy for future scoped operations. It requires an active verified principal, one exact non-global scope assignment, a live database scope/hierarchy, and an explicit matching `role_permissions` grant. It rejects missing, revoked, future-dated, mismatched, duplicate/ambiguous, unknown, and inactive assignments/scopes. A global administrator role does not confer access to a department without an explicit department assignment.
- `department` and `program` scopes are checked against active, non-deleted catalog rows and active parents. `course_offering` scopes verify the offering and its course/term hierarchy; an `instructor` is nevertheless denied because a course offering is not a section assignment.

## Current capability and deliberate denials

- Existing student self-reads retain session and student-role guards, no-store responses, server-derived owner IDs, and service-level owner/active-role checks. Batch 3 adds private section/roster/enrollment operations behind `ACADEMIC_OPERATIONS_ENABLED=false` by default.
- Catalog reads remain shared, read-only, session/role gated and feature-disabled by default; they expose no private student records and have no mutation endpoints.
- The Batch 3 implementation adds sections, teacher-to-section assignments, roster/enrollment relations, and management/self-service endpoints. A `course_offering` remains distinct from a section and does not establish teacher ownership.
- The identity schema has `department`, `program`, and `course_offering` assignment scopes, but no `section` scope. Role assignments have assignment and revocation timestamps, but no explicit expiration timestamp or independent active flag. The implementation uses non-revoked and not-future-dated assignments; expiration policy remains a schema/product decision.
- `permissions` and `role_permissions` are modeled, but production academic permission codes and grants have not been approved/seeded. The reusable policy denies if no exact grant exists. No role or permission is seeded or implicitly privileged here.

## Test evidence and remaining work

The policy unit tests cover inactive/anonymous identities, self-ownership, missing assignments and permissions, future/revoked assignment query constraints, global-admin-without-local-scope denial, cross-department and cross-offering scope mismatch, inactive/missing scopes, ambiguity, and valid explicitly scoped administrator access. Teachers with course-offering assignments are still denied because section assignments do not exist. Existing RolesGuard tests cover missing identity/role; SessionAuthGuard tests cover anonymous rejection and attaching only the server-validated identity. Student HTTP tests attempt to spoof another user through a query parameter and header and verify the backend still uses the authenticated session user.

These earlier policy tests are repository/mock-based and do not prove production permission seeding. Batch 3 adds an isolated PostgreSQL integration test for exact section ownership, department scope, role revocation, capacity locking, history, and enrollment windows. No production HTTP/browser session or permission-provisioning process is claimed.

## Production blockers and approval boundary

Before any management feature is enabled in a target environment, approve permission codes/grants, which roles may manage each resource, scope inheritance (if any), assignment lifecycle/expiry/revocation, and parent-scope semantics. The development implementation does not add a global-admin bypass. Production feature flags remain disabled pending schema and owner approval.

## Batch 3 operations authorization — isolated development

- **Admin:** route role guards admit `system_admin` and `department_head`; service checks additionally require the exact active department assignment and the corresponding persisted permission (`academic.sections.manage`, `academic.teacher_assignments.manage`, or `academic.enrollments.manage`). No global-role bypass exists. A client-supplied department ID only filters a query; the offering's department is loaded and authorized server-side.
- **Teacher:** reads require an active verified principal, active `instructor` assignment and `academic.sections.read` grant for the department, plus a non-revoked assignment to the requested section. Roster queries return active enrollments only.
- **Student:** session-derived identity only; active verified user, active student role and current active placement in the section department are required for writes. Enrollment history and cancellation are owner-checked against the authenticated user; route inputs cannot select another student for self-service.
- The migration seeds no grants. Administrators must not be assumed authorized until valid scoped grants exist. The controller's coarse role decorator is not a substitute for service-level authorization.
- All operations controller routes call the service-side feature gate; the server flag `ACADEMIC_OPERATIONS_ENABLED` defaults to false. Flag activation remains outside this development authorization.
- The isolated integration suite verifies section/department ownership, assignment revocation, student enrollment ownership and concurrent capacity behavior using synthetic users. It is not a production threat model or deployment approval.

Detailed endpoint and verification status is in `MVP_BATCH_3_REPORT.md`.
