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
    # Remove template literal expressions ${...}
    cleaned = re.sub(r'\$\{.*?\}', '', en_str)
    # Remove punctuation
    cleaned = re.sub(r'[^a-zA-Z0-9\s]', '', cleaned)
    words = cleaned.split()
    if not words:
        return 'text'
    # Take first 4-5 words
    words = words[:5]
    res = words[0].lower() + ''.join(w.capitalize() for w in words[1:])
    if not res or not res[0].isalpha():
        res = 'item' + res
    return res

files_data = {}

for root, dirs, files in os.walk('src'):
    for f in files:
        if f.endswith('.tsx') and 'src/i18n/' not in root:
            p = os.path.join(root, f)
            with open(p, 'r', encoding='utf-8') as fl:
                lines = fl.readlines()
            
            file_entries = []
            for idx, line in enumerate(lines):
                matches = is_ar_ternary.findall(line)
                for ar_val, en_val in matches:
                    if not any(k in ar_val or k in en_val for k in legit_keywords):
                        file_entries.append({
                            'line_idx': idx,
                            'full_match': f"isAr ? {ar_val} : {en_val}",
                            'ar': clean_str(ar_val),
                            'en': clean_str(en_val),
                            'raw_ar': ar_val,
                            'raw_en': en_val
                        })
            if file_entries:
                files_data[p] = file_entries

print(f"Files to migrate: {len(files_data)}")
total_ternaries = sum(len(v) for v in files_data.values())
print(f"Total single-line ternaries: {total_ternaries}")
