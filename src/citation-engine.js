const fs = require('fs');
const path = require('path');

class CitationEngine {
  constructor(style, config) {
    this.style = style;
    this.config = config;
    this.references = [];
    this.citationCounter = 0;
    this.errors = [];
    this.warnings = [];
  }

  parseReference(rawRef) {
    const ref = { raw: rawRef, parsed: false, errors: [] };

    if (!rawRef || rawRef.trim().length === 0) {
      ref.errors.push('Empty reference');
      return ref;
    }

    const trimmed = rawRef.trim();
    ref.parsed = true;

    const style = this.style;

    switch (style) {
      case 'APA':
        this._parseAPA(ref, trimmed);
        break;
      case 'MLA':
        this._parseMLA(ref, trimmed);
        break;
      case 'Chicago-NB':
        this._parseChicagoNB(ref, trimmed);
        break;
      case 'Chicago-AD':
        this._parseChicagoAD(ref, trimmed);
        break;
      case 'IEEE':
        this._parseIEEE(ref, trimmed);
        break;
      case 'AMA':
        this._parseAMA(ref, trimmed);
        break;
      case 'ASA':
        this._parseASA(ref, trimmed);
        break;
      default:
        this._parseGeneric(ref, trimmed);
    }

    ref.id = this._generateRefId(ref);
    return ref;
  }

  _parseAPA(ref, text) {
    const authorDateMatch = text.match(/^(.+?)\s*\((\d{4}[a-z]?)\)\./);
    if (authorDateMatch) {
      ref.authors = authorDateMatch[1].split(/;\s*/).map(a => a.trim());
      ref.year = authorDateMatch[2];
      ref.rest = text.substring(authorDateMatch.index + authorDateMatch[0].length).trim();
    }

    if (ref.rest && !ref.title) {
      const titleMatch = ref.rest.match(/^(?:Title of )?(.+?)\./);
      if (titleMatch) {
        ref.title = titleMatch[1];
        ref.rest = ref.rest.substring(titleMatch.index + titleMatch[0].length).trim();
      }
    }

    ref.sourceType = this._detectSourceTypeAPA(ref);
  }

  _parseMLA(ref, text) {
    const authorMatch = text.match(/^(.+?)\.\s*/);
    if (authorMatch) {
      ref.authors = [authorMatch[1].trim()];
      ref.rest = text.substring(authorMatch.index + authorMatch[0].length).trim();
    }

    const titleMatch = ref.rest.match(/^[""](.+?)[""]\s/);
    if (titleMatch) {
      ref.title = titleMatch[1];
      ref.rest = ref.rest.substring(titleMatch.index + titleMatch[0].length).trim();
    } else {
      const titleItalicMatch = ref.rest.match(/^(?:Title of )?(.+?),\s*/);
      if (titleItalicMatch) {
        ref.title = titleItalicMatch[1];
        ref.rest = ref.rest.substring(titleItalicMatch.index + titleItalicMatch[0].length).trim();
      }
    }

    ref.sourceType = this._detectSourceTypeMLA(ref);
  }

  _parseChicagoNB(ref, text) {
    const authorMatch = text.match(/^(.+?),\s*/);
    if (authorMatch) {
      ref.authors = [authorMatch[1].trim()];
      ref.rest = text.substring(authorMatch.index + authorMatch[0].length).trim();
    }

    const titleMatch = ref.rest.match(/^[""](.+?)[""][,]\s*/);
    if (titleMatch) {
      ref.title = titleMatch[1];
      ref.rest = ref.rest.substring(titleMatch.index + titleMatch[0].length).trim();
    }

    ref.sourceType = this._detectSourceTypeChicago(ref);
  }

  _parseChicagoAD(ref, text) {
    const authorMatch = text.match(/^(.+?)\.\s*/);
    if (authorMatch) {
      ref.authors = [authorMatch[1].trim()];
      ref.rest = text.substring(authorMatch.index + authorMatch[0].length).trim();
    }

    const yearMatch = ref.rest.match(/^(\d{4})\.\s*/);
    if (yearMatch) {
      ref.year = yearMatch[1];
      ref.rest = ref.rest.substring(yearMatch.index + yearMatch[0].length).trim();
    }

    ref.sourceType = this._detectSourceTypeChicago(ref);
  }

  _parseIEEE(ref, text) {
    const bracketMatch = text.match(/^\[#?\]\s*/);
    if (bracketMatch) {
      ref.rest = text.substring(bracketMatch.index + bracketMatch[0].length).trim();
    }

    const authorMatch = ref.rest.match(/^(.+?),\s*/);
    if (authorMatch) {
      ref.authors = authorMatch[1].split(/;\s*/).map(a => a.trim());
      ref.rest = ref.rest.substring(authorMatch.index + authorMatch[0].length).trim();
    }

    const titleMatch = ref.rest.match(/^[""](.+?)[""],?\s*/);
    if (titleMatch) {
      ref.title = titleMatch[1];
      ref.rest = ref.rest.substring(titleMatch.index + titleMatch[0].length).trim();
    }

    ref.sourceType = this._detectSourceTypeIEEE(ref);
  }

  _parseAMA(ref, text) {
    const authorMatch = text.match(/^(.+?)\.\s*/);
    if (authorMatch) {
      ref.authors = this._parseAMAuthors(authorMatch[1]);
      ref.rest = text.substring(authorMatch.index + authorMatch[0].length).trim();
    }

    const titleMatch = ref.rest.match(/^(.+?)\.\s*/);
    if (titleMatch) {
      ref.title = titleMatch[1];
      ref.rest = ref.rest.substring(titleMatch.index + titleMatch[0].length).trim();
    }

    ref.sourceType = this._detectSourceTypeAMA(ref);
  }

  _parseASA(ref, text) {
    const authorMatch = text.match(/^(.+?)\.\s*/);
    if (authorMatch) {
      ref.authors = [authorMatch[1].trim()];
      ref.rest = text.substring(authorMatch.index + authorMatch[0].length).trim();
    }

    const yearMatch = ref.rest.match(/^(\d{4})\.\s*/);
    if (yearMatch) {
      ref.year = yearMatch[1];
      ref.rest = ref.rest.substring(yearMatch.index + yearMatch[0].length).trim();
    }

    ref.sourceType = this._detectSourceTypeChicago(ref);
  }

  _parseGeneric(ref, text) {
    ref.authors = ['Unknown'];
    ref.title = text.substring(0, 100);
    ref.sourceType = 'unknown';
  }

  _parseAMAuthors(authorStr) {
    const authors = [];
    const parts = authorStr.split(/,\s*(?=[A-Z])/);
    if (parts.length === 1 && authorStr.includes(',')) {
      parts = authorStr.split(/;\s*/);
    }
    return parts.map(a => a.trim()).filter(a => a.length > 0);
  }

  _detectSourceTypeAPA(ref) {
    if (!ref.rest) return 'unknown';
    const lower = ref.rest.toLowerCase();
    if (lower.includes('http') || lower.includes('www.') || lower.includes('https')) return 'website';
    if (lower.includes('vol.') || lower.includes('vol')) return 'journal-article';
    if (lower.includes('retrieved')) return 'online-source';
    return 'book';
  }

  _detectSourceTypeMLA(ref) {
    if (!ref.rest) return 'unknown';
    const lower = ref.rest.toLowerCase();
    if (lower.includes('www.') || lower.includes('http')) return 'website';
    if (lower.includes('vol.') || lower.includes('no.')) return 'journal-article';
    return 'book';
  }

  _detectSourceTypeChicago(ref) {
    if (!ref.rest) return 'unknown';
    const lower = ref.rest.toLowerCase();
    if (lower.includes('url') || lower.includes('http')) return 'website';
    if (lower.includes('publisher')) return 'book';
    return 'periodical';
  }

  _detectSourceTypeIEEE(ref) {
    if (!ref.rest) return 'unknown';
    const lower = ref.rest.toLowerCase();
    if (lower.includes('doi')) return 'journal-article';
    if (lower.includes('conference') || lower.includes('proc.')) return 'conference-paper';
    if (lower.includes('univ.')) return 'thesis';
    return 'book';
  }

  _detectSourceTypeAMA(ref) {
    if (!ref.rest) return 'unknown';
    const lower = ref.rest.toLowerCase();
    if (lower.includes('doi')) return 'journal-article';
    return 'book';
  }

  _generateRefId(ref) {
    if (ref.id) return ref.id;
    this.citationCounter++;
    return this.citationCounter;
  }

  formatInText(author, year, page) {
    switch (this.style) {
      case 'APA':
        return page ? `(${author}${year}, p. ${page})` : `(${author}${year})`;
      case 'MLA':
        return page ? `(${author} ${page})` : `(${author})`;
      case 'Chicago-NB':
        return `[^${this.citationCounter}]`;
      case 'Chicago-AD':
        return `(${author} ${year})`;
      case 'IEEE':
        return `[${this.citationCounter}]`;
      case 'AMA':
        return `^${this.citationCounter}^`;
      case 'ASA':
        return `(${author}${year})`;
      default:
        return `(${author}${year || ''})`;
    }
  }

  formatFullReference(ref) {
    switch (this.style) {
      case 'APA':
        return this._formatAPAFull(ref);
      case 'MLA':
        return this._formatMLAFull(ref);
      case 'Chicago-NB':
        return this._formatChicagoNBFull(ref);
      case 'Chicago-AD':
        return this._formatChicagoADFull(ref);
      case 'IEEE':
        return this._formatIEEEFull(ref);
      case 'AMA':
        return this._formatAMAFull(ref);
      case 'ASA':
        return this._formatASAFull(ref);
      default:
        return ref.raw || 'Unknown reference';
    }
  }

  _formatAPAFull(ref) {
    const authorStr = ref.authors ? ref.authors.join(', ') : '';
    const yearStr = ref.year ? ` (${ref.year}).` : '.';
    const titleStr = ref.title ? ` ${ref.title}.` : '';
    const restStr = ref.rest ? ` ${ref.rest}` : '';
    return `${authorStr}${yearStr}${titleStr}${restStr}`;
  }

  _formatMLAFull(ref) {
    const authorStr = ref.authors ? ref.authors.join(', ') : '';
    const titleStr = ref.title ? ` "${ref.title}."` : '';
    const restStr = ref.rest ? ` ${ref.rest}` : '';
    return `${authorStr}${titleStr}${restStr}`;
  }

  _formatChicagoNBFull(ref) {
    const authorStr = ref.authors ? ref.authors.join(', ') : '';
    const titleStr = ref.title ? ` "${ref.title}."` : '';
    const restStr = ref.rest ? ` ${ref.rest}` : '';
    return `${authorStr}${titleStr}${restStr}`;
  }

  _formatChicagoADFull(ref) {
    const authorStr = ref.authors ? ref.authors.join(', ') : '';
    const yearStr = ref.year ? ` ${ref.year}.` : '.';
    const titleStr = ref.title ? ` ${ref.title}.` : '';
    const restStr = ref.rest ? ` ${ref.rest}` : '';
    return `${authorStr}${yearStr}${titleStr}${restStr}`;
  }

  _formatIEEEFull(ref) {
    const authorStr = ref.authors ? ref.authors.join(', ') : '';
    const titleStr = ref.title ? `, "${ref.title},"` : '';
    const restStr = ref.rest ? ` ${ref.rest}` : '';
    return `[${this.citationCounter}] ${authorStr}${titleStr}${restStr}`;
  }

  _formatAMAFull(ref) {
    const authorStr = ref.authors ? ref.authors.join(', ') : '';
    const titleStr = ref.title ? ` ${ref.title}.` : '';
    const restStr = ref.rest ? ` ${ref.rest}` : '';
    return `${authorStr}${titleStr}${restStr}`;
  }

  _formatASAFull(ref) {
    const authorStr = ref.authors ? ref.authors.join(', ') : '';
    const yearStr = ref.year ? ` (${ref.year}).` : '';
    const titleStr = ref.title ? ` ${ref.title}.` : '';
    const restStr = ref.rest ? ` ${ref.rest}` : '';
    return `${authorStr}${yearStr}${titleStr}${restStr}`;
  }

  validateReference(ref) {
    const issues = [];

    if (!ref.title || ref.title.trim().length === 0) {
      issues.push('Missing title');
    }

    if (this.style === 'APA' && !ref.year) {
      issues.push('APA style requires publication year');
    }

    if (this.style === 'MLA' && ref.authors && ref.authors.length === 0) {
      issues.push('MLA style requires at least one author');
    }

    if (this.style === 'IEEE' && !ref.title) {
      issues.push('IEEE style requires a title');
    }

    if (!ref.authors || ref.authors.length === 0) {
      this.warnings.push('Reference has no author(s) identified');
    }

    return issues;
  }

  generateReferenceList() {
    const sortedRefs = [...this.references];

    if (this.style === 'IEEE' || this.style === 'AMA') {
      sortedRefs.sort((a, b) => (a.id || 0) - (b.id || 0));
    } else {
      sortedRefs.sort((a, b) => {
        const nameA = (a.authors && a.authors[0]) ? a.authors[0].split(' ').pop().toLowerCase() : '';
        const nameB = (b.authors && b.authors[0]) ? b.authors[0].split(' ').pop().toLowerCase() : '';
        return nameA.localeCompare(nameB);
      });
    }

    return sortedRefs.map(ref => this.formatFullReference(ref)).join('\n\n');
  }
}

module.exports = CitationEngine;