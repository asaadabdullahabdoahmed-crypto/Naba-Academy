# NABA ACADEMY — BACKEND ARCHITECTURE
**أكاديمية نبأ للتعلم الإلكتروني**

> **Document Version:** 1.3.0  
> **Status:** RATIFIED BACKEND ARCHITECTURE SPECIFICATION (STEP 06D)  
> **Governing ADRs:** ADR-01 (Modular Monolith), ADR-02 (PostgreSQL), ADR-03 (REST API), ADR-04 (Server Authority), ADR-05 (RBAC), ADR-08 (Financial Ledger), ADR-09 (Private Object Storage)

---

## 1. System Overview & Core Boundaries

### 1.1 Technology Stack & Location
- **Backend Root Directory:** `backend/`
- **Application Framework:** NestJS 10 (TypeScript 5)
- **Architecture Paradigm:** Modular Monolith
- **API Protocol & Base Path:** REST API under `/api/v1`
- **Default Development Port:** `4000` (Frontend dev server remains isolated on port `3000`)
- **Node Environment Requirement:** Node.js v18+ / v20+ / v22+

### 1.2 Separation from Frontend
The React + Vite frontend and the NestJS backend are decoupled applications coexisting in the same repository:
- The frontend operates independently with its existing commands (`tsc --noEmit`, `npm run lint`, `npm run build`).
- The backend contains its own isolated `backend/package.json`, `backend/tsconfig.json`, build pipeline, and test runner.
- No frontend files import backend internal code directly. Communication occurs strictly over the network via versioned `/api/v1` REST transport contracts (`docs/API_CONTRACTS.md`).

---

## 2. Milestone State in STEP 06D

| Subsystem | State in STEP 06D | Future Target Milestone |
| :--- | :---: | :--- |
| **NestJS Skeleton & Bootstrap** | `IMPLEMENTED` | Operational application lifecycle with global pipes, filters, CORS. |
| **Configuration & Validation** | `IMPLEMENTED` | Type-safe environment validation (`NODE_ENV`, `PORT`, `API_PREFIX`, `CORS_ORIGINS`, `DATABASE_URL`, `REDIS_URL`, `OBJECT_STORAGE_*`). |
| **Security Headers & Fingerprinting** | `IMPLEMENTED` | `helmet` (v8.3.0) applied; `X-Powered-By` explicitly disabled. |
| **Request Tracing & Observability** | `IMPLEMENTED` | Server-generated `X-Trace-Id` with safe structured access logging. |
| **Response & Error Envelopes** | `IMPLEMENTED` | Standardized `ApiSuccess<T>` and `ApiErrorResponse` matching transport contracts. |
| **Global DTO Validation** | `IMPLEMENTED` | Strict whitelist, transformed DTOs, normalized structured error details. |
| **Graceful Shutdown** | `IMPLEMENTED` | NestJS shutdown hooks enabled for clean process termination. |
| **Health Check Module** | `IMPLEMENTED` | `GET /api/v1/health` providing canonical database, redis, and storage dependency status. |
| **PostgreSQL Database & ORM** | `IMPLEMENTED` | TypeORM Data Mapper foundation, TransactionService, DatabaseHealthService, CLI migration runner (STEP 06C). |
| **Redis / Valkey Client** | `IMPLEMENTED` | Provider-agnostic `ioredis` foundation with lazy connect, connection masking, and health probe (STEP 06D). |
| **Background Worker & BullMQ** | `IMPLEMENTED` | Standalone worker entrypoint (`worker.ts`), `JobQueueModule` with BullMQ, queue constants, and bounded retry policy (STEP 06D). |
| **Private Object Storage (S3)** | `IMPLEMENTED` | S3-compatible provider-agnostic port & adapter with time-limited presigned URLs (STEP 06D). |
| **Identity & Authentication** | `PLANNED` | JWT with secure HTTP-only cookies to be implemented in STEP 07. |
| **Business Domain Modules** | `PLANNED` | Identity, Academic, Students, Admissions, Finance, etc. in STEPS 07–15. |

---

## 3. Directory Layout & Module Structure

The backend application layout follows a standard NestJS modular architecture designed to scale sustainably:

```
backend/
├── .env.example                # Environment variables template (no secrets)
├── nest-cli.json               # NestJS CLI build configuration
├── package.json                # Dedicated backend dependencies & scripts
├── tsconfig.json               # Strict TypeScript configuration with decorator support
├── tsconfig.build.json         # Build-specific TypeScript configuration
├── src/
│   ├── main.ts                 # HTTP API bootstrap entrypoint (port 4000)
│   ├── worker.ts               # Standalone headless Worker bootstrap entrypoint
│   ├── worker.module.ts        # Worker execution context module (no HTTP)
│   ├── app.module.ts           # Root HTTP application module
│   ├── app.controller.ts       # Root service descriptor (GET /)
│   ├── config/
│   │   ├── configuration.ts    # Type-safe configuration loader (app, database, redis, storage)
│   │   ├── env.validation.ts   # Class-validator environment schema with fast-fail validation
│   │   ├── env.validation.spec.ts # Unit tests for configuration validation
│   │   └── cors.config.ts      # Origin validator factory preventing wildcard production CORS
│   ├── database/               # Relational persistence subsystem
│   │   ├── database.module.ts
│   │   ├── database.config.ts
│   │   ├── data-source.ts
│   │   ├── database-health.service.ts
│   │   └── transaction.service.ts
│   ├── infrastructure/         # Core infrastructure adapters
│   │   ├── redis/              # Redis / Valkey client & health probe
│   │   │   ├── redis.constants.ts
│   │   │   ├── redis.config.ts
│   │   │   ├── redis.service.ts
│   │   │   ├── redis-health.service.ts
│   │   │   └── redis.module.ts
│   │   ├── jobs/               # BullMQ queues & retry policy
│   │   │   ├── queue.constants.ts
│   │   │   └── job-queue.module.ts
│   │   └── storage/            # Private-by-default S3-compatible storage
│   │       ├── storage.interface.ts
│   │       ├── storage-key.util.ts
│   │       ├── s3-storage.service.ts
│   │       └── storage.module.ts
│   ├── common/
│   │   ├── types/
│   │   │   ├── express.d.ts    # Declaration merging for Request.traceId
│   │   │   └── api-response.ts # Canonical wire transport envelope interfaces
│   │   ├── middleware/
│   │   │   └── trace-id.middleware.ts  # Authoritative trace ID generator and safe access logger
│   │   ├── interceptors/
│   │   │   └── transform-response.interceptor.ts # Global ApiSuccess<T> envelope mapping
│   │   ├── pipes/
│   │   │   └── validation-formatter.ts      # Normalizes class-validator errors into details
│   │   └── filters/
│   │       └── http-exception.filter.ts     # Global sanitized error envelope
│   └── modules/
│       └── health/             # Unified health monitoring (PostgreSQL, Redis, Storage)
│           ├── health.controller.ts
│           ├── health.service.ts
│           └── health.module.ts
└── test/
    ├── jest-e2e.json           # E2E test runner configuration
    └── app.e2e-spec.ts         # Automated HTTP tests
```

---

## 4. Infrastructure Specifications (STEP 06B)

### 4.1 Environment Validation
- Validated via `class-validator` and `class-transformer` prior to NestJS module instantiation.
- **NODE_ENV:** Must be one of `development`, `test`, `staging`, `production`.
- **PORT:** Must be an integer between `1` and `65535`.
- **API_PREFIX:** Default `api/v1`.
- **CORS_ORIGINS:** Comma-separated allowlist. Wildcard `*` is strictly forbidden in production.
- **Fast-fail behavior:** Missing or invalid configuration immediately throws `ConfigValidationError` and aborts process launch.

### 4.2 Security Headers & CORS
- **Helmet (`helmet@8.3.0`):** Applied with `hidePoweredBy: true`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, `X-Frame-Options: SAMEORIGIN`.
- **Server Fingerprinting:** Express `x-powered-by` header explicitly disabled.
- **CORS Policy:** Strict allowlist matching against incoming `Origin` headers. Server-to-server and non-browser clients (missing origin) are permitted; unapproved browser origins are rejected. `credentials: false` (session transport remains undecided per ADR-04).

### 4.3 Observability & Trace IDs
- Every inbound request receives a server-generated UUID (`crypto.randomUUID()`).
- Inbound client-supplied trace headers are untrusted and discarded in favor of authoritative server generation.
- The trace ID is assigned to `req.traceId` (with full TypeScript declaration merging) and attached to the response header:
  ```http
  X-Trace-Id: 6f2053d5-642f-4d4b-86a1-f2988c8c69b7
  ```
- **Access Logging:** Upon response finish, logs `[traceId] METHOD PATH -> STATUS (DURATIONms)`.
- **Sanitization:** Request bodies, passwords, authorization tokens, cookies, and file payloads are NEVER logged.

### 4.4 Unified Transport Contracts
#### Successful Responses (`ApiSuccess<T>`)
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "service": "naba-api",
    "timestamp": "2026-09-20T10:37:46.284Z"
  }
}
```

#### Error Responses (`ApiErrorResponse`)
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Cannot GET /api/v1/non-existent-route",
    "details": null,
    "trace_id": "d48d5bce-7d70-49b7-a1b8-2f99e714d813"
  }
}
```

#### Validation Error Details (`ValidationErrorDetail`)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "email must be an email",
        "code": "ISEMAIL"
      }
    ],
    "trace_id": "..."
  }
}
```

---

## 5. Verification Commands

### Backend Verification
- `npm --prefix backend run build`: Compiles NestJS backend.
- `npm --prefix backend run lint`: Static type validation (`tsc --noEmit`).
- `npm --prefix backend test`: Unit tests for config, validation formatter, and health (18 passed).
- `npm --prefix backend run test:e2e`: E2E integration tests for root, health, 404 envelope, trace IDs, and security headers (4 passed).
