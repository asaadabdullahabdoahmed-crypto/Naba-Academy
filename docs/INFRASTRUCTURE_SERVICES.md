# NABA ACADEMY — INFRASTRUCTURE SERVICES SPECIFICATION
**أكاديمية نبأ للتعلم الإلكتروني**

> **Document Version:** 1.0.0  
> **Status:** RATIFIED (STEP 06D)  
> **Scope:** Redis / Valkey Foundation, BullMQ Queue Infrastructure, Worker Process Architecture, S3-Compatible Object Storage  
> **Governing ADRs:** ADR-01 (Modular Monolith), ADR-04 (Server Authority), ADR-09 (Private Object Storage)

---

## 1. System Context & Infrastructure Topology

Naba Academy relies on four foundational, provider-agnostic infrastructure capabilities:
1. **Relational Database:** PostgreSQL 16+ via TypeORM Data Mapper (STEP 06A–06C).
2. **Key-Value Cache & Broker:** Redis 7+ / Valkey via `ioredis` (STEP 06D).
3. **Asynchronous Background Processing:** BullMQ via `@nestjs/bullmq` executed in dedicated, headless worker processes (STEP 06D).
4. **Private Object Storage:** S3-compatible object storage via AWS SDK v3 with time-limited signed URLs (STEP 06D).

```
                      +-----------------------------+
                      |   Internet Ingress / Proxy  |
                      +--------------+--------------+
                                     |
               +---------------------+---------------------+
               |                                           |
               v                                           v
    +----------------------+                    +----------------------+
    |  Naba Web API (HTTP) |                    |  Naba Worker Process |
    |    (main.ts / 4000)  |                    |     (worker.ts)      |
    +----------+-----------+                    +----------+-----------+
               |                                           |
               +---------------------+---------------------+
                                     |
       +-----------------------------+-----------------------------+
       |                             |                             |
       v                             v                             v
+---------------+            +---------------+            +------------------+
|  PostgreSQL   |            | Redis/Valkey  |            | S3-Compatible    |
| (Primary DB)  |            | (BullMQ/Cache)|            | Object Storage   |
+---------------+            +---------------+            +------------------+
```

---

## 2. Redis Client Foundation

### 2.1 Technology & Configuration Model
- **Client Library:** `ioredis` (v5+). Provider-agnostic, works seamlessly with Redis, Valkey, AWS ElastiCache, Dragonfly, or KeyDB.
- **Environment Variables:**
  - `REDIS_URL`: `redis://[user]:[password]@[host]:[port]/[db]` (Supports `redis://` and `rediss://` for TLS).
  - `REDIS_CONNECT_TIMEOUT_MS`: Connection attempt timeout in ms (default: `10000`).
  - `REDIS_MAX_RETRIES_PER_REQUEST`: Command retry limit (default: `3`).
- **Resilience & Safety Invariants:**
  - **Lazy Connection (`lazyConnect: true`):** The Redis client does not block application startup or crash the process if Redis is temporarily unreachable.
  - **Bounded Retry Loop:** Disconnection retry strategies cap exponential backoff and avoid unhandled infinite reconnect loops.
  - **Credential Masking:** Passwords in connection URLs are masked (`***`) in all logs, health probes, and stack traces.

### 2.2 Health Probe
- Implemented via `RedisHealthService.check()`.
- Probes connectivity using a lightweight `PING` command.
- Returns `'up'` when Redis replies `'PONG'`, or `'down'` if unreachable, unconfigured, or failing.
- Network topology, credentials, and hostnames are strictly excluded from health responses.

---

## 3. Asynchronous Job & Queue Infrastructure (BullMQ)

### 3.1 Framework & Shared Queue Module
- **Engine:** BullMQ (v5+) integrated through `@nestjs/bullmq` (v10.x compatible with NestJS 10).
- **Global Module:** `JobQueueModule` encapsulates connection configuration and exports `BullModule`.
- **Redis Connection Sharing:** Leverages the validated Redis configuration (`REDIS_URL`) while honoring BullMQ's requirement of `maxRetriesPerRequest: null`.
- **Key Prefix:** All queue keys are namespaced with `naba_bull` to prevent collision with application caching keys.

### 3.2 Foundational Queue Registry
Queue names are registered as foundational constants (`QueueName` enum):
- `QueueName.NOTIFICATIONS`: Push notifications and in-app alerts.
- `QueueName.EMAILS`: Transactional emails, activation links, invoice receipts.
- `QueueName.MEDIA_PROCESSING`: Video compression, audio transcode, exam recording chunk assembly.
- `QueueName.DOCUMENT_GENERATION`: PDF transcripts, official certificates, tuition statements.

*Note: Business queue processors are activated only in their respective domain modules in subsequent implementation steps.*

### 3.3 Retry Policy & Execution Philosophy
Unbounded retries cause cascading queue saturation and duplicate side effects. Naba Academy enforces `DEFAULT_JOB_OPTIONS`:
- **Max Attempts:** `3` attempts before sending to failed queue.
- **Backoff:** Exponential backoff with a base delay of `1000ms`.
- **Retention / Pruning:**
  - Completed jobs: Retain last `100` jobs for audit/monitoring.
  - Failed jobs: Retain last `500` jobs for operational triage and dead-letter analysis.
- **Idempotency Requirement:** Future job processors must verify job deduplication using `idempotencyKey` provided in `JobMetadata`.

---

## 4. Standalone Background Worker Architecture

### 4.1 Strict Separation of Concerns
- The HTTP Web API (`backend/src/main.ts`) and Background Worker (`backend/src/worker.ts`) are **separate operating system processes**.
- Background workers **MUST NOT** be embedded inside the HTTP Web API process.
- Benefits:
  - Long-running media/document tasks do not starve the HTTP event loop.
  - Web API can scale independently based on request traffic.
  - Worker processes can scale independently based on queue backlogs.

### 4.2 Worker Bootstrap Lifecycle
- **Entrypoint:** `backend/src/worker.ts`
- **Module:** `backend/src/worker.module.ts`
- Bootstraps a headless `NestApplicationContext` without HTTP listeners, express adapters, controllers, or global filters.
- Implements OS signal handlers (`SIGINT`, `SIGTERM`) for graceful queue draining and connection teardown.
- **NPM Run Scripts:**
  - `npm --prefix backend run worker`: Production entrypoint (`node dist/worker`).
  - `npm --prefix backend run worker:dev`: Development entrypoint with TypeScript execution (`tsx src/worker.ts`).
  - `npm --prefix backend run worker:build`: Builds both API and worker into `dist/`.

---

## 5. Private Object Storage Foundation (S3-Compatible)

### 5.1 Provider-Agnostic Port & Adapter Architecture
- **Port Interface:** `ObjectStorage` (`backend/src/infrastructure/storage/storage.interface.ts`)
  - `putObject(key, data, contentType, metadata)`
  - `getObjectStream(key)`
  - `deleteObject(key)`
  - `headObject(key)`
  - `createSignedDownloadUrl(key, expiresInSeconds)`
  - `createSignedUploadUrl(key, contentType, expiresInSeconds)`
  - `checkHealth()`
- **Adapter Implementation:** `S3StorageService` (`backend/src/infrastructure/storage/s3-storage.service.ts`) using AWS SDK v3:
  - `@aws-sdk/client-s3`
  - `@aws-sdk/s3-request-presigner`
- Compatible with AWS S3, Cloudflare R2, MinIO, Backblaze B2, Ceph, and Wasabi.

### 5.2 Private-by-Default Storage Rule
- **Rule:** ALL objects stored in Naba Academy storage buckets are **STRICTLY PRIVATE**.
- Permanent public URLs are never generated or stored.
- Direct bucket access from public clients is blocked via S3 bucket policies.
- Client access is granted exclusively through short-lived, time-limited presigned URLs.

### 5.3 Signed URL Security Model
- **Download URLs:** Default validity is `900 seconds` (15 minutes). Absolute upper cap is `3600 seconds` (1 hour).
- **Upload URLs:** Generated for direct-to-bucket uploads with strict content-type locking and short expiry.
- Storage credentials (`OBJECT_STORAGE_ACCESS_KEY`, `OBJECT_STORAGE_SECRET_KEY`) never leave the backend environment.

### 5.4 Object Key Conventions & Partitioning
- **Anti-Pattern:** User-provided filenames MUST NEVER be used as storage keys.
- All keys must pass validation (`sanitizeStorageKey`) to reject directory traversal (`..`, `\`), illegal characters, and null bytes.
- Key format pattern:
  `{partition}/{entityId}/{category}/{uuid}.{ext}`
- **Future Sensitive File Categories:**
  1. **Exam Recordings:** `exam-recordings/{attemptId}/{chunkId}.webm`
  2. **Student Identity Documents:** `students/{studentId}/identity/{uuid}.pdf`
  3. **Admission Appeal Evidence:** `appeals/{appealId}/evidence/{uuid}.pdf`
  4. **Medical / Excuse Documents:** `attendance-excuses/{excuseId}/{uuid}.pdf`
  5. **Official Academic Documents:** `academic-records/{studentId}/transcripts/{uuid}.pdf`

### 5.5 File Security Standards (Future File-Security Step)
1. **Untrusted Client Metadata:** Filename, client-declared MIME type, and file extension are untrusted user input.
2. **Magic-Byte MIME Inspection:** Server-side verification of magic bytes (file signature) is required before storing or serving files.
3. **Malware / Antivirus Scanning:** Background quarantine pipeline will scan newly uploaded files before authorizing permanent access.

---

## 6. Health Integration & Verification

The unified health endpoint (`GET /api/v1/health`) reports:
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "service": "naba-api",
    "timestamp": "2026-09-21T10:30:00.000Z",
    "dependencies": {
      "database": "up",
      "redis": "up",
      "storage": "up"
    }
  }
}
```
- If Redis is unreachable or fails: `redis: 'down'` and overall status degrades to `'degraded'`.
- If Object Storage is unconfigured in local/test: safely reported as `'unconfigured'` without failing the core API.
- Destructive read/write checks are strictly avoided during health probes; non-destructive metadata probes are utilized.
