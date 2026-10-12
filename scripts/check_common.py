import os
import re

is_ar_ternary = re.compile(r'isAr\s*\?\s*([\'"`][^\n\r]*?[\'"`])\s*:\s*([\'"`][^\n\r]*?[\'"`])')
legit_keywords = ['ArrowLeft', 'ArrowRight', 'ChevronLeft', 'ChevronRight', 'rtl', 'ltr', 'translate', 'text-right', 'text-left', 'dir =', 'dir=', 'dir:', 'dir :', 'font-arabic']

common_mappings = {
    ('حفظ', 'Save'): 'd.common.save',
    ('إلغاء', 'Cancel'): 'd.common.cancel',
    ('تعديل', 'Edit'): 'd.common.edit',
    ('حذف', 'Delete'): 'd.common.delete',
    ('تصدير', 'Export'): 'd.common.export',
    ('طباعة', 'Print'): 'd.common.print',
    ('تحديث', 'Refresh'): 'd.common.refresh',
    ('تصفية', 'Filter'): 'd.common.filter',
    ('بحث', 'Search'): 'd.common.search',
    ('عرض التفاصيل', 'View Details'): 'd.common.viewDetails',
    ('عرض الكل', 'View All'): 'd.common.viewAll',
    ('إغلاق', 'Close'): 'd.common.close',
    ('رجوع', 'Back'): 'd.common.back',
    ('العودة للرئيسية', 'Back to Home'): 'd.common.backToHome',
    ('جميع الحقوق محفوظة', 'All rights reserved'): 'd.common.allRightsReserved',
    ('بوابة الطالب', 'Student Portal'): 'd.portals.student',
    ('بوابة المحاضر', 'Faculty Portal'): 'd.portals.instructor',
    ('بوابة المحاضر', 'Instructor Portal'): 'd.portals.instructor',
    ('بوابة القسم', 'Department Portal'): 'd.portals.department',
    ('بوابة الإدارة المركزية', 'Admin Portal'): 'd.portals.admin',
    ('بوابة الخريجين', 'Alumni Portal'): 'd.portals.alumni',
    ('نشط', 'Active'): 'd.status.active',
    ('غير نشط', 'Inactive'): 'd.status.inactive',
    ('معتمد', 'Approved'): 'd.status.approved',
    ('مرفوض', 'Rejected'): 'd.status.rejected',
    ('قيد الانتظار', 'Pending'): 'd.status.pending',
    ('مكتمل', 'Completed'): 'd.status.completed',
}

matched = 0
total = 0
for root, dirs, files in os.walk('src'):
    for f in files:
        if f.endswith('.tsx') and 'src/i18n/' not in root:
            p = os.path.join(root, f)
            with open(p, 'r', encoding='utf-8') as fl:
                lines = fl.readlines()
            for idx, line in enumerate(lines):
                matches = is_ar_ternary.findall(line)
                for ar_val, en_val in matches:
                    if not any(k in ar_val or k in en_val for k in legit_keywords):
                        total += 1
                        clean_ar = ar_val.strip('\'"`')
                        clean_en = en_val.strip('\'"`')
                        if (clean_ar, clean_en) in common_mappings:
                            matched += 1

print(f"Total single-line ternaries: {total}")
print(f"Matched directly by top common keys: {matched}")
