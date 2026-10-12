import os
import re

is_ar_ternary = re.compile(r'isAr\s*\?\s*([\'"`][^\n\r]*?[\'"`])\s*:\s*([\'"`][^\n\r]*?[\'"`])')
legit_keywords = ['ArrowLeft', 'ArrowRight', 'ChevronLeft', 'ChevronRight', 'rtl', 'ltr', 'translate', 'text-right', 'text-left', 'dir =', 'dir=', 'dir:', 'dir :', 'font-arabic']

files_map = {}

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
                        if p not in files_map:
                            files_map[p] = []
                        files_map[p].append({
                            'line_num': idx + 1,
                            'full_line': line,
                            'ar': ar_val,
                            'en': en_val
                        })

print(f"Total files with ternaries: {len(files_map)}")
total_entries = sum(len(v) for v in files_map.values())
print(f"Total single-line ternaries to migrate: {total_entries}")

# Check groups
groups = {}
for p in files_map:
    # Determine group
    parts = p.split('/')
    group = parts[2] if len(parts) > 2 else 'root'
    groups[group] = groups.get(group, 0) + len(files_map[p])

for g, count in sorted(groups.items()):
    print(f"Group {g}: {count} ternaries")
