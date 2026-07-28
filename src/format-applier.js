const fs = require('fs');
const path = require('path');
const CitationEngine = require('./citation-engine');
const PaperAnalyzer = require('./paper-analyzer');

class FormatApplier {
  constructor(config) {
    this.config = config || {};
    this.paperTypeInfo = PaperAnalyzer.PAPER_TYPES;
    this.citationStyleInfo = CitationEngine.prototype.constructor.CITATION_STYLES;
    this.output = {};
    this.warnings = [];
  }

  apply(config, sourceContent) {
    this.config = config;
    this.sourceContent = sourceContent || '';
    this.paperType = this._getPaperType(config);
    this.citationStyle = this._getCitationStyle(config);

    if (!this.paperType) {
      this.warnings.push(`Unknown paper type: ${config.paperType}. Using "research-paper" as default.`);
      this.paperType = this.paperTypeInfo.RESEARCH_PAPER;
    }

    if (!this.citationStyle) {
      this.warnings.push(`Unknown citation style: ${config.citationStyle}. Using "APA" as default.`);
      this.citationStyle = CitationEngine.prototype.constructor.CITATION_STYLES ? null : null;
    }

    this.output = {
      paperType: this.paperType,
      citationStyle: this.citationStyle,
      formattedSections: {},
      generatedContent: '',
      warnings: this.warnings,
      metadata: {}
    };

    this._applyFormattingRules();
    this._applyCitationRules();
    this._applySectionStructure();
    this._applyTitlePageRules();

    return this.output;
  }

  _getPaperType(config) {
    const type = config.paperType || '';
    const key = type.toUpperCase().replace(/-/g, '_');
    return this.paperTypeInfo[key] || null;
  }

  _getCitationStyle(config) {
    const style = config.citationStyle || '';
    const normalized = style.toUpperCase().replace(/-/g, '_').replace(/\s+/g, '_');

    const citationStylesMap = {
      'APA': 'APA',
      'MLA': 'MLA',
      'CHICAGO_NB': 'CHICAGO_NB',
      'CHICAGO_AD': 'CHICAGO_AD',
      'CHICAGO': 'CHICAGO_NB',
      'IEEE': 'IEEE',
      'AMA': 'AMA',
      'ASA': 'ASA',
      'HARVARD': 'CHICAGO_AD',
      'TURABIAN': 'CHICAGO_NB'
    };

    if (citationStylesMap[normalized]) {
      return { name: normalized, info: this._getCitationStyleInfo(normalized) };
    }

    return null;
  }

  _getCitationStyleInfo(styleKey) {
    const styleMap = {
      'APA': { fullName: 'American Psychological Association (7th Edition)', inTextFormat: '(Author, Year)', refListTitle: 'References' },
      'MLA': { fullName: 'Modern Language Association (9th Edition)', inTextFormat: '(Author Page)', refListTitle: 'Works Cited' },
      'CHICAGO_NB': { fullName: 'Chicago Manual of Style - Notes and Bibliography (18th Ed.)', inTextFormat: 'Superscript number', refListTitle: 'Bibliography' },
      'CHICAGO_AD': { fullName: 'Chicago Manual of Style - Author-Date (18th Ed.)', inTextFormat: '(Author Year)', refListTitle: 'References' },
      'IEEE': { fullName: 'Institute of Electrical and Electronics Engineers', inTextFormat: '[Number]', refListTitle: 'References' },
      'AMA': { fullName: 'American Medical Association', inTextFormat: 'Superscript number', refListTitle: 'References' },
      'ASA': { fullName: 'American Sociological Association', inTextFormat: '(Author Year)', refListTitle: 'References' }
    };
    return styleMap[styleKey] || null;
  }

  _applyFormattingRules() {
    this.output.metadata = {
      fontSize: this._getDefaultFontSize(),
      lineSpacing: this._getDefaultLineSpacing(),
      margins: this._getDefaultMargins(),
      fontFamily: this._getDefaultFont(),
      headingStyle: this._getHeadingStyle()
    };
  }

  _getDefaultFontSize() {
    switch (this.config.citationStyle?.toUpperCase()) {
      case 'IEEE':
        return '10pt';
      case 'AMA':
        return '12pt';
      default:
        return '12pt';
    }
  }

  _getDefaultLineSpacing() {
    switch (this.config.citationStyle?.toUpperCase()) {
      case 'IEEE':
        return 'single';
      case 'AMA':
        return 'double';
      default:
        return 'double';
    }
  }

  _getDefaultMargins() {
    switch (this.config.citationStyle?.toUpperCase()) {
      case 'IEEE':
        return '1 inch (2.54 cm)';
      case 'AMA':
        return '1.25 inch (3.175 cm)';
      default:
        return '1 inch (2.54 cm)';
    }
  }

  _getDefaultFont() {
    switch (this.config.citationStyle?.toUpperCase()) {
      case 'IEEE':
        return 'Times New Roman';
      case 'AMA':
        return 'Arial 12pt';
      case 'CHICAGO_NB':
        return 'Times New Roman 12pt';
      case 'ASA':
        return '12pt Arial';
      default:
        return 'Times New Roman 12pt';
    }
  }

  _getHeadingStyle() {
    switch (this.config.citationStyle?.toUpperCase()) {
      case 'IEEE':
        return 'Roman numerals for primary, capital letters for secondary, Arabic numerals for tertiary, lowercase letters for quaternary';
      case 'APA':
        return 'Five levels of headings with specific formatting (Level 1: centered, bold, title case; Level 2: left-aligned, bold, title case; Level 3: left-aligned, bold italic, title case; Level 4: indented, bold italic, title case, ending with period; Level 5: indented, italic, title case, ending with period)';
      case 'ASA':
        return 'Three levels: Level 1 all caps left-justified; Level 2 italic left-justified title case; Level 3 italic indented title case with period';
      default:
        return 'Standard academic heading hierarchy with 3 levels recommended';
    }
  }

  _applyCitationRules() {
    const citationRules = {
      APA: {
        inTextExample: '(Smith, 2023, p. 45)',
        refListTitle: 'References',
        order: 'Alphabetical by author last name',
        multipleAuthors: 'Use & before last author; up to 20 authors in reference list',
        doiFormat: 'https://doi.org/xxxx',
        urlFormat: 'Retrieved from URL',
        etAl: 'Use et al. for 3+ authors in in-text citation',
        hangingIndent: 'Hanging indent of 0.5 inches for reference list entries'
      },
      MLA: {
        inTextExample: '(Smith 45)',
        refListTitle: 'Works Cited',
        order: 'Alphabetical by author last name',
        multipleAuthors: 'List up to 2 authors; use et al. for 3+',
        doiFormat: 'Include URL or DOI',
        urlFormat: 'Include at end of citation',
        etAl: 'Use et al. for 3+ authors in both in-text and works cited',
        hangingIndent: 'Hanging indent for works cited entries'
      },
      Chicago_NB: {
        inTextExample: 'Superscript number[^1]',
        refListTitle: 'Bibliography',
        order: 'Alphabetical by author last name',
        multipleAuthors: 'First author name inverted; subsequent names normal',
        doiFormat: 'Include DOI as URL',
        urlFormat: 'Include access date if no publication date available',
        etAl: 'Use "ibid." for repeated same-source same-page citations',
        hangingIndent: 'First line of each entry is flush left'
      },
      Chicago_AD: {
        inTextExample: '(Smith 2023, 45)',
        refListTitle: 'References',
        order: 'Alphabetical by author last name',
        multipleAuthors: 'First author name inverted; subsequent names normal',
        doiFormat: 'Include DOI',
        urlFormat: 'Include URL',
        etAl: 'Use et al. for 4+ authors in notes; 10+ in bibliography',
        hangingIndent: 'Flush left first line'
      },
      IEEE: {
        inTextExample: '[1] or [1, p. 45]',
        refListTitle: 'References',
        order: 'Numerical order of first citation',
        multipleAuthors: 'List up to 6 authors; use "et al." for 7+',
        doiFormat: 'doi: xxxx',
        urlFormat: 'Available: URL',
        etAl: 'Use "et al." after first 3 authors for 6+ references',
        hangingIndent: 'Flush left reference number'
      },
      AMA: {
        inTextExample: '^1^',
        refListTitle: 'References',
        order: 'Numerical order of first citation',
        multipleAuthors: 'List up to 6 authors; use "et al." for 7+',
        doiFormat: 'doi: xxxx',
        urlFormat: 'Include access date for online sources',
        etAl: 'Use et al. for more than 6 authors',
        hangingIndent: 'Numbered flush left'
      },
      ASA: {
        inTextExample: '(Smith 2023)',
        refListTitle: 'References',
        order: 'Alphabetical by author last name',
        multipleAuthors: 'List all authors; use & before last author',
        doiFormat: 'Include DOI',
        urlFormat: 'Include URL',
        etAl: 'No et al. in reference list; list all authors',
        hangingIndent: 'Hanging indent for references'
      }
    };

    const styleKey = this.config.citationStyle?.toUpperCase();
    this.output.citationRules = citationRules[styleKey] || citationRules['APA'];
  }

  _applySectionStructure() {
    if (!this.paperType) return;

    const sections = this.paperType.sections || [];
    this.output.formattedSections = {};

    sections.forEach((section, index) => {
      this.output.formattedSections[section] = {
        headingLevel: this._getSectionHeadingLevel(section),
        content: '',
        required: true
      };
    });
  }

  _getSectionHeadingLevel(section) {
    const sectionLower = section.toLowerCase();
    if (sectionLower.includes('introduction')) return 1;
    if (sectionLower.includes('literature review')) return 1;
    if (sectionLower.includes('method')) return 1;
    if (sectionLower.includes('methodology')) return 1;
    if (sectionLower.includes('results')) return 1;
    if (sectionLower.includes('discussion')) return 1;
    if (sectionLower.includes('conclusion')) return 1;
    if (sectionLower.includes('abstract')) return 0;
    if (sectionLower.includes('references')) return 0;
    if (sectionLower.includes('appendix')) return 0;
    return 2;
  }

  _applyTitlePageRules() {
    const titlePageConfig = {
      required: ['thesis', 'dissertation', 'research-paper', 'term-paper', 'literature-review', 'experimental-report'],
      elements: ['Title', 'Author', 'Institution', 'Course', 'Instructor', 'Date', 'Running head'],
      formatting: {}
    };

    const style = this.config.citationStyle?.toUpperCase();
    switch (style) {
      case 'APA':
        titlePageConfig.formatting = {
          title: 'Centered, bold, 12pt font, no more than 12 words',
          author: 'Name without titles, degrees',
          institution: 'Institution name',
          header: 'Running head: SHORT TITLE (all caps, max 50 chars)',
          pageNumber: 'Top right on title page'
        };
        break;
      case 'IEEE':
        titlePageConfig.formatting = {
          title: 'Centered, 24pt type',
          author: 'Centered, 10pt type, separate lines',
          affiliation: 'City & country on separate line',
          email: 'E-mail address on separate line',
          abstract: 'Required on page after title',
          keywords: '3-5 keywords'
        };
        break;
      case 'ASA':
        titlePageConfig.formatting = {
          title: 'Centered on first page',
          author: 'Below title',
          institution: 'Below author',
          wordCount: 'Required on title page footnote',
          runningHead: 'Shortened title (60 chars max)'
        };
        break;
      default:
        titlePageConfig.formatting = {
          title: 'Centered, bold',
          author: 'Centered',
          date: 'Centered',
          institution: 'Centered if applicable'
        };
    }

    this.output.titlePageConfig = titlePageConfig;
  }

  getTemplate(templateName) {
    const templatePath = path.join(__dirname, '..', 'templates', `${templateName}.md`);
    if (fs.existsSync(templatePath)) {
      return fs.readFileSync(templatePath, 'utf-8');
    }
    return null;
  }

  getAllTemplates() {
    const templatesDir = path.join(__dirname, '..', 'templates');
    if (!fs.existsSync(templatesDir)) return [];
    return fs.readdirSync(templatesDir).filter(f => f.endsWith('.md'));
  }
}

module.exports = FormatApplier;