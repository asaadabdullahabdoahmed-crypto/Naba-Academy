import os
import re
import json

is_ar_ternary = re.compile(r'isAr\s*\?\s*([\'"`][^\n\r]*?[\'"`])\s*:\s*([\'"`][^\n\r]*?[\'"`])')
legit_keywords = ['ArrowLeft', 'ArrowRight', 'ChevronLeft', 'ChevronRight', 'rtl', 'ltr', 'translate', 'text-right', 'text-left', 'dir =', 'dir=', 'dir:', 'dir :', 'font-arabic']

def clean_str(s):
    if (s.startswith("'") and s.endswith("'")) or (s.startswith('"') and s.endswith('"')) or (s.startswith('`') and s.endswith('`')):
        return s[1:-1]
    return s

def make_camel_key(en_str):
    cleaned = re.sub(r'\$\{.*?\}', '', en_str)
    cleaned = re.sub(r'[^a-zA-Z0-9\s]', '', cleaned)
    words = cleaned.split()
    if not words:
        return 'text'
    words = words[:6]
    res = words[0].lower() + ''.join(w.capitalize() for w in words[1:])
    if not res or not res[0].isalpha():
        res = 'item' + res
    return res

def get_page_path(file_path):
    # e.g. src/views/student/StudentLecturesPage.tsx -> student, studentLectures
    # src/components/ui/DataTableShell.tsx -> ui, dataTableShell
    parts = file_path.replace('.tsx', '').split('/')
    if 'views' in parts:
        v_idx = parts.index('views')
        portal = parts[v_idx + 1]
        name = parts[v_idx + 2]
        page = name[0].lower() + name[1:]
        if page.endswith('Page'):
            page = page[:-4]
        return portal, page
    elif 'components' in parts:
        c_idx = parts.index('components')
        sub = parts[c_idx + 1]
        name = parts[-1]
        page = name[0].lower() + name[1:]
        return 'shared', page
    else:
        return 'misc', 'page'

# Direct common mappings
COMMON_MAP = {
    ('حفظ', 'Save'): 'd.common.save',
    ('حفظ التغييرات', 'Save Changes'): 'd.common.save',
    ('إلغاء', 'Cancel'): 'd.common.cancel',
    ('تعديل', 'Edit'): 'd.common.edit',
    ('حذف', 'Delete'): 'd.common.delete',
    ('تصدير', 'Export'): 'd.common.export',
    ('طباعة', 'Print'): 'd.common.print',
    ('تحديث', 'Refresh'): 'd.common.refresh',
    ('تصفية', 'Filter'): 'd.common.filter',
    ('بحث', 'Search'): 'd.common.search',
    ('عرض', 'View'): 'd.common.view',
    ('فتح', 'Open'): 'd.common.open',
    ('إغلاق', 'Close'): 'd.common.close',
    ('رجوع', 'Back'): 'd.common.back',
    ('التالي', 'Next'): 'd.common.next',
    ('السابق', 'Previous'): 'd.common.previous',
    ('تأكيد', 'Confirm'): 'd.common.confirm',
    ('متابعة', 'Continue'): 'd.common.continue',
    ('إعادة المحاولة', 'Retry'): 'd.common.retry',
    ('عرض التفاصيل', 'View Details'): 'd.common.viewDetails',
    ('عرض الكل', 'View All'): 'd.common.viewAll',
    ('العودة للرئيسية', 'Back to Home'): 'd.common.backToHome',
    ('جميع الحقوق محفوظة', 'All rights reserved'): 'd.common.allRightsReserved',
    ('جميع الحقوق محفوظة.', 'All rights reserved.'): 'd.common.allRightsReserved',
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

views_ar = {}
views_en = {}
file_replacements = {}

for root, dirs, files in os.walk('src'):
    for f in sorted(files):
        if f.endswith('.tsx') and 'src/i18n/' not in root:
            p = os.path.join(root, f)
            with open(p, 'r', encoding='utf-8') as fl:
                lines = fl.readlines()
            
            portal, page = get_page_path(p)
            if portal not in views_ar:
                views_ar[portal] = {}
                views_en[portal] = {}
            if page not in views_ar[portal]:
                views_ar[portal][page] = {}
                views_en[portal][page] = {}
            
            replaces = []
            used_keys = set()
            for idx, line in enumerate(lines):
                matches = is_ar_ternary.findall(line)
                for ar_val, en_val in matches:
                    if not any(k in ar_val or k in en_val for k in legit_keywords):
                        c_ar = clean_str(ar_val)
                        c_en = clean_str(en_val)
                        full_pat = f"isAr ? {ar_val} : {en_val}"
                        
                        if (c_ar, c_en) in COMMON_MAP:
                            target_expr = COMMON_MAP[(c_ar, c_en)]
                        else:
                            base_key = make_camel_key(c_en)
                            key = base_key
                            count = 2
                            while key in used_keys and (views_ar[portal][page].get(key) != c_ar or views_en[portal][page].get(key) != c_en):
                                key = f"{base_key}{count}"
                                count += 1
                            used_keys.add(key)
                            views_ar[portal][page][key] = c_ar
                            views_en[portal][page][key] = c_en
                            target_expr = f"d.views.{portal}.{page}.{key}"
                        
                        replaces.append({
                            'line_idx': idx,
                            'full_pat': full_pat,
                            'ar': ar_val,
                            'en': en_val,
                            'target_expr': target_expr
                        })
            if replaces:
                file_replacements[p] = replaces

total_keys = sum(len(pages) for portal in views_ar.values() for pages in portal.values())
total_strings = sum(len(strings) for portal in views_ar.values() for pages in portal.values() for strings in pages.values())
print(f"Generated {len(views_ar)} portals/domains, {total_keys} pages, {total_strings} dictionary keys!")
