import os
import re
import json

with open('scripts/file_replacements.json', 'r', encoding='utf-8') as f:
    file_replacements = json.load(f)

mock_field_pattern = re.compile(r'isAr\s*\?\s*([a-zA-Z0-9_\.]+?)\.([a-zA-Z0-9_]+)Ar\s*:\s*\1\.\2En')
mock_field_pattern_rev = re.compile(r'!isAr\s*\?\s*([a-zA-Z0-9_\.]+?)\.([a-zA-Z0-9_]+)En\s*:\s*\1\.\2Ar')
mock_field_pattern_swap = re.compile(r'isAr\s*\?\s*([a-zA-Z0-9_\.]+?)\.([a-zA-Z0-9_]+)En\s*:\s*\1\.\2Ar')

def migrate_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    repls = file_replacements.get(file_path, [])

    # 1. Replace single-line ternaries from dictionary
    for r in sorted(repls, key=lambda x: len(x['full_pat']), reverse=True):
        full_pat = r['full_pat']
        target_expr = r['target_expr']

        if full_pat in content:
            content = content.replace(full_pat, target_expr)
        else:
            ar_escaped = re.escape(r['ar'])
            en_escaped = re.escape(r['en'])
            pat = re.compile(rf'isAr\s*\?\s*{ar_escaped}\s*:\s*{en_escaped}')
            content = pat.sub(target_expr, content)

    # 2. Replace entity mock fields BEFORE checking needed imports
    content = mock_field_pattern.sub(r"getLocalized(\1, '\2', isAr)", content)
    content = mock_field_pattern_rev.sub(r"getLocalized(\1, '\2', isAr)", content)
    content = mock_field_pattern_swap.sub(r"!getLocalized(\1, '\2', isAr)", content)

    # 3. Check if imports are needed
    needs_use_translation = 'd.' in content
    needs_get_localized = 'getLocalized(' in content
    needs_get_status = 'getStatusLabel(' in content

    # Calculate relative import path to src/i18n
    parts = file_path.split('/')
    rel_depth = len(parts) - 2
    rel_i18n = ('../' * rel_depth) + 'i18n'

    needed_items = []
    if needs_use_translation and 'useTranslation' not in content:
        needed_items.append('useTranslation')
    if needs_get_localized and 'getLocalized' not in content:
        needed_items.append('getLocalized')
    if needs_get_status and 'getStatusLabel' not in content:
        needed_items.append('getStatusLabel')

    if needed_items:
        # Check existing imports from i18n
        import_match = re.search(r'import\s+\{([^}]+)\}\s+from\s+[\'"](\.{1,2}/[^\'"]*?i18n[^\'"]*?)[\'"];?', content)
        if import_match:
            existing_items = [x.strip() for x in import_match.group(1).split(',')]
            for item in needed_items:
                if item not in existing_items:
                    existing_items.append(item)
            new_import = f"import {{ {', '.join(existing_items)} }} from '{import_match.group(2)}';"
            content = content[:import_match.start()] + new_import + content[import_match.end():]
        else:
            import_stmt = f"import {{ {', '.join(needed_items)} }} from '{rel_i18n}';\n"
            lines = content.splitlines(keepends=True)
            last_import_idx = 0
            for idx, l in enumerate(lines):
                if l.startswith('import '):
                    last_import_idx = idx
            lines.insert(last_import_idx + 1, import_stmt)
            content = ''.join(lines)

    # 4. Ensure `const { d, isAr } = useTranslation();` is inside component body
    if needs_use_translation:
        if 'useTranslation()' in content:
            content = re.sub(
                r'const\s*\{\s*([^}]+?)\s*\}\s*=\s*useTranslation\(\);',
                lambda m: f"const {{ {m.group(1)}, d }} = useTranslation();" if 'd' not in m.group(1).split(',') else m.group(0),
                content
            )
        else:
            lines = content.splitlines(keepends=True)
            comp_start_idx = -1
            for idx, l in enumerate(lines):
                if (('export const ' in l or 'export function ' in l) and ('=> {' in l or ') {' in l or '}: React.FC' in l)) or 'React.FC<' in l:
                    for j in range(idx, min(idx + 5, len(lines))):
                        if '{' in lines[j]:
                            comp_start_idx = j
                            break
                    if comp_start_idx != -1:
                        break

            if comp_start_idx != -1:
                replaced_is_ar = False
                for j in range(comp_start_idx + 1, min(comp_start_idx + 4, len(lines))):
                    if re.match(r'\s*const\s+isAr\s*=', lines[j]):
                        lines[j] = "  const { d, isAr } = useTranslation();\n"
                        replaced_is_ar = True
                        break
                if not replaced_is_ar:
                    lines.insert(comp_start_idx + 1, "  const { d, isAr } = useTranslation();\n")
                content = ''.join(lines)

    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

# Re-run on alumni
alumni_files = [os.path.join(r, f) for r, d, fs in os.walk('src/views/alumni') for f in fs if f.endswith('.tsx')]
changed = 0
for p in alumni_files:
    if migrate_file(p):
        changed += 1
print(f"Migrated {changed} of {len(alumni_files)} alumni files.")
