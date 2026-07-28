const fs = require('fs');
const path = require('path');

class ReferenceValidator {
  constructor(config) {
    this.config = config || {};
    this.citationStyle = config.citationStyle || 'APA';
    this.strictMode = config.strictMode || false;
    this.errors = [];
    this.warnings = [];
  }

  validateReferences(references) {
    this.errors = [];
    this.warnings = [];

    if (!Array.isArray(references) && typeof references !== 'object') {
      this.errors.push('References must be an array or object');
      return { valid: false, errors: this.errors, warnings: this.warnings };
    }

    const refArray = Array.isArray(references) ? references : Object.values(references);

    if (refArray.length === 0) {
      this.warnings.push('No references found in the document');
    }

    refArray.forEach((ref, index) => {
      this._validateCitation(ref, index);
      this._validateCompleteness(ref, index);
      this._validateStyleCompliance(ref, index);
      this._checkDuplicateReferences(ref, index, refArray);
      this._checkOrphanInTextCitations(ref, index, refArray);
    });

    this._validateReferenceOrder(refArray);
    this._checkCitationConsistency(refArray);

    return {
      valid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
      totalReferences: refArray.length,
      errorCount: this.errors.length,
      warningCount: this.warnings.length
    };
  }

  _validateCitation(ref, index) {
    if (!ref || typeof ref !== 'object') {
      this.errors.push(`Reference at index ${index}: Not a valid reference object`);
      return;
    }

    if (!ref.raw && !ref.formatted) {
      this.warnings.push(`Reference at index ${index}: Missing raw and formatted citation text`);
    }

    if (ref.raw && ref.raw.trim().length === 0) {
      this.errors.push(`Reference at index ${index}: Empty citation text`);
    }
  }

  _validateCompleteness(ref, index) {
    const style = this.citationStyle;

    switch (style) {
      case 'APA':
        this._validateAPAFields(ref, index);
        break;
      case 'MLA':
        this._validateMLAFields(ref, index);
        break;
      case 'Chicago-NB':
        this._validateChicagoNBFields(ref, index);
        break;
      case 'Chicago-AD':
        this._validateChicagoADFields(ref, index);
        break;
      case 'IEEE':
        this._validateIEEEFields(ref, index);
        break;
      case 'AMA':
        this._validateAMAFields(ref, index);
        break;
      case 'ASA':
        this._validateASAFields(ref, index);
        break;
    }
  }

  _validateAPAFields(ref, index) {
    if (!ref.authors || ref.authors.length === 0) {
      this.warnings.push(`APA Ref #${index}: Missing or empty author field`);
    }
    if (!ref.year) {
      this.errors.push(`APA Ref #${index}: Missing publication year (required by APA)`);
    }
    if (!ref.title || ref.title.trim().length === 0) {
      this.errors.push(`APA Ref #${index}: Missing title (required by APA)`);
    }
    if (ref.title && ref.title.length > 500) {
      this.warnings.push(`APA Ref #${index}: Title exceeds recommended length`);
    }
    if (!ref.publisher && ref.sourceType === 'book') {
      this.warnings.push(`APA Ref #${index}: Book reference missing publisher`);
    }
    if (ref.sourceType === 'journal' && !ref.volume) {
      this.warnings.push(`APA Ref #${index}: Journal reference missing volume number`);
    }
    if (ref.sourceType === 'journal' && !ref.doi && !ref.url) {
      this.warnings.push(`APA Ref #${index}: Journal article should include DOI or URL`);
    }
  }

  _validateMLAFields(ref, index) {
    if (!ref.title || ref.title.trim().length === 0) {
      this.errors.push(`MLA Ref #${index}: Missing title`);
    }
    if (!ref.publisher && ref.sourceType === 'book') {
      this.warnings.push(`MLA Ref #${index}: Book reference missing publisher`);
    }
    if (!ref.publicationDate && !ref.year) {
      this.warnings.push(`MLA Ref #${index}: Missing publication date`);
    }
  }

  _validateChicagoNBFields(ref, index) {
    if (!ref.authors || ref.authors.length === 0) {
      this.warnings.push(`Chicago NB Ref #${index}: Missing author`);
    }
    if (!ref.title || ref.title.trim().length === 0) {
      this.errors.push(`Chicago NB Ref #${index}: Missing title`);
    }
  }

  _validateChicagoADFields(ref, index) {
    this._validateAPAFields(ref, index);
  }

  _validateIEEEFields(ref, index) {
    if (!ref.title || ref.title.trim().length === 0) {
      this.errors.push(`IEEE Ref #${index}: Missing title`);
    }
    if (!ref.publisher && ref.sourceType === 'book') {
      this.warnings.push(`IEEE Ref #${index}: Book reference missing publisher`);
    }
    if (ref.sourceType === 'journal' && !ref.doi && !ref.url) {
      this.warnings.push(`IEEE Ref #${index}: Journal article should include DOI or URL`);
    }
    if (ref.sourceType === 'thesis' && !ref.university) {
      this.warnings.push(`IEEE Ref #${index}: Thesis reference missing university`);
    }
  }

  _validateAMAFields(ref, index) {
    if (!ref.title || ref.title.trim().length === 0) {
      this.errors.push(`AMA Ref #${index}: Missing title`);
    }
    if (ref.sourceType === 'journal' && !ref.journal) {
      this.warnings.push(`AMA Ref #${index}: Journal reference missing abbreviated journal name`);
    }
    if (ref.sourceType === 'journal' && !ref.doi) {
      this.warnings.push(`AMA Ref #${index}: Journal article should include DOI`);
    }
  }

  _validateASAFields(ref, index) {
    this._validateAPAFields(ref, index);
  }

  _validateStyleCompliance(ref, index) {
    const style = this.citationStyle;

    if (style === 'IEEE') {
      if (ref.formatted && !ref.formatted.match(/^\[\d+\]/)) {
        this.warnings.push(`IEEE Ref #${index}: IEEE in-text citations should use bracketed numbers`);
      }
      if (ref.referenceListTitle && ref.referenceListTitle !== 'References') {
        this.warnings.push(`IEEE Ref #${index}: Reference list title should be "References"`);
      }
    }

    if (style === 'MLA') {
      if (ref.referenceListTitle && ref.referenceListTitle !== 'Works Cited') {
        this.warnings.push(`MLA Ref #${index}: Reference list title should be "Works Cited"`);
      }
    }

    if (style === 'APA') {
      if (ref.referenceListTitle && ref.referenceListTitle !== 'References') {
        this.warnings.push(`APA Ref #${index}: Reference list title should be "References"`);
      }
    }
  }

  _checkDuplicateReferences(ref, index, refArray) {
    for (let i = 0; i < index; i++) {
      if (refArray[i] && ref.raw && refArray[i].raw &&
          ref.raw.trim().toLowerCase() === refArray[i].raw.trim().toLowerCase()) {
        this.warnings.push(`Duplicate reference detected: Ref #${index} appears similar to Ref #${i}`);
        return;
      }
    }
  }

  _checkOrphanInTextCitations(ref, index, refArray) {
    if (ref.inTextCitationUsed && !ref.inTextCitationUsed) {
      this.warnings.push(`Ref #${index}: Cited in text but may be missing from reference list`);
    }
  }

  _validateReferenceOrder(refArray) {
    const style = this.citationStyle;

    if (style === 'IEEE' || style === 'AMA') {
      for (let i = 1; i < refArray.length; i++) {
        const prevId = this._getRefId(refArray[i - 1], i - 1);
        const currId = this._getRefId(refArray[i], i);
        if (currId < prevId) {
          this.warnings.push(`Reference ordering may not follow IEEE/AMA numbering sequence at index ${i}`);
        }
      }
    } else {
      this._checkAlphabeticalOrder(refArray);
    }
  }

  _checkAlphabeticalOrder(refArray) {
    for (let i = 1; i < refArray.length; i++) {
      const prevAuthor = this._getPrimaryAuthor(refArray[i - 1]);
      const currAuthor = this._getPrimaryAuthor(refArray[i]);

      if (prevAuthor && currAuthor && prevAuthor.toLowerCase() > currAuthor.toLowerCase()) {
        this.warnings.push(`References not in alphabetical order at index ${i}: "${currAuthor}" should come before "${prevAuthor}"`);
      }
    }
  }

  _checkCitationConsistency(refArray) {
    const citedInText = new Set();
    refArray.forEach(ref => {
      if (ref.citedInText) citedInText.add(ref.id || ref.index);
    });

    refArray.forEach(ref => {
      if (!ref.citedInText && !ref.optional) {
        this.warnings.push(`Ref #${ref.index || ref.id}: Listed in references but not cited in text (orphan reference)`);
      }
    });
  }

  _getRefId(ref, fallbackIndex) {
    return ref.id || ref.number || (fallbackIndex + 1);
  }

  _getPrimaryAuthor(ref) {
    if (!ref.authors || ref.authors.length === 0) return '';
    const firstAuthor = ref.authors[0];
    const lastName = firstAuthor.split(' ').pop();
    return lastName;
  }

  validateDOIs(references) {
    const doiIssues = [];

    references.forEach((ref) => {
      if (ref.doi) {
        const doiPattern = /^10\.\d{4,9}\/[-._;()/:A-Z0-9]+$/i;
        if (!doiPattern.test(ref.doi)) {
          doiIssues.push({
            reference: ref.title || ref.raw,
            doi: ref.doi,
            issue: 'DOI format does not match expected pattern (10.xxxx/...)'
          });
        }
      }

      if (ref.url && !ref.url.startsWith('http')) {
        doiIssues.push({
          reference: ref.title || ref.raw,
          url: ref.url,
          issue: 'URL does not start with http:// or https://'
        });
      }
    });

    return {
      valid: doiIssues.length === 0,
      issues: doiIssues
    };
  }
}

module.exports = ReferenceValidator;