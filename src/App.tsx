import React, { useEffect, useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useParams,
  useLocation,
} from 'react-router-dom';
import { Locale } from './i18n/dictionaries';
import { PublicLayout } from './components/layout/PublicLayout';
import { PortalLayout } from './components/layout/PortalLayout';
import { RouteVerificationDrawer } from './components/ui/RouteVerificationDrawer';
import { ShieldCheck } from 'lucide-react';
import { ToastProvider } from './components/ui/toast';
import { ConfirmationDialogProvider } from './components/ui/dialog';
import { I18nProvider } from './i18n/I18nProvider';

// Public views
import { HomePage } from './views/public/HomePage';
import { AboutPage } from './views/public/AboutPage';
import { ProgramsPage } from './views/public/ProgramsPage';
import { ProgramDetailPage } from './views/public/ProgramDetailPage';
import { AdmissionsPage } from './views/public/AdmissionsPage';
import { AcademicCalendarPage } from './views/public/AcademicCalendarPage';
import { FacultyPublicPage } from './views/public/FacultyPublicPage';
import { ElearningPlatformPage } from './views/public/ElearningPlatformPage';
import { AccreditationPage } from './views/public/AccreditationPage';
import { NewsPage } from './views/public/NewsPage';
import { NewsDetailPage } from './views/public/NewsDetailPage';
import { ContactPage } from './views/public/ContactPage';
import { FaqPage } from './views/public/FaqPage';
import { PrivacyPage } from './views/public/PrivacyPage';
import { TermsPage } from './views/public/TermsPage';
import { PublicLibraryPage } from './views/public/PublicLibraryPage';

// Auth views
import { LoginPage } from './views/auth/LoginPage';
import { RegisterPage } from './views/auth/RegisterPage';
import { ForgotPasswordPage } from './views/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './views/auth/ResetPasswordPage';
import { VerifyOtpPage } from './views/auth/VerifyOtpPage';
import { ApplicationStatusPage } from './views/auth/ApplicationStatusPage';

// Student views
import { StudentDashboardPage } from './views/student/StudentDashboardPage';
import { StudentCoursesPage } from './views/student/StudentCoursesPage';
import { StudentCourseDetailPage } from './views/student/StudentCourseDetailPage';
import { StudentLessonPage } from './views/student/StudentLessonPage';
import { StudentQuizPage } from './views/student/StudentQuizPage';
import { StudentLecturesPage } from './views/student/StudentLecturesPage';
import { StudentAssignmentsPage } from './views/student/StudentAssignmentsPage';
import { StudentExamsPage } from './views/student/StudentExamsPage';
import { StudentExamPrecheckPage } from './views/student/StudentExamPrecheckPage';
import { StudentExamAttemptPage } from './views/student/StudentExamAttemptPage';
import { StudentGradesPage } from './views/student/StudentGradesPage';
import { StudentTranscriptPage } from './views/student/StudentTranscriptPage';
import { StudentSchedulePage } from './views/student/StudentSchedulePage';
import { StudentAttendancePage } from './views/student/StudentAttendancePage';
import { StudentRegistrationPage } from './views/student/StudentRegistrationPage';
import { StudentFinancePage } from './views/student/StudentFinancePage';
import { StudentAdvisingPage } from './views/student/StudentAdvisingPage';
import { StudentCertificatesPage } from './views/student/StudentCertificatesPage';
import { StudentAppealsPage } from './views/student/StudentAppealsPage';
import { StudentLibraryPage } from './views/student/StudentLibraryPage';
import { StudentForumsPage } from './views/student/StudentForumsPage';
import { StudentProfilePage } from './views/student/StudentProfilePage';
import { StudentSettingsPage } from './views/student/StudentSettingsPage';

// Instructor views
import { InstructorDashboardPage } from './views/instructor/InstructorDashboardPage';
import { InstructorCoursesPage } from './views/instructor/InstructorCoursesPage';
import { InstructorCourseDetailPage } from './views/instructor/InstructorCourseDetailPage';
import { InstructorCourseStudentsPage } from './views/instructor/InstructorCourseStudentsPage';
import { InstructorCourseLecturesPage } from './views/instructor/InstructorCourseLecturesPage';
import { InstructorCourseAssignmentsPage } from './views/instructor/InstructorCourseAssignmentsPage';
import { InstructorSectionsPage } from './views/instructor/InstructorSectionsPage';
import { InstructorStudentsPage } from './views/instructor/InstructorStudentsPage';
import { InstructorLecturesPage } from './views/instructor/InstructorLecturesPage';
import { InstructorContentPage } from './views/instructor/InstructorContentPage';
import { InstructorLiveSessionPage } from './views/instructor/InstructorLiveSessionPage';
import { InstructorAssignmentsPage } from './views/instructor/InstructorAssignmentsPage';
import { InstructorGradingPage } from './views/instructor/InstructorGradingPage';
import { InstructorQuestionBankPage } from './views/instructor/InstructorQuestionBankPage';
import { InstructorExamsPage } from './views/instructor/InstructorExamsPage';
import { InstructorAttendancePage } from './views/instructor/InstructorAttendancePage';
import { InstructorExcusesPage } from './views/instructor/InstructorExcusesPage';
import { InstructorAnalyticsPage } from './views/instructor/InstructorAnalyticsPage';
import { InstructorOfficeHoursPage } from './views/instructor/InstructorOfficeHoursPage';
import { InstructorMessagesPage } from './views/instructor/InstructorMessagesPage';
import { InstructorAnnouncementsPage } from './views/instructor/InstructorAnnouncementsPage';
import { InstructorLibraryPage } from './views/instructor/InstructorLibraryPage';
import { InstructorProfilePage } from './views/instructor/InstructorProfilePage';
import { InstructorSettingsPage } from './views/instructor/InstructorSettingsPage';

// Department views
import { DepartmentDashboardPage } from './views/department/DepartmentDashboardPage';
import { DepartmentFacultyPage } from './views/department/DepartmentFacultyPage';
import { DepartmentFacultyDetailPage } from './views/department/DepartmentFacultyDetailPage';
import { DepartmentProgramsPage } from './views/department/DepartmentProgramsPage';
import { DepartmentProgramDetailPage } from './views/department/DepartmentProgramDetailPage';
import { DepartmentCourseOfferingsPage } from './views/department/DepartmentCourseOfferingsPage';
import { DepartmentCourseAssignmentsPage } from './views/department/DepartmentCourseAssignmentsPage';
import { DepartmentEnrollmentApprovalsPage } from './views/department/DepartmentEnrollmentApprovalsPage';
import { DepartmentExamSchedulesPage } from './views/department/DepartmentExamSchedulesPage';
import { DepartmentAcademicAdvisingPage } from './views/department/DepartmentAcademicAdvisingPage';
import { DepartmentAppealsPage } from './views/department/DepartmentAppealsPage';
import { DepartmentQualityPage } from './views/department/DepartmentQualityPage';
import { DepartmentReportsPage } from './views/department/DepartmentReportsPage';
import { DepartmentProfilePage } from './views/department/DepartmentProfilePage';
import { DepartmentSettingsPage } from './views/department/DepartmentSettingsPage';

// Admin views
import { AdminDashboardPage } from './views/admin/AdminDashboardPage';
import { AdminUsersPage } from './views/admin/AdminUsersPage';
import { AdminUserDetailPage } from './views/admin/AdminUserDetailPage';
import { AdminRolesPage } from './views/admin/AdminRolesPage';
import { AdminProgramsPage } from './views/admin/AdminProgramsPage';
import { AdminCoursesPage } from './views/admin/AdminCoursesPage';
import { AdminDepartmentsPage } from './views/admin/AdminDepartmentsPage';
import { AdminAdmissionsPage } from './views/admin/AdminAdmissionsPage';
import { AdminFinancePage } from './views/admin/AdminFinancePage';
import { AdminReportsPage } from './views/admin/AdminReportsPage';
import { AdminAuditLogsPage } from './views/admin/AdminAuditLogsPage';
import { AdminSystemHealthPage } from './views/admin/AdminSystemHealthPage';
import { AdminCmsNewsPage } from './views/admin/AdminCmsNewsPage';
import { AdminCmsBannersPage } from './views/admin/AdminCmsBannersPage';
import { AdminCmsPagesPage } from './views/admin/AdminCmsPagesPage';
import { AdminSupportPage } from './views/admin/AdminSupportPage';
import { AdminIntegrationsPage } from './views/admin/AdminIntegrationsPage';
import { AdminProfilePage } from './views/admin/AdminProfilePage';
import { AdminSettingsPage } from './views/admin/AdminSettingsPage';

// Alumni views
import { AlumniDashboardPage } from './views/alumni/AlumniDashboardPage';
import { AlumniVerificationPage } from './views/alumni/AlumniVerificationPage';
import { AlumniRecordsPage } from './views/alumni/AlumniRecordsPage';
import { AlumniJobsPage } from './views/alumni/AlumniJobsPage';
import { AlumniDirectoryPage } from './views/alumni/AlumniDirectoryPage';
import { AlumniMentorshipPage } from './views/alumni/AlumniMentorshipPage';
import { AlumniEventsPage } from './views/alumni/AlumniEventsPage';
import { AlumniBenefitsPage } from './views/alumni/AlumniBenefitsPage';
import { AlumniGivingPage } from './views/alumni/AlumniGivingPage';
import { AlumniProfilePage } from './views/alumni/AlumniProfilePage';
import { AlumniSettingsPage } from './views/alumni/AlumniSettingsPage';

// System status views
import { SystemStatusPage } from './views/system/SystemStatusPage';

/**
 * LocaleController syncs HTML dir and lang attributes with the active locale
 */
const LocaleController: React.FC<{ children: (locale: Locale) => React.ReactNode }> = ({ children }) => {
  const { locale } = useParams<{ locale: Locale }>();
  const activeLocale: Locale = locale === 'en' ? 'en' : 'ar';

  useEffect(() => {
    document.documentElement.lang = activeLocale;
    document.documentElement.dir = activeLocale === 'ar' ? 'rtl' : 'ltr';
  }, [activeLocale]);

  return (
    <I18nProvider locale={activeLocale}>
      {children(activeLocale)}
    </I18nProvider>
  );
};

export default function App() {
  const [isVerifierOpen, setIsVerifierOpen] = useState(false);

  useEffect(() => {
    // Hidden dev shortcut Alt+R to inspect routes if needed by internal developers
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'r' || e.key === 'R')) {
        setIsVerifierOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <BrowserRouter>
      <ToastProvider>
        <ConfirmationDialogProvider>
          {/* Route Verification Drawer accessible via Alt+R only (no public UI badges) */}
            <RouteVerificationDrawer
              isOpen={isVerifierOpen}
              onClose={() => setIsVerifierOpen(false)}
              locale="ar"
            />

            <Routes>
        {/* Default route redirect to Arabic */}
        <Route path="/" element={<Navigate to="/ar" replace />} />

        {/* Dynamic Locale Wrapper Route */}
        <Route
          path="/:locale/*"
          element={
            <LocaleController>
              {(loc) => (
                <Routes>
                  {/* PUBLIC ROUTES */}
                  <Route element={<PublicLayout locale={loc} />}>
                    <Route index element={<HomePage locale={loc} onOpenRouteVerifier={() => setIsVerifierOpen(true)} />} />
                    <Route path="about" element={<AboutPage locale={loc} />} />
                    <Route path="programs" element={<ProgramsPage locale={loc} />} />
                    <Route path="programs/:programId" element={<ProgramDetailPage locale={loc} />} />
                    <Route path="admissions" element={<AdmissionsPage locale={loc} />} />
                    <Route path="calendar" element={<AcademicCalendarPage locale={loc} />} />
                    <Route path="faculty" element={<FacultyPublicPage locale={loc} />} />
                    <Route path="elearning" element={<ElearningPlatformPage locale={loc} />} />
                    <Route path="accreditation" element={<AccreditationPage locale={loc} />} />
                    <Route path="news" element={<NewsPage locale={loc} />} />
                    <Route path="news/:newsId" element={<NewsDetailPage locale={loc} />} />
                    <Route path="contact" element={<ContactPage locale={loc} />} />
                    <Route path="faq" element={<FaqPage locale={loc} />} />
                    <Route path="privacy" element={<PrivacyPage locale={loc} />} />
                    <Route path="terms" element={<TermsPage locale={loc} />} />
                    <Route path="library" element={<PublicLibraryPage locale={loc} />} />
                  </Route>

                  {/* AUTH ROUTES */}
                  <Route path="auth/login" element={<LoginPage locale={loc} />} />
                  <Route path="auth/register" element={<RegisterPage locale={loc} />} />
                  <Route path="auth/forgot-password" element={<ForgotPasswordPage locale={loc} />} />
                  <Route path="auth/reset-password" element={<ResetPasswordPage locale={loc} />} />
                  <Route path="auth/verify-email" element={<VerifyOtpPage locale={loc} />} />
                  <Route path="auth/verify-otp" element={<VerifyOtpPage locale={loc} />} />
                  <Route path="auth/application-status" element={<ApplicationStatusPage locale={loc} />} />

                  {/* STUDENT PORTAL */}
                  <Route element={<PortalLayout locale={loc} portalKey="student" />}>
                    <Route path="student/dashboard" element={<StudentDashboardPage locale={loc} />} />
                    <Route path="student/courses" element={<StudentCoursesPage locale={loc} />} />
                    <Route path="student/courses/:courseId" element={<StudentCourseDetailPage locale={loc} />} />
                    <Route path="student/courses/:courseId/lessons/:lessonId" element={<StudentLessonPage locale={loc} />} />
                    <Route path="student/courses/:courseId/quiz" element={<StudentQuizPage locale={loc} />} />
                    <Route path="student/lessons/:lessonId/quiz" element={<StudentQuizPage locale={loc} />} />
                    <Route path="student/lectures" element={<StudentLecturesPage locale={loc} />} />
                    <Route path="student/assignments" element={<StudentAssignmentsPage locale={loc} />} />
                    <Route path="student/exams" element={<StudentExamsPage locale={loc} />} />
                    <Route path="student/exams/:examId" element={<StudentExamsPage locale={loc} />} />
                    <Route path="student/exams/:examId/precheck" element={<StudentExamPrecheckPage locale={loc} />} />
                    <Route path="student/exams/:examId/attempt" element={<StudentExamAttemptPage locale={loc} />} />
                    <Route path="student/grades" element={<StudentGradesPage locale={loc} />} />
                    <Route path="student/transcript" element={<StudentTranscriptPage locale={loc} />} />
                    <Route path="student/schedule" element={<StudentSchedulePage locale={loc} />} />
                    <Route path="student/attendance" element={<StudentAttendancePage locale={loc} />} />
                    <Route path="student/registration" element={<StudentRegistrationPage locale={loc} />} />
                    <Route path="student/finance" element={<StudentFinancePage locale={loc} />} />
                    <Route path="student/advising" element={<StudentAdvisingPage locale={loc} />} />
                    <Route path="student/certificates" element={<StudentCertificatesPage locale={loc} />} />
                    <Route path="student/documents" element={<StudentCertificatesPage locale={loc} />} />
                    <Route path="student/appeals" element={<StudentAppealsPage locale={loc} />} />
                    <Route path="student/library" element={<StudentLibraryPage locale={loc} />} />
                    <Route path="student/forums" element={<StudentForumsPage locale={loc} />} />
                    <Route path="student/messages" element={<StudentForumsPage locale={loc} />} />
                    <Route path="student/support" element={<StudentAppealsPage locale={loc} />} />
                    <Route path="student/profile" element={<StudentProfilePage locale={loc} />} />
                    <Route path="student/settings" element={<StudentSettingsPage locale={loc} />} />
                  </Route>

                  {/* INSTRUCTOR PORTAL */}
                  <Route element={<PortalLayout locale={loc} portalKey="instructor" />}>
                    <Route path="instructor/dashboard" element={<InstructorDashboardPage locale={loc} />} />
                    <Route path="instructor/courses" element={<InstructorCoursesPage locale={loc} />} />
                    <Route path="instructor/courses/:courseId" element={<InstructorCourseDetailPage locale={loc} />} />
                    <Route path="instructor/courses/:courseId/students" element={<InstructorCourseStudentsPage locale={loc} />} />
                    <Route path="instructor/courses/:courseId/lectures" element={<InstructorCourseLecturesPage locale={loc} />} />
                    <Route path="instructor/courses/:courseId/assignments" element={<InstructorCourseAssignmentsPage locale={loc} />} />
                    <Route path="instructor/sections" element={<InstructorSectionsPage locale={loc} />} />
                    <Route path="instructor/students" element={<InstructorStudentsPage locale={loc} />} />
                    <Route path="instructor/lectures" element={<InstructorLecturesPage locale={loc} />} />
                    <Route path="instructor/content" element={<InstructorContentPage locale={loc} />} />
                    <Route path="instructor/live" element={<InstructorLiveSessionPage locale={loc} />} />
                    <Route path="instructor/live-session" element={<InstructorLiveSessionPage locale={loc} />} />
                    <Route path="instructor/assignments" element={<InstructorAssignmentsPage locale={loc} />} />
                    <Route path="instructor/grading" element={<InstructorGradingPage locale={loc} />} />
                    <Route path="instructor/grades" element={<InstructorGradingPage locale={loc} />} />
                    <Route path="instructor/question-bank" element={<InstructorQuestionBankPage locale={loc} />} />
                    <Route path="instructor/exams" element={<InstructorExamsPage locale={loc} />} />
                    <Route path="instructor/attendance" element={<InstructorAttendancePage locale={loc} />} />
                    <Route path="instructor/excuses" element={<InstructorExcusesPage locale={loc} />} />
                    <Route path="instructor/analytics" element={<InstructorAnalyticsPage locale={loc} />} />
                    <Route path="instructor/office-hours" element={<InstructorOfficeHoursPage locale={loc} />} />
                    <Route path="instructor/messages" element={<InstructorMessagesPage locale={loc} />} />
                    <Route path="instructor/announcements" element={<InstructorAnnouncementsPage locale={loc} />} />
                    <Route path="instructor/library" element={<InstructorLibraryPage locale={loc} />} />
                    <Route path="instructor/profile" element={<InstructorProfilePage locale={loc} />} />
                    <Route path="instructor/settings" element={<InstructorSettingsPage locale={loc} />} />
                  </Route>

                  {/* DEPARTMENT HEAD PORTAL */}
                  <Route element={<PortalLayout locale={loc} portalKey="department" />}>
                    <Route path="department/dashboard" element={<DepartmentDashboardPage locale={loc} />} />
                    <Route path="department/faculty" element={<DepartmentFacultyPage locale={loc} />} />
                    <Route path="department/faculty/:facultyId" element={<DepartmentFacultyDetailPage locale={loc} />} />
                    <Route path="department/instructors" element={<DepartmentFacultyPage locale={loc} />} />
                    <Route path="department/instructors/:facultyId" element={<DepartmentFacultyDetailPage locale={loc} />} />
                    <Route path="department/programs" element={<DepartmentProgramsPage locale={loc} />} />
                    <Route path="department/programs/:programId" element={<DepartmentProgramDetailPage locale={loc} />} />
                    <Route path="department/curricula" element={<DepartmentProgramsPage locale={loc} />} />
                    <Route path="department/courses" element={<DepartmentCourseOfferingsPage locale={loc} />} />
                    <Route path="department/sections" element={<DepartmentCourseOfferingsPage locale={loc} />} />
                    <Route path="department/course-offerings" element={<DepartmentCourseOfferingsPage locale={loc} />} />
                    <Route path="department/course-assignments" element={<DepartmentCourseAssignmentsPage locale={loc} />} />
                    <Route path="department/enrollments" element={<DepartmentEnrollmentApprovalsPage locale={loc} />} />
                    <Route path="department/students" element={<DepartmentAcademicAdvisingPage locale={loc} />} />
                    <Route path="department/exam-schedules" element={<DepartmentExamSchedulesPage locale={loc} />} />
                    <Route path="department/advising" element={<DepartmentAcademicAdvisingPage locale={loc} />} />
                    <Route path="department/appeals" element={<DepartmentAppealsPage locale={loc} />} />
                    <Route path="department/violations" element={<DepartmentAppealsPage locale={loc} />} />
                    <Route path="department/notifications" element={<DepartmentReportsPage locale={loc} />} />
                    <Route path="department/grades" element={<DepartmentReportsPage locale={loc} />} />
                    <Route path="department/attendance" element={<DepartmentReportsPage locale={loc} />} />
                    <Route path="department/quality" element={<DepartmentQualityPage locale={loc} />} />
                    <Route path="department/reports" element={<DepartmentReportsPage locale={loc} />} />
                    <Route path="department/profile" element={<DepartmentProfilePage locale={loc} />} />
                    <Route path="department/settings" element={<DepartmentSettingsPage locale={loc} />} />
                  </Route>

                  {/* SYSTEM ADMIN PORTAL */}
                  <Route element={<PortalLayout locale={loc} portalKey="admin" />}>
                    <Route path="admin/dashboard" element={<AdminDashboardPage locale={loc} />} />
                    <Route path="admin/users" element={<AdminUsersPage locale={loc} />} />
                    <Route path="admin/users/:userId" element={<AdminUserDetailPage locale={loc} />} />
                    <Route path="admin/roles" element={<AdminRolesPage locale={loc} />} />
                    <Route path="admin/students" element={<AdminUsersPage locale={loc} />} />
                    <Route path="admin/programs" element={<AdminProgramsPage locale={loc} />} />
                    <Route path="admin/curricula" element={<AdminProgramsPage locale={loc} />} />
                    <Route path="admin/courses" element={<AdminCoursesPage locale={loc} />} />
                    <Route path="admin/terms" element={<AdminCoursesPage locale={loc} />} />
                    <Route path="admin/library" element={<AdminCoursesPage locale={loc} />} />
                    <Route path="admin/departments" element={<AdminDepartmentsPage locale={loc} />} />
                    <Route path="admin/admissions" element={<AdminAdmissionsPage locale={loc} />} />
                    <Route path="admin/registration" element={<AdminSettingsPage locale={loc} />} />
                    <Route path="admin/finance" element={<AdminFinancePage locale={loc} />} />
                    <Route path="admin/documents" element={<AdminReportsPage locale={loc} />} />
                    <Route path="admin/graduation" element={<AdminReportsPage locale={loc} />} />
                    <Route path="admin/reports" element={<AdminReportsPage locale={loc} />} />
                    <Route path="admin/grades" element={<AdminReportsPage locale={loc} />} />
                    <Route path="admin/audit" element={<AdminAuditLogsPage locale={loc} />} />
                    <Route path="admin/audit-logs" element={<AdminAuditLogsPage locale={loc} />} />
                    <Route path="admin/security" element={<AdminSettingsPage locale={loc} />} />
                    <Route path="admin/system-status" element={<AdminSystemHealthPage locale={loc} />} />
                    <Route path="admin/system-health" element={<AdminSystemHealthPage locale={loc} />} />
                    <Route path="admin/assessments" element={<AdminSystemHealthPage locale={loc} />} />
                    <Route path="admin/cms/news" element={<AdminCmsNewsPage locale={loc} />} />
                    <Route path="admin/cms/banners" element={<AdminCmsBannersPage locale={loc} />} />
                    <Route path="admin/cms/pages" element={<AdminCmsPagesPage locale={loc} />} />
                    <Route path="admin/support" element={<AdminSupportPage locale={loc} />} />
                    <Route path="admin/integrations" element={<AdminIntegrationsPage locale={loc} />} />
                    <Route path="admin/profile" element={<AdminProfilePage locale={loc} />} />
                    <Route path="admin/settings" element={<AdminSettingsPage locale={loc} />} />
                  </Route>

                  {/* ALUMNI PORTAL */}
                  <Route element={<PortalLayout locale={loc} portalKey="alumni" />}>
                    <Route path="alumni/dashboard" element={<AlumniDashboardPage locale={loc} />} />
                    <Route path="alumni/certificate" element={<AlumniVerificationPage locale={loc} />} />
                    <Route path="alumni/verification" element={<AlumniVerificationPage locale={loc} />} />
                    <Route path="alumni/transcript" element={<AlumniRecordsPage locale={loc} />} />
                    <Route path="alumni/records" element={<AlumniRecordsPage locale={loc} />} />
                    <Route path="alumni/documents" element={<AlumniRecordsPage locale={loc} />} />
                    <Route path="alumni/jobs" element={<AlumniJobsPage locale={loc} />} />
                    <Route path="alumni/internships" element={<AlumniJobsPage locale={loc} />} />
                    <Route path="alumni/events" element={<AlumniEventsPage locale={loc} />} />
                    <Route path="alumni/announcements" element={<AlumniEventsPage locale={loc} />} />
                    <Route path="alumni/directory" element={<AlumniDirectoryPage locale={loc} />} />
                    <Route path="alumni/mentorship" element={<AlumniMentorshipPage locale={loc} />} />
                    <Route path="alumni/support" element={<AlumniMentorshipPage locale={loc} />} />
                    <Route path="alumni/benefits" element={<AlumniBenefitsPage locale={loc} />} />
                    <Route path="alumni/giving" element={<AlumniGivingPage locale={loc} />} />
                    <Route path="alumni/profile" element={<AlumniProfilePage locale={loc} />} />
                    <Route path="alumni/settings" element={<AlumniSettingsPage locale={loc} />} />
                  </Route>

                  {/* SYSTEM STATES & ERRORS */}
                  <Route path="system/403" element={<SystemStatusPage forcedCode="403" locale={loc} />} />
                  <Route path="system/404" element={<SystemStatusPage forcedCode="404" locale={loc} />} />
                  <Route path="system/500" element={<SystemStatusPage forcedCode="500" locale={loc} />} />
                  <Route path="system/maintenance" element={<SystemStatusPage forcedCode="maintenance" locale={loc} />} />
                  <Route path="system/session-expired" element={<SystemStatusPage forcedCode="session-expired" locale={loc} />} />
                  <Route path="system/account-disabled" element={<SystemStatusPage forcedCode="account-disabled" locale={loc} />} />
                  <Route path="system/service-unavailable" element={<SystemStatusPage forcedCode="service-unavailable" locale={loc} />} />

                  {/* Wildcard Fallback */}
                  <Route path="*" element={<SystemStatusPage forcedCode="404" locale={loc} />} />
                </Routes>
              )}
            </LocaleController>
          }
        />

        {/* Fallback for naked paths without locale prefix (e.g. /student/dashboard -> /ar/student/dashboard) */}
        <Route path="*" element={<Navigate to="/ar/system/404" replace />} />
      </Routes>
    </ConfirmationDialogProvider>
  </ToastProvider>
</BrowserRouter>
  );
}
