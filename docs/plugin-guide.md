# Plugin Development Guide

## Overview

This guide documents the development structure and conventions used in the Academic Paper Formatter GitHub plugin.

## Project Structure

```
academic-paper-plugin/
├── action.yml              # GitHub Action metadata
├── Dockerfile              # Container image definition
├── package.json            # Node.js project configuration
├── paper-config.yml        # Sample configuration
├── README.md               # Project documentation
├── src/                    # Source code directory
│   ├── main.js             # Entry point
│   ├── paper-analyzer.js   # Paper type & citation style lookup
│   ├── citation-engine.js  # Citation formatting engine
│   ├── format-applier.js   # Formatting rules engine
│   └── reference-validator.js  # Reference validation engine
├── templates/              # Paper type templates
│   ├── thesis.md
│   ├── research-paper.md
│   ├── term-paper.md
│   ├── literature-review.md
│   ├── dissertation.md
│   └── experimental-report.md
├── .github/
│   └── workflows/
│       └── demo.yml        # Example GitHub Actions workflow
└── docs/                   # Documentation directory
    ├── research-summary.md # Research findings
    ├── workflow.md         # Workflow documentation
    └── plugin-guide.md     # This file
```

## Core Modules

### 1. paper-analyzer.js

**Purpose**: Detects paper types and citation styles from configuration.

**Key Exports**:
- `PAPER_TYPES`: Dictionary of paper type definitions with section structures, word count ranges, and supported citation styles.
- `CITATION_STYLES`: Dictionary of citation style definitions with in-text formats, reference list rules, and formatting conventions.
- `getPaperType(config)`: Returns metadata for the configured paper type.
- `getCitationStyle(config)`: Returns metadata for the configured citation style.

**Adding a New Paper Type**:
1. Add entry to `PAPER_TYPES` with:
   - `id`: Unique identifier (snake_case)
   - `name`: Human-readable name
   - `description`: Brief description
   - `sections`: Array of required section names in order
   - `minWords` / `maxWords`: Word count range
   - `citationStyles`: Array of supported citation style keys
   - `requiresApproval`: Boolean
   - `typicalAudience`: String
   - `formattingNote`: Additional formatting notes

**Adding a New Citation Style**:
1. Add entry to `CITATION_STYLES` with:
   - `fullName`: Complete name of the style guide
   - `fields`: List of fields used in citations
   - `inTextFormat`: Pattern for in-text citations
   - `referenceListTitle`: Title for the references page
   - `referenceListOrder`: "alphabetical" or "order of citation (numerical)"
   - `italicsFor`: Array of what should be italicized
   - `quotationMarksFor`: Array of what should be in quotation marks
   - `paperTypes`: Which paper types this style is commonly used for
   - `defaultFields`: Default citation format strings

### 2. citation-engine.js

**Purpose**: Parses, formats, and validates citations and references.

**Key Class**: `CitationEngine`

**Constructor Options**:
- `style`: Citation style key (APA, MLA, Chicago-NB, etc.)
- `config`: Additional configuration options

**Key Methods**:
- `parseReference(rawRef)`: Parses a raw reference string into structured data
- `formatInText(author, year, page)`: Generates in-text citation
- `formatFullReference(ref)`: Generates full reference list entry
- `validateReference(ref)`: Validates a single reference for completeness
- `generateReferenceList()`: Returns all formatted references as a string
- `validateDOIs(references)`: Validates DOI formats across all references

**Reference Parsing Flow**:
1. Detect source type (book, journal, website, thesis, conference, technical report, dataset, etc.)
2. Extract authors, title, publication info, and location
3. Normalize fields to a standard structure
4. Format according to the selected citation style

### 3. format-applier.js

**Purpose**: Applies formatting rules to paper content based on type and style.

**Key Class**: `FormatApplier`

**Constructor Options**:
- `config`: Plugin configuration object

**Key Methods**:
- `apply(config, sourceContent)`: Main method that applies all formatting rules
- `getTemplate(templateName)`: Loads a specific template file
- `getAllTemplates()`: Lists all available templates

**Formatting Rules Applied**:
1. Font size (varies by style)
2. Line spacing (single or double)
3. Margins (varies by style)
4. Font family (varies by style)
5. Heading hierarchy (varies by style)
6. Title page formatting (varies by style)
7. Abstract formatting (varies by style)
8. Section structure (varies by paper type)

### 4. reference-validator.js

**Purpose**: Validates references for completeness, accuracy, and style compliance.

**Key Class**: `ReferenceValidator`

**Constructor Options**:
- `config`: Plugin configuration object

**Key Methods**:
- `validateReferences(references)`: Validates all references at once
- `validateDOIs(references)`: Checks DOI format compliance
- `_validateAPAFields(ref, index)`: Validates APA-specific fields
- `_validateMLAFields(ref, index)`: Validates MLA-specific fields
- `_validateIEEEFields(ref, index)`: Validates IEEE-specific fields
- `_validateAMAFields(ref, index)`: Validates AMA-specific fields
- `_checkDuplicateReferences(ref, index, refArray)`: Detects duplicate entries
- `_checkOrphanInTextCitations(ref, index, refArray)`: Detects orphans
- `_validateReferenceOrder(refArray)`: Checks reference ordering
- `_checkCitationConsistency(refArray)`: Checks for citation inconsistencies

## Adding a New Citation Style

### Step 1: Add to CITATION_STYLES in paper-analyzer.js

```javascript
'NEW_STYLE': {
  fullName: 'Full Style Name',
  fields: ['Author', 'Date', 'Title', 'Source'],
  inTextFormat: '(Author Year)',
  referenceListTitle: 'References',
  referenceListOrder: 'alphabetical',
  italicsFor: ['Book titles', 'Journal titles'],
  quotationMarksFor: ['Article titles', 'Chapter titles'],
  paperTypes: ['thesis', 'research-paper'],
  defaultFields: {
    book: 'Author. Year. Title. Publisher.',
    journal: 'Author. "Title." Journal, vol. #, year.'
  }
}
```

### Step 2: Add validation methods in reference-validator.js

Add a `_validateNEW_STYLEFields` method that checks all required fields for the new style.

### Step 3: Add formatting methods in citation-engine.js

Add `_formatNEW_STYLEFull(ref)` method for generating properly formatted reference list entries.

### Step 4: Add formatting rules in format-applier.js

Add cases in `_getDefaultFontSize()`, `_getDefaultLineSpacing()`, `_getDefaultMargins()`, etc.

## Adding a New Paper Type

### Step 1: Add to PAPER_TYPES in paper-analyzer.js

### Step 2: Create a template in templates/ directory

### Step 3: Update README.md with the new paper type

### Step 4: Update research-summary.md with details

## Testing

Run the test suite:
```bash
npm test
```

Run linting:
```bash
npm run lint
```

Run formatting:
```bash
npm run format
```

## Key Conventions

1. All file names use kebab-case
2. Source files are in `src/` with descriptive names
3. Templates are in `templates/` with paper-type names
4. Documentation is in `docs/` with clear, descriptive filenames
5. All methods should be documented with their purpose, parameters, and return values
6. Error messages should be actionable and specific
7. Warnings should not block execution; only errors should cause failures
8. Configuration is YAML-based for human readability
9. The plugin follows the GitHub Action metadata format (action.yml)
10. All external data sources are documented in this guide