import os
import re
import json

with open('scripts/file_replacements.json', 'r', encoding='utf-8') as f:
    file_replacements = json.load(f)

mock_field_pattern = re.compile(r'isAr\s*\?\s*([a-zA-Z0-9_\.]+)Ar\s*:\s*([a-zA-Z0-9_\.]+)En')

def migrate_file_content(file_path, content):
    repls = file_replacements.get(file_path, [])
    
    # 1. Replace single line ternaries
    # Sort replacements by line index and length descending to avoid partial replacements
    for r in sorted(repls, key=lambda x: len(x['full_pat']), reverse=True):
        full_pat = r['full_pat']
        target_expr = r['target_expr']
        
        # When target_expr is in JSX attribute or text, e.g. title={target_expr} or <span>{target_expr}</span>
        # In full_pat: isAr ? '...' : '...'
        if full_pat in content:
            content = content.replace(full_pat, target_expr)
        else:
            # Try with double quotes or template literal
            # Find in content with regex
            ar_escaped = re.escape(r['ar'])
            en_escaped = re.escape(r['en'])
            pat = re.compile(rf'isAr\s*\?\s*{ar_escaped}\s*:\s*{en_escaped}')
            content = pat.sub(target_expr, content)

    # 2. Replace entity mock fields: isAr ? item.titleAr : item.titleEn -> getLocalized(item, 'title', isAr)
    def repl_mock(m):
        obj_ar = m.group(1)
        obj_en = m.group(2)
        # Check if they have a common base and field
        # e.g. job.companyAr and job.companyEn -> getLocalized(job, 'company', isAr)
        if '.' in obj_ar and '.' in obj_en:
            base_ar, field_ar = obj_ar.rsplit('.', 1)
            base_en, field_en = obj_en.rsplit('.', 1)
            if base_ar == base_en and field_ar == field_en:
                return f"getLocalized({base_ar}, '{field_ar}', isAr)"
        elif obj_ar == obj_en:
            return f"getLocalized(this, '{obj_ar}', isAr)"
        return m.group(0)

    content = mock_field_pattern.sub(repl_mock, content)

    # 3. Add imports and hook if needed
    needs_use_translation = 'd.' in content
    needs_get_localized = 'getLocalized(' in content
    needs_get_status = 'getStatusLabel(' in content

    # Check relative path to src/i18n
    rel_depth = len(file_path.split('/')) - 2  # src/views/alumni/X.tsx has 4 parts -> depth 2 -> ../../i18n
    rel_i18n = ('../' * rel_depth) + 'i18n'

    imports_to_add = []
    if needs_use_translation and 'useTranslation' not in content:
        imports_to_add.append('useTranslation')
    if needs_get_localized and 'getLocalized' not in content:
        imports_to_add.append('getLocalized')
    if needs_get_status and 'getStatusLabel' not in content:
        imports_to_add.append('getStatusLabel')

    if imports_to_add:
        import_stmt = f"import {{ {', '.join(imports_to_add)} }} from '{rel_i18n}';\n"
        # Insert after the last import line
        lines = content.splitlines(keepends=True)
        last_import_idx = 0
        for idx, l in enumerate(lines):
            if l.startswith('import '):
                last_import_idx = idx
        lines.insert(last_import_idx + 1, import_stmt)
        content = ''.join(lines)

    # 4. Insert `const { d, isAr, locale } = useTranslation();` or ensure `d` is available
    if needs_use_translation and 'const { d' not in content and 'const { ...d' not in content:
        # Find component function definition
        # e.g. export const AlumniJobsPage: React.FC<...> = ({ locale }) => {
        # or export function MyComponent(...) {
        lines = content.splitlines(keepends=True)
        comp_start_idx = -1
        for idx, l in enumerate(lines):
            if (('export const ' in l or 'export function ' in l or 'const ' in l) and ('=> {' in l or ') {' in l or '}: React.FC' in l)) or 'React.FC<' in l:
                # Find the line with opening { of the component body
                for j in range(idx, min(idx + 5, len(lines))):
                    if '{' in lines[j]:
                        comp_start_idx = j
                        break
                if comp_start_idx != -1:
                    break

        if comp_start_idx != -1:
            # Replace `const isAr = locale === 'ar';` if it's right after
            hook_line = "  const { d, isAr, locale } = useTranslation();\n"
            # Check if line after is `const isAr = locale === 'ar';`
            if comp_start_idx + 1 < len(lines) and 'const isAr = ' in lines[comp_start_idx + 1]:
                lines[comp_start_idx + 1] = hook_line
            else:
                lines.insert(comp_start_idx + 1, hook_line)
            content = ''.join(lines)

    return content

# Test on AlumniJobsPage.tsx
with open('src/views/alumni/AlumniJobsPage.tsx', 'r', encoding='utf-8') as f:
    sample = f.read()

migrated = migrate_file_content('src/views/alumni/AlumniJobsPage.tsx', sample)
print("=== Migrated AlumniJobsPage.tsx ===")
print('\n'.join(migrated.splitlines()[:40]))
