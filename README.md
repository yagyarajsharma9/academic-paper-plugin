# Academic Paper Formatter - GitHub Plugin

An AI-powered GitHub Action that detects, formats, and validates academic papers across different types (thesis, research paper, term paper, etc.) and citation styles (APA, MLA, Chicago, IEEE, AMA, ASA).

## Why This Plugin?

Academic writing comes in many different forms, each with distinct formatting requirements, citation styles, and structural expectations. Students and researchers often struggle with:

- **Different paper types**: Thesis, dissertation, research paper, term paper, literature review, experimental report, and more — each with unique section structures.
- **Multiple citation styles**: APA, MLA, Chicago (NB & Author-Date), IEEE, AMA, ASA — each with different in-text citation formats, reference list styles, and formatting rules.
- **Formatting variations**: Font sizes, margins, line spacing, heading levels, and title page requirements vary by style and paper type.
- **Reference validation**: Ensuring all citations in the text match entries in the reference list and vice versa.

This plugin automates the confusion by guiding users through an interactive setup and then applying the correct formatting rules automatically.

## Key Feature: Interactive Setup

The plugin supports an **interactive question-asking mode** that guides users step-by-step through configuring their paper:

### Interactive Mode Usage

```bash
# Full interactive mode — asks all questions step by step
npx academic-paper-formatter --interactive

# Quick prompt mode — same as interactive, just a shortcut
npx academic-paper-formatter --prompt

# Or via GitHub Actions with interactive enabled
```

### What the Interactive Setup Asks

1. **Paper Type** — What kind of paper are you writing? (thesis, research paper, term paper, literature review, etc.)
2. **Citation Style** — Which citation style do you need? (APA, MLA, Chicago, IEEE, AMA, ASA)
3. **Paper Details** — Title, author name, institution, department, course, instructor, date
4. **Formatting Options** — Output format, TOC generation, reference validation, strict mode, word count target, plagiarism check
5. **Reference Entry** — Enter your references one by one, or skip
6. **Source Files** — Enter paths to your draft/source files
7. **Summary & Save** — Review configuration and save to `paper-config.yml`

### Interactive Mode Flow Diagram

```
┌─────────────────────────────────────────────────┐
│           INTERACTIVE SETUP WIZARD              │
├─────────────────────────────────────────────────┤
│                                                 │
│  STEP 1: Paper Type ──────────────────────┐    │
│  ┌──────────────────────────────────────┐  │    │
│  │ ✓ Thesis                             │  │    │
│  │ ✓ Dissertation                       │  │    │
│  │ ✓ Research Paper                     │  │    │
│  │ ✓ Term Paper                         │  │    │
│  │ ✓ Literature Review                  │  │    │
│  │ ✓ Experimental Report                │  │    │
│  │ ✓ Argumentative Paper                │  │    │
│  │ ✓ Exploratory Paper                  │  │    │
│  │ ✓ Annotated Bibliography             │  │    │
│  │ ✓ Book Review                        │  │    │
│  │ ✓ Research Poster                    │  │    │
│  │ ✓ Essay                              │  │    │
│  └──────────────────────────────────────┘  │    │
│                                             ▼    │
│  STEP 2: Citation Style ────────────────────┐    │
│  ┌──────────────────────────────────────┐  │    │
│  │ ✓ APA                                │  │    │
│  │ ✓ MLA                                │  │    │
│  │ ✓ Chicago-NB                         │  │    │
│  │ ✓ Chicago-AD                         │  │    │
│  │ ✓ IEEE                               │  │    │
│  │ ✓ AMA                                │  │    │
│  │ ✓ ASA                                │  │    │
│  └──────────────────────────────────────┘  │    │
│                                             ▼    │
│  STEP 3: Paper Details ─────────────────────┐    │
│  • Title                                     │    │
│  • Author Name                               │    │
│  • Institution                               │    │
│  • Department                                │    │
│  • Course (optional)                         │    │
│  • Instructor (optional)                     │    │
│  • Date                                      │    │
│                                             ▼    │
│  STEP 4: Formatting Options ────────────────┐    │
│  • Output Format (markdown/html/docx/pdf)    │    │
│  • Generate Table of Contents (yes/no)       │    │
│  • Validate References (yes/no)              │    │
│  • Strict Mode (yes/no)                      │    │
│  • Word Count Target (number)                │    │
│  • Plagiarism Check (yes/no)                 │    │
│                                             ▼    │
│  STEP 5: Reference Entry ───────────────────┐    │
│  • Enter references one per line            │    │
│  • Type 'done' when finished                │    │
│                                             ▼    │
│  STEP 6: Source Files ──────────────────────┐    │
│  • Enter draft file paths                   │    │
│  • Type 'done' when finished                │    │
│                                             ▼    │
│  SUMMARY & SAVE ────────────────────────────┘    │
│  • Review configuration summary                   │
│  • Save to paper-config.yml                       │
│  • Ready to format!                               │
│                                                    │
└───────────────────────────────────────────────────┘
```

## Quick Start - Non-Interactive (Config File)

### 1. Create a paper configuration file

Create `paper-config.yml` in your repository root:

```yaml
paperType: research-paper
citationStyle: APA
outputFormat: markdown
validateReferences: true
generateToc: true
wordCountTarget: 5000

sourceFiles:
  - draft.md
  - sources.md

references:
  - raw: "Smith, J. (2023). Academic writing guide. Education Journal, 12(1), 45-67."
```

### 2. Push and watch the action run

Push to your repository and the action will automatically format your paper and validate references.

## Usage as a GitHub Action

```yaml
- uses: academic-paper-plugin/action@v1
  with:
    paper-config: paper-config.yml
    paper-type: thesis
    citation-style: APA
    output-format: markdown
    validate-references: true
    generate-toc: true
    strict-mode: false
    interactive: false
```

## Paper Types Supported

| Paper Type | Description | Min Words | Typical Citation Style |
|---|---|---|---|
| Thesis | Master's level research document | 15,000 | APA, MLA, Chicago, IEEE |
| Dissertation | Doctoral-level original research | 30,000 | APA, MLA, Chicago, IEEE |
| Research Paper | Published or course research paper | 3,000 | APA, MLA, Chicago, IEEE, AMA, ASA |
| Term Paper | Course assignment research paper | 2,000 | APA, MLA, Chicago, Harvard |
| Literature Review | Critical summary of existing sources | 2,000 | APA, MLA, Chicago |
| Experimental Report | Scientific method-based paper | 2,500 | APA, IEEE |
| Argumentative Paper | Position-based persuasive paper | 1,500 | APA, MLA, Chicago |
| Exploratory Paper | Open inquiry paper | 1,000 | APA, MLA, Chicago |
| Annotated Bibliography | Citations with annotations | 500 | APA, MLA, Chicago |
| Book Review | Critical evaluation of a book | 500 | APA, MLA, Chicago |
| Research Poster | Conference visual presentation | 300 | APA, MLA, Chicago |
| Essay | Short academic writing | 500 | APA, MLA, Chicago |

## Citation Styles Supported

### APA (7th Edition)
- **In-text**: (Author, Year) or (Author, Year, p. Page)
- **Reference list**: "References" section, alphabetical order
- **Italics**: Book titles, journal titles, report titles
- **Quotes**: Article titles, chapter titles
- **Paper types**: Research papers, literature reviews, experimental reports, theses

### MLA (9th Edition)
- **In-text**: (Author Page)
- **Works Cited**: Alphabetical order
- **Container concept**: Unique system for tracking sources through larger works
- **9 core elements**: Apply to all source types
- **Paper types**: Research papers, term papers, essays, theses

### Chicago - Notes & Bibliography (18th Ed.)
- **In-text**: Superscript numbers with footnotes/endnotes
- **Bibliography**: Alphabetical order, full details on first use
- **Shortened citations**: Available for repeated references
- **"Ibid."**: For repeated same-source same-page citations
- **Paper types**: Theses, dissertations, research papers, term papers

### Chicago - Author-Date (18th Ed.)
- **In-text**: (Author Year)
- **References**: Alphabetical order
- **Paper types**: Theses, dissertations, research papers

### IEEE
- **In-text**: Bracketed numbers [1], [1, p. 5]
- **References**: Numbered in order of citation (not alphabetical)
- **Heading levels**: Roman numerals, capital letters, Arabic, lowercase
- **Paper format**: Two-column, 10pt, 1-inch margins
- **Paper types**: Research papers, experimental reports, theses

### AMA (American Medical Association)
- **In-text**: Superscript numbers ^1^
- **References**: Numbered in order of citation
- **Sentence case**: For all titles
- **Max 6 authors** before et al.
- **Paper types**: Research papers, experimental reports, theses

### ASA (American Sociological Association)
- **In-text**: (Author Year)
- **References**: Alphabetical order, hanging indent
- **Title page**: Required with word count
- **12pt Arial**, double spaced, 1.25-inch margins
- **Paper types**: Research papers, theses, dissertations

## Configuration Options

| Option | Description | Default |
|---|---|---|
| `paper-config` | Path to config YAML file | `paper-config.yml` |
| `paper-type` | Override auto-detected paper type | Auto-detected |
| `citation-style` | Override citation style | Auto-detected |
| `output-format` | Output format (markdown, html, docx, pdf) | `markdown` |
| `validate-references` | Enable reference validation | `true` |
| `template` | Path to custom template file | Default template |
| `generate-toc` | Generate table of contents | `true` |
| `word-count-target` | Target word count for warnings | None |
| `check-plagiarism` | Enable plagiarism check | `false` |
| `strict-mode` | Fail on validation errors | `false` |
| `interactive` | Run interactive setup wizard | `false` |
| `prompt` | Run quick prompt mode | `false` |

## Directory Structure

```
academic-paper-plugin/
├── action.yml              # GitHub Action definition
├── Dockerfile              # Container definition
├── package.json            # Node.js dependencies
├── .gitignore              # Git ignore rules
├── paper-config.yml        # Sample configuration
├── README.md               # This file
├── src/
│   ├── main.js             # Entry point and orchestration
│   ├── paper-analyzer.js   # Paper type & style database
│   ├── citation-engine.js  # Citation formatting engine
│   ├── format-applier.js   # Formatting rules engine
│   ├── reference-validator.js  # Reference validation engine
│   └── prompts.js          # Interactive prompt system (interactive Q&A)
├── templates/
│   ├── thesis.md           # Thesis template
│   ├── dissertation.md      # Dissertation template
│   ├── research-paper.md   # Research paper template
│   ├── term-paper.md       # Term paper template
│   ├── literature-review.md # Literature review template
│   ├── experimental-report.md # Experimental report template
├── .github/workflows/
│   └── demo.yml            # Example workflow
└── docs/
    ├── research-summary.md # Research findings summary
    ├── workflow.md          # Workflow documentation
    ├── plugin-guide.md      # Developer guide
    └── PROJECT_SUMMARY.md   # Complete project summary
```

## Interactive Mode Examples

### Example 1: First-time user
```bash
$ npx academic-paper-formatter --interactive

  [1] What type of paper are you writing?
  > [1] thesis
  ✓ Selected: Thesis - A substantial research paper submitted for a university degree
  
  > [1] APA
  ✓ Selected: APA (7th Edition)
  
  > My Master's Thesis on AI in Education
  > Jane Doe
  > University of Example
  ...
  
  ✓ Configuration saved to paper-config.yml
  ✓ Ready to format!
```

### Example 2: Quick prompt in CI/CD
```yaml
- name: Configure paper interactively
  run: npx academic-paper-formatter --prompt
```

## Requirements

- Node.js 18+
- Docker (for GitHub Action)
- js-yaml (for config parsing)

## License

MIT License

## Contributing

Contributions are welcome! Please submit a pull request or open an issue.

## Research Sources

This plugin is built on research from:
- Purdue OWL (owl.purdue.edu) - MLA, APA, Chicago, IEEE, AMA, ASA style guides
- The Chicago Manual of Style, 18th Edition
- Publication Manual of the American Psychological Association, 7th Edition
- MLA Handbook, 9th Edition
- Chicago Manual of Style (Author-Date system)
- IEEE citation and formatting standards
- AMA Manual of Style
- ASA Style Guide