# Rules and Profiles

## Rules

- `schema.empty_properties`: tool schema has no declared properties.
- `schema.unbounded_string`: string input without maxLength/enum/pattern.
- `schema.unbounded_array`: array input without maxItems.
- `schema.missing_description` (strict/paranoid): tool description missing.
- `schema.categorical_missing_enum` (strict/paranoid): categorical field lacks enum.
- `security.path_traversal`: path/file parameters without allowlist constraints.
- `security.shell_injection`: raw command/shell arguments accepted as strings.
- `security.raw_args`: unbounded argv/flags arrays.

## Profiles

- `default`: baseline rule set.
- `strict`: enables additional schema hygiene checks and heavier scoring.
- `paranoid`: escalates shell/argv findings to high severity and uses strongest score penalties.
