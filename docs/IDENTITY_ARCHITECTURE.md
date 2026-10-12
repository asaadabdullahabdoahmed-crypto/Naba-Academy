# Naba Academy — Identity & Access Architecture

## 1. Overview & Core Philosophy

The Identity & Access subsystem in Naba Academy provides the security and authentication foundation for all university personas (administrators, department heads, instructors, and students). It is engineered according to strict zero-trust, privacy-first, and data-mapper persistence principles.

---

## 2. Canonical Authorization Roles

Naba Academy V1 defines exactly **four** canonical authorization roles. No additional system roles (such as generic `admin`, `super_admin`, or `faculty_admin`) exist:

| Role Code | Arabic Display Name | English Display Name | Description |
| :--- | :--- | :--- | :--- |
| `system_admin` | مدير النظام | System Administrator | Full platform administrative, configuration, and auditing authority |
| `department_head` | رئيس القسم | Department Head | Scoped or global academic department management, curricula, faculty oversight |
| `instructor` | مدرس | Instructor | Course section delivery, grading, syllabus authoring, student assessment |
| `student` | طالب | Student | Enrolled learner accessing courses, grades, transcripts, and submissions |

### Crucial Architectural Decision: Alumni is NOT an Auth Role
> **Alumni is an academic status and portal persona state, NOT an authorization role.**
> An alumnus is a former student whose graduation requirements have been fulfilled. Alumni access is governed by the user's academic lifecycle state and fine-grained resource permissions, never by assigning a separate `alumni` role in the identity system.

---

## 3. Identity Persistence Model (9 Tables)

The subsystem is implemented using TypeORM Data Mapper (entities never inherit from `BaseEntity` or expose Active Record methods). All UUIDs are generated via PostgreSQL `pgcrypto` (`gen_random_uuid()`).

```
┌─────────────────────────────────────────────────────────────┐
│                            users                            │
│ ─────────────────────────────────────────────────────────── │
│ id (PK UUID)                                                │
│ email / normalized_email (UNIQUE)                           │
│ password_hash (Argon2id)                                    │
│ account_status (pending_verification | active | disabled)   │
│ failed_login_count (smallint >= 0)                          │
│ locked_until (timestamptz NULL)                             │
│ disabled_by_user_id (FK -> users.id)                        │
└─────────────────────────────────────────────────────────────┘
          │                   │                 │
          ▼                   ▼                 ▼
 ┌──────────────────┐ ┌───────────────┐ ┌──────────────────────┐
 │  user_sessions   │ │ user_role_    │ │ user_account_status_ │
 │                  │ │ assignments   │ │ events               │
 └──────────────────┘ └───────────────┘ └──────────────────────┘
          │                   │
          ▼                   ▼
 ┌──────────────────┐ ┌───────────────┐
 │ email_verif_     │ │ roles         │
 │ tokens           │ │               │
 └──────────────────┘ └───────────────┘
          │                   │
          ▼                   ▼
 ┌──────────────────┐ ┌───────────────┐
 │ password_reset_  │ │ role_         │◄─── permissions
 │ tokens           │ │ permissions   │
 └──────────────────┘ └───────────────┘
```

### Table 1: `users`
- Stores user credentials and canonical authentication state.
- `email`: Preserves user-entered casing for display/communication.
- `normalized_email`: Lowercased and trimmed, enforced with a unique database constraint.
- `password_hash`: Argon2id password hash string.
- `email_verified_at`: Timestamp when the user verified their email.
- `account_status`: CHECK constraint enforcing `'pending_verification'`, `'active'`, or `'disabled'`.
- `failed_login_count`: Consecutive failed authentication attempts.
- `locked_until`: Temporary authentication lockout expiry.
- `disabled_at`, `disabled_reason`, `disabled_by_user_id`: Administrative disable metadata.

### Table 2: `roles`
- Seeded with the 4 canonical roles (`system_admin`, `department_head`, `instructor`, `student`).
- Enforced unique on `code`.

### Table 3: `permissions`
- Granular action permissions (to be cataloged in STEP 07E).
- Enforced unique on `code`.

### Table 4: `role_permissions`
- Composite primary key `(role_id, permission_id)`.
- Enforces relational referential integrity with `ON DELETE RESTRICT`.

### Table 5: `user_role_assignments`
- Links a user to a role with an explicit operational scope.
- `scope_type`: CHECK constraint enforcing `'global'`, `'department'`, `'program'`, or `'course_offering'`.
- `scope_id`: UUID of the scoped academic unit, program, or section.
- **Scope Consistency Constraint**:
  ```sql
  CHECK (
    ("scope_type" = 'global' AND "scope_id" IS NULL) OR
    ("scope_type" <> 'global' AND "scope_id" IS NOT NULL)
  )
  ```
- **Active Assignment Uniqueness**:
  - Active global assignment partial unique index: `(user_id, role_id) WHERE revoked_at IS NULL AND scope_type = 'global' AND scope_id IS NULL`
  - Active scoped assignment partial unique index: `(user_id, role_id, scope_type, scope_id) WHERE revoked_at IS NULL AND scope_type <> 'global' AND scope_id IS NOT NULL`
- Revocation metadata: `revoked_at`, `revoked_by_user_id`, `revocation_reason`.

### Table 6: `user_sessions`
- Server-side opaque session records.
- `token_hash`: SHA-256 hash of the random session token transmitted to the client.
- `csrf_token_hash`: SHA-256 hash of the CSRF token.
- `user_agent`, `device_label`, `ip_address`: Session auditing and device listing.
- `created_at`, `last_seen_at`, `expires_at`, `revoked_at`, `revoke_reason`.

### Table 7: `email_verification_tokens`
- Stores verification tokens with `token_hash` (SHA-256).
- `expires_at`, `used_at`.
- Indexed on `(user_id, used_at, expires_at)`.

### Table 8: `password_reset_tokens`
- Stores password reset tokens with `token_hash` (SHA-256).
- `expires_at`, `used_at`.
- Indexed on `(user_id, used_at, expires_at)`.

### Table 9: `user_account_status_events`
- Dedicated event log for tracking transitions between `'pending_verification'`, `'active'`, and `'disabled'`.
- Preserves `previous_status`, `new_status`, `actor_user_id`, and `reason`.
- Independent of the future generic audit log to guarantee reliable administrative account tracking.

---

## 4. Session Architecture Decisions

### Opaque Server-Side Sessions (NO Primary JWT for Web Sessions)
Naba Web V1 utilizes **opaque server-side sessions** rather than JSON Web Tokens (JWT) for browser authentication:
1. **Immediate Revocation**: Any administrative action (account disable, password reset, compromise detection) immediately terminates active sessions without waiting for JWT expiration.
2. **Active Device Management**: Users can inspect all logged-in devices and invoke "Logout other sessions".
3. **Storage Mechanism**: The browser receives an opaque cryptographically secure 256-bit random string inside an `HttpOnly`, `SameSite=Lax` (or `Strict`), and `Secure` (production) cookie.
4. **Hash-Only Database Storage**: The database stores only `SHA-256(token)`. A database breach does not grant attackers valid session cookies.

### CSRF Protection Strategy
State-changing API requests (POST, PUT, PATCH, DELETE) from cookie-authenticated browsers require a matching CSRF token header verified against the stored `csrf_token_hash`. This will be implemented in STEP 07C.

---

## 5. Security & Authentication Policies

### Password Hashing Policy (STEP 07B)
- **Algorithm**: Argon2id (memory-hard, resistant to GPU/ASIC cracking).
- **Parameters**: 64MB memory cost, 3 iterations, 4 parallelism lanes.
- Plaintext passwords are never logged, serialized, or stored.

### Account Lockout Policy
- **Threshold**: 5 consecutive failed login attempts.
- **Lock Duration**: Exactly 15 minutes.
- **Mechanism**: Enforced via `failed_login_count` and `locked_until` columns on `users`.
- **Status Independence**: Temporary lockout is NOT represented as `account_status = 'locked'`. `account_status` is reserved strictly for lifecycle states (`pending_verification`, `active`, `disabled`).
- **Reset**: A successful login resets `failed_login_count = 0` and clears `locked_until = NULL`.

### Cryptographic Token Policy
- All tokens (session tokens, email verification tokens, password reset tokens) are generated using `crypto.randomBytes(32)` (256 bits of entropy).
- Raw tokens exist in memory solely during generation and are sent directly to the client/email.
- The database stores **only the SHA-256 digest** (`token_hash`), preventing offline privilege escalation from database dumps.

---

## 6. Migration & Schema Governance
- Schema changes are executed exclusively via TypeORM migration files (`npm run migration:run`).
- `synchronize: false` is strictly enforced across development, staging, and production.
- Entity definitions mirror the migration structure and maintain TypeScript type safety.
