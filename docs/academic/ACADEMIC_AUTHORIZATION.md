# Academic Authorization Foundation

**Status:** Provisional development foundation. These rules are not institutional production approval. No academic write endpoint or teacher/administrator workflow is enabled by this document.

## Trust boundary and enforcement

- `SessionAuthGuard` validates the server-side session and attaches the database-loaded user; it rejects missing, expired, revoked sessions and non-active/unverified accounts. Never derive identity from request parameters, headers, or frontend state.
- `RolesGuard` remains the coarse role gate. It accepts only non-revoked role assignments whose `assigned_at` is not in the future. Role checks do not imply permission, resource ownership, or a wider scope.
- `AcademicAuthorizationService.assertStudentOwns` checks an active, verified session principal, exact owner identity, and an active global `student` role assignment. It is applied to both existing `/students/me/academic-profile` and `/students/me/academic-placement` reads. Their APIs continue deriving user ID from `@CurrentUser`; there is no user-ID route parameter.
- `AcademicAuthorizationService.assertScopedPermission` is the reusable backend policy for future scoped operations. It requires an active verified principal, one exact non-global scope assignment, a live database scope/hierarchy, and an explicit matching `role_permissions` grant. It rejects missing, revoked, future-dated, mismatched, duplicate/ambiguous, unknown, and inactive assignments/scopes. A global administrator role does not confer access to a department without an explicit department assignment.
- `department` and `program` scopes are checked against active, non-deleted catalog rows and active parents. `course_offering` scopes verify the offering and its course/term hierarchy; an `instructor` is nevertheless denied because a course offering is not a section assignment.

## Current capability and deliberate denials

- Student self-reads are the only private academic operations currently exposed. They have session and student-role guards, no-store responses, server-derived owner IDs, and service-level owner/active-role checks.
- Catalog reads remain shared, read-only, session/role gated and feature-disabled by default; they expose no private student records and have no mutation endpoints.
- There are no academic management-write endpoints, authoritative department-admin assignment workflow, section entity, teacher-to-section assignment, roster/enrollment, or student-to-section relation. Do not treat `course_offering` as a section or implement teacher roster access from it.
- The identity schema has `department`, `program`, and `course_offering` assignment scopes, but no `section` scope. Role assignments have assignment and revocation timestamps, but no explicit expiration timestamp or independent active flag. The implementation uses non-revoked and not-future-dated assignments; expiration policy remains a schema/product decision.
- `permissions` and `role_permissions` are modeled, but production academic permission codes and grants have not been approved/seeded. The reusable policy denies if no exact grant exists. No role or permission is seeded or implicitly privileged here.

## Test evidence and remaining work

The policy unit tests cover inactive/anonymous identities, self-ownership, missing assignments and permissions, future/revoked assignment query constraints, global-admin-without-local-scope denial, cross-department and cross-offering scope mismatch, inactive/missing scopes, ambiguity, and valid explicitly scoped administrator access. Teachers with course-offering assignments are still denied because section assignments do not exist. Existing RolesGuard tests cover missing identity/role; SessionAuthGuard tests cover anonymous rejection and attaching only the server-validated identity. Student HTTP tests attempt to spoof another user through a query parameter and header and verify the backend still uses the authenticated session user.

These are repository/mock-based tests, not proof of database transaction isolation or production permission seeding. No successful teacher or department administrator HTTP workflow is claimed. Add integration tests only after approved permissions and real section/assignment entities exist.

## Production blockers and approval boundary

Before any management feature is enabled, approve permission codes/grants, which roles may manage each resource, scope inheritance (if any), assignment lifecycle/expiry/revocation, and parent-scope semantics. Implement authoritative section and teacher assignments plus roster/enrollment relationships before teacher access. Add audited assignment administration and integration tests using isolated PostgreSQL. Do not add a global-admin bypass. Production feature flags remain disabled pending schema and owner approval.
