# NABA ACADEMY — DATABASE ARCHITECTURE
**أكاديمية نبأ للتعلم الإلكتروني**

> **Document Version:** 1.0.0  
> **Status:** RATIFIED PERSISTENCE SPECIFICATION (STEP 06C)  
> **Governing ADRs:** ADR-01 (Modular Monolith), ADR-02 (PostgreSQL Persistence), ADR-04 (Server Authority), ADR-08 (Financial Ledger Immutability)

---

## 1. Overview & Technology Decisions

### 1.1 Persistence Engine
- **Database Engine:** PostgreSQL (v14 / v15 / v16+)
- **Object-Relational Mapping (ORM):** TypeORM (v0.3.x) with `@nestjs/typeorm` (v10.x)
- **Database Driver:** `pg` (`node-postgres` v8.x)
- **Architectural Pattern:** Strict **Data Mapper** (Repository / EntityManager / DataSource)
- **Forbidden Patterns:**
  - `Active Record` / `BaseEntity` (Strictly banned across all entities)
  - `synchronize: true` (Strictly banned in all environments, including local development)
  - `dropSchema: true` (Strictly banned)
  - Dual ORMs (No Prisma, Sequelize, or Drizzle)
  - SQLite as a test or development substitute

---

## 2. Core Modules & Services

### 2.1 `DatabaseModule` (`backend/src/database/database.module.ts`)
- Configured as a `@Global()` NestJS module.
- Initializes TypeORM asynchronously via `TypeOrmModule.forRootAsync` using `ConfigService`.
- Exports `TypeOrmModule`, `TransactionService`, and `DatabaseHealthService` across the entire modular monolith.

### 2.2 `database.config.ts` (`backend/src/database/database.config.ts`)
Responsible for building safe `TypeOrmModuleOptions`:
- **`synchronize: false`** — Guarantees no automatic schema mutation at runtime.
- **`dropSchema: false`** — Prevents accidental catastrophic schema destruction.
- **`autoLoadEntities: true`** — Enables clean entity registration in domain modules via `TypeOrmModule.forFeature([Entity])`.
- **`extra` Pool Options** — Configures `max` connection pool and `connectionTimeoutMillis`.
- **Validation** — Fails fast with `[DatabaseConfigError]` if `DATABASE_URL` is omitted in `production` or `staging`.

### 2.3 `data-source.ts` (`backend/src/database/data-source.ts`)
- Authoritative CLI DataSource export (`AppDataSource`) for TypeORM migration operations.
- Reads environment variables via `dotenv`.
- Points entity discovery to `src/**/*.entity{.ts,.js}`.
- Points migration discovery to `src/database/migrations/*{.ts,.js}`.
- Migration records are tracked in the dedicated `typeorm_migrations` table.
- Contains exactly one export (`AppDataSource`) to avoid CLI ambiguous export errors.

### 2.4 `TransactionService` (`backend/src/database/transaction.service.ts`)
Encapsulates atomic database transaction boundaries using TypeORM's Data Mapper:
- Method: `run<T>(operation: (manager: EntityManager) => Promise<T>): Promise<T>`
- Automatically commits on successful execution.
- Automatically rolls back on unhandled error or exception.
- Fails fast with `[TransactionServiceError]` if the DataSource is not initialized.
- Protects critical business transactions (e.g. course registration, invoice posting, grade submission) from partial failure states.

### 2.5 `DatabaseHealthService` (`backend/src/database/database-health.service.ts`)
- Performs lightweight, non-invasive `SELECT 1` probes against PostgreSQL.
- Returns `'up'` when the database connection is live and queryable.
- Returns `'down'` when uninitialized, disconnected, or throwing.
- Security Invariant: Logs probe failures safely with zero credential or connection string leakage.
- Integrated into `HealthService` (`GET /api/v1/health`), reporting:
  ```json
  {
    "status": "ok",
    "service": "naba-api",
    "timestamp": "2026-09-21T09:40:00.000Z",
    "dependencies": {
      "database": "up"
    }
  }
  ```
  *(If database is unreachable, `status` reports `"degraded"` and `database` reports `"down"`).*

---

## 3. Schema Design & Persistence Conventions

When business entities are introduced in subsequent steps (STEPS 07–29), all database structures MUST adhere to these conventions:

### 3.1 Naming Rules
| Layer | Convention | Example |
| :--- | :--- | :--- |
| **Table Names** | `snake_case` (plural) | `users`, `academic_terms`, `course_sections` |
| **Column Names** | `snake_case` | `id`, `first_name`, `student_id`, `created_at` |
| **Entity Classes** | `PascalCase` | `UserEntity`, `AcademicTermEntity` |
| **Entity Properties** | `camelCase` | `firstName`, `studentId`, `createdAt` |
| **Primary Keys** | `UUID` (v4) | `id: string` (`@PrimaryGeneratedColumn('uuid')`) |
| **Foreign Keys** | `snake_case` with `_id` | `department_id`, `student_id`, `instructor_id` |
| **Indexes** | `idx_{table}_{columns}` | `idx_users_email`, `idx_enrollments_student_term` |
| **Unique Constraints** | `uq_{table}_{columns}` | `uq_users_national_id`, `uq_students_student_number` |

### 3.2 Timestamps & Temporal Integrity
- All technical timestamp columns (`created_at`, `updated_at`, `deleted_at`, `expires_at`) MUST use PostgreSQL **`timestamptz`** (`TIMESTAMP WITH TIME ZONE`).
- In application memory, dates MUST represent standard UTC ISO 8601 strings or native `Date` objects.

### 3.3 Soft Deletion & Auditability
- Core master data and user-authored academic records support soft deletion via `deleted_at: Date | null` (`@DeleteDateColumn()`).
- Financial ledger entries (`invoices`, `transactions`, `fee_waivers`) are **strictly immutable** (append-only ledger, zero physical or logical deletes, reversals modeled as offsetting credit/debit rows per ADR-08).

---

## 4. Migration & Schema Evolution Policy

1. **No Runtime DDL (`synchronize: false`):**
   - Under no circumstances is `synchronize: true` permitted.
   - All schema modifications (tables, columns, indexes, constraints, enums) must be authored and executed via TypeORM migrations.

2. **Migration Scripts (`package.json`):**
   - Run pending migrations: `npm run migration:run`
   - Revert last migration: `npm run migration:revert`
   - Show migration status: `npm run migration:show`
   - Create new migration: `npm run migration:create -- src/database/migrations/<MigrationName>`
   - Generate schema migration: `npm run migration:generate -- src/database/migrations/<MigrationName>`

3. **Migration Directory:**
   - All migration files reside in `backend/src/database/migrations/`.
   - Migration files follow timestamped naming: `{timestamp}-{MigrationName}.ts`.

---

## 5. Environment Configuration

| Variable | Type | Default | Required | Description |
| :--- | :---: | :---: | :---: | :--- |
| `DATABASE_URL` | string | `postgresql://...` | Yes (in prod/staging) | Full PostgreSQL connection URI |
| `DATABASE_SSL` | boolean | `false` | No | Enables TLS/SSL database connection |
| `DATABASE_SSL_REJECT_UNAUTHORIZED` | boolean | `false` | No | Enforces SSL certificate authority verification |
| `DATABASE_POOL_MAX` | number | `10` | No | Maximum connections in client connection pool |
| `DATABASE_CONNECT_TIMEOUT_MS` | number | `10000` | No | Timeout for establishing database socket (ms) |

---

## 6. Verification Protocol

- **Static Validation:** `npm run lint` (`tsc --noEmit`) validates complete type safety with zero errors.
- **Unit Testing:** `npm test` runs comprehensive isolated unit tests for `DatabaseConfig`, `TransactionService`, and `DatabaseHealthService` with mocked database interactions.
- **End-to-End Testing:** `npm run test:e2e` executes integration tests using isolated test modules without requiring a live external database daemon.
- **Live Database Probing:** If a real PostgreSQL instance is unavailable in the execution environment, runtime migration execution is documented as:
  `NOT RUN — PostgreSQL instance unavailable`.
  The codebase must never falsify health states or substitute SQLite.
