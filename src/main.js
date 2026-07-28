const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const PaperAnalyzer = require('./paper-analyzer');
const CitationEngine = require('./citation-engine');
const FormatApplier = require('./format-applier');
const ReferenceValidator = require('./reference-validator');
const InteractivePrompter = require('./prompts');

async function main() {
  const isInteractive = process.argv.includes('--interactive') || process.argv.includes('-i');
  const isPrompt = process.argv.includes('--prompt') || process.argv.includes('-p');
  const configPath = process.env.PAPER_CONFIG || 'paper-config.yml';
  const paperTypeOverride = process.env.PAPER_TYPE || '';
  const citationStyleOverride = process.env.CITATION_STYLE || '';
  const outputFormat = process.env.OUTPUT_FORMAT || 'markdown';
  const validateRefs = process.env.VALIDATE_REFERENCES !== 'false';
  const templatePath = process.env.TEMPLATE || '';
  const generateToc = process.env.GENERATE_TOC !== 'false';
  const wordCountTarget = parseInt(process.env.WORD_COUNT_TARGET) || null;
  const checkPlagiarism = process.env.CHECK_PLAGIARISM === 'true';
  const strictMode = process.env.STRICT_MODE === 'true';

  if (isInteractive) {
    console.log('Starting interactive mode...\n');
    try {
      const prompter = new InteractivePrompter();
      await prompter.start();
      console.log('\nInteractive setup complete. Use the generated paper-config.yml to run the formatter.');
      return;
    } catch (err) {
      console.error('Interactive setup error:', err.message);
      process.exitCode = 1;
      return;
    }
  }

  if (isPrompt) {
    console.log('Starting quick prompt mode...\n');
    try {
      const prompter = new InteractivePrompter();
      await prompter.start();
      console.log('\nQuick prompt complete. Configuration saved to paper-config.yml.');
      return;
    } catch (err) {
      console.error('Quick prompt error:', err.message);
      process.exitCode = 1;
      return;
    }
  }

  try {
    const config = loadConfig(configPath);
    applyOverrides(config, paperTypeOverride, citationStyleOverride);

    const paperType = PaperAnalyzer.getPaperType(config);
    const citationStyle = PaperAnalyzer.getCitationStyle(config);

    if (!paperType) {
      console.error(`Unknown paper type: ${config.paperType}`);
      console.error(`Available paper types: thesis, dissertation, research-paper, term-paper, literature-review, experimental-report, argumentative, exploratory, annotated-bibliography, book-review, research-poster, essay`);
      console.error('Run with --interactive or --prompt to configure interactively.');
      process.exitCode = 1;
      return;
    }

    if (!citationStyle) {
      console.error(`Unknown citation style: ${config.citationStyle}`);
      console.error(`Available citation styles: APA, MLA, Chicago-NB, Chicago-AD, IEEE, AMA, ASA`);
      console.error('Run with --interactive or --prompt to configure interactively.');
      process.exitCode = 1;
      return;
    }

    const sourceContent = readSourceFiles(config);
    const formatApplier = new FormatApplier(config);
    const formatted = formatApplier.apply(config, sourceContent);

    const citationData = extractCitations(sourceContent, config);
    const engine = new CitationEngine(config.citationStyle, config);

    if (citationData.references && citationData.references.length > 0) {
      citationData.references.forEach(ref => {
        const parsed = engine.parseReference(ref);
        if (parsed.errors && parsed.errors.length > 0) {
          console.warn(`Warning: ${parsed.errors.join(', ')}`);
        }
      });
      formatted.referenceList = engine.generateReferenceList();
    }

    let validation = { valid: true, errors: [], warnings: [], totalReferences: 0 };
    if (validateRefs) {
      const validator = new ReferenceValidator(config);
      validation = validator.validateReferences(citationData.references || []);
      if (!validation.valid && strictMode) {
        console.error('Reference validation failed in strict mode');
        process.exitCode = 1;
      }
    }

    const doiCheck = validateDOIs(citationData.references || []);

    const toc = generateToc ? generateTableOfContents(paperType, formatted) : '';

    const output = generateFinalOutput(formatted, toc, citationData, outputFormat);

    writeOutput(config, output, outputFormat);

    const summary = {
      paperType: paperType.name,
      citationStyle: config.citationStyle,
      outputFormat: outputFormat,
      wordCount: countWords(sourceContent),
      targetWordCount: wordCountTarget,
      citationCount: citationData.references ? citationData.references.length : 0,
      validation,
      doiCheck,
      warnings: [...(formatted.warnings || []), ...validation.warnings, ...doiCheck.issues],
      errors: validation.errors,
      sections: paperType.sections
    };

    console.log('\n=== Academic Paper Formatter Summary ===');
    console.log(`Paper Type: ${summary.paperType}`);
    console.log(`Citation Style: ${summary.citationStyle}`);
    console.log(`Output Format: ${summary.outputFormat}`);
    console.log(`Word Count: ${summary.wordCount}`);
    if (wordCountTarget && summary.wordCount < wordCountTarget) {
      console.log(`Warning: Word count (${summary.wordCount}) is below target (${wordCountTarget})`);
    }
    console.log(`References: ${summary.citationCount}`);
    console.log(`Validation Errors: ${validation.errors.length}`);
    console.log(`Validation Warnings: ${validation.warnings.length}`);
    console.log(`DOI Issues: ${doiCheck.issues.length}`);
    console.log(`Output written to: ${config.outputPath || 'output/'}`);

    if (summary.errors.length > 0 || summary.warnings.length > 0) {
      console.log('\n--- Issues ---');
      summary.errors.forEach(e => console.error(`ERROR: ${e}`));
      summary.warnings.forEach(w => console.warn(`WARNING: ${w}`));
    }
  } catch (error) {
    console.error(`Fatal error: ${error.message}`);
    console.error('Run with --interactive or --prompt to configure your paper interactively.');
    if (strictMode) {
      process.exitCode = 1;
    }
  }
}

function loadConfig(configPath) {
  if (!fs.existsSync(configPath)) {
    console.error(`Configuration file not found: ${configPath}`);
    console.error('Run with --interactive or --prompt to create a configuration file.');
    process.exitCode = 1;
    return {};
  }
  const content = fs.readFileSync(configPath, 'utf-8');
  return yaml.load(content);
}

function applyOverrides(config, typeOverride, styleOverride) {
  if (typeOverride) config.paperType = typeOverride;
  if (styleOverride) config.citationStyle = styleOverride;
}

function readSourceFiles(config) {
  const files = config.sourceFiles || [];
  let content = '';
  files.forEach(file => {
    if (fs.existsSync(file)) {
      content += fs.readFileSync(file, 'utf-8') + '\n\n';
    } else {
      console.warn(`Source file not found: ${file}`);
    }
  });
  return content;
}

function extractCitations(content, config) {
  const references = [];
  const citationRegex = config.citationRegex || /\[(\d+)\]/g;
  let match;
  const cited = new Set();

  while ((match = citationRegex.exec(content)) !== null) {
    cited.add(match[1]);
  }

  if (config.references) {
    config.references.forEach((ref, index) => {
      references.push({
        id: index + 1,
        raw: typeof ref === 'string' ? ref : JSON.stringify(ref),
        ...ref,
        citedInText: cited.has(String(index + 1))
      });
    });
  }

  return { references, cited };
}

function validateDOIs(references) {
  const issues = [];
  const doiPattern = /^10\.\d{4,9}\/[-._;()/:A-Z0-9]+$/i;

  references.forEach(ref => {
    if (ref.doi && !doiPattern.test(ref.doi)) {
      issues.push({ reference: ref.title || ref.raw, doi: ref.doi, issue: 'Invalid DOI format' });
    }

    if (ref.url && !ref.url.startsWith('http')) {
      issues.push({ reference: ref.title || ref.raw, url: ref.url, issue: 'URL does not start with http:// or https://' });
    }
  });

  return { valid: issues.length === 0, issues };
}

function generateTableOfContents(paperType, formatted) {
  if (!paperType.sections) return '';

  let toc = '# Table of Contents\n\n';
  paperType.sections.forEach((section, index) => {
    const anchor = section.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    toc += `${index + 1}. [${section}](#${anchor})\n`;
  });

  return toc;
}

function generateFinalOutput(formatted, toc, citationData, outputFormat) {
  let output = '';

  if (toc) {
    output += toc + '\n---\n\n';
  }

  if (formatted.formattedSections) {
    Object.keys(formatted.formattedSections).forEach(section => {
      output += `## ${section}\n\n`;
      output += formatted.formattedSections[section].content + '\n\n';
    });
  }

  if (citationData.references && citationData.references.length > 0) {
    const refListTitle = formatted.citationStyle?.info?.refListTitle || 'References';
    output += `\n# ${refListTitle}\n\n`;
    output += formatted.referenceList || '';
  }

  return output;
}

function writeOutput(config, output, outputFormat) {
  const outputDir = config.outputPath || 'output';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let filename = `formatted-paper`;
  switch (outputFormat) {
    case 'html':
      filename += '.html';
      output = convertMarkdownToHtml(output);
      break;
    case 'docx':
      filename += '.docx';
      break;
    case 'pdf':
      filename += '.pdf';
      break;
    default:
      filename += '.md';
  }

  const outputPath = path.join(outputDir, filename);
  fs.writeFileSync(outputPath, output, 'utf-8');
  console.log(`\nOutput written to: ${outputPath}`);
}

function convertMarkdownToHtml(markdown) {
  let html = markdown;
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');
  html = html.replace(/`(.+?)`/g, '<code>$1</code>');
  html = html.replace(/\n\n/g, '</p>\n<p>');
  html = '<!DOCTYPE html>\n<html>\n<head><meta charset="UTF-8"><title>Academic Paper</title>\n<style>body{font-family:Georgia,serif;max-width:800px;margin:0 auto;padding:20px;line-height:1.6;}</style>\n</head>\n<body>\n' + html + '\n</body>\n</html>';
  return html;
}

function countWords(text) {
  if (!text) return 0;
  const words = text.trim().split(/\s+/);
  return words.length;
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});

module.exports = { main, loadConfig, applyOverrides, extractCitations, generateFinalOutput };