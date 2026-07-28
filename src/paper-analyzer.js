
module.exports = {
  PAPER_TYPES: {
    THESIS: {
      id: 'thesis',
      name: 'Thesis',
      description: "A substantial research paper submitted for a university degree, typically at the master's level.",
      sections: [
        'Title Page',
        'Abstract',
        'Table of Contents',
        'List of Figures',
        'List of Tables',
        'List of Abbreviations',
        'Chapter 1: Introduction',
        'Chapter 2: Literature Review',
        'Chapter 3: Methodology',
        'Chapter 4: Results',
        'Chapter 5: Discussion',
        'Chapter 6: Conclusion',
        'References',
        'Appendices'
      ],
      minWords: 15000,
      maxWords: 50000,
      citationStyles: ['APA', 'MLA', 'Chicago', 'IEEE', 'AMA', 'ASA'],
      requiresApproval: true,
      typicalAudience: 'Academic committee / dissertation panel',
      formattingNote: 'Must follow institutional template and university guidelines'
    },
    DISSERTATION: {
      id: 'dissertation',
      name: 'Dissertation',
      description: 'A doctoral-level research document contributing original knowledge to a field.',
      sections: [
        'Title Page',
        'Abstract',
        'Table of Contents',
        'List of Figures',
        'List of Tables',
        'List of Symbols',
        'Chapter 1: Introduction',
        'Chapter 2: Literature Review',
        'Chapter 3: Methodology',
        'Chapter 4: Results',
        'Chapter 5: Discussion',
        'Chapter 6: Conclusion',
        'References',
        'Appendices'
      ],
      minWords: 30000,
      maxWords: 100000,
      citationStyles: ['APA', 'MLA', 'Chicago', 'IEEE', 'AMA', 'ASA'],
      requiresApproval: true,
      typicalAudience: 'Doctoral committee / examination board',
      formattingNote: 'Must follow institutional template; often requires specific margin, font, and spacing rules'
    },
    RESEARCH_PAPER: {
      id: 'research-paper',
      name: 'Research Paper',
      description: 'An original academic paper presenting research findings, typically published in a journal or for a course.',
      sections: [
        'Title',
        'Abstract',
        'Introduction',
        'Literature Review',
        'Methodology',
        'Results',
        'Discussion',
        'Conclusion',
        'References'
      ],
      minWords: 3000,
      maxWords: 15000,
      citationStyles: ['APA', 'MLA', 'Chicago', 'IEEE', 'AMA', 'ASA'],
      requiresApproval: false,
      typicalAudience: 'Academic peers / journal readers',
      formattingNote: 'Follow journal or course-specific guidelines'
    },
    TERM_PAPER: {
      id: 'term-paper',
      name: 'Term Paper',
      description: 'A research paper written by a student over an academic term, often accounting for a large portion of a grade.',
      sections: [
        'Title Page',
        'Abstract (optional)',
        'Introduction',
        'Body Sections',
        'Conclusion',
        'References'
      ],
      minWords: 2000,
      maxWords: 10000,
      citationStyles: ['APA', 'MLA', 'Chicago', 'Harvard'],
      requiresApproval: false,
      typicalAudience: 'Instructor / course grader',
      formattingNote: 'Typically follows course syllabus guidelines; MLA is common in humanities, APA in social sciences'
    },
    LITERATURE_REVIEW: {
      id: 'literature-review',
      name: 'Literature Review',
      description: 'A critical summary and synthesis of existing scholarly literature on a specific topic.',
      sections: [
        'Title Page',
        'Introduction',
        'Body (organized thematically or chronologically)',
        'Conclusion',
        'References'
      ],
      minWords: 2000,
      maxWords: 8000,
      citationStyles: ['APA', 'MLA', 'Chicago', 'Harvard'],
      requiresApproval: false,
      typicalAudience: 'Academic / instructor',
      formattingNote: 'Focuses on synthesis of sources, not original research; APA literature reviews have no explicit methodology section'
    },
    EXPERIMENTAL_REPORT: {
      id: 'experimental-report',
      name: 'Experimental Report',
      description: 'A paper reporting the design, execution, and results of an experiment, following the scientific method.',
      sections: [
        'Title Page',
        'Abstract',
        'Introduction',
        'Method',
        'Results',
        'Discussion',
        'References',
        'Appendices (if necessary)',
        'Tables and/or Figures (if necessary)'
      ],
      minWords: 2500,
      maxWords: 8000,
      citationStyles: ['APA', 'IEEE'],
      requiresApproval: false,
      typicalAudience: 'Academic peers / journal readers',
      formattingNote: 'APA format is standard in psychology and social sciences; IEEE format is standard in engineering and computer science'
    },
    ARGUMENTATIVE: {
      id: 'argumentative',
      name: 'Argumentative Paper',
      description: 'A paper that takes a stance on a debatable issue and supports it with evidence and reasoning.',
      sections: [
        'Introduction with thesis statement',
        'Body paragraphs (claim, evidence, counterargument, rebuttal)',
        'Conclusion'
      ],
      minWords: 1500,
      maxWords: 5000,
      citationStyles: ['APA', 'MLA', 'Chicago'],
      requiresApproval: false,
      typicalAudience: 'Instructor / academic audience',
      formattingNote: 'Must include a clear thesis statement and address counterarguments'
    },
    EXPLORATORY: {
      id: 'exploratory',
      name: 'Exploratory Paper / Essay',
      description: 'A paper that investigates a topic without a predetermined conclusion, exploring multiple perspectives.',
      sections: [
        'Introduction',
        'Body (exploring multiple viewpoints)',
        'Conclusion (reflecting on the exploration)'
      ],
      minWords: 1000,
      maxWords: 4000,
      citationStyles: ['APA', 'MLA', 'Chicago'],
      requiresApproval: false,
      typicalAudience: 'Instructor / academic audience',
      formattingNote: 'May not require a traditional thesis statement; focuses on inquiry process'
    },
    ANNOTATED_BIBLIOGRAPHY: {
      id: 'annotated-bibliography',
      name: 'Annotated Bibliography',
      description: 'A list of citations to books, articles, and documents with a brief descriptive and evaluative paragraph following each citation.',
      sections: [
        'Title',
        'Annotated entries (citation + annotation)'
      ],
      minWords: 500,
      maxWords: 3000,
      citationStyles: ['APA', 'MLA', 'Chicago (Turabian)'],
      requiresApproval: false,
      typicalAudience: 'Instructor / researcher',
      formattingNote: 'Each citation is followed by a 100-200 word annotation summarizing and evaluating the source'
    },
    BOOK_REVIEW: {
      id: 'book-review',
      name: 'Book Review',
      description: 'A critical evaluation and summary of a book, providing analysis of its strengths, weaknesses, and significance.',
      sections: [
        'Citation of the book',
        'Introduction',
        'Summary of content',
        'Critical evaluation',
        'Conclusion'
      ],
      minWords: 500,
      maxWords: 2000,
      citationStyles: ['APA', 'MLA', 'Chicago', 'Harvard'],
      requiresApproval: false,
      typicalAudience: 'Academic / journal readers',
      formattingNote: 'Must go beyond summary to provide critical analysis'
    },
    RESEARCH_POSTER: {
      id: 'research-poster',
      name: 'Research Poster',
      description: 'A visual presentation of research findings, typically displayed at academic conferences.',
      sections: [
        'Title',
        'Author and affiliation',
        'Introduction',
        'Methods',
        'Results',
        'Conclusions',
        'References',
        'Acknowledgments'
      ],
      minWords: 300,
      maxWords: 1000,
      citationStyles: ['APA', 'MLA', 'Chicago'],
      requiresApproval: false,
      typicalAudience: 'Conference attendees',
      formattingNote: 'Visually focused; uses columns, graphics, and concise text; typically in portrait orientation on large format paper'
    },
    ESSAY: {
      id: 'essay',
      name: 'Essay',
      description: 'A short piece of writing on a particular subject, often for academic assessment.',
      sections: [
        'Title',
        'Introduction (with thesis)',
        'Body paragraphs',
        'Conclusion'
      ],
      minWords: 500,
      maxWords: 3000,
      citationStyles: ['APA', 'MLA', 'Chicago'],
      requiresApproval: false,
      typicalAudience: 'Instructor',
      formattingNote: 'Flexible format; MLA common for humanities, APA for social sciences'
    }
  },

  CITATION_STYLES: {
    APA: {
      fullName: 'American Psychological Association (7th Edition)',
      fields: ['Author', 'Date', 'Title of work', 'Source', 'DOI/URL'],
      inTextFormat: '(Author, Year)',
      referenceListTitle: 'References',
      referenceListOrder: 'alphabetical',
      italicsFor: ['Book titles', 'Journal titles', 'Report titles'],
      quotationMarksFor: ['Article titles', 'Chapter titles', 'Webpage titles', 'Paper titles'],
      paperTypes: ['research-paper', 'literature-review', 'experimental-report', 'thesis', 'dissertation'],
      paperTypes: ['research-paper', 'literature-review', 'experimental-report', 'thesis', 'dissertation']
    },
    MLA: {
      fullName: 'Modern Language Association (9th Edition)',
      fields: ['Author', 'Title of source', 'Title of container', 'Other contributors', 'Version', 'Number', 'Publisher', 'Publication date', 'Location'],
      inTextFormat: '(Author Page)',
      referenceListTitle: 'Works Cited',
      referenceListOrder: 'alphabetical',
      italicsFor: ['Book titles', 'Journal titles', 'Container titles', 'Website titles'],
      quotationMarksFor: ['Article titles', 'Chapter titles', 'Webpage titles', 'Song titles', 'Poem titles'],
      paperTypes: ['research-paper', 'term-paper', 'literature-review', 'essay', 'thesis']
    },
    CHICAGO_NB: {
      fullName: 'Chicago Manual of Style - Notes and Bibliography (18th Edition)',
      fields: ['Author', 'Title', 'Publication info', 'Page number', 'Note'],
      inTextFormat: 'superscript number',
      referenceListTitle: 'Bibliography',
      referenceListOrder: 'alphabetical',
      italicsFor: ['Book titles', 'Journal titles'],
      quotationMarksFor: ['Article titles', 'Chapter titles'],
      noteSystem: true,
      usesFootnotes: true,
      usesEndnotes: true,
      paperTypes: ['thesis', 'dissertation', 'research-paper', 'term-paper', 'literature-review']
    },
    CHICAGO_AD: {
      fullName: 'Chicago Manual of Style - Author-Date (18th Edition)',
      fields: ['Author', 'Date', 'Title', 'Publication info'],
      inTextFormat: '(Author, Year)',
      referenceListTitle: 'References',
      referenceListOrder: 'alphabetical',
      italicsFor: ['Book titles', 'Journal titles'],
      quotationMarksFor: ['Article titles', 'Chapter titles'],
      paperTypes: ['thesis', 'dissertation', 'research-paper', 'literature-review']
    },
    IEEE: {
      fullName: 'Institute of Electrical and Electronics Engineers',
      fields: ['Author', 'Title', 'Publication info', 'Number'],
      inTextFormat: '[Number]',
      referenceListTitle: 'References',
      referenceListOrder: 'order of citation (not alphabetical)',
      italicsFor: ['Journal titles', 'Book titles', 'Conference titles'],
      quotationMarksFor: ['Article titles', 'Paper titles'],
      paperTypes: ['research-paper', 'experimental-report', 'thesis', 'dissertation']
    },
    AMA: {
      fullName: 'American Medical Association',
      fields: ['Author', 'Title', 'Journal', 'Year', 'Volume', 'Issue', 'Pages', 'DOI'],
      inTextFormat: 'superscript number',
      referenceListTitle: 'References',
      referenceListOrder: 'order of citation (numerical)',
      italicsFor: ['Journal titles'],
      quotationMarksFor: ['Article titles'],
      paperTypes: ['research-paper', 'experimental-report', 'thesis', 'dissertation']
    },
    ASA: {
      fullName: 'American Sociological Association',
      fields: ['Author', 'Date', 'Title', 'Publication info'],
      inTextFormat: '(Author, Year)',
      referenceListTitle: 'References',
      referenceListOrder: 'alphabetical',
      italicsFor: ['Book titles', 'Journal titles'],
      quotationMarksFor: ['Article titles', 'Chapter titles'],
      paperTypes: ['research-paper', 'thesis', 'dissertation', 'literature-review']
    }
  },

  getPaperType(config) {
    const detectedType = config.paperType;
    if (detectedType && this.PAPER_TYPES[detectedType.toUpperCase().replace(/-/g, '_')]) {
      return this.PAPER_TYPES[detectedType.toUpperCase().replace(/-/g, '_')];
    }
    return null;
  },

  getCitationStyle(config) {
    const style = config.citationStyle;
    if (style && this.CITATION_STYLES[style.toUpperCase().replace(/-/g, '_').replace(/\s+/g, '_')]) {
      return this.CITATION_STYLES[style.toUpperCase().replace(/-/g, '_').replace(/\s+/g, '_')];
    }
    return null;
  }
};