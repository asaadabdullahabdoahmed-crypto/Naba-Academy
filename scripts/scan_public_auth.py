import os
import re
import json

def get_ternaries(path):
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    pattern = re.compile(r"isAr\s*\?\s*([\'\"`][\s\S]*?[\'\"`])\s*:\s*([\'\"`][\s\S]*?[\'\"`])")
    legit = ["ArrowLeft", "ArrowRight", "ChevronLeft", "ChevronRight", "rtl", "ltr", "translate", "text-right", "text-left", "dir =", "dir=", "dir:", "dir :", "font-arabic", "textAlign"]
    matches = []
    for m in pattern.finditer(content):
        s = m.group(0)
        if not any(k in s for k in legit):
            # check that it doesn't span across multiple statements
            if len(s) < 800:
                matches.append({
                    "match": s,
                    "ar": m.group(1).strip()[1:-1].strip(),
                    "en": m.group(2).strip()[1:-1].strip(),
                })
    return matches

with open("scripts/file_replacements.json") as f:
    replacements = json.load(f)

for target_dir in ["src/views/public", "src/views/auth", "src/components"]:
    for root, dirs, files in os.walk(target_dir):
        for f in sorted(files):
            if f.endswith(".tsx"):
                p = os.path.join(root, f)
                if "TwoFactor" in f or "SSO" in f:
                    continue
                if "components" in target_dir and not ("public" in root or "Public" in f or "Auth" in f):
                    continue
                terns = get_ternaries(p)
                if terns:
                    rep_items = replacements.get(p, [])
                    print(f"{p}: {len(terns)} ternaries in file, {len(rep_items)} in replacements.json")
