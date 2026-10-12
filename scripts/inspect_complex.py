import os
import re

is_ar_ternary = re.compile(r'isAr\s*\?\s*([\'"`][^\n\r]*?[\'"`])\s*:\s*([\'"`][^\n\r]*?[\'"`])')
legit_keywords = ['ArrowLeft', 'ArrowRight', 'ChevronLeft', 'ChevronRight', 'rtl', 'ltr', 'translate', 'text-right', 'text-left', 'dir =', 'dir=', 'dir:', 'dir :', 'font-arabic']
all_is_ar = re.compile(r'isAr\s*\?')

complex_cases = []
for root, dirs, files in os.walk('src'):
    for f in files:
        if f.endswith('.tsx') and 'src/i18n/' not in root:
            p = os.path.join(root, f)
            with open(p, 'r', encoding='utf-8') as fl:
                lines = fl.readlines()
            for idx, line in enumerate(lines):
                if all_is_ar.search(line):
                    if not any(k in line for k in legit_keywords):
                        if not is_ar_ternary.search(line):
                            complex_cases.append((p, idx + 1, line.strip()))

print(f'Total complex cases: {len(complex_cases)}')
for p, idx, l in complex_cases[:30]:
    print(f'{p}:{idx}: {l}')
