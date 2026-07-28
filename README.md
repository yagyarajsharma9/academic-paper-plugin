# Academic Paper Formatter

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Repo](https://img.shields.io/badge/GitHub-yagyarajsharma9%2Facademic--paper--plugin-lightgrey)](https://github.com/yagyarajsharma9/academic-paper-plugin)

An open-source GitHub Action that detects, formats, and validates academic papers across different types (thesis, research paper, term paper, etc.) and citation styles (APA, MLA, Chicago, IEEE, AMA, ASA).

## 📜 License

This project is **open source** and released under the **[MIT License](LICENSE)**.
You are free to use, modify, distribute, and contribute to this project.

## Install as Plugin

### For AI Coding Agents

This plugin can be installed in any AI coding agent setup. Add the `academic-paper-plugin/` directory to your project to enable academic paper formatting capabilities.

```bash
# Clone the plugin into your project
git clone https://github.com/yagyarajsharma9/academic-paper-plugin.git
```

### As a GitHub Action

Add this to your workflow file:

```yaml
- uses: yagyarajsharma9/academic-paper-plugin@v1
  with:
    paper-config: paper-config.yml
    citation-style: APA
    validate-references: true
    generate-toc: true
```

### Interactive Mode (AI Agent Friendly)

The plugin asks questions interactively so AI agents and users don't need to know formatting rules:

```bash
npx academic-paper-formatter --interactive
```

The interactive system provides:
- **Paper type selection** with hints (12 types)
- **Citation style selection** with guidance (7 styles)
- **Smart defaults** for every question
- **`hint`** command at any prompt for context
- **`help`** command for full explanation
- **`skip`** to bypass optional questions

## Quick Start

### 1. Interactive Setup (Recommended)

```bash
npx academic-paper-formatter --interactive
```

The wizard will ask:
1. What type of paper? → selects correct sections and formatting
2. Which citation style? → filtered by paper type
3. Paper details → title, author, institution
4. Formatting options → output format, TOC, validation
5. References → enter one by one or skip
6. Source files → your draft files
7. Saves to `paper-config.yml`

### 2. Use Config File

```yaml
paperType: research-paper
citationStyle: APA
outputFormat: markdown
validateReferences: true
generateToc: true
wordCountTarget: 5000

sourceFiles:
  - draft.md

references:
  - raw: "Smith, J. (2023). Academic writing guide. Education Journal, 12(1), 45-67."
```

```bash
npx academic-paper-formatter
```

## Paper Types Supported

| Paper Type | Description | Min Words | Citation Styles |
|---|---|---|---|
| thesis | Master's research document | 15,000 | APA, MLA, Chicago, IEEE |
| dissertation | Doctoral research | 30,000 | APA, MLA, Chicago, IEEE |
| research-paper | Original findings | 3,000 | APA, MLA, Chicago, IEEE, AMA, ASA |
| term-paper | Course assignment | 2,000 | APA, MLA, Chicago |
| literature-review | Synthesis of sources | 2,000 | APA, MLA, Chicago |
| experimental-report | Scientific method paper | 2,500 | APA, IEEE |
| argumentative | Position-based paper | 1,500 | APA, MLA, Chicago |
| exploratory | Open inquiry paper | 1,000 | APA, MLA, Chicago |
| annotated-bibliography | Citations with annotations | 500 | APA, MLA, Chicago |
| book-review | Critical evaluation | 500 | APA, MLA, Chicago |
| research-poster | Conference display | 300 | APA, MLA, Chicago |
| essay | Short academic writing | 500 | APA, MLA, Chicago |

## Citation Styles Supported

### APA (7th Edition)
- **In-text**: `(Author, Year)`
- **Reference list**: "References" — alphabetical
- **Italics**: Book titles, journal titles
- **Quotes**: Article titles, chapter titles

### MLA (9th Edition)
- **In-text**: `(Author Page)`
- **Works Cited**: Alphabetical
- **Container system**: Tracks sources through larger works
- **9 core elements**: Apply to all source types

### Chicago - Notes & Bibliography (18th Ed.)
- **In-text**: Superscript numbers with footnotes/endnotes
- **Bibliography**: Alphabetical, full details on first use
- **Shortened citations**: For repeated references
- **"Ibid."**: For repeated same-source citations

### Chicago - Author-Date (18th Ed.)
- **In-text**: `(Author Year)`
- **References**: Alphabetical

### IEEE
- **In-text**: `[Number]`
- **References**: Numbered in order of citation
- **Headings**: Roman numerals, capital letters, Arabic, lowercase

### AMA (American Medical Association)
- **In-text**: Superscript numbers
- **References**: Numbered in order of citation
- **Sentence case**: For all titles
- **Max 6 authors** before et al.

### ASA (American Sociological Association)
- **In-text**: `(Author Year)`
- **References**: Alphabetical, hanging indent
- **Title page**: Required with word count

## Configuration Options

| Option | Description | Default |
|---|---|---|
| `paper-config` | Path to config YAML | `paper-config.yml` |
| `paper-type` | Override paper type | Auto-detected |
| `citation-style` | Override citation style | Auto-detected |
| `output-format` | Output format | `markdown` |
| `validate-references` | Enable validation | `true` |
| `generate-toc` | Generate table of contents | `true` |
| `word-count-target` | Target word count | None |
| `strict-mode` | Fail on errors | `false` |
| `interactive` | Run interactive wizard | `false` |
| `prompt` | Quick prompt mode | `false` |

## Directory Structure

```
academic-paper-plugin/
├── action.yml              # GitHub Action definition
├── Dockerfile              # Container definition
├── LICENSE                 # MIT License
├── package.json            # Node.js dependencies
├── paper-config.yml        # Sample configuration
├── README.md               # This file
├── src/
│   ├── main.js             # Entry point
│   ├── paper-analyzer.js   # Paper type & style database
│   ├── citation-engine.js  # Citation formatting engine
│   ├── format-applier.js   # Formatting rules engine
│   ├── reference-validator.js  # Reference validation engine
│   └── prompts.js          # Interactive prompt system
├── templates/
│   ├── thesis.md
│   ├── dissertation.md
│   ├── research-paper.md
│   ├── term-paper.md
│   ├── literature-review.md
│   ├── experimental-report.md
└── docs/
    ├── research-summary.md
    ├── workflow.md
    ├── plugin-guide.md
    └── PROJECT_SUMMARY.md
```

## AI Agent Installation

### Install as a coding agent plugin

Add to your AI agent's plugin directory:

```bash
# Clone into your agent's plugin folder
git clone https://github.com/yagyarajsharma9/academic-paper-plugin.git
cd academic-paper-plugin

# Run interactive setup
node src/main.js --interactive

# Or use config file
node src/main.js --config paper-config.yml
```

### The plugin automatically:
1. Asks what type of paper you're writing
2. Selects the correct citation style
3. Applies formatting rules
4. Validates all references
5. Generates a properly structured output

No need to know citation rules — the plugin handles it all.

## Example Interactive Session

```
? What type of paper are you writing?
  ▶ research-paper
  thesis (15000-50000 words)
  dissertation (30000-100000 words)
  research-paper (3000-15000 words)
  term-paper (2000-10000 words)
  ...

? Select citation style:
  ▶ APA - Social sciences (psychology, education, nursing)
  MLA - Humanities (literature, languages, cultural studies)
  IEEE - Engineering & Computer Science
  ...

? Your paper title?
  > The Impact of AI on Education

✓ Configuration saved to paper-config.yml
✓ Ready to format!
```

## Requirements

- Node.js 18+
- Docker (for GitHub Action)
- js-yaml (for config parsing)

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

## Project Status

**Complete and Open Source** — MIT Licensed

- ✅ 12 paper types supported
- ✅ 7 citation styles supported
- ✅ Interactive Q&A with hints system
- ✅ Reference validation
- ✅ GitHub Action integration
- ✅ Pre-built templates
- ✅ Comprehensive documentation
- ✅ MIT License — free to use and contribute