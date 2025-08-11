import { pdfjs } from 'react-pdf';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();

export interface TextItem {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  pageNumber: number;
}

export interface AnalysisIssue {
  id: string;
  type: 'spelling' | 'grammar' | 'redundancy' | 'format' | 'skills';
  text: string;
  suggestion: string;
  coordinates: {
    top: string;
    left: string;
    width: string;
    height: string;
  };
  color: string;
}

export interface DynamicHighlights {
  spelling: AnalysisIssue[];
  grammar: AnalysisIssue[];
  redundancy: AnalysisIssue[];
  format: AnalysisIssue[];
  skills: AnalysisIssue[];
}

export class DynamicAnalysisEngine {
  private static spellCheckWords = [
    'responsibile', 'maintaing', 'experiance', 'succesful', 'managment',
    'developement', 'recieve', 'seperate', 'occured', 'acheivement'
  ];

  private static grammarIssues = [
    'was responsible for', 'worked on', 'helped with', 'involved in',
    'participated in', 'assisted with', 'contributed to'
  ];

  private static redundantPhrases = [
    'developing and maintaining', 'responsible for managing',
    'worked closely with', 'hands-on experience'
  ];

  static async extractTextFromPDF(fileUrl: string, pageNumber = 1): Promise<TextItem[]> {
    try {
      const pdf = await pdfjs.getDocument(fileUrl).promise;
      const page = await pdf.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const viewport = page.getViewport({ scale: 1 });

      return textContent.items
        .filter((item) => 'str' in item && item.str && item.str.trim().length > 0)
        .map((item, index: number) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const textItem = item as any; // PDF.js TextItem
          const transform = textItem.transform;
          return {
            id: `text-${index}`,
            text: textItem.str.trim(),
            x: transform[4],
            y: viewport.height - transform[5], // Convert to top-based coordinates
            width: textItem.width || textItem.str.length * 8,
            height: textItem.height || 12,
            pageNumber
          };
        });
    } catch (error) {
      console.error('Error extracting PDF text:', error);
      return [];
    }
  }

  static analyzeSpelling(textItems: TextItem[]): AnalysisIssue[] {
    const issues: AnalysisIssue[] = [];
    
    textItems.forEach(item => {
      const words = item.text.toLowerCase().split(/\s+/);
      words.forEach(word => {
        const cleanWord = word.replace(/[^\w]/g, '');
        if (this.spellCheckWords.includes(cleanWord)) {
          issues.push({
            id: `spell-${item.id}-${cleanWord}`,
            type: 'spelling',
            text: cleanWord,
            suggestion: this.getSpellingSuggestion(cleanWord),
            coordinates: this.convertToPercentage(item, textItems),
            color: '#ef4444'
          });
        }
      });
    });

    return issues;
  }

  static analyzeGrammar(textItems: TextItem[]): AnalysisIssue[] {
    const issues: AnalysisIssue[] = [];
    const fullText = textItems.map(item => item.text).join(' ').toLowerCase();

    textItems.forEach(item => {
      const itemText = item.text.toLowerCase();
      this.grammarIssues.forEach(issue => {
        if (itemText.includes(issue)) {
          issues.push({
            id: `grammar-${item.id}-${issue.replace(/\s+/g, '-')}`,
            type: 'grammar',
            text: issue,
            suggestion: this.getGrammarSuggestion(issue),
            coordinates: this.convertToPercentage(item, textItems),
            color: '#f97316'
          });
        }
      });
    });

    return issues;
  }

  static analyzeRedundancy(textItems: TextItem[]): AnalysisIssue[] {
    const issues: AnalysisIssue[] = [];
    const fullText = textItems.map(item => item.text).join(' ').toLowerCase();

    textItems.forEach(item => {
      const itemText = item.text.toLowerCase();
      this.redundantPhrases.forEach(phrase => {
        if (itemText.includes(phrase)) {
          issues.push({
            id: `redundancy-${item.id}-${phrase.replace(/\s+/g, '-')}`,
            type: 'redundancy',
            text: phrase,
            suggestion: this.getRedundancySuggestion(phrase),
            coordinates: this.convertToPercentage(item, textItems),
            color: '#eab308'
          });
        }
      });
    });

    return issues;
  }

  static analyzeFormat(textItems: TextItem[]): AnalysisIssue[] {
    const issues: AnalysisIssue[] = [];
    
    // Find inconsistent formatting (different font sizes, alignments)
    const fontSizes = textItems.map(item => item.height);
    const uniqueSizes = [...new Set(fontSizes)];
    
    if (uniqueSizes.length > 3) {
      // Too many different font sizes - format issue
      textItems.slice(0, 2).forEach((item, index) => {
        issues.push({
          id: `format-${item.id}`,
          type: 'format',
          text: 'Inconsistent formatting',
          suggestion: 'Use consistent font sizes for headers and body text',
          coordinates: this.convertToPercentage(item, textItems),
          color: '#8b5cf6'
        });
      });
    }

    return issues;
  }

  static analyzeSkills(textItems: TextItem[]): AnalysisIssue[] {
    const issues: AnalysisIssue[] = [];
    const fullText = textItems.map(item => item.text).join(' ').toLowerCase();
    
    // Look for skills section and suggest improvements
    const skillsKeywords = ['skills', 'technologies', 'tools', 'languages'];
    const skillsItems = textItems.filter(item => 
      skillsKeywords.some(keyword => item.text.toLowerCase().includes(keyword))
    );

    skillsItems.forEach(item => {
      issues.push({
        id: `skills-${item.id}`,
        type: 'skills',
        text: 'Skills section',
        suggestion: 'Add more relevant technical skills and certifications',
        coordinates: this.convertToPercentage(item, textItems),
        color: '#10b981'
      });
    });

    return issues;
  }

  static async analyzePDF(fileUrl: string): Promise<DynamicHighlights> {
    const textItems = await this.extractTextFromPDF(fileUrl);
    
    return {
      spelling: this.analyzeSpelling(textItems),
      grammar: this.analyzeGrammar(textItems),
      redundancy: this.analyzeRedundancy(textItems),
      format: this.analyzeFormat(textItems),
      skills: this.analyzeSkills(textItems)
    };
  }

  private static convertToPercentage(item: TextItem, allItems: TextItem[]) {
    // Convert pixel coordinates to percentage for responsive positioning
    const maxWidth = Math.max(...allItems.map(i => i.x + i.width));
    const maxHeight = Math.max(...allItems.map(i => i.y + i.height));
    
    return {
      top: `${(item.y / maxHeight * 100).toFixed(1)}%`,
      left: `${(item.x / maxWidth * 100).toFixed(1)}%`,
      width: `${(item.width / maxWidth * 100).toFixed(1)}%`,
      height: `${(item.height / maxHeight * 100).toFixed(1)}%`
    };
  }

  private static getSpellingSuggestion(word: string): string {
    const corrections: { [key: string]: string } = {
      'responsibile': 'responsible',
      'maintaing': 'maintaining',
      'experiance': 'experience',
      'succesful': 'successful',
      'managment': 'management',
      'developement': 'development',
      'recieve': 'receive',
      'seperate': 'separate',
      'occured': 'occurred',
      'acheivement': 'achievement'
    };
    return corrections[word] || 'Check spelling';
  }

  private static getGrammarSuggestion(phrase: string): string {
    const suggestions: { [key: string]: string } = {
      'was responsible for': 'Use active voice: "Managed" or "Led"',
      'worked on': 'Use specific action: "Developed" or "Built"',
      'helped with': 'Use direct action: "Assisted in" or "Supported"',
      'involved in': 'Use active role: "Participated in" or "Contributed to"',
      'participated in': 'Use stronger verb: "Led" or "Coordinated"',
      'assisted with': 'Use specific action: "Supported" or "Facilitated"',
      'contributed to': 'Use direct impact: "Improved" or "Enhanced"'
    };
    return suggestions[phrase] || 'Use more active language';
  }

  private static getRedundancySuggestion(phrase: string): string {
    const suggestions: { [key: string]: string } = {
      'developing and maintaining': 'Use varied terms: "built", "enhanced", "optimized"',
      'responsible for managing': 'Simply say "managed" or "oversaw"',
      'worked closely with': 'Use "collaborated with" or "partnered with"',
      'hands-on experience': 'Use "direct experience" or "practical experience"'
    };
    return suggestions[phrase] || 'Vary your language for better impact';
  }
}
