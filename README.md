# Academic Paper Formatter - GitHub Plugin

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![GitHub Repo](https://img.shields.io/badge/GitHub-yagyarajsharma9%2Facademic--paper--plugin-lightgrey)](https://github.com/yagyarajsharma9/academic-paper-plugin)

An open-source GitHub Action that detects, formats, and validates academic papers across different types (thesis, research paper, term paper, etc.) and citation styles (APA, MLA, Chicago, IEEE, AMA, ASA).

## 📜 License

This project is **open source** and released under the **[MIT License](LICENSE)**.
You are free to use, modify, distribute, and contribute to this project.

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

# Quick prompt mode — same as interactive
npx academic-paper-formatter --prompt
```

### What the Interactive Setup Asks

1. **Paper Type** — What kind of paper are you writing? (12 options with hints)
2. **Citation Style** — Which citation style do you need? (7 options, filtered by paper type)
3. **Paper Details** — Title, author name, institution, department, course, instructor, date
4. **Formatting Options** — Output format, TOC, reference validation, strict mode, word count target, plagiarism check
5. **Reference Entry** — Enter references one-by-one with format hints, or skip
6. **Source Files** — Enter paths to your draft/source files
7. **Summary & Save** — Review configuration and save to `paper-config.yml`

### Smart Hints System

At every prompt, type **`hint`** for contextual guidance or **`help`** for full explanation. The system provides:
- **Paper type hints**: Explains which type fits their situation
- **Citation style hints**: Quick guide (APA → social sciences, MLA → humanities, etc.)
- **Formatting hints**: Recommendations based on use case
- **Reference format examples**: Shows exact citation format for the chosen style
- **Smart defaults**: Pre-selects the most common options