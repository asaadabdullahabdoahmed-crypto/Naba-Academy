import os
import re
import json

# Match both single-line and multiline ternaries: isAr ? '...' : '...'
# Limit the inner content to 500 chars to avoid matching over gigantic JSX blocks
is_ar_ternary = re.compile(r'isAr\s*\?\s*([\'"`][\s\S]{1,600}?[\'"`])\s*:\s*([\'"`][\s\S]{1,600}?[\'"`])')
legit_keywords = ['ArrowLeft', 'ArrowRight', 'ChevronLeft', 'ChevronRight', 'rtl', 'ltr', 'translate', 'text-right', 'text-left', 'dir =', 'dir=', 'dir:', 'dir :', 'font-arabic']

def clean_str(s):
    s = s.strip()
    if (s.startswith("'") and s.endswith("'")) or (s.startswith('"') and s.endswith('"')) or (s.startswith('`') and s.endswith('`')):
        s = s[1:-1]
    # Normalize whitespace inside multiline strings
    s = ' '.join(s.split())
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
        name = parts[-1]
        page = name[0].lower() + name[1:]
        return 'shared', page
    else:
        return 'misc', 'page'

COMMON_MAP = {
    ('حفظ', 'Save'): 'd.common.save',
    ('حفظ التغييرات', 'Save Changes'): 'd.common.save',
    ('إلغاء', 'Cancel'): 'd.common.cancel',
    ('تعديل', 'Edit'): 'd.common.edit',
    ('حذف', 'Delete'): 'd.common.delete',
    ('عرض', 'View'): 'd.common.view',
    ('فتح', 'Open'): 'd.common.open',
    ('إغلاق', 'Close'): 'd.common.close',
    ('تصدير', 'Export'): 'd.common.export',
    ('طباعة', 'Print'): 'd.common.print',
    ('تحديث', 'Refresh'): 'd.common.refresh',
    ('تصفية', 'Filter'): 'd.common.filter',
    ('بحث', 'Search'): 'd.common.search',
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
                content = fl.read()
            
            portal, page = get_page_path(p)
            if portal not in views_ar:
                views_ar[portal] = {}
                views_en[portal] = {}
            if page not in views_ar[portal]:
                views_ar[portal][page] = {}
                views_en[portal][page] = {}
            
            replaces = []
            used_keys = set()
            
            matches = is_ar_ternary.finditer(content)
            for m in matches:
                ar_val = m.group(1).strip()
                en_val = m.group(2).strip()
                full_match = m.group(0)
                
                # Check if this is a legitimate icon / dir ternary
                if any(k in ar_val or k in en_val for k in legit_keywords):
                    continue
                
                c_ar = clean_str(ar_val)
                c_en = clean_str(en_val)
                
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
                    'full_match': full_match,
                    'ar': ar_val,
                    'en': en_val,
                    'target_expr': target_expr
                })
            
            if replaces:
                file_replacements[p] = replaces

def dump_ts(obj, indent=2):
    lines = []
    sp = ' ' * indent
    lines.append('{')
    for k, v in obj.items():
        key_str = k if re.match(r'^[a-zA-Z_$][a-zA-Z0-9_$]*$', k) else json.dumps(k)
        if isinstance(v, dict):
            sub = dump_ts(v, indent + 2)
            lines.append(f"{sp}{key_str}: {sub},")
        else:
            val_str = json.dumps(v, ensure_ascii=False)
            lines.append(f"{sp}{key_str}: {val_str},")
    lines.append((' ' * (indent - 2)) + '}')
    return '\n'.join(lines)

with open('src/i18n/dictionaries/views.ar.ts', 'w', encoding='utf-8') as f:
    f.write('export const viewsAr = ' + dump_ts(views_ar, 2) + ';\n')

with open('src/i18n/dictionaries/views.en.ts', 'w', encoding='utf-8') as f:
    f.write('export const viewsEn = ' + dump_ts(views_en, 2) + ';\n')

with open('scripts/file_replacements.json', 'w', encoding='utf-8') as f:
    json.dump(file_replacements, f, ensure_ascii=False, indent=2)

total_pages = sum(len(portal) for portal in views_ar.values())
total_strings = sum(len(page) for portal in views_ar.values() for page in portal.values())
print(f"views.ar.ts and views.en.ts updated: {len(views_ar)} portals, {total_pages} pages, {total_strings} dictionary keys!")
