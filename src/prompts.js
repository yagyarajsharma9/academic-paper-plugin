const readline = require('readline');
const PaperAnalyzer = require('./paper-analyzer');

const COLORS = {
  RESET: '\x1b[0m',
  BOLD: '\x1b[1m',
  DIM: '\x1b[2m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  CYAN: '\x1b[36m',
  RED: '\x1b[31m',
  MAGENTA: '\x1b[35m'
};

class InteractivePrompter {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.answers = {};
    this.helpCache = {};
  }

  async start() {
    this._printHeader();
    await this.askPaperType();
    await this.askCitationStyle();
    await this.askPaperDetails();
    await this.askFormattingOptions();
    await this.askValidationOptions();
    await this.askSourceFiles();
    await this._showSmartHints();
    await this.showSummary();
    await this.saveConfig();
    this.rl.close();
  }

  _printHeader() {
    console.log(`\n${COLORS.BOLD}${COLORS.CYAN}╔══════════════════════════════════════════════════════════════╗${COLORS.RESET}`);
    console.log(`${COLORS.BOLD}${COLORS.CYAN}║         📚 Academic Paper Formatter - Interactive Setup        ║${COLORS.RESET}`);
    console.log(`${COLORS.BOLD}${COLORS.CYAN}╚══════════════════════════════════════════════════════════════╝${COLORS.RESET}`);
    console.log(`${COLORS.DIM}  This wizard will ask you questions about your paper and then
  generate the correct configuration file. At any point type
  'help' for context-sensitive guidance on the current question.${COLORS.RESET}\n`);
  }

  ask(question, options = {}) {
    return new Promise((resolve) => {
      const { default: defaultVal, required, maxLength, minLength } = options;
      let prompt = `\n${COLORS.BOLD}${COLORS.GREEN}?${COLORS.RESET} ${question}`;
      if (defaultVal !== undefined) prompt += ` ${COLORS.DIM}[default: ${defaultVal}]${COLORS.RESET}`;
      if (required) prompt += ` ${COLORS.RED}*${COLORS.RESET}`;
      prompt += `\n${COLORS.CYAN}  > ${COLORS.RESET}`;

      this.rl.question(prompt, (input) => {
        const trimmed = input.trim();

        if (trimmed.toLowerCase() === 'help') {
          this._showContextHelp();
          return resolve(this.ask(question, options));
        }

        if (trimmed.toLowerCase() === 'hint') {
          this._showHint(options);
          return resolve(this.ask(question, options));
        }

        if (trimmed.toLowerCase() === 'skip' && !required) {
          resolve(defaultVal || '');
          return;
        }

        if (required && trimmed.length === 0 && defaultVal === undefined) {
          console.log(`  ${COLORS.RED}  ⚠ This field is required. Please try again or type 'help'.${COLORS.RESET}`);
          return resolve(this.ask(question, options));
        }
        if (minLength && trimmed.length < minLength && trimmed.length > 0) {
          console.log(`  ${COLORS.YELLOW}  ⚠ Input too short (minimum ${minLength} characters).${COLORS.RESET}`);
          return resolve(this.ask(question, options));
        }
        if (maxLength && trimmed.length > maxLength) {
          console.log(`  ${COLORS.YELLOW}  ⚠ Input too long (maximum ${maxLength} characters).${COLORS.RESET}`);
          return resolve(this.ask(question, options));
        }
        resolve(trimmed || defaultVal || '');
      });
    });
  }

  askChoice(question, choices, options = {}) {
    return new Promise((resolve) => {
      const { default: defaultIdx = 0 } = options;
      const hints = options.hints || {};

      const display = choices.map((c, i) => {
        const marker = i === defaultIdx ? '▶' : ' ';
        const label = typeof c === 'string' ? c : c.label;
        const desc = typeof c === 'object' ? (c.desc || '') : '';
        const hint = hints[label] || '';
        return `  ${COLORS.BOLD}${marker}${COLORS.RESET} ${label} ${COLORS.DIM}- ${desc}${COLORS.RESET}${hint ? COLORS.MAGENTA + ` (${hint})` + COLORS.RESET : ''}`;
      }).join('\n');

      const prompt = `\n${COLORS.BOLD}${COLORS.GREEN}?${COLORS.RESET} ${question}\n${display}\n  ${COLORS.DIM}Type the number or name. Type 'hint' for guidance. Type 'help' for full help.${COLORS.RESET}\n${COLORS.CYAN}  > ${COLORS.RESET}`;

      this.rl.question(prompt, (input) => {
        const trimmed = input.trim();

        if (trimmed.toLowerCase() === 'help') {
          this._showContextHelp();
          return resolve(this.askChoice(question, choices, options));
        }

        if (trimmed.toLowerCase() === 'hint') {
          this._showChoiceHint(question, choices, options);
          return resolve(this.askChoice(question, choices, options));
        }

        if (trimmed === '') {
          resolve(choices[defaultIdx]);
          return;
        }

        const numIdx = parseInt(trimmed) - 1;
        if (!isNaN(numIdx) && numIdx >= 0 && numIdx < choices.length) {
          resolve(choices[numIdx]);
          return;
        }

        const matched = choices.filter((c) => {
          const label = typeof c === 'string' ? c.toLowerCase() : c.label.toLowerCase();
          return label.includes(trimmed.toLowerCase());
        });

        if (matched.length === 1) {
          resolve(matched[0]);
        } else if (matched.length > 1) {
          console.log(`  ${COLORS.YELLOW}  Multiple matches. Please be more specific or enter the number.${COLORS.RESET}`);
          return resolve(this.askChoice(question, choices, options));
        } else {
          console.log(`  ${COLORS.RED}  Invalid choice. Enter the number or name, or type 'hint' for help.${COLORS.RESET}`);
          return resolve(this.askChoice(question, choices, options));
        }
      });
    });
  }

  _showContextHelp() {
    const step = this._getCurrentStep();
    const helps = {
      paperType: `\n  ${COLORS.CYAN}📦 What type of paper is this?${COLORS.RESET}\n${COLORS.DIM}  The paper type determines the section structure, formatting rules,\n  and citation style options available to you.${COLORS.RESET}\n\n  ${COLORS.YELLOW}How to choose:${COLORS.RESET}\n  • Are you writing a master's or doctoral research document?\n    → thesis or dissertation\n  • Is it for a journal or course with original research?\n    → research-paper or experimental-report\n  • Is it a course assignment?\n    → term-paper or essay\n  • Are you summarizing existing sources?\n    → literature-review\n  • Is it a short assignment with a stance?\n    → argumentative\n  • Are you creating a visual display?\n    → research-poster\n  • Do you need citations with annotations?\n    → annotated-bibliography\n  • Are you evaluating a book?\n    → book-review`,
      citationStyle: `\n  ${COLORS.CYAN}📖 Which citation style should be used?${COLORS.RESET}\n${COLORS.DIM}  The citation style determines how sources are formatted in-text\n  and in the reference list.${COLORS.RESET}\n\n  ${COLORS.YELLOW}Quick guide:${COLORS.RESET}\n  • Social sciences (psychology, education, nursing) → APA\n  • Humanities (literature, languages, history) → MLA or Chicago-NB\n  • Engineering / Computer Science → IEEE\n  • Medicine / Health Sciences → AMA\n  • Sociology → ASA\n  • History / Arts → Chicago-NB`,
      paperDetails: `\n  ${COLORS.CYAN}📝 Paper details${COLORS.RESET}\n${COLORS.DIM}  These are used in the title page and metadata of the paper.${COLORS.RESET}\n\n  ${COLORS.YELLOW}Tips:${COLORS.RESET}\n  • Title should be descriptive and specific\n  • Use your full legal name as the author\n  • Include your university and department\n  • Date format: YYYY-MM-DD (e.g., 2026-07-28)`,
      formatting: `\n  ${COLORS.CYAN}🎨 Formatting options${COLORS.RESET}\n${COLORS.DIM}  These control how the final output looks.${COLORS.RESET}\n\n  ${COLORS.YELLOW}Recommendations:${COLORS.RESET}\n  • markdown for GitHub and web use\n  • html for web publishing\n  • docx for Microsoft Word editing\n  • pdf for final print-ready submission\n  • Always generate TOC for thesis/dissertation\n  • Always validate references before submission\n  • Enable strict mode for final submission drafts`,
      validation: `\n  ${COLORS.CYAN}✓ Reference validation${COLORS.RESET}\n${COLORS.DIM}  This checks your references for correctness.\n\
n  ${COLORS.YELLOW}What it checks:${COLORS.RESET}\n  • All in-text citations have matching reference entries\n  • All references are cited in the text\n  • DOI formats are valid\n  • Reference ordering follows the chosen style rules\n  • No duplicate references`,
      sourceFiles: `\n  ${COLORS.CYAN}📂 Source files${COLORS.RESET}\n${COLORS.DIM}  These are the draft or markdown files containing your paper content.${COLORS.RESET}\n\n  ${COLORS.YELLOW}Tips:${COLORS.RESET}\n  • Enter paths relative to the repository root\n  • You can enter multiple files (they will be combined)\n  • If you just created your paper in a template, you can skip this\n  • Common patterns: draft.md, sources.md, references.md`
    };

    const help = helps[step] || '';
    if (help) {
      console.log(help);
    }
  }

  _showHint(options) {
    const hint = options.hint || options.desc || '';
    if (hint) {
      console.log(`\n  ${COLORS.MAGENTA}💡 Hint: ${hint}${COLORS.RESET}`);
    } else {
      console.log(`\n  ${COLORS.MAGENTA}💡 No additional hints available for this field.${COLORS.RESET}`);
    }
  }

  _showChoiceHint(question, choices, options) {
    const step = this._getCurrentStep();
    const hintsMap = {
      paperType: '\n  💡 Tip: Choose "research-paper" if you are not sure. It is the most common academic paper type.',
      citationStyle: '\n  💡 Tip: APA is the most widely used style across academic disciplines.',
      outputFormat: '\n  💡 Tip: Choose "markdown" for GitHub. "pdf" only works with pandoc installed.',
      generateToc: '\n  💡 Tip: Always generate a TOC for papers longer than 3,000 words.',
      validateReferences: '\n  💡 Tip: Always validate references before submitting to avoid citation errors.',
      strictMode: '\n  💡 Tip: Start with "no" strict mode. Switch to "yes" for final submission drafts.',
      checkPlagiarism: '\n  💡 Tip: Enable this to catch uncited claims before submitting.'
    };
    const hint = hintsMap[step] || '';
    if (hint) {
      console.log(`  ${COLORS.MAGENTA}${hint}${COLORS.RESET}`);
    }
  }

  _getCurrentStep() {
    const keys = Object.keys(this._getStepOrder());
    const completed = keys.filter(k => this.answers[k]);
    if (completed.length === 0) return 'paperType';
    const lastCompleted = completed[completed.length - 1];
    return lastCompleted;
  }

  _getStepOrder() {
    return {
      paperType: 1,
      citationStyle: 2,
      paperDetails: 3,
      formatting: 4,
      validation: 5,
      sourceFiles: 6
    };
  }

  async _showSmartHints() {
    console.log(`\n${COLORS.BOLD}${COLORS.CYAN}═══ Smart Suggestions ═══${COLORS.RESET}`);

    if (this.answers.paperType) {
      const pt = this.answers.paperType;
      const ptInfo = PaperAnalyzer.PAPER_TYPES[pt.toUpperCase().replace(/-/g, '_')];
      if (ptInfo) {
        console.log(`\n  ${COLORS.BOLD}📋 For ${ptInfo.name}:${COLORS.RESET}`);
        console.log(`     ${COLORS.DIM}Expected word count: ${ptInfo.minWords} - ${ptInfo.maxWords}${COLORS.RESET}`);
        console.log(`     ${COLORS.DIM}Sections: ${ptInfo.sections.join(', ')}${COLORS.RESET}`);
        if (ptInfo.citationStyles.length <= 3) {
          console.log(`     ${COLORS.DIM}Recommended styles: ${ptInfo.citationStyles.join(', ')}${COLORS.RESET}`);
        }
        console.log(`     ${COLORS.DIM}Audience: ${ptInfo.typicalAudience}${COLORS.RESET}`);
      }
    }

    if (this.answers.citationStyle) {
      const style = this.answers.citationStyle;
      const styleInfo = PaperAnalyzer.CITATION_STYLES[style.toUpperCase().replace(/-/g, '_')];
      if (styleInfo) {
        console.log(`\n  ${COLORS.BOLD}📖 ${styleInfo.fullName}:${COLORS.RESET}`);
        console.log(`     ${COLORS.DIM}In-text: ${styleInfo.inTextFormat}${COLORS.RESET}`);
        console.log(`     ${COLORS.DIM}Reference list: ${styleInfo.referenceListTitle} (${styleInfo.referenceListOrder})${COLORS.RESET}`);
      }
    }

    if (this.answers.wordCountTarget) {
      console.log(`\n  ${COLORS.BOLD}📏 Word count target: ${this.answers.wordCountTarget}${COLORS.RESET}`);
      console.log(`     ${COLORS.DIM}The formatter will warn if your paper is significantly below this target.${COLORS.RESET}`);
    }

    if (this.answers.sourceFiles && this.answers.sourceFiles.length > 0) {
      console.log(`\n  ${COLORS.BOLD}📂 Source files configured: ${this.answers.sourceFiles.length}${COLORS.RESET}`);
    }

    console.log('');
  }

  async askPaperType() {
    console.log(`\n${COLORS.BOLD}${'═'.repeat(60)}${COLORS.RESET}`);
    console.log(`${COLORS.BOLD}  STEP 1: What type of paper are you writing?${COLORS.RESET}`);
    console.log(`${COLORS.DIM}  (Type 'hint' for guidance, 'help' for detailed explanation)${COLORS.RESET}`);
    console.log(`${COLORS.BOLD}${'═'.repeat(60)}${COLORS.RESET}`);

    const paperTypes = Object.values(PaperAnalyzer.PAPER_TYPES);
    const choices = paperTypes.map((pt) => ({
      label: pt.id,
      desc: `${pt.name} (${pt.minWords}-${pt.maxWords} words)`,
      value: pt.id,
      hint: `${pt.sections.length} sections, audience: ${pt.typicalAudience}`
    }));

    const choice = await this.askChoice('Select your paper type:', choices, {
      default: 2,
      hints: paperTypes.reduce((acc, pt) => {
        acc[pt.id] = `${pt.minWords}-${pt.maxWords} words, ${pt.sections.length} sections`;
        return acc;
      }, {})
    });
    this.answers.paperType = choice;

    const ptInfo = PaperAnalyzer.PAPER_TYPES[choice.toUpperCase().replace(/-/g, '_')];
    if (ptInfo) {
      console.log(`\n  ${COLORS.GREEN}✓ ${COLORS.BOLD}${ptInfo.name}${COLORS.RESET}`);
      console.log(`  ${COLORS.DIM}${ptInfo.description}${COLORS.RESET}`);
      if (ptInfo.citationStyles.length > 0) {
        console.log(`  ${COLORS.DIM}Compatible citation styles: ${ptInfo.citationStyles.join(', ')}${COLORS.RESET}`);
      }
      console.log(`  ${COLORS.DIM}Sections will include: ${ptInfo.sections.slice(0, 4).join(', ...')}${COLORS.RESET}`);
    }
  }

  async askCitationStyle() {
    console.log(`\n${COLORS.BOLD}${''.padEnd(60, '═')}${COLORS.RESET}`);
    console.log(`${COLORS.BOLD}  STEP 2: Which citation style do you need?${COLORS.RESET}`);
    console.log(`${COLORS.DIM}  (Type 'hint' for guidance, 'help' for detailed explanation)${COLORS.RESET}`);
    console.log(`${COLORS.BOLD}${''.padEnd(60, '═')}${COLORS.RESET}`);

    const styles = [
      { label: 'APA', desc: 'Social sciences (psychology, education, nursing)', value: 'APA', hint: 'Use for psychology, education, social work, nursing papers' },
      { label: 'MLA', desc: 'Humanities (literature, languages, cultural studies)', value: 'MLA', hint: 'Use for literature, languages, cultural studies papers' },
      { label: 'Chicago-NB', desc: 'Humanities (notes + bibliography system)', value: 'Chicago-NB', hint: 'Used in history, literature, arts, philosophy' },
      { label: 'Chicago-AD', desc: 'Social sciences (author-date system)', value: 'Chicago-AD', hint: 'Variant of Chicago for social sciences' },
      { label: 'IEEE', desc: 'Engineering & Computer Science', value: 'IEEE', hint: 'Use for electrical engineering, CS, IT papers' },
      { label: 'AMA', desc: 'Medicine & Health Sciences', value: 'AMA', hint: 'Use for medical, health sciences, nursing papers' },
      { label: 'ASA', desc: 'Sociology', value: 'ASA', hint: 'Use for sociology, social science papers' }
    ];

    const ptInfo = PaperAnalyzer.PAPER_TYPES[this.answers.paperType.toUpperCase().replace(/-/g, '_')];
    let choices = styles;
    if (ptInfo && ptInfo.citationStyles) {
      choices = styles.filter(s => ptInfo.citationStyles.includes(s.value));
    }

    const choice = await this.askChoice('Select citation style:', choices, {
      default: 0,
      hints: styles.reduce((acc, s) => {
        acc[s.label] = s.hint;
        return acc;
      }, {})
    });
    this.answers.citationStyle = choice;
    console.log(`\n  ${COLORS.GREEN}✓ Selected: ${COLORS.BOLD}${choice}${COLORS.RESET}`);
  }

  async askPaperDetails() {
    console.log(`\n${COLORS.BOLD}${''.padEnd(60, '═')}${COLORS.RESET}`);
    console.log(`${COLORS.BOLD}  STEP 3: Paper details${COLORS.RESET}`);
    console.log(`${COLORS.DIM}  (Type 'hint' for guidance on each field, 'help' for all)${COLORS.RESET}`);
    console.log(`${COLORS.BOLD}${''.padEnd(60, '═')}${COLORS.RESET}`);

    this.answers.title = await this.ask(
      'What is your paper title?\n  💡 Tip: Make it descriptive and specific. Include key terms.',
      { required: false, maxLength: 200, hint: 'Example: "The Impact of AI on Secondary Education: A Literature Review"' }
    );

    this.answers.author = await this.ask(
      'Your full name (as it should appear on the paper)?\n  💡 Tip: Use your legal first and last name.',
      { required: true, hint: 'Example: Jane Smith or J. Smith (check your institution preference)' }
    );

    this.answers.institution = await this.ask(
      'Your institution/university name?\n  💡 Tip: Include the full official name.',
      { required: false, hint: 'Example: University of Example, Department of Computer Science' }
    );

    this.answers.department = await this.ask(
      'Department or faculty?',
      { required: false, hint: 'Example: Department of Psychology, Faculty of Arts' }
    );

    this.answers.course = await this.ask(
      'Course name or code (if applicable)?',
      { required: false, hint: 'Example: EDU 401, PSY 201, CS 500' }
    );

    this.answers.instructor = await this.ask(
      "Instructor or supervisor name (if applicable)?",
      { required: false, hint: "Example: Dr. Jane Doe, Prof. John Smith" }
    );

    this.answers.date = await this.ask(
      "Submission date? (YYYY-MM-DD, or leave blank for today)",
      { required: false, hint: 'Example: 2026-07-28' }
    );

    if (!this.answers.date) {
      const today = new Date();
      this.answers.date = today.toISOString().split('T')[0];
      console.log(`  ${COLORS.DIM}  Using today's date: ${this.answers.date}${COLORS.RESET}`);
    }
  }

  async askFormattingOptions() {
    console.log(`\n${COLORS.BOLD}${''.padEnd(60, '═')}${COLORS.RESET}`);
    console.log(`${COLORS.BOLD}  STEP 4: Formatting options${COLORS.RESET}`);
    console.log(`${COLORS.DIM}  (Type 'hint' for guidance, 'help' for detailed explanation)${COLORS.RESET}`);
    console.log(`${COLORS.BOLD}${''.padEnd(60, '═')}${COLORS.RESET}`);

    const outputChoices = [
      { label: 'markdown', desc: '.md file - best for GitHub, README, web', value: 'markdown', hint: 'Recommended for first-time users and GitHub workflows' },
      { label: 'html', desc: '.html file - formatted web page with styles', value: 'html', hint: 'Use for web publishing or online submission' },
      { label: 'docx', desc: '.docx file - Microsoft Word document', value: 'docx', hint: 'Use when your institution requires Word format' },
      { label: 'pdf', desc: '.pdf file - print-ready, fixed layout', value: 'pdf', hint: '⚠ Requires pandoc + LaTeX for conversion' }
    ];

    this.answers.outputFormat = await this.askChoice(
      'Output format?',
      outputChoices,
      { default: 0, hints: outputChoices.reduce((acc, o) => {
        acc[o.label] = o.hint;
        return acc;
      }, {}) }
    );

    this.answers.generateToc = await this.askChoice(
      'Generate table of contents?',
      [
        { label: 'yes', desc: 'Auto-generate clickable TOC with section links', value: true, hint: 'Required for thesis and dissertation' },
        { label: 'no', desc: 'Skip table of contents', value: false, hint: 'Shorter papers and some journal formats do not need TOC' }
      ],
      { default: 0 }
    );

    this.answers.validateReferences = await this.askChoice(
      'Validate references for completeness?',
      [
        { label: 'yes', desc: 'Check all references for style compliance, DOI format, ordering', value: true, hint: 'Always recommended before submission' },
        { label: 'no', desc: 'Skip reference validation', value: false, hint: 'Only skip if you are confident references are correct' }
      ],
      { default: 0 }
    );

    this.answers.strictMode = await this.askChoice(
      'Strict mode (fail workflow on any error)?',
      [
        { label: 'yes', desc: 'Fail the workflow if any validation error is found', value: true, hint: 'Best for final submission and published papers' },
        { label: 'no', desc: 'Report errors and warnings but continue processing', value: false, hint: 'Best for drafts and iterative work' }
      ],
      { default: 1 }
    );

    const wcPrompt = 'Target word count? (or press Enter to skip)\n  💡 Tip: Set this to get a warning if your paper is significantly under/over target';
    const wordCountTarget = await this.ask(wcPrompt, { required: false, maxLength: 10, hint: 'Leave blank if no word count requirement' });
    this.answers.wordCountTarget = wordCountTarget ? parseInt(wordCountTarget) : null;

    this.answers.checkPlagiarism = await this.askChoice(
      'Enable basic plagiarism pattern check?',
      [
        { label: 'yes', desc: 'Check for properly formatted citations near factual claims', value: true, hint: 'Detects uncited passages in your draft' },
        { label: 'no', desc: 'Skip plagiarism check (use external tools instead)', value: false, hint: 'Recommended if you have access to dedicated plagiarism tools' }
      ],
      { default: 1 }
    );
  }

  async askValidationOptions() {
    if (!this.answers.validateReferences) {
      console.log(`\n  ${COLORS.DIM}Skipping reference entry (validation disabled).${COLORS.RESET}`);
      this.answers.references = [];
      return;
    }

    console.log(`\n${COLORS.BOLD}${''.padEnd(60, '═')}${COLORS.RESET}`);
    console.log(`${COLORS.BOLD}  STEP 5: Enter your references${COLORS.RESET}`);
    console.log(`${COLORS.DIM}  (Type 'hint' for citation format guidance, 'skip' to continue later)${COLORS.RESET}`);
    console.log(`${COLORS.BOLD}${''.padEnd(60, '═')}${COLORS.RESET}`);

    console.log(`\n  ${COLORS.CYAN}Enter each reference exactly as it appears in your paper.${COLORS.RESET}`);
    console.log(`  ${COLORS.CYAN}One reference per line. Type 'done' when finished, or 'skip' to continue.${COLORS.RESET}`);
    console.log(`  ${COLORS.CYAN}Type 'hint' at any time to see citation format examples for your style.${COLORS.RESET}\n`);

    this._showCitationFormatHint();

    const refs = [];
    let refCount = 1;

    while (true) {
      const prompt = `${COLORS.CYAN}  Reference #${refCount} (or 'done'/'skip'/'hint'): ${COLORS.RESET}`;
      const ref = await this.ask(prompt, { required: false });

      if (ref.toLowerCase() === 'done') {
        if (refs.length === 0) {
          console.log(`  ${COLORS.YELLOW}  ⚠ You entered no references. This is okay if you will enter them later.${COLORS.RESET}`);
        }
        break;
      }

      if (ref.toLowerCase() === 'skip') {
        console.log(`  ${COLORS.DIM}  Skipping reference entry. You can add references later.${COLORS.RESET}`);
        break;
      }

      if (ref.toLowerCase() === 'hint') {
        this._showCitationFormatHint();
        continue;
      }

      if (ref.trim().length === 0) {
        console.log(`  ${COLORS.RED}  Reference cannot be empty. Enter a citation or 'done'.${COLORS.RESET}`);
        continue;
      }

      refs.push(ref);
      const preview = ref.length > 80 ? ref.substring(0, 80) + '...' : ref;
      console.log(`  ${COLORS.GREEN}  ✓ Added reference #${refCount}: "${preview}"${COLORS.RESET}`);
      refCount++;
    }

    this.answers.references = refs;
    console.log(`\n  ${COLORS.BOLD}Total references entered: ${refs.length}${COLORS.RESET}`);
  }

  _showCitationFormatHint() {
    const style = this.answers.citationStyle || 'APA';
    let hint = '';

    switch (style) {
      case 'APA':
        hint = `\n  ${COLORS.MAGENTA}💡 APA format examples:${COLORS.RESET}
  Book:     Author, A. A. (Year). Title of work. Publisher.
  Journal:  Author, A. A. (Year). Title of article. Journal Name, vol(Issue), pp. https://doi.org/...
  Website:  Author, A. A. (Year, Month Day). Page title. Site Name. URL`;
        break;
      case 'MLA':
        hint = `\n  ${COLORS.MAGENTA}💡 MLA format examples:${COLORS.RESET}
  Book:     Author Last, First. Title of Book. Publisher, Year.
  Journal:  Author Last, First. "Title of Article." Journal Title, vol. #, no. #, Year, pp. #-#.
  Website:  Author Last, First. "Title of Page." Website Title, Publisher, Date, URL.`;
        break;
      case 'Chicago-NB':
        hint = `\n  ${COLORS.MAGENTA}💡 Chicago NB format examples:${COLORS.RESET}
  Book:     Author First Last, Title of Book (City: Publisher, Year).
  Journal:  Author First Last, "Title of Article," Journal Title volume, no. issue (Year): pages.`;
        break;
      case 'IEEE':
        hint = `\n  ${COLORS.MAGENTA}💡 IEEE format examples:${COLORS.RESET}
  Book:     [#] Author, Title, volume, edition. City, State, Country: Publisher, year.
  Journal:  [#] Author, "Title," Journal, volume, number, pages, month year, doi: xxxx.`;
        break;
      case 'AMA':
        hint = `\n  ${COLORS.MAGENTA}💡 AMA format examples:${COLORS.RESET}
  Journal:  AuthorInitials. Title in sentence case. Abbreviated Journal Title. Year;vol(Issue):pp. doi:`;
        break;
      case 'ASA':
        hint = `\n  ${COLORS.MAGENTA}💡 ASA format examples:${COLORS.RESET}
  Book:     Author Last, First Initials. Year. Title of Book. City, State: Publisher.
  Journal:  Author Last, First Initials. Year. "Title of Article." Journal Title vol(Issue):pages.`;
        break;
      default:
        hint = `\n  ${COLORS.MAGENTA}💡 Enter your reference in the format required by your citation style.${COLORS.RESET}`;
    }

    console.log(hint);
  }

  async askSourceFiles() {
    console.log(`\n${COLORS.BOLD}${''.padEnd(60, '═')}${COLORS.RESET}`);
    console.log(`${COLORS.BOLD}  STEP 6: Source files${COLORS.RESET}`);
    console.log(`${COLORS.DIM}  (Type 'hint' for guidance, 'skip' to use template content)${COLORS.RESET}`);
    console.log(`${COLORS.BOLD}${''.padEnd(60, '═')}${COLORS.RESET}`);

    console.log(`\n  ${COLORS.CYAN}Enter paths to your draft/source files (one per line).${COLORS.RESET}`);
    console.log(`  ${COLORS.CYAN}Type 'done' when finished, 'skip' to use template content, 'hint' for examples.${COLORS.RESET}\n`);

    while (true) {
      const prompt = `${COLORS.CYAN}  Source file #${this.answers.sourceFiles ? this.answers.sourceFiles.length + 1 : 1} (or 'done'/'skip'): ${COLORS.RESET}`;
      const file = await this.ask(prompt, { required: false });

      if (file.toLowerCase() === 'done') {
        if (!this.answers.sourceFiles || this.answers.sourceFiles.length === 0) {
          console.log(`  ${COLORS.YELLOW}  ⚠ No source files specified. Will use template content as default.${COLORS.RESET}`);
        }
        break;
      }

      if (file.toLowerCase() === 'skip') {
        console.log(`  ${COLORS.DIM}  No source files specified. Will use template content as default.${COLORS.RESET}`);
        break;
      }

      if (file.trim().length === 0) {
        console.log(`  ${COLORS.RED}  File path cannot be empty. Enter a path, 'done', or 'skip'.${COLORS.RESET}`);
        continue;
      }

      if (!this.answers.sourceFiles) {
        this.answers.sourceFiles = [];
      }
      this.answers.sourceFiles.push(file.trim());
      console.log(`  ${COLORS.GREEN}  ✓ Added: ${file.trim()}${COLORS.RESET}`);
    }
  }

  showSummary() {
    console.log(`\n${COLORS.BOLD}${COLORS.CYAN}╔══════════════════════════════════════════════════════════════╗${COLORS.RESET}`);
    console.log(`${COLORS.BOLD}${COLORS.CYAN}║                    CONFIGURATION SUMMARY                     ║${COLORS.RESET}`);
    console.log(`${COLORS.BOLD}${COLORS.CYAN}╚══════════════════════════════════════════════════════════════╝${COLORS.RESET}\n`);

    const summary = [
      ['Paper Type', this.answers.paperType || 'Not set'],
      ['Citation Style', this.answers.citationStyle || 'Not set'],
      ['Title', this.answers.title || '(not set)'],
      ['Author', this.answers.author || 'Not set'],
      ['Institution', this.answers.institution || '(not set)'],
      ['Department', this.answers.department || '(not set)'],
      ['Course', this.answers.course || '(not set)'],
      ['Instructor', this.answers.instructor || '(not set)'],
      ['Date', this.answers.date || 'Not set'],
      ['Output Format', this.answers.outputFormat || 'markdown'],
      ['Generate TOC', this.answers.generateToc ? 'Yes ✓' : 'No'],
      ['Validate References', this.answers.validateReferences ? 'Yes ✓' : 'No'],
      ['Strict Mode', this.answers.strictMode ? 'Yes' : 'No'],
      ['Word Count Target', this.answers.wordCountTarget ? this.answers.wordCountTarget.toString() : 'Not set'],
      ['Plagiarism Check', this.answers.checkPlagiarism ? 'Yes' : 'No'],
      ['References Count', this.answers.references ? this.answers.references.length.toString() : '0'],
      ['Source Files', (this.answers.sourceFiles && this.answers.sourceFiles.length > 0) ? this.answers.sourceFiles.join(', ') : 'None (will use template)']
    ];

    summary.forEach(([key, val]) => {
      const keyPad = key.padEnd(28);
      console.log(`  ${COLORS.BOLD}${keyPad}${COLORS.RESET} ${COLORS.DIM}:${COLORS.RESET} ${val}`);
    });

    console.log('');
  }

  async saveConfig() {
    const confirm = await this.askChoice(
      'Save configuration to paper-config.yml?',
      [
        { label: 'yes', desc: 'Save and generate paper-config.yml file', value: true },
        { label: 'no', desc: 'Copy to clipboard instead (for manual pasting)', value: false }
      ],
      { default: 0 }
    );

    if (confirm) {
      const fs = require('fs');
      const yaml = require('js-yaml');

      const config = {
        paperType: this.answers.paperType,
        citationStyle: this.answers.citationStyle,
        outputFormat: this.answers.outputFormat,
        validateReferences: this.answers.validateReferences,
        generateToc: this.answers.generateToc,
        wordCountTarget: this.answers.wordCountTarget,
        strictMode: this.answers.strictMode,
        checkPlagiarism: this.answers.checkPlagiarism,
        sourceFiles: this.answers.sourceFiles || [],
        references: this.answers.references ? this.answers.references.map(r => ({ raw: r })) : [],
        metadata: {
          title: this.answers.title,
          author: this.answers.author,
          institution: this.answers.institution,
          department: this.answers.department,
          course: this.answers.course,
          instructor: this.answers.instructor,
          date: this.answers.date
        }
      };

      try {
        const yamlContent = yaml.dump(config, { lineWidth: -1 });
        fs.writeFileSync('paper-config.yml', yamlContent, 'utf-8');
        console.log(`\n  ${COLORS.GREEN}${COLORS.BOLD}✓ Configuration saved to paper-config.yml${COLORS.RESET}`);
        console.log(`  ${COLORS.DIM}  Run 'npx academic-paper-formatter' to format your paper!${COLORS.RESET}`);
      } catch (err) {
        console.log(`\n  ${COLORS.RED}Error saving config: ${err.message}${COLORS.RESET}`);
      }
    } else {
      const fs = require('fs');
      const yaml = require('js-yaml');
      const config = {
        paperType: this.answers.paperType,
        citationStyle: this.answers.citationStyle,
        outputFormat: this.answers.outputFormat,
        validateReferences: this.answers.validateReferences,
        generateToc: this.answers.generateToc,
        wordCountTarget: this.answers.wordCountTarget,
        strictMode: this.answers.strictMode,
        checkPlagiarism: this.answers.checkPlagiarism,
        sourceFiles: this.answers.sourceFiles || [],
        references: this.answers.references ? this.answers.references.map(r => ({ raw: r })) : [],
        metadata: {
          title: this.answers.title,
          author: this.answers.author,
          institution: this.answers.institution,
          department: this.answers.department,
          course: this.answers.course,
          instructor: this.answers.instructor,
          date: this.answers.date
        }
      };
      const yamlContent = yaml.dump(config, { lineWidth: -1 });
      try {
        fs.writeFileSync('/dev/clipboard', yamlContent);
        console.log(`\n  ${COLORS.GREEN}✓ Configuration copied to clipboard! Paste it into paper-config.yml${COLORS.RESET}`);
      } catch (e) {
        console.log(`\n  ${COLORS.YELLOW}Configuration YAML (copy and save manually):${COLORS.RESET}`);
        console.log(yamlContent);
      }
    }
  }

  close() {
    this.rl.close();
    console.log(`\n${COLORS.DIM}Happy writing! 📝${COLORS.RESET}\n`);
  }
}

module.exports = InteractivePrompter;