// Resume Analysis Engine - Detects various issues in resume content
export interface AnalysisIssue {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
  startIndex: number;
  endIndex: number;
  text: string;
  suggestion: string;
  color: string;
  category: 'quality' | 'format' | 'skills';
}

export interface AnalysisResult {
  issues: AnalysisIssue[];
  totalIssues: number;
  categoryCount: {
    quality: number;
    format: number;
    skills: number;
  };
}

// Color scheme for different issue types
export const HIGHLIGHT_COLORS = {
  spellCheck: '#ef4444',      // Red
  grammar: '#f97316',         // Orange  
  redundancy: '#eab308',      // Yellow
  wordCount: '#3b82f6',       // Blue
  professional: '#8b5cf6',    // Purple
  consistency: '#ec4899',     // Pink
  bulletPoints: '#06b6d4',    // Cyan
  dateFormat: '#84cc16',      // Lime
  fontSpacing: '#6366f1',     // Indigo
  sectionHeaders: '#14b8a6',  // Teal
  technicalSkills: '#10b981', // Green
  softSkills: '#f59e0b',      // Amber
  industryKeywords: '#f43f5e', // Rose
  actionVerbs: '#8b5cf6',     // Violet
  quantifiableResults: '#64748b' // Slate
};

// Spell check dictionary (common words)
const COMMON_WORDS = new Set([
  'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'man', 'men', 'put', 'say', 'she', 'too', 'use',
  'experience', 'work', 'project', 'team', 'management', 'development', 'software', 'application', 'system', 'data', 'analysis', 'design', 'implementation', 'skills', 'technical', 'business', 'client', 'customer', 'service', 'support', 'research', 'education', 'university', 'degree', 'bachelor', 'master', 'certification'
]);

// Weak action verbs that should be replaced
const WEAK_VERBS = [
  'responsible for', 'worked on', 'helped with', 'assisted', 'involved in', 'participated in', 'contributed to', 'was part of', 'handled', 'dealt with'
];

// Strong action verbs
const STRONG_VERBS = [
  'led', 'managed', 'developed', 'implemented', 'created', 'designed', 'optimized', 'improved', 'increased', 'reduced', 'achieved', 'delivered', 'executed', 'launched', 'streamlined'
];

// Technical skills keywords
const TECHNICAL_KEYWORDS = [
  'javascript', 'python', 'java', 'react', 'node.js', 'sql', 'mongodb', 'aws', 'docker', 'kubernetes', 'git', 'agile', 'scrum', 'api', 'rest', 'graphql', 'typescript', 'html', 'css'
];

// Soft skills keywords
const SOFT_SKILLS = [
  'leadership', 'communication', 'teamwork', 'problem-solving', 'analytical', 'creative', 'adaptable', 'collaborative', 'organized', 'detail-oriented'
];

export class ResumeAnalyzer {
  private text: string;
  private issues: AnalysisIssue[] = [];

  constructor(resumeText: string) {
    this.text = resumeText.toLowerCase();
  }

  // QUALITY ANALYSIS FUNCTIONS
  analyzeSpelling(): AnalysisIssue[] {
    const issues: AnalysisIssue[] = [];
    const words = this.text.match(/\b\w+\b/g) || [];
    let currentIndex = 0;

    // Common misspellings
    const misspellings = {
      'recieve': 'receive',
      'seperate': 'separate', 
      'definate': 'definite',
      'occured': 'occurred',
      'managment': 'management',
      'sucessful': 'successful',
      'developement': 'development',
      'responsibilty': 'responsibility'
    };

    words.forEach((word: string) => {
      const cleanWord = word.replace(/[^\w]/g, '');
      if (misspellings[cleanWord as keyof typeof misspellings]) {
        const startIndex = this.text.indexOf(cleanWord, currentIndex);
        issues.push({
          id: `spell-${startIndex}`,
          type: 'spellCheck',
          severity: 'high',
          startIndex,
          endIndex: startIndex + cleanWord.length,
          text: cleanWord,
          suggestion: `Replace "${cleanWord}" with "${misspellings[cleanWord]}"`,
          color: HIGHLIGHT_COLORS.spellCheck,
          category: 'quality'
        });
      }
      currentIndex = this.text.indexOf(cleanWord, currentIndex) + cleanWord.length;
    });

    return issues;
  }

  analyzeGrammar(): AnalysisIssue[] {
    const issues: AnalysisIssue[] = [];
    
    // Common grammar issues
    const grammarPatterns = [
      { pattern: /\bi\s+am\b/g, suggestion: 'Use active voice instead of "I am"' },
      { pattern: /\bwas\s+responsible\s+for\b/g, suggestion: 'Use strong action verbs instead of "was responsible for"' },
      { pattern: /\bhas\s+been\b/g, suggestion: 'Use active voice instead of passive voice' },
      { pattern: /\bthere\s+are\b/g, suggestion: 'Use more direct language' }
    ];

    grammarPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.pattern.exec(this.text)) !== null) {
        issues.push({
          id: `grammar-${match.index}`,
          type: 'grammar',
          severity: 'medium',
          startIndex: match.index,
          endIndex: match.index + match[0].length,
          text: match[0],
          suggestion: pattern.suggestion,
          color: HIGHLIGHT_COLORS.grammar,
          category: 'quality'
        });
      }
    });

    return issues;
  }

  analyzeRedundancy(): AnalysisIssue[] {
    const issues: AnalysisIssue[] = [];
    const sentences = this.text.split(/[.!?]+/);
    const wordCount: { [key: string]: number } = {};

    // Count word frequency
    const words = this.text.match(/\b\w{4,}\b/g) || [];
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    // Find overused words (appearing more than 3 times)
    Object.entries(wordCount).forEach(([word, count]) => {
      if (count > 3 && !COMMON_WORDS.has(word)) {
        let startIndex = 0;
        for (let i = 0; i < count; i++) {
          const index = this.text.indexOf(word, startIndex);
          if (index !== -1) {
            issues.push({
              id: `redundancy-${index}`,
              type: 'redundancy',
              severity: 'medium',
              startIndex: index,
              endIndex: index + word.length,
              text: word,
              suggestion: `"${word}" appears ${count} times. Consider using synonyms`,
              color: HIGHLIGHT_COLORS.redundancy,
              category: 'quality'
            });
            startIndex = index + 1;
          }
        }
      }
    });

    return issues;
  }

  // FORMAT ANALYSIS FUNCTIONS
  analyzeConsistency(): AnalysisIssue[] {
    const issues: AnalysisIssue[] = [];
    
    // Check for inconsistent date formats
    const datePatterns = [
      /\b\d{4}-\d{2}-\d{2}\b/g,  // 2024-01-01
      /\b\d{2}\/\d{2}\/\d{4}\b/g, // 01/01/2024
      /\b\w+\s+\d{4}\b/g          // January 2024
    ];

    let dateFormats: string[] = [];
    datePatterns.forEach(pattern => {
      const matches = this.text.match(pattern);
      if (matches) {
        dateFormats = [...dateFormats, ...matches];
      }
    });

    // If more than one date format found, flag inconsistency
    if (dateFormats.length > 1) {
      dateFormats.forEach(date => {
        const index = this.text.indexOf(date);
        issues.push({
          id: `consistency-${index}`,
          type: 'consistency',
          severity: 'low',
          startIndex: index,
          endIndex: index + date.length,
          text: date,
          suggestion: 'Use consistent date format throughout resume',
          color: HIGHLIGHT_COLORS.consistency,
          category: 'format'
        });
      });
    }

    return issues;
  }

  analyzeBulletPoints(): AnalysisIssue[] {
    const issues: AnalysisIssue[] = [];
    const lines = this.text.split('\n');

    lines.forEach((line, lineIndex) => {
      // Check for lines that should be bullet points but aren't
      if (line.trim().length > 0 && 
          !line.startsWith('•') && 
          !line.startsWith('-') && 
          !line.startsWith('*') &&
          line.match(/^[a-z]/i) &&
          line.length > 20) {
        
        const index = this.text.indexOf(line);
        issues.push({
          id: `bullet-${index}`,
          type: 'bulletPoints',
          severity: 'low',
          startIndex: index,
          endIndex: index + line.length,
          text: line.trim(),
          suggestion: 'Consider using bullet points for better readability',
          color: HIGHLIGHT_COLORS.bulletPoints,
          category: 'format'
        });
      }
    });

    return issues;
  }

  // SKILLS ANALYSIS FUNCTIONS
  analyzeTechnicalSkills(): AnalysisIssue[] {
    const issues: AnalysisIssue[] = [];
    const foundSkills = TECHNICAL_KEYWORDS.filter(skill => 
      this.text.includes(skill.toLowerCase())
    );

    // If fewer than 3 technical skills mentioned, suggest more
    if (foundSkills.length < 3) {
      const index = this.text.indexOf('skills') || this.text.indexOf('technical') || 0;
      issues.push({
        id: `tech-skills-${index}`,
        type: 'technicalSkills',
        severity: 'medium',
        startIndex: index,
        endIndex: index + 10,
        text: 'skills section',
        suggestion: `Add more technical skills. Found only ${foundSkills.length}/3 recommended`,
        color: HIGHLIGHT_COLORS.technicalSkills,
        category: 'skills'
      });
    }

    return issues;
  }

  analyzeActionVerbs(): AnalysisIssue[] {
    const issues: AnalysisIssue[] = [];

    WEAK_VERBS.forEach(weakVerb => {
      const regex = new RegExp(weakVerb, 'gi');
      let match;
      while ((match = regex.exec(this.text)) !== null) {
        issues.push({
          id: `action-verb-${match.index}`,
          type: 'actionVerbs',
          severity: 'high',
          startIndex: match.index,
          endIndex: match.index + match[0].length,
          text: match[0],
          suggestion: `Replace with strong action verb like "Led", "Developed", "Implemented"`,
          color: HIGHLIGHT_COLORS.actionVerbs,
          category: 'skills'
        });
      }
    });

    return issues;
  }

  analyzeQuantifiableResults(): AnalysisIssue[] {
    const issues: AnalysisIssue[] = [];
    
    // Look for statements that could benefit from quantification
    const quantifiablePatterns = [
      /improved/gi, /increased/gi, /reduced/gi, /managed/gi, /led/gi
    ];

    quantifiablePatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(this.text)) !== null) {
        // Check if there's already a number nearby
        const surrounding = this.text.slice(
          Math.max(0, match.index - 50),
          Math.min(this.text.length, match.index + 50)
        );
        
        if (!/\d+%|\$\d+|\d+\+/g.test(surrounding)) {
          issues.push({
            id: `quantify-${match.index}`,
            type: 'quantifiableResults',
            severity: 'medium',
            startIndex: match.index,
            endIndex: match.index + match[0].length,
            text: match[0],
            suggestion: 'Add specific numbers, percentages, or metrics to quantify this achievement',
            color: HIGHLIGHT_COLORS.quantifiableResults,
            category: 'skills'
          });
        }
      }
    });

    return issues;
  }

  // Main analysis function
  analyzeAll(): AnalysisResult {
    this.issues = [
      ...this.analyzeSpelling(),
      ...this.analyzeGrammar(),
      ...this.analyzeRedundancy(),
      ...this.analyzeConsistency(),
      ...this.analyzeBulletPoints(),
      ...this.analyzeTechnicalSkills(),
      ...this.analyzeActionVerbs(),
      ...this.analyzeQuantifiableResults()
    ];

    const categoryCount = {
      quality: this.issues.filter(i => i.category === 'quality').length,
      format: this.issues.filter(i => i.category === 'format').length,
      skills: this.issues.filter(i => i.category === 'skills').length
    };

    return {
      issues: this.issues,
      totalIssues: this.issues.length,
      categoryCount
    };
  }

  // Get issues by type
  getIssuesByType(type: string): AnalysisIssue[] {
    return this.issues.filter(issue => issue.type === type);
  }

  // Get issues by category
  getIssuesByCategory(category: 'quality' | 'format' | 'skills'): AnalysisIssue[] {
    return this.issues.filter(issue => issue.category === category);
  }
}
