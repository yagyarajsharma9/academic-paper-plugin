# Plugin Workflow Documentation (Updated)

## Overview

This document describes the detailed workflow of the Academic Paper Formatter GitHub plugin, including the new interactive question-asking system.

## Workflow Steps

### Step 0: Interactive Setup (NEW)

When running with `--interactive` or `--prompt` flags, the plugin starts an interactive wizard:

1. **Paper Type Selection** - User selects from 12 paper types with descriptions and word count ranges
2. **Citation Style Selection** - User selects from 7 citation styles, filtered by paper type
3. **Paper Details** - Title, author, institution, department, course, instructor, date
4. **Formatting Options** - Output format, TOC, reference validation, strict mode, word count target, plagiarism check
5. **Reference Entry** - Enter references one by one or skip
6. **Source Files** - Enter draft file paths or skip
7. **Summary & Save** - Review configuration and save to `paper-config.yml`

**Why this matters**: The interactive system ensures users don't need to know citation style rules upfront. It guides them through every decision, preventing format confusion.

### Step 1: Configuration Loading

**Input**: `paper-config.yml` (or `paper-config.yaml`), or answers from interactive setup

**Action**:
1. Load YAML configuration file
2. Validate required fields exist
3. Apply environment variable overrides if set
4. Parse paper type and citation style
5. Load paper type metadata from internal database

### Step 2: Paper Type Detection

The plugin uses a lookup table to identify the paper type and retrieve its metadata including section structure, word count ranges, supported citation styles, and audience information.

### Step 3: Citation Style Detection

The plugin identifies the citation style and retrieves its configuration including in-text format, reference list rules, font/spacing defaults, and heading hierarchy rules.

### Step 4: Source File Processing

The plugin reads all specified source files and combines them for processing, tracking total word count and file origins.

### Step 5: Citation Extraction

The plugin scans source content for in-text citations using the configured regex pattern, maps each citation to its reference entry, and flags orphans.

### Step 6: Citation Formatting

Each citation is formatted according to the selected style with proper in-text format and full reference list formatting.

### Step 7: Format Application

Formatting rules are applied per paper type and citation style: font size, line spacing, margins, heading hierarchy, title page formatting, abstract formatting, and section structure.

### Step 8: Reference Validation

All references are validated for completeness, style compliance, DOI format, alphabetical/numerical ordering, duplicate detection, and orphan citation detection.

### Step 9: Plagiarism Check (Optional)

If enabled, the plugin scans for properly formatted citations near factual claims and flags passages without citation markers.

### Step 10: Output Generation

The final formatted paper is assembled with TOC, all sections, and reference list, then written in the specified output format.

### Step 11: Results Reporting

A summary is generated with word count, citation count, validation results, and any errors or warnings.

## Interactive Mode vs Config File Mode

| Aspect | Interactive Mode | Config File Mode |
|---|---|---|
| User interaction | Step-by-step wizard | None (automated) |
| Best for | First-time users, quick setup | CI/CD pipelines, automated workflows |
| Configuration saved | Yes, to paper-config.yml | Already exists as paper-config.yml |
| Reference entry | One-by-one interactive | Pre-defined in YAML |
| Error handling | Guided re-prompts | Reports and exits |
| Output | Console-based | File-based |
| GitHub Actions | Can be triggered interactively | Runs automatically on push/PR |

## Error Handling

### Errors (cause action to fail in strict mode)
- Missing configuration file
- Unknown paper type
- Missing required citation fields
- Invalid DOI format
- Duplicate references
- Missing required paper sections

### Warnings (do not cause failure)
- Reference cited in text but not in references list
- Reference in list but not cited in text
- Word count below target
- Title exceeds recommended length
- Multiple references with similar content
- Unknown source type detected

## Integration with GitHub Actions

### Interactive Mode in CI/CD

```yaml
- name: Interactive paper setup
  uses: academic-paper-plugin/action@v1
  with:
    interactive: 'true'
    paper-config: paper-config.yml

- name: Format paper
  uses: academic-paper-plugin/action@v1
  with:
    paper-config: paper-config.yml
    validate-references: 'true'
    generate-toc: 'true'
```

### Workflow Dispatch with Interactive Input

```yaml
workflow_dispatch:
  inputs:
    interactive:
      description: 'Run interactive setup'
      required: false
      default: 'false'
```