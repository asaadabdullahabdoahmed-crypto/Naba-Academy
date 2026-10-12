export interface NavItem {
  id: string;
  path: string;
  titleKey: string;
  titleAr: string;
  titleEn: string;
  icon: string;
  badge?: string;
}

export interface PortalConfig {
  key: string;
  nameKey: string;
  nameAr: string;
  nameEn: string;
  basePath: string;
  color: string;
  bgSoft: string;
  badgeKey: string;
  badgeAr: string;
  badgeEn: string;
  items: NavItem[];
}

export const PORTAL_CONFIGS: Record<string, PortalConfig> = {
  student: {
    key: 'student',
    nameKey: 'portals.student',
    nameAr: 'بوابة الطالب',
    nameEn: 'Student Portal',
    basePath: '/student',
    color: '#082B50',
    bgSoft: '#EFF3F8',
    badgeKey: 'roles.student',
    badgeAr: 'طالب منتظم',
    badgeEn: 'Enrolled Student',
    items: [
      { id: 'st-dash', path: '/student/dashboard', titleKey: 'navigation.student.dashboard', titleAr: 'لوحة التحكم', titleEn: 'Dashboard', icon: 'LayoutDashboard' },
      { id: 'st-courses', path: '/student/courses', titleKey: 'navigation.student.courses', titleAr: 'مقرراتي الدراسية', titleEn: 'My Courses', icon: 'BookMarked' },
      { id: 'st-course-detail', path: '/student/courses/cs101', titleKey: 'navigation.student.courseDetail', titleAr: 'تفاصيل المقرر', titleEn: 'Course Details', icon: 'FileText' },
      { id: 'st-lesson', path: '/student/courses/cs101/lessons/lesson-1', titleKey: 'navigation.student.lessons', titleAr: 'عرض المحاضرات', titleEn: 'Lessons', icon: 'PlayCircle' },
      { id: 'st-quiz', path: '/student/lessons/lesson-1/quiz', titleKey: 'navigation.student.quiz', titleAr: 'اختبار الدرس', titleEn: 'Lesson Quiz', icon: 'HelpCircle' },
      { id: 'st-assign', path: '/student/assignments', titleKey: 'navigation.student.assignments', titleAr: 'التكليفات والواجبات', titleEn: 'Assignments', icon: 'ClipboardList' },
      { id: 'st-exams', path: '/student/exams', titleKey: 'navigation.student.exams', titleAr: 'جدول الاختبارات', titleEn: 'Exams', icon: 'CalendarCheck' },
      { id: 'st-exam-detail', path: '/student/exams/exam-midterm', titleKey: 'navigation.student.examDetail', titleAr: 'تفاصيل الاختبار', titleEn: 'Exam Overview', icon: 'Award' },
      { id: 'st-exam-precheck', path: '/student/exams/exam-midterm/precheck', titleKey: 'navigation.student.examPrecheck', titleAr: 'فحص ما قبل الاختبار', titleEn: 'Exam Pre-Check', icon: 'ShieldAlert' },
      { id: 'st-exam-attempt', path: '/student/exams/exam-midterm/attempt', titleKey: 'navigation.student.examAttempt', titleAr: 'أداء الاختبار', titleEn: 'Active Exam', icon: 'CheckSquare' },
      { id: 'st-grades', path: '/student/grades', titleKey: 'navigation.student.grades', titleAr: 'السجل والدرجات', titleEn: 'Grades & GPA', icon: 'TrendingUp' },
      { id: 'st-attend', path: '/student/attendance', titleKey: 'navigation.student.attendance', titleAr: 'سجل الحضور', titleEn: 'Attendance', icon: 'UserCheck' },
      { id: 'st-schedule', path: '/student/schedule', titleKey: 'navigation.student.schedule', titleAr: 'الجدول الأسبوعي', titleEn: 'Class Schedule', icon: 'Calendar' },
      { id: 'st-reg', path: '/student/registration', titleKey: 'navigation.student.registration', titleAr: 'التسجيل الفصلي', titleEn: 'Course Registration', icon: 'PlusCircle' },
      { id: 'st-fin', path: '/student/finance', titleKey: 'navigation.student.finance', titleAr: 'السجل المالي', titleEn: 'Finance & Payments', icon: 'CreditCard' },
      { id: 'st-lib', path: '/student/library', titleKey: 'navigation.student.library', titleAr: 'المكتبة والمصادر', titleEn: 'Library', icon: 'Book' },
      { id: 'st-msg', path: '/student/messages', titleKey: 'navigation.student.messages', titleAr: 'الرسائل والمحادثات', titleEn: 'Messages', icon: 'MessageSquare' },
      { id: 'st-docs', path: '/student/documents', titleKey: 'navigation.student.documents', titleAr: 'الوثائق والإفادات', titleEn: 'Documents', icon: 'FolderArchive' },
      { id: 'st-sup', path: '/student/support', titleKey: 'navigation.student.support', titleAr: 'الدعم الطلابي', titleEn: 'Support', icon: 'LifeBuoy' },
      { id: 'st-prof', path: '/student/profile', titleKey: 'navigation.student.profile', titleAr: 'الملف الأكاديمي', titleEn: 'Profile', icon: 'User' },
    ],
  },
  instructor: {
    key: 'instructor',
    nameKey: 'portals.instructor',
    nameAr: 'بوابة المحاضر',
    nameEn: 'Instructor Portal',
    basePath: '/instructor',
    color: '#082B50',
    bgSoft: '#EFF3F8',
    badgeKey: 'roles.instructor',
    badgeAr: 'أستاذ مقرر',
    badgeEn: 'Course Faculty',
    items: [
      { id: 'inst-dash', path: '/instructor/dashboard', titleKey: 'navigation.instructor.dashboard', titleAr: 'لوحة التحكم', titleEn: 'Dashboard', icon: 'LayoutDashboard' },
      { id: 'inst-courses', path: '/instructor/courses', titleKey: 'navigation.instructor.courses', titleAr: 'المقررات المكلفة', titleEn: 'My Courses', icon: 'BookOpen' },
      { id: 'inst-sections', path: '/instructor/sections', titleKey: 'navigation.instructor.sections', titleAr: 'الشعب الدراسية', titleEn: 'Sections', icon: 'Layers' },
      { id: 'inst-students', path: '/instructor/students', titleKey: 'navigation.instructor.students', titleAr: 'قوائم الطلاب', titleEn: 'Students', icon: 'Users' },
      { id: 'inst-assign', path: '/instructor/assignments', titleKey: 'navigation.instructor.assignments', titleAr: 'الواجبات والتصحيح', titleEn: 'Assignments', icon: 'ClipboardCheck' },
      { id: 'inst-exams', path: '/instructor/exams', titleKey: 'navigation.instructor.exams', titleAr: 'إدارة الاختبارات', titleEn: 'Exams', icon: 'Award' },
      { id: 'inst-qbank', path: '/instructor/question-bank', titleKey: 'navigation.instructor.questionBank', titleAr: 'بنك الأسئلة', titleEn: 'Question Bank', icon: 'Database' },
      { id: 'inst-grades', path: '/instructor/grades', titleKey: 'navigation.instructor.grades', titleAr: 'رصد الدرجات', titleEn: 'Grade Entry', icon: 'BarChart2' },
      { id: 'inst-attend', path: '/instructor/attendance', titleKey: 'navigation.instructor.attendance', titleAr: 'تحضير المحاضرات', titleEn: 'Attendance', icon: 'CheckCircle' },
      { id: 'inst-excuses', path: '/instructor/excuses', titleKey: 'navigation.instructor.excuses', titleAr: 'أعذار الطلاب', titleEn: 'Student Excuses', icon: 'FileQuestion' },
      { id: 'inst-content', path: '/instructor/content', titleKey: 'navigation.instructor.content', titleAr: 'المحتوى والدروس', titleEn: 'Content Builder', icon: 'FolderPlus' },
      { id: 'inst-announce', path: '/instructor/announcements', titleKey: 'navigation.instructor.announcements', titleAr: 'الإعلانات الأكاديمية', titleEn: 'Announcements', icon: 'Bell' },
      { id: 'inst-msg', path: '/instructor/messages', titleKey: 'navigation.instructor.messages', titleAr: 'الرسائل', titleEn: 'Messages', icon: 'Send' },
      { id: 'inst-lib', path: '/instructor/library', titleKey: 'navigation.instructor.library', titleAr: 'المراجع العلمية', titleEn: 'Faculty Library', icon: 'Library' },
      { id: 'inst-prof', path: '/instructor/profile', titleKey: 'navigation.instructor.profile', titleAr: 'الملف الأكاديمي', titleEn: 'Faculty Profile', icon: 'UserCog' },
    ],
  },
  department: {
    key: 'department',
    nameKey: 'portals.department',
    nameAr: 'بوابة رئيس القسم',
    nameEn: 'Department Head Portal',
    basePath: '/department',
    color: '#17324d',
    bgSoft: '#eaf0f5',
    badgeKey: 'roles.department',
    badgeAr: 'رئاسة القسم',
    badgeEn: 'Department Chair',
    items: [
      { id: 'dept-dash', path: '/department/dashboard', titleKey: 'navigation.department.dashboard', titleAr: 'لوحة القيادة', titleEn: 'Dashboard', icon: 'LayoutDashboard' },
      { id: 'dept-prog', path: '/department/programs', titleKey: 'navigation.department.programs', titleAr: 'البرامج الأكاديمية', titleEn: 'Department Programs', icon: 'GraduationCap' },
      { id: 'dept-courses', path: '/department/courses', titleKey: 'navigation.department.courses', titleAr: 'مقررات القسم', titleEn: 'Courses', icon: 'BookCopy' },
      { id: 'dept-curricula', path: '/department/curricula', titleKey: 'navigation.department.curricula', titleAr: 'المناهج والخطط', titleEn: 'Curricula', icon: 'GitMerge' },
      { id: 'dept-sections', path: '/department/sections', titleKey: 'navigation.department.sections', titleAr: 'الشعب والقاعات', titleEn: 'Sections', icon: 'Grid' },
      { id: 'dept-inst', path: '/department/instructors', titleKey: 'navigation.department.instructors', titleAr: 'أعضاء هيئة التدريس', titleEn: 'Faculty Members', icon: 'UserCheck' },
      { id: 'dept-stud', path: '/department/students', titleKey: 'navigation.department.students', titleAr: 'طلاب القسم', titleEn: 'Students', icon: 'GraduationCap' },
      { id: 'dept-enroll', path: '/department/enrollments', titleKey: 'navigation.department.enrollments', titleAr: 'طلبات التسجيل والحذف', titleEn: 'Enrollments', icon: 'UserPlus' },
      { id: 'dept-grades', path: '/department/grades', titleKey: 'navigation.department.grades', titleAr: 'اعتماد الدرجات', titleEn: 'Grade Approvals', icon: 'FileCheck2' },
      { id: 'dept-attend', path: '/department/attendance', titleKey: 'navigation.department.attendance', titleAr: 'الحرمان والغياب', titleEn: 'Attendance & Denials', icon: 'AlertTriangle' },
      { id: 'dept-appeals', path: '/department/appeals', titleKey: 'navigation.department.appeals', titleAr: 'التظلمات والشكاوى', titleEn: 'Appeals', icon: 'Scale' },
      { id: 'dept-viol', path: '/department/violations', titleKey: 'navigation.department.violations', titleAr: 'المخالفات واللجان', titleEn: 'Violations', icon: 'ShieldAlert' },
      { id: 'dept-notif', path: '/department/notifications', titleKey: 'navigation.department.notifications', titleAr: 'التعاميم والقرارات', titleEn: 'Notifications', icon: 'BellRing' },
      { id: 'dept-rep', path: '/department/reports', titleKey: 'navigation.department.reports', titleAr: 'تقارير الأداء', titleEn: 'Analytics & Reports', icon: 'PieChart' },
    ],
  },
  admin: {
    key: 'admin',
    nameKey: 'portals.admin',
    nameAr: 'بوابة الإدارة المركزية',
    nameEn: 'System Admin Portal',
    basePath: '/admin',
    color: '#17324d',
    bgSoft: '#eaf0f5',
    badgeKey: 'roles.admin',
    badgeAr: 'مسؤول النظام',
    badgeEn: 'Administrator',
    items: [
      { id: 'adm-dash', path: '/admin/dashboard', titleKey: 'navigation.admin.dashboard', titleAr: 'لوحة التحكم', titleEn: 'Admin Dashboard', icon: 'Shield' },
      { id: 'adm-users', path: '/admin/users', titleKey: 'navigation.admin.users', titleAr: 'المستخدمون والحسابات', titleEn: 'Users Directory', icon: 'Users' },
      { id: 'adm-roles', path: '/admin/roles', titleKey: 'navigation.admin.roles', titleAr: 'الأدوار والصلاحيات (RBAC)', titleEn: 'Roles & Permissions', icon: 'Key' },
      { id: 'adm-students', path: '/admin/students', titleKey: 'navigation.admin.students', titleAr: 'سجلات الطلاب العامة', titleEn: 'Master Students', icon: 'UserCheck' },
      { id: 'adm-dept', path: '/admin/departments', titleKey: 'navigation.admin.departments', titleAr: 'الأقسام الأكاديمية', titleEn: 'Departments', icon: 'Building2' },
      { id: 'adm-prog', path: '/admin/programs', titleKey: 'navigation.admin.programs', titleAr: 'البرامج والدرجات', titleEn: 'Programs', icon: 'Award' },
      { id: 'adm-courses', path: '/admin/courses', titleKey: 'navigation.admin.courses', titleAr: 'دليل المقررات الشامل', titleEn: 'Course Directory', icon: 'BookMarked' },
      { id: 'adm-curricula', path: '/admin/curricula', titleKey: 'navigation.admin.curricula', titleAr: 'الخطط الدراسية', titleEn: 'Curricula', icon: 'Compass' },
      { id: 'adm-terms', path: '/admin/terms', titleKey: 'navigation.admin.terms', titleAr: 'الفصول والتقويم', titleEn: 'Terms & Calendar', icon: 'CalendarRange' },
      { id: 'adm-admiss', path: '/admin/admissions', titleKey: 'navigation.admin.admissions', titleAr: 'القبول والتسجيل', titleEn: 'Admissions', icon: 'FileCheck' },
      { id: 'adm-reg', path: '/admin/registration', titleKey: 'navigation.admin.registration', titleAr: 'التسجيل الأكاديمي', titleEn: 'Registration', icon: 'Cpu' },
      { id: 'adm-grades', path: '/admin/grades', titleKey: 'navigation.admin.grades', titleAr: 'معايير النتائج والمعدل', titleEn: 'Grade Governance', icon: 'CheckCheck' },
      { id: 'adm-assess', path: '/admin/assessments', titleKey: 'navigation.admin.assessments', titleAr: 'الاختبارات والتقييم', titleEn: 'Assessments', icon: 'ShieldAlert' },
      { id: 'adm-fin', path: '/admin/finance', titleKey: 'navigation.admin.finance', titleAr: 'الشؤون المالية والرسوم', titleEn: 'Financial Ops', icon: 'Wallet' },
      { id: 'adm-docs', path: '/admin/documents', titleKey: 'navigation.admin.documents', titleAr: 'الوثائق والأختام الرقمية', titleEn: 'Document Verification', icon: 'FileBadge' },
      { id: 'adm-grad', path: '/admin/graduation', titleKey: 'navigation.admin.graduation', titleAr: 'شؤون الخريجين والشهادات', titleEn: 'Graduation Operations', icon: 'GraduationCap' },
      { id: 'adm-lib', path: '/admin/library', titleKey: 'navigation.admin.library', titleAr: 'إدارة المكتبة الرقمية', titleEn: 'Library Admin', icon: 'Library' },
      { id: 'adm-rep', path: '/admin/reports', titleKey: 'navigation.admin.reports', titleAr: 'التقارير المؤسسية', titleEn: 'Institutional Reports', icon: 'BarChart3' },
      { id: 'adm-audit', path: '/admin/audit', titleKey: 'navigation.admin.auditLogs', titleAr: 'سجلات المراجعة (Audit)', titleEn: 'Security Audit Logs', icon: 'History' },
      { id: 'adm-sec', path: '/admin/security', titleKey: 'navigation.admin.security', titleAr: 'الأمان وجلسات الدخول', titleEn: 'Security & Access', icon: 'Lock' },
      { id: 'adm-status', path: '/admin/system-status', titleKey: 'navigation.admin.systemHealth', titleAr: 'حالة الخوادم والخدمات', titleEn: 'System Health', icon: 'Activity' },
      { id: 'adm-sup', path: '/admin/support', titleKey: 'navigation.admin.support', titleAr: 'تذاكر الدعم الفني', titleEn: 'Helpdesk Tickets', icon: 'Headphones' },
      { id: 'adm-set', path: '/admin/settings', titleKey: 'navigation.admin.settings', titleAr: 'إعدادات المنصة العامة', titleEn: 'Platform Settings', icon: 'Settings' },
    ],
  },
  alumni: {
    key: 'alumni',
    nameKey: 'portals.alumni',
    nameAr: 'بوابة الخريجين',
    nameEn: 'Alumni Portal',
    basePath: '/alumni',
    color: '#082B50',
    bgSoft: '#EFF3F8',
    badgeKey: 'roles.alumni',
    badgeAr: 'خريج معتمد',
    badgeEn: 'Alumni Member',
    items: [
      { id: 'alm-dash', path: '/alumni/dashboard', titleKey: 'navigation.alumni.dashboard', titleAr: 'لوحة تحكم الخريج', titleEn: 'Dashboard', icon: 'LayoutDashboard' },
      { id: 'alm-cert', path: '/alumni/certificate', titleKey: 'navigation.alumni.certificate', titleAr: 'الشهادة الجدارية الرقمية', titleEn: 'Degree Certificate', icon: 'Award' },
      { id: 'alm-trans', path: '/alumni/transcript', titleKey: 'navigation.alumni.transcript', titleAr: 'السجل الأكاديمي الرسمي', titleEn: 'Official Transcript', icon: 'FileText' },
      { id: 'alm-docs', path: '/alumni/documents', titleKey: 'navigation.alumni.documents', titleAr: 'طلب الوثائق والإفادات', titleEn: 'Document Orders', icon: 'FolderArchive' },
      { id: 'alm-jobs', path: '/alumni/jobs', titleKey: 'navigation.alumni.jobs', titleAr: 'بوابة الفرص الوظيفية', titleEn: 'Career & Jobs', icon: 'Briefcase' },
      { id: 'alm-intern', path: '/alumni/internships', titleKey: 'navigation.alumni.internships', titleAr: 'برامج التدريب والتأهيل', titleEn: 'Internships', icon: 'Award' },
      { id: 'alm-events', path: '/alumni/events', titleKey: 'navigation.alumni.events', titleAr: 'ملتقيات الخريجين', titleEn: 'Alumni Events', icon: 'CalendarCheck2' },
      { id: 'alm-ann', path: '/alumni/announcements', titleKey: 'navigation.alumni.announcements', titleAr: 'أخبار رابطة الخريجين', titleEn: 'News & Updates', icon: 'Bell' },
      { id: 'alm-sup', path: '/alumni/support', titleKey: 'navigation.alumni.support', titleAr: 'التوجيه والإرشاد المهني', titleEn: 'Career Support', icon: 'LifeBuoy' },
      { id: 'alm-prof', path: '/alumni/profile', titleKey: 'navigation.alumni.profile', titleAr: 'الملف المهني للخريج', titleEn: 'Graduate Profile', icon: 'User' },
    ],
  },
};
