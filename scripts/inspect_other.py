import os
import re

is_ar_ternary = re.compile(r'isAr\s*\?\s*([\'"`][^\n\r]*?[\'"`])\s*:\s*([\'"`][^\n\r]*?[\'"`])')
legit_keywords = ['ArrowLeft', 'ArrowRight', 'ChevronLeft', 'ChevronRight', 'rtl', 'ltr', 'translate', 'text-right', 'text-left', 'dir =', 'dir=', 'dir:', 'dir :', 'font-arabic']
all_is_ar = re.compile(r'isAr\s*\?')

mock_fields = re.compile(r'isAr\s*\?\s*([a-zA-Z0-9_\.]+(?:Ar|En))\s*:\s*([a-zA-Z0-9_\.]+(?:Ar|En))')

mock_field_cases = []
jsx_or_other = []

for root, dirs, files in os.walk('src'):
    for f in files:
        if f.endswith('.tsx') and 'src/i18n/' not in root:
            p = os.path.join(root, f)
            with open(p, 'r', encoding='utf-8') as fl:
                lines = fl.readlines()
            for idx, line in enumerate(lines):
                if all_is_ar.search(line) and not any(k in line for k in legit_keywords):
                    if not is_ar_ternary.search(line):
                        if mock_fields.search(line):
                            mock_field_cases.append((p, idx + 1, line.strip()))
                        else:
                            jsx_or_other.append((p, idx + 1, line.strip()))

print(f"Mock field ternaries: {len(mock_field_cases)}")
print(f"JSX or other multiline: {len(jsx_or_other)}")
print("\nAll JSX or other cases:")
for x in jsx_or_other:
    print(x)
