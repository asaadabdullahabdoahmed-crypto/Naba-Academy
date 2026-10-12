# NABA ACADEMY — ARCHITECTURAL DECISION RECORDS (ADR)
**أكاديمية نبأ للتعلم الإلكتروني**

The following non-negotiable architectural decisions govern the Naba Academy system design and implementation:

---

### ADR-01: Modular Monolith Backend
- **Decision:** The backend will be constructed as a modular monolith rather than microservices or distributed functions.
- **Rationale:** Minimizes operational complexity, allows high-throughput in-process transactional boundaries, simplifies testing, and guarantees rapid feature delivery while maintaining strict domain separation.

### ADR-02: PostgreSQL as Primary Database
- **Decision:** PostgreSQL is the single source of truth for relational application data.
- **Rationale:** Full ACID compliance, robust foreign key constraints, rich indexing (B-Tree, GIN), native JSONB support, and proven reliability for higher education systems.

### ADR-03: REST API Communication
- **Decision:** Standardized RESTful JSON API contracts between frontend and backend.
- **Rationale:** Clear semantic HTTP verbs, predictable status envelopes (`{ success, data, error, meta }`), clean client caching, and straightforward client-side type-safety.

### ADR-04: Server-Side Authority on Truth
- **Decision:** The frontend NEVER owns academic, financial, or security truth. All grades, GPA calculations, prerequisite checks, billing totals, and permission validations must execute on the backend server.
- **Rationale:** Client-side state is untrusted. Prevents tampering, academic fraud, and financial race conditions.

### ADR-05: Fine-Grained Authorization Paradigm
- **Decision:** Enforce authorization using **Role + Permission + Scope + Resource Ownership**.
- **Rationale:** A role alone (e.g. `instructor`) is insufficient; an instructor can only edit grades for sections they own within their assigned department during open grading windows.

### ADR-06: Append-Only Academic Audit Log
- **Decision:** All critical student record changes, grade modifications, registration actions, and administrative overrides are written to an immutable append-only audit log table.
- **Rationale:** Satisfies accreditation standards, non-repudiation, and institutional compliance requirements. Records cannot be updated or deleted.

### ADR-07: Dedicated Security Log
- **Decision:** Security events (failed logins, password resets, permission rejections, session invalidations, suspicious IP access) are recorded in an isolated security log separate from standard operational logs.
- **Rationale:** Dedicated audit surface for security analysis, incident response, and forensic reviews.

### ADR-08: Append-Only Double-Entry Financial Ledger
- **Decision:** Tuition invoices, payments, discounts, and fee adjustments are stored in an append-only double-entry ledger. Balance is always calculated by aggregating immutable transactions.
- **Rationale:** Eliminates data corruption, supports financial reconciliation, and ensures full accounting transparency.

### ADR-09: Sensitive Document Security via Private Object Storage
- **Decision:** Transcripts, civil IDs, exam submissions, and certificates must be stored in private, non-public object storage accessible only via short-lived, authenticated pre-signed URLs.
- **Rationale:** Prevents unauthorized direct file access or URL scraping of confidential student and institutional files.

### ADR-10: Strict Preservation of Academic History
- **Decision:** Academic history must never be hard-deleted or overwritten. Grade changes, course retakes, academic warnings, and term statuses preserve historical snapshots with reason codes and author timestamps.
- **Rationale:** Essential for accurate historical transcripts, retroactive degree audits, and academic appeals.

### ADR-11: UUID Primary Keys for Core Entities
- **Decision:** All primary database entities (Users, Courses, Sections, Enrollments, Invoices, Submissions) use UUIDv7 or UUIDv4 as primary keys.
- **Rationale:** Prevents sequential enumeration attacks, eases distributed generation, and decouples internal database identities from external representations.

### ADR-12: Human-Readable Business Keys
- **Decision:** Human-facing identifiers (such as Student ID e.g. `202410042`, Course Code e.g. `CS101`, Section Number e.g. `101`, Invoice Number e.g. `INV-2024-001`) are unique business keys, separate from database primary keys.
- **Rationale:** Clear administrative communication without coupling to internal database identity keys.

### ADR-13: Version 1 Scope: No AI / Gemini Features
- **Decision:** Version 1 strictly excludes AI models, automated LLM graders, or chatbot integrations.
- **Rationale:** Maintains high institutional stability, deterministic operational predictability, and focus on foundational SIS/LMS capabilities.

### ADR-14: Version 1 Scope: No Two-Factor Authentication (2FA)
- **Decision:** 2FA is out of scope for the v1 implementation.
- **Rationale:** Streamlines user adoption and core workflow validation before introducing multi-step authentication mechanisms.

### ADR-15: Version 1 Scope: No SSO / National Identity Integration
- **Decision:** External Single Sign-On (SSO) and National SSO (e.g. Nafath) are excluded from v1.
- **Rationale:** Keeps authentication internal, self-contained, and completely testable in sandbox/development environments.

### ADR-16: Centralized Dual-Language (AR/EN) i18n
- **Decision:** Arabic and English localizations are managed through a single centralized dictionary architecture (`src/i18n/`).
- **Rationale:** Guarantees 100% string parity, eliminates hardcoded bilingual ternary clutter in view code, and simplifies future translation maintenance.

### ADR-17: Global Native RTL and LTR Layouts
- **Decision:** Full first-class bidirectional UI support. The document root toggles between `dir="rtl"` (Arabic) and `dir="ltr"` (English) with synchronized font-family selection and directional icon mirroring.
- **Rationale:** Provides an authentic, native reading and navigation experience for both Arabic-first and English users.

### ADR-18: Responsive Web-First Foundation
- **Decision:** Responsive, mobile-first design across all views without sacrificing dense desktop dashboard utility.
- **Rationale:** Students and faculty access the academy on smartphones, tablets, laptops, and ultra-wide desktop monitors.

### ADR-19: Migration of Mock Business Rules to Backend
- **Decision:** Existing client-side mock logic (e.g. GPA calculations, registration conflicts, grading rules in `mockData.ts`) will be migrated into backend domain service layers.
- **Rationale:** Guarantees that all business rules are authoritative, centralized, and tested in backend automated suites.

### ADR-20: Preservation of Established Visual Identity
- **Decision:** The existing visual language (Naba Navy `#17324d`, Naba Teal `#0f766e`, Naba Gold `#d6a23d`, clean neutral backgrounds, high typographic contrast) must be preserved across all upcoming development steps.
- **Rationale:** Maintains brand consistency, professional academic aesthetics, and avoids disruption to previously completed views.
