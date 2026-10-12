import json
import re

with open("scripts/file_replacements.json") as f:
    replacements = json.load(f)

# Read views.ar.ts and views.en.ts
with open("src/i18n/dictionaries/views.ar.ts") as f:
    views_ar_str = f.read()

with open("src/i18n/dictionaries/views.en.ts") as f:
    views_en_str = f.read()

# Filter only public, auth, and relevant components
target_files = [k for k in replacements if "views/public" in k or "views/auth" in k or "PublicHeader" in k or "PublicFooter" in k or "AuthCard" in k]

missing_keys_ar = []
missing_keys_en = []

for file_path in target_files:
    items = replacements[file_path]
    for it in items:
        expr = it["target_expr"]
        if expr.startswith("d.views."):
            # e.g. d.views.public.home.key
            parts = expr.replace("d.views.", "").split(".")
            portal = parts[0]
            page = parts[1]
            key = parts[2]
            
            # Check if key is in views_ar_str and views_en_str
            # Rough check or exact check
            if f'"{key}":' not in views_ar_str and f'{key}:' not in views_ar_str:
                missing_keys_ar.append((expr, file_path))
            if f'"{key}":' not in views_en_str and f'{key}:' not in views_en_str:
                missing_keys_en.append((expr, file_path))

print(f"Checked {len(target_files)} files.")
print(f"Missing keys in views.ar.ts: {len(missing_keys_ar)}")
print(f"Missing keys in views.en.ts: {len(missing_keys_en)}")
if missing_keys_ar:
    for k in missing_keys_ar[:5]:
        print("  Missing AR:", k)
