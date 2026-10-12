import os
import re

def fix_imports_in_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    orig = content
    import_matches = re.findall(r'import\s+\{([^}]+)\}\s+from', content)
    all_imported = set()
    for m in import_matches:
        for item in m.split(','):
            all_imported.add(item.strip())

    needs_get_localized = 'getLocalized(' in content and 'getLocalized' not in all_imported
    needs_get_status = 'getStatusLabel(' in content and 'getStatusLabel' not in all_imported
    needs_use_translation = ('d.' in content or 't(' in content) and 'useTranslation' not in all_imported

    needed = []
    if needs_use_translation:
        needed.append('useTranslation')
    if needs_get_localized:
        needed.append('getLocalized')
    if needs_get_status:
        needed.append('getStatusLabel')

    if needed:
        parts = file_path.split('/')
        rel_depth = len(parts) - 2
        rel_i18n = ('../' * rel_depth) + 'i18n'

        import_match = re.search(r'import\s+\{([^}]+)\}\s+from\s+[\'"](\.{1,2}/[^\'"]*?i18n[^\'"]*?)[\'"];?', content)
        if import_match:
            existing = [x.strip() for x in import_match.group(1).split(',')]
            for n in needed:
                if n not in existing:
                    existing.append(n)
            new_import = f"import {{ {', '.join(existing)} }} from '{import_match.group(2)}';"
            content = content[:import_match.start()] + new_import + content[import_match.end():]
        else:
            lines = content.splitlines(keepends=True)
            last_import = 0
            for idx, l in enumerate(lines):
                if l.startswith('import '):
                    last_import = idx
            lines.insert(last_import + 1, f"import {{ {', '.join(needed)} }} from '{rel_i18n}';\n")
            content = ''.join(lines)

    if content != orig:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

for r, d, fs in os.walk('src/views/alumni'):
    for f in fs:
        if f.endswith('.tsx'):
            p = os.path.join(r, f)
            if fix_imports_in_file(p):
                print(f"Fixed imports in: {p}")
