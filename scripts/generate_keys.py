import os
import re
import json

is_ar_ternary = re.compile(r'isAr\s*\?\s*([\'"`][^\n\r]*?[\'"`])\s*:\s*([\'"`][^\n\r]*?[\'"`])')
legit_keywords = ['ArrowLeft', 'ArrowRight', 'ChevronLeft', 'ChevronRight', 'rtl', 'ltr', 'translate', 'text-right', 'text-left', 'dir =', 'dir=', 'dir:', 'dir :', 'font-arabic']

entries = []
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
                        entries.append({
                            'file': p,
                            'line_num': idx + 1,
                            'ar': ar_val.strip('\'"`'),
                            'en': en_val.strip('\'"`'),
                            'raw_line': line.strip()
                        })

print(f"Total entries: {len(entries)}")

# Show samples from different areas
by_area = {}
for e in entries:
    area = e['file'].split('/')[2]
    if area not in by_area:
        by_area[area] = []
    by_area[area].append(e)

for a, elist in sorted(by_area.items()):
    print(f"\nArea: {a} ({len(elist)} entries)")
    for e in elist[:3]:
        print(f"  [{e['file'].split('/')[-1]}:{e['line_num']}] AR: {e['ar']} | EN: {e['en']}")
