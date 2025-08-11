// Real Analysis Engine for Dynamic PDF Highlighting
import compromise from 'compromise';

export interface TextItem {
  id: number | string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontName?: string;
}

export interface AnalysisIssue {
  id: string;
  type: 'spelling' | 'grammar' | 'redundancy' | 'format' | 'skills';
  text: string;
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  suggestion: string;
  severity: 'low' | 'medium' | 'high';
}

export interface AnalysisResults {
  spelling: AnalysisIssue[];
  grammar: AnalysisIssue[];
  redundancy: AnalysisIssue[];
  format: AnalysisIssue[];
  skills: AnalysisIssue[];
}

export class RealAnalysisEngine {
  private static spellCheckDict = new Set([
    'experience', 'education', 'skills', 'responsibilities', 'achievements', 
    'development', 'management', 'leadership', 'communication', 'collaboration',
    'implementation', 'analysis', 'design', 'testing', 'optimization',
    'javascript', 'typescript', 'react', 'node', 'python', 'java', 'html',
    'css', 'sql', 'database', 'api', 'frontend', 'backend', 'fullstack'
  ]);

  private static commonMisspellings = new Map([
    ['responsibile', 'responsible'],
    ['managment', 'management'],
    ['developement', 'development'],
    ['recieve', 'receive'],
    ['seperate', 'separate'],
    ['definately', 'definitely'],
    ['occured', 'occurred'],
    ['maintaing', 'maintaining'],
    ['sucessful', 'successful'],
    ['acheivement', 'achievement']
  ]);

  private static weakWords = new Set([
    'assisted', 'helped', 'worked on', 'participated in', 'involved in',
    'responsible for', 'duties included', 'was part of'
  ]);

  private static strongWords = new Set([
    'achieved', 'accelerated', 'accomplished', 'delivered', 'developed',
    'engineered', 'executed', 'implemented', 'improved', 'increased',
    'launched', 'led', 'managed', 'optimized', 'spearheaded', 'streamlined'
  ]);

  static analyzeText(textItems: TextItem[]): AnalysisResults {
    const results: AnalysisResults = {
      spelling: [],
      grammar: [],
      redundancy: [],
      format: [],
      skills: []
    };

    // Analyze each text item
    textItems.forEach((item, index) => {
      if (!item.text || item.text.trim().length === 0) return;

      // Spelling Analysis
      const spellingIssues = this.analyzeSpelling(item, index);
      results.spelling.push(...spellingIssues);

      // Grammar Analysis
      const grammarIssues = this.analyzeGrammar(item, index);
      results.grammar.push(...grammarIssues);

      // Format Analysis
      const formatIssues = this.analyzeFormat(item, index);
      results.format.push(...formatIssues);

      // Skills Analysis
      const skillsIssues = this.analyzeSkills(item, index);
      results.skills.push(...skillsIssues);
    });

    // Redundancy Analysis (cross-item)
    results.redundancy = this.analyzeRedundancy(textItems);

    return results;
  }

  private static analyzeSpelling(item: TextItem, index: number): AnalysisIssue[] {
    const issues: AnalysisIssue[] = [];
    const words = item.text.toLowerCase().split(/\s+/);

    words.forEach(word => {
      const cleanWord = word.replace(/[^\w]/g, '');
      if (cleanWord.length < 3) return;

      // Check if it's a common misspelling
      if (this.commonMisspellings.has(cleanWord)) {
        issues.push({
          id: `spell-${index}-${cleanWord}`,
          type: 'spelling',
          text: cleanWord,
          coordinates: item,
          suggestion: `"${cleanWord}" → "${this.commonMisspellings.get(cleanWord)}"`,
          severity: 'high'
        });
      }
      // Check against dictionary
      else if (!this.spellCheckDict.has(cleanWord) && !this.isValidWord(cleanWord)) {
        issues.push({
          id: `spell-${index}-${cleanWord}`,
          type: 'spelling',
          text: cleanWord,
          coordinates: item,
          suggestion: `Check spelling of "${cleanWord}"`,
          severity: 'medium'
        });
      }
    });

    return issues;
  }

  private static analyzeGrammar(item: TextItem, index: number): AnalysisIssue[] {
    const issues: AnalysisIssue[] = [];
    const text = item.text.toLowerCase();

    // Check for weak action verbs
    this.weakWords.forEach(weakWord => {
      if (text.includes(weakWord)) {
        const strongAlternatives = Array.from(this.strongWords).slice(0, 3).join(', ');
        issues.push({
          id: `grammar-${index}-weak`,
          type: 'grammar',
          text: weakWord,
          coordinates: item,
          suggestion: `Replace "${weakWord}" with stronger verbs like: ${strongAlternatives}`,
          severity: 'medium'
        });
      }
    });

    // Check for passive voice using compromise
    try {
      const doc = compromise(item.text);
      const passiveVerbs = doc.match('#Verb #Adverb? #PastTense').out('array');
      
      if (passiveVerbs.length > 0) {
        issues.push({
          id: `grammar-${index}-passive`,
          type: 'grammar',
          text: passiveVerbs[0],
          coordinates: item,
          suggestion: 'Consider using active voice for stronger impact',
          severity: 'medium'
        });
      }
    } catch (error) {
      // Fallback grammar analysis
      if (text.includes(' was ') || text.includes(' were ') || text.includes(' been ')) {
        issues.push({
          id: `grammar-${index}-passive-simple`,
          type: 'grammar',
          text: 'passive voice detected',
          coordinates: item,
          suggestion: 'Consider using active voice',
          severity: 'low'
        });
      }
    }

    return issues;
  }

  private static analyzeRedundancy(textItems: TextItem[]): AnalysisIssue[] {
    const issues: AnalysisIssue[] = [];
    const phrases = new Map<string, TextItem[]>();

    // Collect phrases and their locations
    textItems.forEach(item => {
      const text = item.text.toLowerCase();
      const words = text.split(/\s+/);
      
      // Check for 2-3 word phrases
      for (let i = 0; i < words.length - 1; i++) {
        const phrase = words.slice(i, i + 3).join(' ');
        if (phrase.length > 10) { // Only meaningful phrases
          if (!phrases.has(phrase)) {
            phrases.set(phrase, []);
          }
          phrases.get(phrase)!.push(item);
        }
      }
    });

    // Find redundant phrases
    phrases.forEach((locations, phrase) => {
      if (locations.length > 1) {
        locations.forEach((item, index) => {
          issues.push({
            id: `redundancy-${phrase}-${index}`,
            type: 'redundancy',
            text: phrase,
            coordinates: item,
            suggestion: `"${phrase}" appears ${locations.length} times. Consider varying your language.`,
            severity: 'low'
          });
        });
      }
    });

    return issues;
  }

  private static analyzeFormat(item: TextItem, index: number): AnalysisIssue[] {
    const issues: AnalysisIssue[] = [];
    const text = item.text;

    // Check for inconsistent capitalization
    if (text.length > 3 && text === text.toUpperCase() && !text.match(/^[A-Z]{2,4}$/)) {
      issues.push({
        id: `format-${index}-caps`,
        type: 'format',
        text: 'ALL CAPS TEXT',
        coordinates: item,
        suggestion: 'Avoid using all caps. Use proper capitalization.',
        severity: 'medium'
      });
    }

    // Check for inconsistent date formats
    if (text.match(/\d{1,2}\/\d{1,2}\/\d{2,4}/) || text.match(/\d{1,2}-\d{1,2}-\d{2,4}/)) {
      issues.push({
        id: `format-${index}-date`,
        type: 'format',
        text: 'date format',
        coordinates: item,
        suggestion: 'Use consistent date format (e.g., "January 2023" or "01/2023")',
        severity: 'low'
      });
    }

    // Check for multiple spaces
    if (text.includes('  ')) {
      issues.push({
        id: `format-${index}-spacing`,
        type: 'format',
        text: 'multiple spaces',
        coordinates: item,
        suggestion: 'Remove extra spaces for cleaner formatting',
        severity: 'low'
      });
    }

    return issues;
  }

  private static analyzeSkills(item: TextItem, index: number): AnalysisIssue[] {
    const issues: AnalysisIssue[] = [];
    const text = item.text.toLowerCase();

    // Check for outdated technologies
    const outdatedTech = ['jquery', 'flash', 'silverlight', 'perl', 'cobol'];
    outdatedTech.forEach(tech => {
      if (text.includes(tech)) {
        issues.push({
          id: `skills-${index}-outdated`,
          type: 'skills',
          text: tech,
          coordinates: item,
          suggestion: `Consider replacing "${tech}" with more current technologies`,
          severity: 'medium'
        });
      }
    });

    // Check for missing important skills
    const modernTech = ['react', 'typescript', 'node.js', 'python', 'aws', 'docker'];
    const hasModernTech = modernTech.some(tech => text.includes(tech));
    
    if (text.includes('skills') && !hasModernTech) {
      issues.push({
        id: `skills-${index}-missing`,
        type: 'skills',
        text: 'skills section',
        coordinates: item,
        suggestion: 'Consider adding modern technologies like React, TypeScript, or cloud platforms',
        severity: 'medium'
      });
    }

    return issues;
  }

  private static isValidWord(word: string): boolean {
    // Basic validation for common patterns
    return word.length < 3 || 
           !!word.match(/^\d+$/) || // numbers
           !!word.match(/^[a-z]+\.(com|org|net)$/) || // domains
           !!word.match(/^@[a-z]+/) || // social handles
           !!word.match(/^#[a-z]+/) || // hashtags
           !!word.match(/^[A-Z]{2,}$/) // acronyms
  }
}
