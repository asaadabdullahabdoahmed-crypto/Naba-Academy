from generate_dict_files import file_replacements

template_ternaries = []
for p, repls in file_replacements.items():
    for r in repls:
        if '${' in r['ar'] or '${' in r['en']:
            template_ternaries.append((p, r['ar'], r['en']))

print(f"Total template ternaries: {len(template_ternaries)}")
for p, ar, en in template_ternaries:
    print(f"{p}: AR={ar} | EN={en}")
