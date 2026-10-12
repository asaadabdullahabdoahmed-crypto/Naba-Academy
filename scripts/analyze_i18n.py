import os
import re

is_ar_ternary = re.compile(r'isAr\s*\?\s*([\'"`][^\n\r]*?[\'"`])\s*:\s*([\'"`][^\n\r]*?[\'"`])')
legit_keywords = ['ArrowLeft', 'ArrowRight', 'ChevronLeft', 'ChevronRight', 'rtl', 'ltr', 'translate', 'text-right', 'text-left', 'dir =', 'dir=', 'dir:', 'dir :', 'font-arabic']

single_line = []
pairs = set()

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
                        single_line.append((p, idx + 1, ar_val, en_val))
                        pairs.add((ar_val, en_val))

print(f"Total single-line inline bilingual ternaries: {len(single_line)}")
print(f"Total distinct (ar, en) string pairs: {len(pairs)}")

# Also search for any isAr ? that was NOT matched by single_line regex
all_is_ar = re.compile(r'isAr\s*\?')
all_is_ar_matches = []
for root, dirs, files in os.walk('src'):
    for f in files:
        if f.endswith('.tsx') and 'src/i18n/' not in root:
            p = os.path.join(root, f)
            with open(p, 'r', encoding='utf-8') as fl:
                lines = fl.readlines()
            for idx, line in enumerate(lines):
                if all_is_ar.search(line):
                    if not any(k in line for k in legit_keywords):
                        all_is_ar_matches.append((p, idx + 1, line.strip()))

print(f"Total isAr ? lines (excluding legit): {len(all_is_ar_matches)}")
unmatched = len(all_is_ar_matches) - len(single_line)
print(f"Multiline or complex ternaries: {unmatched}")
