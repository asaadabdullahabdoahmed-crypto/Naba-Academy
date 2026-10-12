# NABA ACADEMY — BACKEND HTTP STANDARDS
**معايير بروتوكول واستجابات الواجهة البرمجية (REST Standards)**

> **Document Version:** 1.0.0  
> **Status:** RATIFIED STANDARDS SPECIFICATION (STEP 06B)  
> **Governing Documents:** `docs/API_CONTRACTS.md`, `docs/ARCHITECTURE_DECISIONS.md` (ADR-03, ADR-04)

---

## 1. Global Routing & API Prefix

- **Base Route Prefix:** `/api/v1`
- **Root Descriptor:** `GET /` (Exempt from prefix; returns basic service name and version)
- **Health Monitoring:** `GET /api/v1/health`
- **Protocol:** HTTP/1.1 and HTTP/2 over TLS

---

## 2. Request Correlation & Trace IDs

1. **Authoritative Generation:** Every inbound request is assigned a unique server-generated UUIDv4 (`crypto.randomUUID()`).
2. **Client Un-trust:** External client-provided trace headers (e.g. `X-Request-Id`) are never trusted as authoritative internal traces.
3. **Response Header:** The trace ID is returned on every HTTP response:
   ```http
   X-Trace-Id: 6f2053d5-642f-4d4b-86a1-f2988c8c69b7
   ```
4. **Error Correlation:** The same trace ID is embedded inside every error response payload under `error.trace_id`.

---

## 3. Standard Response Envelopes

### 3.1 Success Envelope (`ApiSuccess<T>`)
Every successful HTTP response (`200 OK`, `201 Created`, etc.) is wrapped in a standard envelope:

```typescript
export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}
```

#### Example (Health Check):
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

### 3.2 Error Envelope (`ApiErrorResponse`)
Every non-2xx response is intercepted by the global `HttpExceptionFilter` and formatted consistently:

```typescript
export interface ApiError {
  code: string;
  message: string;
  details?: ValidationErrorDetail[] | Record<string, unknown> | null;
  trace_id: string;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiError;
}
```

#### Example (Resource Not Found):
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

---

## 4. Error Code Registry (Infrastructure Level)

| Code | HTTP Status | Description |
| :--- | :---: | :--- |
| `VALIDATION_ERROR` | 400 | One or more payload attributes failed DTO constraints. |
| `BAD_REQUEST` | 400 | Malformed HTTP request body or invalid parameters. |
| `UNAUTHORIZED` | 401 | Missing, expired, or invalid authentication credentials. |
| `FORBIDDEN` | 403 | Authenticated user lacks required role or permission. |
| `NOT_FOUND` | 404 | Target resource or route does not exist. |
| `CONFLICT` | 409 | State conflict (e.g. duplicate unique key, concurrency issue). |
| `UNPROCESSABLE_ENTITY` | 422 | Syntactically correct payload violates domain state rules. |
| `RATE_LIMIT_EXCEEDED` | 429 | Request volume threshold exceeded. |
| `INTERNAL_ERROR` | 500 | Unhandled server exception (details sanitized). |
| `SERVICE_UNAVAILABLE` | 503 | Downstream dependency or database temporarily unreachable. |

---

## 5. Validation Error Format (`ValidationErrorDetail`)

DTO validation failures produced by `ValidationPipe` are normalized into structured detail arrays:

```typescript
export interface ValidationErrorDetail {
  field: string;
  message: string;
  code?: string;
}
```

#### Example:
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
      },
      {
        "field": "address.postalCode",
        "message": "postalCode must be a valid postal code",
        "code": "ISPOSTALCODE"
      }
    ],
    "trace_id": "8a31e84e-37ab-4fcf-84bd-6d4349472e39"
  }
}
```

---

## 6. HTTP Security Headers Baseline

The backend applies `helmet` with API-optimized defaults:
- `X-Content-Type-Options: nosniff` (prevents MIME sniffing)
- `Strict-Transport-Security: max-age=31536000; includeSubDomains` (enforces HTTPS)
- `X-Frame-Options: SAMEORIGIN` (mitigates clickjacking)
- `X-Download-Options: noopen`
- `X-Permitted-Cross-Domain-Policies: none`
- `Referrer-Policy: no-referrer`
- `X-Powered-By`: **REMOVED** (prevents Express/NestJS technology discovery)

---

## 7. CORS Policy

- **Configured Origins:** Loaded from `CORS_ORIGINS` environment variable.
- **Parsing:** Comma-separated, trimmed, empty tokens removed.
- **Production Restriction:** Wildcard `*` is strictly forbidden in production.
- **Non-Browser Access:** Requests lacking an `Origin` header (curl, mobile apps, internal proxies) are permitted.
- **Browser Access:** Incoming `Origin` must strictly exist in the allowlist; otherwise request is rejected.
- **Credentials:** Disabled (`credentials: false`). Session transport decisions remain open (ADR-04).
- **Exposed Headers:** `X-Trace-Id` is exposed to frontend clients.

---

## 8. Safe Request Logging Rules

The backend employs lightweight, structured request logging via `TraceIdMiddleware`:
- **Logged Fields:** `traceId`, `method`, `path`, `statusCode`, `durationMs`.
- **Format:** `[traceId] METHOD PATH -> STATUS (DURATIONms)`
- **Prohibited in Logs:**
  - Request body payloads
  - Passwords and PINs
  - Bearer tokens and `Authorization` headers
  - Cookies and session tokens
  - Verification and OTP codes
  - File upload buffers
