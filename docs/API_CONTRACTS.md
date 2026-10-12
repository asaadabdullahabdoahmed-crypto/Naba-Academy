# NABA ACADEMY — API TRANSPORT CONTRACTS SPECIFICATION
**أكاديمية نبأ للتعلم الإلكتروني**

> **Document Version:** 1.0.0  
> **API Version Target:** `/api/v1`  
> **Status:** RATIFIED CONTRACT SPECIFICATION (STEP 05D)  
> **Governing ADRs:** ADR-03 (REST API), ADR-04 (Server Authority), ADR-05 (RBAC), ADR-08 (Ledger), ADR-14/15 (No 2FA/SSO in v1)

---

## 1. Architectural Purpose & Boundaries

### 1.1 Separation of Concerns: `src/types/` vs. `src/contracts/`
- **`src/types/` (Domain Layer):**
  Represents shared frontend and UI-facing models, component state shapes, dictionary keys, and domain entities (e.g., `StudentProfile`, `CourseItem`, `GradebookEntry`).
- **`src/contracts/` (Transport Boundary Layer):**
  Represents strict wire contracts crossing the HTTP boundary between the React client and the future backend. It defines standard envelopes, request payloads, response bodies, and wire serialization formats.

### 1.2 Strict Dependency Rule
```
src/contracts/  ──► imports from ──►  src/types/
src/types/      ──x MUST NOT import  src/contracts/
```
- Dependency direction is strictly one-way (`contracts` depends on `types`).
- `src/types/` contains zero imports from `src/contracts/` to guarantee no circular coupling.

---

## 2. Global Transport Conventions

### 2.1 API Base URL
All REST operations are scoped under the versioned base path:
```http
/api/v1
```

### 2.2 Standard Response Envelopes
All API responses follow a uniform wire envelope structure.

#### Success Envelope (`ApiSuccess<T>`)
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "requestId": "req-9842-ab12"
  }
}
```

#### Error Envelope (`ApiErrorResponse`)
```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested section was not found or is not open for enrollment.",
    "details": [
      {
        "field": "sectionId",
        "message": "Section is closed for enrollment",
        "code": "SECTION_CLOSED"
      }
    ],
    "trace_id": "trc-20260920-883921"
  }
}
```

- **Wire Error Properties:**
  - `code` (`string`): Machine-readable error code.
  - `message` (`string`): Human-readable descriptive message.
  - `details` (`unknown | ValidationErrorDetail[] | Record<string, unknown>`): Structured field-level validation errors or contextual metadata.
  - `trace_id` (`string`): Correlating trace identifier for backend log audit (ADR-07).
- **Public Safety Guarantee:** Wire errors never expose stack traces, database query fragments, or internal exception objects.

### 2.3 Canonical Pagination Convention
All paginated list endpoints use a uniform 1-indexed pagination query and response metadata:

#### Query Parameters (`PaginationQuery`)
- `page` (`number`, default: 1)
- `pageSize` (`number`, default: 20)
- `sort` (`string`, optional)
- `direction` (`'asc' | 'desc'`, optional)

#### Response Metadata (`PaginationMeta`)
```json
{
  "page": 1,
  "pageSize": 20,
  "totalItems": 84,
  "totalPages": 5,
  "hasNext": true,
  "hasPrevious": false
}
```

---

## 3. Authentication & Session Architecture

### 3.1 Session Transport Mechanism Decision: UNDECIDED
The underlying session mechanism is intentionally **not coupled** into wire contracts at this stage:
- The architecture allows for HTTP-only secure cookies (`Set-Cookie`) or secure bearer tokens managed by infrastructure.
- **No JWT tokens (`accessToken`, `refreshToken`)** are exposed or assumed in `LoginResponse` or auth contracts.

### 3.2 Canonical v1 Authorization Roles
The system enforces 4 canonical authorization roles:
1. `system_admin`: Full system, IT configuration, and security management.
2. `department_head`: Departmental curriculum governance and grade approvals.
3. `instructor`: Section management, lecturing, gradebook entries, attendance.
4. `student`: Academic enrollment, learning activities, transcripts.

*Note:* `alumni` is a graduate lifecycle status of a student account, **not** a distinct authentication identity or auth role.

### 3.3 Explicit Non-Goals for Version 1
In accordance with ADR-13, ADR-14, and ADR-15:
- **No Two-Factor Authentication (2FA)** contracts.
- **No Single Sign-On (SSO)** or National SSO (Nafath) contracts.
- **No AI / Gemini** endpoint contracts.

---

## 4. Contract Module Inventory

| Module | Wire Path Prefix | Primary Flow Contracts |
| :--- | :--- | :--- |
| `common.ts` | — | `ApiSuccess<T>`, `ApiErrorResponse`, `ApiError`, `ValidationErrorDetail`, `PaginationQuery`, `PaginationMeta`, `PaginatedResponse<T>` |
| `identity.ts` | `/api/v1/identity` | `UserSummaryContract`, `UserProfileContract`, `RoleAssignmentContract`, `UserSessionContract` |
| `auth.ts` | `/api/v1/auth` | `LoginRequest`, `LoginResponse`, `RegisterRequest`, `RegisterResponse`, `VerifyEmailRequest`, `VerifyEmailResponse`, `ForgotPasswordRequest`, `ForgotPasswordResponse`, `ResetPasswordRequest`, `ResetPasswordResponse`, `LogoutResponse`, `CurrentUserResponse`, `SessionListResponse`, `LogoutOtherSessionsRequest`, `LogoutOtherSessionsResponse`, `ApplicationStatusLookupRequest`, `ApplicationStatusLookupResponse` |
| `academic.ts` | `/api/v1/academic` | `DepartmentSummaryContract`, `DepartmentDetailResponse`, `DepartmentListResponse`, `ProgramSummaryContract`, `ProgramDetailResponse`, `ProgramListResponse`, `CourseSummaryContract`, `CourseDetailResponse`, `CourseListResponse`, `CourseOfferingSummaryContract`, `CourseOfferingListResponse`, `SectionSummaryContract`, `SectionListResponse`, `AcademicTermSummaryContract`, `AcademicCalendarResponse` |
| `student.ts` | `/api/v1/student` | `StudentProfileResponse`, `StudentDashboardResponse`, `StudentCoursesResponse`, `StudentCourseDetailResponse`, `StudentAttendanceResponse`, `StudentGradesResponse`, `StudentTranscriptResponse`, `StudentRegistrationOptionsResponse`, `StudentRegistrationRequest`, `StudentRegistrationResponse`, `StudentFinanceSummaryResponse` |
| `assessment.ts` | `/api/v1/assessments` | `ExamListResponse`, `ExamDetailResponse`, `ExamPrecheckRequest`, `ExamPrecheckResponse`, `ExamAttemptBootstrapResponse`, `AnswerSubmissionRequest`, `AnswerSubmissionResponse`, `ExamSubmissionRequest`, `ExamSubmissionResponse`, `LessonQuizResponse`, `QuizSubmissionRequest`, `QuizSubmissionResponse` |
| `finance.ts` | `/api/v1/finance` | `InvoiceListResponse`, `InvoiceDetailResponse`, `PaymentSummaryResponse`, `FinancialHoldSummaryResponse` |
| `documents.ts` | `/api/v1/documents` | `DocumentListResponse`, `DocumentMetadataResponse`, `DocumentRequestPayload`, `DocumentRequestResponse`, `VerificationResultResponse` |
| `communication.ts`| `/api/v1/communication`| `NewsListResponse`, `NewsDetailResponse`, `AnnouncementListResponse`, `NotificationSummaryResponse`, `ContactMessageRequest`, `ContactMessageResponse` |

---

## 5. Evolution Rules

1. **No Implementation in Frontend:**
   These files define wire shapes only. No HTTP clients, `fetch` wrappers, Axios instances, or React Query hooks are implemented in STEP 05.
2. **Backend Alignment:**
   STEP 06 (Backend Foundation) will implement the modular monolith server and controllers against these exact contract shapes.
3. **Change Control:**
   Once backend implementation commences in STEP 06, contract changes must be versioned and coordinated with both frontend consumers and backend handlers.
