# Naba Academy — Identity & Authentication API (STEP 07B)

## 1. Overview & Scope

STEP 07B implements the core user registration and email verification subsystem for Naba Academy. It builds directly upon the STEP 07A persistence model and introduces:

- **Argon2id Password Hashing**: Memory-hard password hashing via `Argon2PasswordHasherService` conforming to the `PasswordHasher` port.
- **Strict Password Complexity Policy**: Enforced via `assertPasswordPolicy` (12–128 characters, Unicode letter, Unicode digit).
- **Email Normalization**: Lowercased and trimmed normalization with display email preservation.
- **Cryptographic Token Service**: 256-bit entropy random tokens via `SecureTokenService`, stored solely as SHA-256 hashes in `email_verification_tokens`.
- **Email Dispatch Subsystem**: Abstracted behind the `EmailSender` port with a production-ready `NodemailerEmailSenderService` (supporting SMTP and non-crashing simulation mode).
- **Transactional Registration**: Atomic multi-entity persistence (`users`, `user_role_assignments`, `user_account_status_events`, `email_verification_tokens`).
- **Email Verification & Anti-Enumeration Resend**: Verification token consumption with atomic account activation and anti-enumeration protections.

---

## 2. Security Specifications

### Password Hashing Policy
- **Algorithm**: Argon2id
- **Memory Cost**: 65,536 KiB (64 MiB)
- **Time Cost (Iterations)**: 3
- **Parallelism**: 1 lane
- **Hash Length**: 32 bytes
- Raw passwords are never logged, serialized, or retained in persistent memory.

### Password Complexity Rules
1. Minimum length: 12 characters.
2. Maximum length: 128 characters.
3. Must contain at least one Unicode letter (`\p{L}`).
4. Must contain at least one Unicode number (`\p{N}`).

### Cryptographic Token Handling
- Raw tokens are generated using `crypto.randomBytes(32)` (256 bits of entropy) encoded as URL-safe hexadecimal strings.
- Only the SHA-256 hash (`crypto.createHash('sha256').update(token).digest('hex')`) is stored in the database (`token_hash`).
- Tokens expire 24 hours after creation.
- Once verified, `used_at` is stamped; subsequent attempts are rejected with `VERIFICATION_TOKEN_ALREADY_USED`.

---

## 3. Endpoints

Base Prefix: `/api/v1/auth`

### 3.1. User Registration
`POST /api/v1/auth/register`

Creates a new student user account with `pending_verification` status, strictly assigns the canonical `student` role (privilege escalation prevention), records the initial status transition event, generates a 24-hour verification token, and dispatches the verification email. 

**Security & Anti-Enumeration Hotfix:**
- Public registration strictly permits only `email` and `password`. Non-whitelisted properties (such as caller-injected `roleCode`) are rejected with `400 Bad Request (VALIDATION_ERROR)`.
- The registration service guarantees that public registrations can only assign the canonical `student` role and aborts if that role is unseeded.
- Returns `202 Accepted` with a generic `verification_required` payload for both new accounts and existing accounts, preventing user account enumeration. PostgreSQL unique-constraint race conditions are caught and handled safely.

#### Request Headers
```http
Content-Type: application/json
```

#### Request Body
```json
{
  "email": "student@naba.edu.sa",
  "password": "StrongStudentPassword2026!"
}
```

#### Success Response (202 Accepted)
```json
{
  "status": "verification_required",
  "message": "If this email address is eligible for an account, a verification email has been sent."
}
```

#### Error Responses
- **400 Bad Request (`PASSWORD_POLICY_VIOLATION`)**:
  ```json
  {
    "statusCode": 400,
    "code": "PASSWORD_POLICY_VIOLATION",
    "message": "Password must be at least 12 characters long"
  }
  ```
- **400 Bad Request (`VALIDATION_ERROR`)**:
  Triggered if unauthorized fields (such as `roleCode`) are submitted or if fields fail format checks.

---

### 3.2. Email Verification
`POST /api/v1/auth/verify-email`

Verifies a pending account using the one-time raw token received via email. Validates token expiration, hashes the token for lookup, marks `used_at`, transitions user `account_status` to `active`, and records the status transition event.

#### Request Body
```json
{
  "token": "4a8c9e0f1b2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f"
}
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "email": "student@naba.edu.sa",
  "message": "Email verified successfully. Your account is now active."
}
```

#### Error Responses
- **400 Bad Request (`INVALID_VERIFICATION_TOKEN`)**:
  ```json
  {
    "statusCode": 400,
    "code": "INVALID_VERIFICATION_TOKEN",
    "message": "The verification token is invalid or does not exist"
  }
  ```
- **400 Bad Request (`VERIFICATION_TOKEN_EXPIRED`)**:
  ```json
  {
    "statusCode": 400,
    "code": "VERIFICATION_TOKEN_EXPIRED",
    "message": "The verification token has expired"
  }
  ```
- **400 Bad Request (`VERIFICATION_TOKEN_ALREADY_USED`)**:
  ```json
  {
    "statusCode": 400,
    "code": "VERIFICATION_TOKEN_ALREADY_USED",
    "message": "The verification token has already been used"
  }
  ```
- **403 Forbidden (`ACCOUNT_DISABLED`)**:
  ```json
  {
    "statusCode": 403,
    "code": "ACCOUNT_DISABLED",
    "message": "User account is disabled"
  }
  ```

---

### 3.3. Resend Verification Link
`POST /api/v1/auth/resend-verification`

Dispatches a new verification token to the provided email address if an unverified account exists. Uses anti-enumeration protection so non-existent or already-verified accounts receive an identical or neutral success response without leaking user existence.

#### Request Body
```json
{
  "email": "student@naba.edu.sa"
}
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "If an unverified account exists with this email address, a new verification link has been sent."
}
```

---

### 3.4. Forgot Password (STEP 07D)
`POST /api/v1/auth/forgot-password`

Initiates the password reset flow. Follows strict anti-enumeration invariants: returns HTTP 202 Accepted with a neutral message identically for existing, non-existent, unverified, or disabled accounts. For eligible accounts (active, verified, non-disabled), generates a 256-bit cryptographically secure token (stored solely as SHA-256 hash in `password_reset_tokens`), invalidates previous unused tokens, and dispatches a localized email containing the token in the URL fragment (`#token=`).

#### Request Body
```json
{
  "email": "student@naba.edu.sa",
  "locale": "ar"
}
```
*Note: `locale` is optional (`ar` or `en`, defaults to `ar`).*

#### Success Response (202 Accepted)
```json
{
  "success": true,
  "data": {
    "accepted": true,
    "message": "If the account is eligible, password reset instructions have been sent."
  }
}
```

#### Error Responses
- **400 Bad Request (`VALIDATION_ERROR`)**:
  Triggered when email is invalid or unexpected fields (such as `roleCode`, `userId`) are injected.

---

### 3.5. Reset Password (STEP 07D)
`POST /api/v1/auth/reset-password`

Executes atomic password reset using a one-time reset token.

**Security Invariants:**
1. Token must be present, unused, and unexpired (30-minute TTL). Invalid, expired, used, or unknown tokens all return HTTP 400 with `PASSWORD_RESET_INVALID_OR_EXPIRED`.
2. Reuses authoritative password policy (12–128 characters, Unicode letter & digit required).
3. Atomically updates `password_hash` with Argon2id and `password_changed_at`.
4. Resets temporary lockout (`failed_login_count = 0`, `locked_until = null`).
5. Marks consumed token `used_at = now` and invalidates all other outstanding reset tokens for the user.
6. Revokes all active sessions for the user in `user_sessions`. Old session cookies no longer authenticate.
7. Clears any lingering authentication cookies; does NOT auto-login. User must log in again with new password.
8. Preserves account status, roles, and permissions untouched.

#### Request Body
```json
{
  "token": "4a8c9e0f1b2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f",
  "password": "NewStrongStudentPassword2026!"
}
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Password has been reset successfully. Please log in with your new password."
}
```

#### Error Responses
- **400 Bad Request (`PASSWORD_RESET_INVALID_OR_EXPIRED`)**:
  ```json
  {
    "success": false,
    "error": {
      "code": "PASSWORD_RESET_INVALID_OR_EXPIRED",
      "message": "The password reset token is invalid, expired, or has already been used."
    }
  }
  ```
- **400 Bad Request (`PASSWORD_POLICY_VIOLATION`)**:
  ```json
  {
    "success": false,
    "error": {
      "code": "PASSWORD_POLICY_VIOLATION",
      "message": "Password does not satisfy security policy requirements"
    }
  }
  ```
- **400 Bad Request (`VALIDATION_ERROR`)**:
  Triggered when non-whitelisted fields (e.g., `email`, `roleCode`) are submitted.

---

### 3.6. Security Hardening & Rate Limiting (STEP 07E)

All public state-changing authentication routes enforce multilayered security boundaries:

#### Origin & Referer Verification (`OriginRefererGuard`)
- Evaluates `Origin` and `Referer` against the configured CORS allowlist (`app.corsOrigins`).
- Blocks unauthorized external websites from submitting cross-site state-changing POST/PUT/PATCH/DELETE requests.
- Blocks browsers sending `Sec-Fetch-Site: cross-site` without a valid trusted Origin.
- Violation code: HTTP 403 Forbidden (`ORIGIN_FORBIDDEN`).

#### Abuse Prevention & Throttling (`IdentityRateLimiterService` / `RateLimiterGuard`)
- **IP Extraction Policy:** Strictly ignores untrusted `X-Forwarded-For` headers unless `app.trustProxy` is explicitly enabled in configuration. Normalizes IPv4-mapped IPv6 loopbacks.
- **Fail-Safe Policy:** Uses Redis when connected; cleanly falls back to an in-memory sliding window if Redis is offline or throws errors. Rate limits never become unlimited on Redis downtime.
- **Privacy & Token Security:** Raw tokens, passwords, and sensitive user data are never used as cache keys or logged in rate limiter stores.
- **Throttling Thresholds:**
  - `POST /api/v1/auth/register`: 10 requests / 1 hour per IP.
  - `POST /api/v1/auth/login`: 15 requests / 15 minutes per IP (in addition to 5 failed attempts / 15 min per-account lockout).
  - `POST /api/v1/auth/forgot-password`: 10 requests / 15 minutes per IP (in addition to 60s cooldown and 5 tokens/hour per account).
  - `POST /api/v1/auth/resend-verification`: 10 requests / 15 minutes per IP (in addition to 60s cooldown and 5 tokens/hour per account).
  - `POST /api/v1/auth/verify-email`: 20 requests / 15 minutes per IP.
  - `POST /api/v1/auth/reset-password`: 10 requests / 15 minutes per IP.
- Violation code: HTTP 429 Too Many Requests (`TOO_MANY_REQUESTS`). Anti-enumeration is strictly preserved.

---

## 4. Subsystem Components & Ports

```
backend/src/modules/identity/
├── application/
│   ├── ports/
│   │   ├── password-hasher.port.ts       # PasswordHasher interface & symbol
│   │   └── email-sender.port.ts          # EmailSender interface & symbol
│   └── services/
│       ├── registration.service.ts       # Registration orchestration
│       ├── email-verification.service.ts # Verification lifecycle & cooldowns
│       ├── authentication.service.ts     # Credential authentication & lockout engine
│       ├── session.service.ts            # Opaque session lifecycle & CSRF token generator
│       └── password-reset.service.ts     # Transactional password reset & session revocation
├── domain/
│   ├── identity.types.ts                 # AccountStatus, CanonicalRoleCode
│   └── identity.errors.ts                # Domain exception hierarchy (TOO_MANY_REQUESTS, ORIGIN_FORBIDDEN, etc.)
├── infrastructure/
│   ├── mail/
│   │   └── nodemailer-email-sender.service.ts # SMTP transport with URL fragment (#token=) links
│   ├── persistence/
│   │   └── entities/                     # User, Role, Token, UserSession entities
│   └── security/
│       ├── argon2-password-hasher.service.ts  # Argon2id implementation
│       ├── email-normalizer.ts           # Email casing/trim normalizer
│       ├── password-policy.ts            # Complexity validation rules
│       ├── secure-token.service.ts       # Crypto token generator & SHA-256 hasher
│       ├── rate-limiter.service.ts       # Redis + in-memory fallback rate limiter
│       ├── client-ip.util.ts             # Safe client IP extractor respecting proxy trust
│       └── cookie.config.ts              # Secure cookie transport & clearing options
└── presentation/
    ├── controllers/
    │   └── auth.controller.ts            # REST endpoints guarded by Origin & RateLimiter
    ├── guards/
    │   ├── session-auth.guard.ts         # Authenticated cookie validator
    │   ├── csrf.guard.ts                 # Database-backed CSRF guard
    │   ├── origin-referer.guard.ts       # Origin/Referer allowlist validator
    │   ├── rate-limiter.guard.ts         # IP-based rate limiting guard
    │   └── rate-limiter.decorator.ts     # @RateLimit metadata decorator
    └── dto/
        ├── register.dto.ts               # Validation DTO
        ├── verify-email.dto.ts           # Validation DTO
        ├── resend-verification.dto.ts   # Validation DTO
        ├── forgot-password.dto.ts        # Validation DTO
        ├── reset-password.dto.ts         # Validation DTO
        └── login.dto.ts                  # Login payload validation
```

---

## 5. Next Sequential Substep

- **STEP 07D (Password Reset Workflows)**: `COMPLETE`.
- **STEP 07E (Identity E2E & Security Hardening)**: `COMPLETE`.
- **STEP 07F (Frontend Auth Integration)**: `NEXT` (Wire frontend views to real backend endpoints after backend authentication passes all security gates).
