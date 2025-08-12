import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect, useCallback, useRef, CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { animations } from "@/lib/animations";
import { ResumeAnalyzer, AnalysisIssue, AnalysisResult } from "@/utils/resumeAnalyzer";
import { DynamicAnalysisEngine, DynamicHighlights } from "@/utils/dynamicAnalysisEngine";
import PDFViewerFitWidth from "@/components/PDFViewerFitToView";

// Remove static highlights as we're now using dynamic analysis

import { 
  TrendingUp, 
  FileText, 
  Users, 
  Target, 
  CheckCircle,
  AlertTriangle,
  XCircle,
  Send,
  Zap,
  Plus,
  Clock,
  Mail,
  Phone,
  MapPin,
  Globe,
  X,
  AlertCircle,
  ChevronLeft,
  Home,
  Download,
  Share2
} from "lucide-react";
import Header from "@/components/dashboard/Header";

// CSS styles for PDF.js-compatible keyword highlighting with Red, Green, Yellow scheme
const highlightStyles = `
  /* Quality/Impact Section - RED colors */
  .highlight-actionable { 
    background-color: rgba(239, 68, 68, 0.5) !important; 
    border: none !important; 
    padding: 0 !important;
    margin: 0 !important;
    box-shadow: none !important;
    display: inline !important;
    line-height: normal !important;
    border-radius: 2px !important;
  }
  .highlight-specifics { 
    background-color: rgba(220, 38, 38, 0.5) !important; 
    border: none !important; 
    padding: 0 !important;
    margin: 0 !important;
    box-shadow: none !important;
    display: inline !important;
    line-height: normal !important;
    border-radius: 2px !important;
  }
  .highlight-measurable { 
    background-color: rgba(185, 28, 28, 0.5) !important; 
    border: none !important; 
    padding: 0 !important;
    margin: 0 !important;
    box-shadow: none !important;
    display: inline !important;
    line-height: normal !important;
    border-radius: 2px !important;
  }
  .highlight-redundancy { 
    background-color: rgba(239, 68, 68, 0.4) !important; 
    border: none !important; 
    padding: 0 !important;
    margin: 0 !important;
    box-shadow: none !important;
    display: inline !important;
    line-height: normal !important;
    border-radius: 2px !important;
  }
  .highlight-tactical { 
    background-color: rgba(220, 38, 38, 0.4) !important; 
    border: none !important; 
    padding: 0 !important;
    margin: 0 !important;
    box-shadow: none !important;
    display: inline !important;
    line-height: normal !important;
    border-radius: 2px !important;
  }

  /* Format/Presentation Section - YELLOW colors */
  .highlight-format { 
    background-color: rgba(245, 158, 11, 0.5) !important; 
    border: none !important; 
    padding: 0 !important;
    margin: 0 !important;
    box-shadow: none !important;
    display: inline !important;
    line-height: normal !important;
    border-radius: 2px !important;
  }
  .highlight-pages { 
    background-color: rgba(217, 119, 6, 0.5) !important; 
    border: none !important; 
    padding: 0 !important;
    margin: 0 !important;
    box-shadow: none !important;
    display: inline !important;
    line-height: normal !important;
    border-radius: 2px !important;
  }
  .highlight-sections { 
    background-color: rgba(180, 83, 9, 0.5) !important; 
    border: none !important; 
    padding: 0 !important;
    margin: 0 !important;
    box-shadow: none !important;
    display: inline !important;
    line-height: normal !important;
    border-radius: 2px !important;
  }
  .highlight-spell { 
    background-color: rgba(245, 158, 11, 0.4) !important; 
    border: none !important; 
    padding: 0 !important;
    margin: 0 !important;
    box-shadow: none !important;
    display: inline !important;
    line-height: normal !important;
    border-radius: 2px !important;
  }

  /* Skills/Competencies Section - GREEN colors */
  .highlight-analytical { 
    background-color: rgba(34, 197, 94, 0.5) !important; 
    border: none !important; 
    padding: 0 !important;
    margin: 0 !important;
    box-shadow: none !important;
    display: inline !important;
    line-height: normal !important;
    border-radius: 2px !important;
  }
  .highlight-communication { 
    background-color: rgba(22, 163, 74, 0.5) !important; 
    border: none !important; 
    padding: 0 !important;
    margin: 0 !important;
    box-shadow: none !important;
    display: inline !important;
    line-height: normal !important;
    border-radius: 2px !important;
  }
  .highlight-leadership { 
    background-color: rgba(21, 128, 61, 0.5) !important; 
    border: none !important; 
    padding: 0 !important;
    margin: 0 !important;
    box-shadow: none !important;
    display: inline !important;
    line-height: normal !important;
    border-radius: 2px !important;
  }
  .highlight-teamwork { 
    background-color: rgba(34, 197, 94, 0.4) !important; 
    border: none !important; 
    padding: 0 !important;
    margin: 0 !important;
    box-shadow: none !important;
    display: inline !important;
    line-height: normal !important;
    border-radius: 2px !important;
  }
  .highlight-initiative { 
    background-color: rgba(22, 163, 74, 0.4) !important; 
    border: none !important; 
    padding: 0 !important;
    margin: 0 !important;
    box-shadow: none !important;
    display: inline !important;
    line-height: normal !important;
    border-radius: 2px !important;
  }
  
  /* Subtle hover effects that don't disrupt text positioning */
  .highlight-actionable:hover,
  .highlight-specifics:hover,
  .highlight-measurable:hover,
  .highlight-redundancy:hover,
  .highlight-tactical:hover {
    background-color: rgba(239, 68, 68, 0.7) !important;
    transition: background-color 0.2s ease !important;
  }

  .highlight-format:hover,
  .highlight-pages:hover,
  .highlight-sections:hover,
  .highlight-spell:hover {
    background-color: rgba(245, 158, 11, 0.7) !important;
    transition: background-color 0.2s ease !important;
  }

  .highlight-analytical:hover,
  .highlight-communication:hover,
  .highlight-leadership:hover,
  .highlight-teamwork:hover,
  .highlight-initiative:hover {
    background-color: rgba(34, 197, 94, 0.7) !important;
    transition: background-color 0.2s ease !important;
  }
`;

// Category-specific keywords for highlighting with section-based grouping
const categoryKeywords = {
  // Quality/Impact Section (RED) - Action-oriented and measurable content
  'highlight-actionable': ['built', 'created', 'implemented', 'integrated', 'executed', 'developed', 'designed', 'managed', 'led', 'established', 'initiated', 'launched', 'delivered', 'achieved', 'accomplished', 'engineered', 'architected', 'deployed', 'optimized', 'automated', 'spearheaded', 'directed', 'coordinated'],
  'highlight-specifics': ['%', 'CGPA', 'GPA', 'score', 'rank', 'percent', 'percentage', 'points', 'rating', 'grade', 'marks', 'years', 'months', 'weeks', 'days', 'hours', '$', 'million', 'thousand', 'billion', 'revenue', 'profit', 'growth', 'increase', 'decrease'],
  'highlight-measurable': ['increased', 'reduced', 'improved', 'achieved', 'enhanced', 'optimized', 'boosted', 'decreased', 'accelerated', 'streamlined', 'maximized', 'minimized', 'scaled', 'grew', 'expanded', 'generated', 'saved', 'exceeded', 'surpassed'],
  'highlight-redundancy': ['responsible', 'worked', 'helped', 'assisted', 'involved', 'participated', 'contributed', 'engaged', 'collaborated', 'coordinated', 'handled', 'dealt', 'performed', 'executed', 'tasked', 'assigned', 'duties', 'activities'],
  'highlight-tactical': ['plan', 'strategy', 'approach', 'methodology', 'framework', 'process', 'system', 'procedure', 'protocol', 'guidelines', 'best practices', 'workflow', 'roadmap', 'architecture', 'blueprint', 'model'],

  // Format/Presentation Section (YELLOW) - Document structure and formatting
  'highlight-format': ['•', '-', '—', '●', '◦', '*', '▪', '▫', '→', '►', 'bullet', 'format', 'layout', 'structure', 'template', 'design'],
  'highlight-pages': ['page', 'pages', 'resume', 'CV', 'document', 'portfolio', 'profile', 'one', 'two', 'three', 'single', 'multiple', 'length'],
  'highlight-sections': ['experience', 'education', 'skills', 'projects', 'achievements', 'certifications', 'summary', 'objective', 'qualifications', 'background', 'expertise', 'contact', 'references', 'awards'],
  'highlight-spell': ['Bachelor', 'Master', 'University', 'College', 'Degree', 'Engineering', 'Management', 'Technology', 'Science', 'Business', 'Computer', 'Software', 'Information', 'Systems', 'Project'],

  // Skills/Competencies Section (GREEN) - Technical and soft skills
  'highlight-analytical': ['analysis', 'data', 'research', 'statistical', 'metrics', 'insights', 'patterns', 'trends', 'evaluation', 'assessment', 'analytics', 'modeling', 'forecasting', 'algorithms', 'Excel', 'SQL', 'Python', 'R', 'Tableau', 'PowerBI'],
  'highlight-communication': ['presentation', 'communication', 'documentation', 'reporting', 'training', 'mentoring', 'teaching', 'writing', 'speaking', 'presenting', 'emails', 'meetings', 'stakeholders', 'clients', 'customers'],
  'highlight-leadership': ['led', 'managed', 'supervised', 'directed', 'coordinated', 'guided', 'mentored', 'oversaw', 'headed', 'administered', 'spearheaded', 'championed', 'pioneered', 'team', 'people', 'staff', 'employees'],
  'highlight-teamwork': ['team', 'collaboration', 'group', 'partner', 'collective', 'cooperative', 'joint', 'shared', 'together', 'cross-functional', 'interdisciplinary', 'collaborative', 'teamwork', 'members', 'colleagues'],
  'highlight-initiative': ['initiated', 'pioneered', 'founded', 'established', 'introduced', 'launched', 'started', 'created', 'developed', 'innovated', 'conceived', 'originated', 'proposed', 'self-motivated', 'proactive', 'independent']
};

// Function to highlight category-specific words in PDF text layer
const highlightCategoryWords = (categoryClass: string) => {
  // Get all highlight classes for clearing
  const allHighlightClasses = Object.keys(categoryKeywords);

  const attemptHighlight = (attempts = 0) => {
    const spans = document.querySelectorAll('.react-pdf__Page__textContent span');
    
    console.log(`Attempt ${attempts + 1}: Found ${spans.length} text spans`);
    
    if (spans.length === 0 && attempts < 10) {
      // If no spans found, wait a bit more and try again
      setTimeout(() => attemptHighlight(attempts + 1), 500);
      return;
    }

    if (spans.length > 0) {
      const keywords = categoryKeywords[categoryClass] || [];
      
      // Create a more flexible regex that handles word boundaries and partial matches
      const regexPattern = keywords.map(keyword => {
        // Escape special regex characters
        const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // For very short keywords like '%' or single characters, match exactly
        if (keyword.length <= 2) {
          return escapedKeyword;
        }
        // For longer keywords, use word boundaries
        return '\\b' + escapedKeyword + '\\b';
      }).join('|');
      
      const regex = new RegExp('(' + regexPattern + ')', 'i');

      let highlightedCount = 0;

      // Clear existing highlights and apply new ones
      spans.forEach(span => {
        // Remove all highlight classes
        allHighlightClasses.forEach(className => {
          span.classList.remove(className);
        });

        // Check if this span's text matches any keywords for the current category
        if (span.textContent && regex.test(span.textContent.trim())) {
          span.classList.add(categoryClass);
          highlightedCount++;
        }
      });

      console.log(`✅ Applied ${categoryClass} to ${highlightedCount} matching spans out of ${spans.length} total spans`);
      console.log(`🔍 Keywords used: ${keywords.join(', ')}`);
      
      if (highlightedCount === 0) {
        console.log(`⚠️ No matches found for ${categoryClass}. This might be normal if the resume doesn't contain these keywords.`);
      }
    } else {
      console.log('❌ No PDF text spans found after multiple attempts');
    }
  };

  // Start the highlighting attempt
  attemptHighlight();
};

const DetailedFeedback = () => {
  const [activeSystemSection, setActiveSystemSection] = useState("impact");
  const [selectedImpactField, setSelectedImpactField] = useState("Actionable");
  const [selectedPresentationField, setSelectedPresentationField] = useState("Number of Pages");
  const [selectedCompetencyField, setSelectedCompetencyField] = useState("Analytical");
  const [resumeData, setResumeData] = useState(null);
  
  // New dynamic analysis state
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [dynamicHighlights, setDynamicHighlights] = useState<DynamicHighlights>({
    spelling: [],
    grammar: [],
    redundancy: [],
    format: [],
    skills: []
  });
  const [activeHighlights, setActiveHighlights] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const hasAnalyzedRef = useRef(false); // Use ref instead of state to prevent re-renders
  
  // Extract misspelled words from dynamic highlights for PDF text layer highlighting
  const misspelledWords = dynamicHighlights.spelling.map(issue => 
    issue.text.toLowerCase().replace(/[^a-z]/g, '')
  ).filter(word => word.length > 0);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Inject CSS styles for highlighting
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = highlightStyles;
    document.head.appendChild(styleElement);

    return () => {
      // Clean up styles when component unmounts
      document.head.removeChild(styleElement);
    };
  }, []);

  // Handle category changes and trigger highlighting
  useEffect(() => {
    let categoryClass = '';
    let sectionName = '';
    
    if (activeSystemSection === 'impact') {
      sectionName = 'Quality/Impact (RED)';
      switch (selectedImpactField) {
        case 'Actionable': categoryClass = 'highlight-actionable'; break;
        case 'Specifics': categoryClass = 'highlight-specifics'; break;
        case 'Measurable': categoryClass = 'highlight-measurable'; break;
        case 'Redundancy': categoryClass = 'highlight-redundancy'; break;
        case 'Tactical': categoryClass = 'highlight-tactical'; break;
      }
    } else if (activeSystemSection === 'presentation') {
      sectionName = 'Format/Presentation (YELLOW)';
      switch (selectedPresentationField) {
        case 'Number of Pages': categoryClass = 'highlight-pages'; break;
        case 'Overall Format': categoryClass = 'highlight-format'; break;
        case 'Essential Sections': categoryClass = 'highlight-sections'; break;
        case 'Section Specific': categoryClass = 'highlight-sections'; break;
        case 'Spell Check': categoryClass = 'highlight-spell'; break;
      }
    } else if (activeSystemSection === 'competencies') {
      sectionName = 'Skills/Competencies (GREEN)';
      switch (selectedCompetencyField) {
        case 'Analytical': categoryClass = 'highlight-analytical'; break;
        case 'Communication': categoryClass = 'highlight-communication'; break;
        case 'Leadership': categoryClass = 'highlight-leadership'; break;
        case 'Teamwork': categoryClass = 'highlight-teamwork'; break;
        case 'Initiative': categoryClass = 'highlight-initiative'; break;
      }
    }

    if (categoryClass) {
      console.log(`🎯 Section: ${sectionName} | Category: ${categoryClass}`);
      highlightCategoryWords(categoryClass);
    }
  }, [activeSystemSection, selectedImpactField, selectedPresentationField, selectedCompetencyField]);

  // Add debugging function to window for manual testing
  useEffect(() => {
    (window as any).testHighlighting = () => {
      console.log('🧪 Manual highlighting test - Testing actionable keywords');
      highlightCategoryWords('highlight-actionable');
    };
    
    (window as any).checkPDFSpans = () => {
      const spans = document.querySelectorAll('.react-pdf__Page__textContent span');
      console.log(`📊 Found ${spans.length} PDF text spans`);
      if (spans.length > 0) {
        console.log('Sample span:', spans[0]);
        console.log('Sample text:', spans[0].textContent);
        
        // Show some sample text from multiple spans
        const sampleTexts = Array.from(spans).slice(0, 10).map(span => span.textContent).join(' ');
        console.log('Sample resume text:', sampleTexts);
      }
      return spans.length;
    };

    (window as any).testKeywordHighlight = (category: string) => {
      console.log(`🎯 Testing keyword highlighting for: ${category}`);
      const validCategories = Object.keys(categoryKeywords);
      if (validCategories.includes(category)) {
        highlightCategoryWords(category);
      } else {
        console.log(`❌ Invalid category. Valid categories are: ${validCategories.join(', ')}`);
      }
    };

    (window as any).listCategories = () => {
      console.log('📋 Available highlight categories:');
      Object.keys(categoryKeywords).forEach(category => {
        console.log(`  ${category}: ${categoryKeywords[category].slice(0, 5).join(', ')}...`);
      });
    };

    return () => {
      delete (window as any).testHighlighting;
      delete (window as any).checkPDFSpans;
      delete (window as any).testKeywordHighlight;
      delete (window as any).listCategories;
    };
  }, []);

  // New function to analyze PDF dynamically
  const analyzePDFDynamically = useCallback(async (fileUrl: string) => {
    if (hasAnalyzedRef.current) return; // Prevent re-analysis
    
    setIsAnalyzing(true);
    hasAnalyzedRef.current = true;
    try {
      console.log('Starting dynamic PDF analysis...');
      const highlights = await DynamicAnalysisEngine.analyzePDF(fileUrl);
      setDynamicHighlights(highlights);
      
      // Also run the existing text analysis if we have extracted text
      // Get the current resume data from localStorage to avoid circular dependency
      const savedAnalysis = localStorage.getItem('resumeAnalysis');
      if (savedAnalysis) {
        const parsedData = JSON.parse(savedAnalysis);
        if (parsedData?.extractedText) {
          const analyzer = new ResumeAnalyzer(parsedData.extractedText);
          const result = analyzer.analyzeAll();
          setAnalysisResult(result);
        }
      }
      
      console.log('Dynamic analysis complete:', highlights);
      const totalIssues = Object.values(highlights).flat().length;
      toast({
        title: "Analysis Complete",
        description: `Found ${totalIssues} potential improvements in your resume`,
        variant: "default",
      });
    } catch (error) {
      console.error('Error analyzing PDF:', error);
      toast({
        title: "Analysis Error",
        description: "Failed to analyze PDF content",
        variant: "destructive",
      });
      hasAnalyzedRef.current = false; // Allow retry on error
    } finally {
      setIsAnalyzing(false);
    }
  }, [toast]); // Removed resumeData dependency

  useEffect(() => {
    // Load resume analysis data from localStorage
    const loadAnalysisData = async () => {
      const savedAnalysis = localStorage.getItem('resumeAnalysis');
      if (savedAnalysis) {
        try {
          const parsedData = JSON.parse(savedAnalysis);
          
          // Get the file URL from sessionStorage if available
          const fileUrl = sessionStorage.getItem('currentResumeFileUrl');
          if (fileUrl && !parsedData.fileUrl) {
            parsedData.fileUrl = fileUrl;
          }
          
          console.log('Resume data loaded:', parsedData);
          console.log('Has extracted text:', !!parsedData.extractedText);
          console.log('Extracted text preview:', parsedData.extractedText?.substring(0, 200));
          
          // Generate fresh analysis data for each new resume upload
          if (parsedData.extractedText) {
            const { generateRandomAnalysis } = await import('../utils/analysisGenerator');
            const freshAnalysis = generateRandomAnalysis();
            
            // Merge fresh analysis with existing data
            const updatedData = {
              ...parsedData,
              ...freshAnalysis,
              fileUrl: parsedData.fileUrl || fileUrl
            };
            
            // Update localStorage with fresh data
            localStorage.setItem('resumeAnalysis', JSON.stringify(updatedData));
            setResumeData(updatedData);
            
            console.log('🔄 Generated fresh analysis:', updatedData);
          } else {
            setResumeData(parsedData);
          }
          
          // Run dynamic PDF analysis only once
          if (parsedData.extractedText && (parsedData.fileUrl || fileUrl) && !hasAnalyzedRef.current) {
            analyzePDFDynamically(parsedData.fileUrl || fileUrl);
          }
        } catch (error) {
          console.error('Error parsing resume analysis data:', error);
          toast({
            title: "Error",
            description: "Failed to load resume analysis data",
            variant: "destructive",
          });
        }
      }
    };

    loadAnalysisData();
  }, [toast]); // Removed analyzePDFDynamically from dependencies

  // Simple function to toggle highlights with static implementation
  const toggleHighlight = useCallback((analysisType: string) => {
    setActiveHighlights(prev => {
      const isCurrentlyActive = prev.includes(analysisType);
      if (isCurrentlyActive) {
        // Remove highlight
        toast({
          title: `${analysisType.charAt(0).toUpperCase() + analysisType.slice(1)} Analysis`,
          description: `Hiding ${analysisType.replace('_', ' ')} highlights`,
          duration: 2000,
        });
        return prev.filter(type => type !== analysisType);
      } else {
        // Add highlight
        toast({
          title: `${analysisType.charAt(0).toUpperCase() + analysisType.slice(1)} Analysis`,
          description: `Showing ${analysisType.replace('_', ' ')} highlights on resume`,
          duration: 2000,
        });
        return [...prev, analysisType];
      }
    });
  }, [toast]);

  // New function to handle issue clicks
  const handleIssueClick = (issue: AnalysisIssue) => {
    toast({
      title: `${issue.type.replace(/([A-Z])/g, ' $1').trim()} Issue`,
      description: issue.suggestion,
      variant: issue.severity === 'high' ? 'destructive' : 'default',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Good Job!":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "On Track!":
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case "Needs Work!":
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Good Job!":
        return "text-success";
      case "On Track!":
        return "text-warning";
      case "Needs Work!":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  const impactMetrics = [
    { title: "Specifics", status: "On Track!", icon: Target },
    { title: "Measurable", status: "On Track!", icon: Target },
    { title: "Actionable", status: "Good Job!", icon: Target },
    { title: "Redundancy", status: "Needs Work!", icon: XCircle },
    { title: "Tactical", status: "Needs Work!", icon: XCircle },
   
  ];

  const presentationMetrics = [
    { title: "Number of Pages", status: "Good Job!", icon: FileText },
    { title: "Overall Format", status: "Needs Work!", icon: FileText },
    { title: "Essential Sections", status: "Good Job!", icon: FileText },
    { title: "Section Specific", status: "Needs Work!", icon: FileText },
    { title: "Spell Check", status: "Needs Work!", icon: FileText }
  ];

  const competencyMetrics = [
    { title: "Analytical", status: "Good Job!", icon: Target },
    { title: "Communication", status: "On Track!", icon: Users },
    { title: "Leadership", status: "On Track!", icon: Users },
    { title: "Teamwork", status: "On Track!", icon: Users },
    { title: "Initiative", status: "Needs Work!", icon: Target }
  ];

  const improvementSteps = [
    {
      title: "Showcase more competencies",
      points: "+13",
      description: "Include more experiences as per your target function to showcase soft skills."
    },
    {
      title: "Remove overused and filler words",
      points: "+7",
      description: "Avoid repetition and the use of filler words in your resume."
    },
    {
      title: "Fix resume layout",
      points: "+3",
      description: "Correct overall format for better readability."
    }
  ];

  // Dynamic content for each field
const getImpactContent = (field: string) => {
  const content = {
    "Actionable": {
      status: "Good Job!",
      description: "Your resume demonstrates strong action-oriented language and impactful content.",
      expandText: "What are Actionable Words?",
      wordsToAvoid: ["responsible for", "worked on", "helped with", "assisted", "involved in"]
    },
    "Specifics": {
      status: "On Track!",
      description: "Your resume includes specific details but could benefit from more quantifiable metrics.",
      expandText: "How to Add More Specifics?",
      wordsToAvoid: ["many", "several", "some", "various", "multiple"]
    },
    "Redundancy": {
      status: "Needs Work!",
      description: "Some words and phrases are being overused throughout your resume.",
      expandText: "Common Redundant Words to Avoid",
      wordsToAvoid: ["hardworking", "team player", "detail-oriented", "self-motivated", "excellent communication"]
    },
    "Tactical": {
      status: "Needs Work!",
      description: "Your resume contains words that should be avoided or replaced with stronger alternatives.",
      expandText: "List of Words to Avoid",
      wordsToAvoid: ["synergy", "think outside the box", "go-getter", "rockstar", "ninja"]
    }
  };
  return content[field] || content["Actionable"];
};

  const getPresentationContent = (field: string) => {
    const content = {
      "Number of Pages": {
        status: "Good Job!",
        description: "Your resume meets the standard guidelines for the number of pages.",
        expandText: "Deciding the Length of Resume"
      },
      "Overall Format": {
        status: "Needs Work!",
        description: "The overall format of your resume needs improvement for better readability.",
        expandText: "Resume Formatting Best Practices"
      },
      "Essential Sections": {
        status: "Good Job!",
        description: "Your resume includes all the essential sections required.",
        expandText: "Must-Have Resume Sections"
      },
      "Section Specific": {
        status: "Needs Work!",
        description: "Some sections need specific formatting adjustments.",
        expandText: "Section-Specific Guidelines"
      },
      "Spell Check": {
        status: "Needs Work!",
        description: "There are spelling and grammar errors that need to be corrected.",
        expandText: "Common Spelling Mistakes"
      }
    };
    return content[field] || content["Number of Pages"];
  };

  const getCompetencyContent = (field: string) => {
    const content = {
      "Analytical": {
        status: "Good Job!",
        description: "You are doing a great job reflecting your analytical skills!",
        expandText: "What are Analytical Skills?",
        experiences: ["Application Framework", "Server Design", "Product Control", "Product Strategies", "Web Application", "Wireframing"]
      },
      "Communication": {
        status: "On Track!",
        description: "Your communication skills are well represented but could be enhanced further.",
        expandText: "What are Communication Skills?",
        experiences: ["Presentation Skills", "Team Collaboration", "Client Interaction", "Documentation", "Public Speaking", "Cross-functional Teams"]
      },
      "Leadership": {
        status: "On Track!",
        description: "Leadership qualities are present but need more prominent examples.",
        expandText: "What are Leadership Skills?",
        experiences: ["Project Management", "Team Leading", "Mentoring", "Decision Making", "Strategic Planning", "Conflict Resolution"]
      },
      "Teamwork": {
        status: "On Track!",
        description: "Teamwork skills are evident but could be strengthened with more examples.",
        expandText: "What are Teamwork Skills?",
        experiences: ["Collaborative Projects", "Cross-team Coordination", "Peer Support", "Group Problem Solving", "Shared Responsibilities", "Team Building"]
      },
      "Initiative": {
        status: "Needs Work!",
        description: "Initiative skills need more representation in your resume.",
        expandText: "What are Initiative Skills?",
        experiences: ["Innovation Projects", "Process Improvement", "Self-directed Learning", "Problem Identification", "Proactive Solutions", "New Ideas Implementation"]
      }
    };
    return content[field] || content["Analytical"];
  };

  // Handle navigation and actions
  const handleBackToDashboard = () => {
    navigate('/');
  };

  const handleBackToAnalysis = () => {
    navigate('/resume-analysis');
  };

  const handleShareReport = () => {
    toast({
      title: "Share Report",
      description: "Report sharing functionality coming soon!",
    });
  };

  const handleDownloadReport = () => {
    toast({
      title: "Download Report", 
      description: "Report download will be available soon!",
    });
  };

  const handleSendEmail = () => {
    toast({
      title: "Email Report",
      description: "Email functionality will be implemented soon!",
    });
  };

  const handleManualAnalysis = async () => {
    if (resumeData?.fileUrl) {
      hasAnalyzedRef.current = false; // Reset analysis flag
      
      // Generate fresh analysis data
      try {
        const { generateRandomAnalysis } = await import('../utils/analysisGenerator');
        const freshAnalysis = generateRandomAnalysis();
        
        // Update with fresh data
        const updatedData = {
          ...resumeData,
          ...freshAnalysis,
          uploadTime: new Date().toISOString() // Track when analysis was generated
        };
        
        // Update localStorage and state
        localStorage.setItem('resumeAnalysis', JSON.stringify(updatedData));
        setResumeData(updatedData);
        
        // Run PDF analysis with fresh data
        analyzePDFDynamically(resumeData.fileUrl);
        
        toast({
          title: "Analysis Updated",
          description: "Fresh analysis generated with new scores!",
          variant: "default",
        });
        
        console.log('🔄 Manual analysis - Fresh data generated:', updatedData);
      } catch (error) {
        console.error('Error generating fresh analysis:', error);
        toast({
          title: "Analysis Error",
          description: "Failed to generate fresh analysis",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "No Resume Found",
        description: "Please upload a resume first",
        variant: "destructive",
      });
    }
  };

  const handleTestHighlights = () => {
    // Add test highlights to demonstrate functionality
    const testHighlights: DynamicHighlights = {
      spelling: [
        {
          id: 'test-spell-1',
          type: 'spelling',
          text: 'experiance',
          suggestion: 'Change "experiance" to "experience"',
          coordinates: {
            top: '15%',
            left: '25%',
            width: '10%',
            height: '2%'
          },
          color: '#ef4444'
        }
      ],
      grammar: [
        {
          id: 'test-grammar-1',
          type: 'grammar',
          text: 'was responsible for',
          suggestion: 'Use stronger action verbs like "managed" or "led"',
          coordinates: {
            top: '35%',
            left: '20%',
            width: '15%',
            height: '2%'
          },
          color: '#f97316'
        }
      ],
      redundancy: [],
      format: [],
      skills: []
    };
    
    setDynamicHighlights(testHighlights);
    toast({
      title: "Test Highlights Added",
      description: "Click on spelling or grammar buttons to see highlights",
      variant: "default",
    });
  };

  return (
    <div className="min-h-screen bg-dashboard-bg">
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
      `}</style>
      
      <Header />
      
      <div className="p-6">
        {/* Header */}
        <motion.div className="mb-6" {...animations.fadeIn}>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBackToDashboard}
              className="hover:bg-muted p-1 h-auto"
              animated={true}
            >
              <Home className="h-4 w-4 mr-1" />
              Student Dashboard
            </Button>
            <span>|</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBackToAnalysis}
              className="hover:bg-muted p-1 h-auto"
              animated={true}
            >
              Resume Module
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <motion.h1 
              className="text-xl font-semibold text-foreground"
              {...animations.slideInFromLeft}
            >
              Resume Feedback
            </motion.h1>
            <motion.div 
              className="flex gap-2"
              {...animations.slideInFromRight}
            >
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleManualAnalysis}
                disabled={isAnalyzing}
                animated={true}
                condition="info"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mr-2"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Analyze Resume
                  </>
                )}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleTestHighlights}
                animated={true}
                condition="warning"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Test Highlights
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleDownloadReport}
                animated={true}
                condition="info"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleShareReport}
                animated={true}
                condition="success"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSendEmail}
                animated={true}
                condition="info"
              >
                <Send className="h-4 w-4 mr-2" />
                Email
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div {...animations.fadeIn} transition={{ delay: 0.3 }}>
          <Tabs defaultValue="summary" className="space-y-6">
            <TabsList className="grid w-fit grid-cols-4 bg-muted">
              <TabsTrigger value="summary" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Summary
              </TabsTrigger>
              <TabsTrigger value="system" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                System Feedback
            </TabsTrigger>
            {/* <TabsTrigger value="bullet" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Bullet Level
            </TabsTrigger>
            <TabsTrigger value="help" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Highlighting Guide
            </TabsTrigger> */}
          </TabsList>

          <TabsContent value="summary" className="space-y-6" animated={true}>
            <div className="grid grid-cols-4 gap-6">
              {/* Main Content - 3 columns */}
              <div className="col-span-3 space-y-6">
                {/* Overall Score */}
                {/* Overall Score Card */}
                <motion.div {...animations.fadeIn} transition={{ delay: 0.2 }}>
                  <Card className="p-6 bg-gradient-card border-0 shadow-moderate" animated={true} hoverEffect={true}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <motion.div 
                          className="p-3 bg-muted rounded-lg"
                          {...animations.iconHover}
                        >
                          <TrendingUp className="h-6 w-6 text-muted-foreground" />
                        </motion.div>
                        <div>
                          <h2 className="text-lg font-semibold text-foreground">Overall Score</h2>
                          <p className="text-sm text-muted-foreground">
                            {isAnalyzing ? "Analyzing your resume..." : "RScan considers lot of parameters inside 3 core modules. Check how you performed on these parameters"}
                          </p>
                        </div>
                      </div>
                      <motion.div 
                        className="text-center"
                        animate={{
                          scale: [1, 1.05, 1]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <div className="w-20 h-20 bg-warning rounded-full flex items-center justify-center">
                          {isAnalyzing ? (
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                          ) : (
                            <span className="text-2xl font-bold text-white">
                              {resumeData?.score || Math.max(100 - (
                                Object.values(dynamicHighlights).flat().length * 5
                              ), 50)}
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">/100</span>
                      </motion.div>
                    </div>
                  </Card>
                </motion.div>

                {/* Metrics Grid */}
                <motion.div 
                  className="grid grid-cols-3 gap-6"
                  {...animations.staggerContainer}
                >
                  {/* Impact */}
                  <motion.div {...animations.staggerItem} transition={{ delay: 0.1 }}>
                    <Card className="p-6 bg-gradient-card border-0 shadow-moderate" animated={true} hoverEffect={true}>
                      <div className="text-center mb-4">
                        <motion.div 
                          className="text-3xl font-bold text-success mb-1"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                        >
                          {resumeData?.metrics?.[0]?.score || 28}
                        </motion.div>
                        <div className="text-sm text-muted-foreground">/{resumeData?.metrics?.[0]?.maxScore || 40}</div>
                        <h3 className="font-semibold text-foreground mt-2">Quality</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Focuses on the quality of content and its impact on recruiters.
                        </p>
                      </div>
                      
                      <div className="w-full bg-muted rounded-full h-2 mb-4">
                        <Progress value={70} animated={true} color="success" />
                      </div>

                      <motion.div 
                        className="space-y-3"
                        {...animations.staggerContainer}
                      >
                        {impactMetrics.map((metric, index) => (
                          <motion.div 
                            key={index}
                            {...animations.staggerItem}
                            transition={{ delay: 0.8 + index * 0.1 }}
                            whileHover={{ 
                              scale: 1.02, 
                              x: 5,
                              transition: { duration: 0.2 }
                            }}
                            className="flex items-center justify-between p-2 rounded-lg transition-all duration-300 hover:bg-muted/30 hover:shadow-sm group cursor-pointer"
                          >
                            <div className="flex items-center space-x-2">
                              <motion.div whileHover={{ rotate: 10 }}>
                                <metric.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                              </motion.div>
                              <span className="text-sm text-foreground group-hover:font-medium transition-all duration-300">{metric.title}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <motion.div whileHover={{ scale: 1.2 }}>
                                {getStatusIcon(metric.status)}
                              </motion.div>
                              <Badge 
                                variant={metric.status === "Good Job!" ? "success" : 
                                        metric.status === "On Track!" ? "warning" : "destructive"}
                                animated={true}
                                className="text-xs group-hover:font-semibold transition-all duration-300"
                              >
                                {metric.status}
                              </Badge>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    </Card>
                  </motion.div>

                  {/* Presentation */}
                  <motion.div {...animations.staggerItem} transition={{ delay: 0.2 }}>
                    <Card className="p-6 bg-gradient-card border-0 shadow-moderate" animated={true} hoverEffect={true}>
                      <div className="text-center mb-4">
                        <motion.div 
                          className="text-3xl font-bold text-success mb-1"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                        >
                          {resumeData?.metrics?.[1]?.score || 23}
                        </motion.div>
                        <div className="text-sm text-muted-foreground">/{resumeData?.metrics?.[1]?.maxScore || 30}</div>
                        <h3 className="font-semibold text-foreground mt-2">Format</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Focuses on whether your resume is in sync with format requirements.
                        </p>
                      </div>
                      
                      <div className="w-full bg-muted rounded-full h-2 mb-4">
                        <Progress value={77} animated={true} color="success" />
                      </div>

                      <motion.div 
                        className="space-y-3"
                        {...animations.staggerContainer}
                      >
                        {presentationMetrics.map((metric, index) => (
                          <motion.div 
                            key={index}
                            {...animations.staggerItem}
                            transition={{ delay: 0.9 + index * 0.1 }}
                            whileHover={{ 
                              scale: 1.02, 
                              x: 5,
                              transition: { duration: 0.2 }
                            }}
                            className="flex items-center justify-between p-2 rounded-lg transition-all duration-300 hover:bg-muted/30 hover:shadow-sm group cursor-pointer"
                          >
                            <div className="flex items-center space-x-2">
                              <motion.div whileHover={{ rotate: 10 }}>
                                <metric.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                              </motion.div>
                              <span className="text-sm text-foreground group-hover:font-medium transition-all duration-300">{metric.title}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <motion.div whileHover={{ scale: 1.2 }}>
                                {getStatusIcon(metric.status)}
                              </motion.div>
                              <Badge 
                                variant={metric.status === "Good Job!" ? "success" : 
                                        metric.status === "On Track!" ? "warning" : "destructive"}
                                animated={true}
                                className="text-xs group-hover:font-semibold transition-all duration-300"
                              >
                                {metric.status}
                              </Badge>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    </Card>
                  </motion.div>

                  {/* Competency */}
                  <motion.div {...animations.staggerItem} transition={{ delay: 0.3 }}>
                    <Card className="p-6 bg-gradient-card border-0 shadow-moderate" animated={true} hoverEffect={true}>
                      <div className="text-center mb-4">
                        <motion.div 
                          className="text-3xl font-bold text-warning mb-1"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
                        >
                          {resumeData?.metrics?.[2]?.score || 17}
                        </motion.div>
                        <div className="text-sm text-muted-foreground">/{resumeData?.metrics?.[2]?.maxScore || 30}</div>
                        <h3 className="font-semibold text-foreground mt-2">Competency</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Focuses on whether you are reflecting essential competencies through your resume.
                        </p>
                      </div>
                      
                      <div className="w-full bg-muted rounded-full h-2 mb-4">
                        <Progress value={57} animated={true} color="warning" />
                      </div>

                      <motion.div 
                        className="space-y-3"
                        {...animations.staggerContainer}
                      >
                        {competencyMetrics.map((metric, index) => (
                          <motion.div 
                            key={index}
                            {...animations.staggerItem}
                            transition={{ delay: 1.0 + index * 0.1 }}
                            whileHover={{ 
                              scale: 1.02, 
                              x: 5,
                              transition: { duration: 0.2 }
                            }}
                            className="flex items-center justify-between p-2 rounded-lg transition-all duration-300 hover:bg-muted/30 hover:shadow-sm group cursor-pointer"
                          >
                            <div className="flex items-center space-x-2">
                              <motion.div whileHover={{ rotate: 10 }}>
                                <metric.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                              </motion.div>
                              <span className="text-sm text-foreground group-hover:font-medium transition-all duration-300">{metric.title}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <motion.div whileHover={{ scale: 1.2 }}>
                                {getStatusIcon(metric.status)}
                              </motion.div>
                              <Badge 
                                variant={metric.status === "Good Job!" ? "success" : 
                                        metric.status === "On Track!" ? "warning" : "destructive"}
                                animated={true}
                                className="text-xs group-hover:font-semibold transition-all duration-300"
                              >
                                {metric.status}
                              </Badge>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    </Card>
                  </motion.div>
                </motion.div>

                {/* Status Legend */}
                <motion.div 
                  className="flex justify-center space-x-8"
                  {...animations.fadeIn}
                  transition={{ delay: 1.5 }}
                >
                  <motion.div 
                    className="flex items-center space-x-2"
                    whileHover={{ scale: 1.05 }}
                  >
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm text-success">Good Job!</span>
                  </motion.div>
                  <motion.div 
                    className="flex items-center space-x-2"
                    whileHover={{ scale: 1.05 }}
                  >
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    <span className="text-sm text-warning">On Track!</span>
                  </motion.div>
                  <motion.div 
                    className="flex items-center space-x-2"
                    whileHover={{ scale: 1.05 }}
                  >
                    <XCircle className="h-4 w-4 text-destructive" />
                    <span className="text-sm text-destructive">Needs Work!</span>
                  </motion.div>
                </motion.div>
              </div>

              {/* Right Sidebar */}
              <div className="col-span-1 space-y-6">
                <Card className="p-6 bg-gradient-card border-0 shadow-moderate">
                  <h3 className="font-semibold text-foreground mb-4">How to improve your Resume?</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Get personalized feedback and sample suggestions on your Resume
                  </p>
                  
                  <Button 
                    className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90 mb-6"
                    onClick={() => {
                      toast({
                        title: "Detailed Feedback",
                        description: "You're already viewing the detailed feedback page!",
                      });
                    }}
                  >
                    View Detailed Feedback
                  </Button>

                  <div>
                    <h4 className="font-semibold text-primary mb-4">Steps to Improve Your Score</h4>
                    <div className="space-y-4">
                      {(resumeData?.improvementSteps || improvementSteps).map((step, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <TrendingUp className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-foreground text-sm">{step.title}</span>
                              <Badge variant="secondary" className="bg-primary text-primary-foreground px-2 py-0.5 text-xs">
                                {step.points}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{step.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="system" className="h-full" animated={true}>
            <motion.div 
              className="flex min-h-[calc(100vh-250px)]"
              {...animations.fadeIn}
              transition={{ duration: 0.6 }}
            >
              {/* Left 50% - Feedback Interface */}
              <div className="w-1/2 pr-3 flex flex-col">
                {/* Enhanced Header Section */}
                <motion.div 
                  className="bg-gradient-to-br from-orange-50 via-yellow-50 to-amber-50 p-6 rounded-xl mb-4 flex-shrink-0 border-2 border-orange-200 shadow-lg"
                  {...animations.slideUp}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <motion.div 
                      className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-xl px-4 py-2 text-2xl font-bold shadow-lg"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <motion.span
                        key={resumeData?.score || 68}
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        {resumeData?.score || 68}
                      </motion.span>
                      <span className="text-lg text-gray-500">/100</span>
                    </motion.div>
                    <div>
                      <h3 className="text-gray-800 font-bold text-lg">Resume Score</h3>
                      <p className="text-gray-600 text-sm">Click sections below for detailed feedback</p>
                    </div>
                  </div>
                  
                  {/* Enhanced Section Tabs */}
                  <motion.div 
                    className="grid grid-cols-3 gap-4"
                    variants={animations.staggerContainer}
                    initial="initial"
                    animate="animate"
                  >
                    {[
                      { 
                        key: "impact", 
                        title: "Quality", 
                        score: resumeData?.metrics?.[0]?.score || 28, 
                        maxScore: resumeData?.metrics?.[0]?.maxScore || 40,
                        color: "green",
                        icon: CheckCircle,
                        status: "Good Job!"
                      },
                      { 
                        key: "presentation", 
                        title: "Format", 
                        score: resumeData?.metrics?.[1]?.score || 23, 
                        maxScore: resumeData?.metrics?.[1]?.maxScore || 30,
                        color: "green",
                        icon: CheckCircle,
                        status: "Good Job!"
                      },
                      { 
                        key: "competencies", 
                        title: "Skills", 
                        score: resumeData?.metrics?.[2]?.score || 17, 
                        maxScore: resumeData?.metrics?.[2]?.maxScore || 30,
                        color: "orange",
                        icon: Clock,
                        status: "On Track!"
                      }
                    ].map((section, index) => (
                      <motion.div 
                        key={section.key}
                        className={`relative text-center cursor-pointer p-4 rounded-xl border-2 transition-all duration-300 ${
                          activeSystemSection === section.key 
                            ? `bg-${section.color}-100 border-${section.color}-500 shadow-lg transform scale-105` 
                            : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-md"
                        }`}
                        onClick={() => setActiveSystemSection(section.key)}
                        variants={animations.staggerItem}
                        whileHover={{ 
                          y: -2, 
                          scale: activeSystemSection === section.key ? 1.05 : 1.02,
                          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {/* Active Indicator */}
                        <AnimatePresence>
                          {activeSystemSection === section.key && (
                            <motion.div
                              className={`absolute -top-1 -right-1 w-4 h-4 bg-${section.color}-500 rounded-full`}
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              exit={{ scale: 0, rotate: 180 }}
                              transition={{ duration: 0.3 }}
                            />
                          )}
                        </AnimatePresence>

                        <motion.div 
                          className={`text-${section.color}-600 text-xl font-bold mb-2`}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.7 + index * 0.1, type: "spring" }}
                        >
                          <motion.span
                            key={`${section.key}-${section.score}`}
                            initial={{ y: -10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            {section.score}
                          </motion.span>
                          <span className="text-sm text-gray-500">/{section.maxScore}</span>
                        </motion.div>
                        
                        <div className="text-sm text-gray-700 flex items-center justify-center gap-2">
                          <span className="font-medium">{section.title}</span>
                          <motion.div
                            whileHover={{ rotate: 360, scale: 1.2 }}
                            transition={{ duration: 0.3 }}
                          >
                            <section.icon className={`h-4 w-4 text-${section.color}-500`} />
                          </motion.div>
                        </div>

                        {/* Progress bar */}
                        <div className="mt-3 w-full bg-gray-200 rounded-full h-1.5">
                          <motion.div 
                            className={`bg-${section.color}-500 h-1.5 rounded-full`}
                            initial={{ width: 0 }}
                            animate={{ width: `${(section.score / section.maxScore) * 100}%` }}
                            transition={{ delay: 1 + index * 0.1, duration: 1, ease: "easeOut" }}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>

                {/* Content area */}
                <div className="flex-1 min-h-0">

                {/* Dynamic Content based on active section */}
                <AnimatePresence mode="wait">
                  {activeSystemSection === "impact" && (
                    <motion.div 
                      key="impact"
                      className="flex gap-4"
                      initial={{ opacity: 0, x: 100 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                    >
                      {/* Enhanced Categories Sidebar */}
                      <motion.div 
                        className="w-40 space-y-2"
                        variants={animations.staggerContainer}
                        initial="initial"
                        animate="animate"
                      >
                        {impactMetrics.map((metric, index) => (
                          <motion.div 
                            key={index}
                            className={`group relative flex items-center gap-3 p-3 cursor-pointer rounded-xl border-2 transition-all duration-300 ${
                              selectedImpactField === metric.title 
                                ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-500 shadow-lg transform scale-105" 
                                : "bg-white border-gray-200 hover:border-green-300 hover:shadow-md"
                            }`}
                            onClick={() => {
                              setSelectedImpactField(metric.title);
                              console.log(`🎯 Impact field selected: ${metric.title}`);
                            }}
                            variants={animations.staggerItem}
                            whileHover={{ 
                              x: 5, 
                              scale: selectedImpactField === metric.title ? 1.05 : 1.02,
                              boxShadow: metric.status === "Good Job!" 
                                ? "0 10px 25px -5px rgba(16, 185, 129, 0.3)" 
                                : "0 10px 25px -5px rgba(239, 68, 68, 0.3)"
                            }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {/* Active Indicator */}
                            <AnimatePresence>
                              {selectedImpactField === metric.title && (
                                <motion.div
                                  className="absolute -left-1 top-1/2 w-1 h-8 bg-green-500 rounded-full"
                                  initial={{ scaleY: 0, y: "-50%" }}
                                  animate={{ scaleY: 1, y: "-50%" }}
                                  exit={{ scaleY: 0, y: "-50%" }}
                                  transition={{ duration: 0.3 }}
                                />
                              )}
                            </AnimatePresence>

                            <motion.div 
                              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                                metric.status === "Good Job!" 
                                  ? "bg-green-100 border-green-300" 
                                  : "bg-red-100 border-red-300"
                              }`}
                              whileHover={{ 
                                rotate: 360, 
                                scale: 1.1,
                                backgroundColor: metric.status === "Good Job!" ? "#10b981" : "#ef4444"
                              }}
                              transition={{ duration: 0.3 }}
                            >
                              <motion.div
                                whileHover={{ scale: 1.2 }}
                                transition={{ duration: 0.2 }}
                              >
                                {metric.status === "Good Job!" ? 
                                  <CheckCircle className="h-5 w-5 text-green-600 group-hover:text-white" /> : 
                                  <AlertCircle className="h-5 w-5 text-red-600 group-hover:text-white" />
                                }
                              </motion.div>
                            </motion.div>
                            
                            <div className="flex-1">
                              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                                {metric.title}
                              </span>
                              <motion.div 
                                className="w-full bg-gray-200 rounded-full h-1 mt-1"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: selectedImpactField === metric.title ? 1 : 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <motion.div 
                                  className={`h-1 rounded-full ${
                                    metric.status === "Good Job!" ? "bg-green-500" : "bg-red-500"
                                  }`}
                                  initial={{ width: 0 }}
                                  animate={{ 
                                    width: selectedImpactField === metric.title ? "100%" : "0%" 
                                  }}
                                  transition={{ delay: 0.2, duration: 0.5 }}
                                />
                              </motion.div>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>

                    {/* Feedback Content */}
                    <div className="flex-1 bg-white border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">{selectedImpactField}</h3>
                        <Badge className={`${
                          getImpactContent(selectedImpactField).status === "Good Job!" ? "bg-green-100 text-green-700" :
                          getImpactContent(selectedImpactField).status === "On Track!" ? "bg-orange-100 text-orange-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {getImpactContent(selectedImpactField).status}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-4">
                        {getImpactContent(selectedImpactField).description}
                      </p>
                      
                      {/* Words to Avoid Section */}
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-800 mb-3">Words to Avoid:</h4>
                        <div className="flex flex-wrap gap-2">
                          {getImpactContent(selectedImpactField).wordsToAvoid.map((word, index) => (
                            <span 
                              key={index}
                              className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-sm font-medium"
                            >
                              {word}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div 
                        className="bg-gray-50 border rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-gray-100"
                        onClick={() => {
                          const content = getImpactContent(selectedImpactField);
                          let description = "";
                          
                          switch(selectedImpactField) {
                            case "Actionable":
                              description = "Use strong action verbs like 'Led', 'Developed', 'Implemented', 'Managed', 'Created' instead of passive phrases. Start each bullet point with a powerful verb that shows your direct contribution.";
                              break;
                            case "Specifics":
                              description = "Add numbers, percentages, and concrete metrics. Instead of 'Increased sales', write 'Increased sales by 25% over 6 months, generating $50K additional revenue'. Quantify your achievements wherever possible.";
                              break;
                            case "Redundancy":
                              description = "Avoid repeating the same words and phrases throughout your resume. Use varied vocabulary and focus on unique contributions. Replace generic terms with specific, industry-relevant language.";
                              break;
                            case "Tactical":
                              description = "Eliminate buzzwords and clichés that don't add value. Focus on concrete skills and achievements rather than subjective personality traits. Show, don't tell your capabilities through specific examples.";
                              break;
                            default:
                              description = "Focus on creating impactful content that demonstrates your value to potential employers.";
                          }
                          
                          toast({
                            title: content.expandText,
                            description: description,
                          });
                        }}
                      >
                        <span className="text-sm font-medium text-gray-700">{getImpactContent(selectedImpactField).expandText}</span>
                        <Plus className="h-4 w-4 text-gray-500" />
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeSystemSection === "presentation" && (
                  <motion.div 
                    key="presentation"
                    className="flex gap-4"
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  >
                    {/* Categories Sidebar */}
                    <div className="w-36 space-y-1">
                      {presentationMetrics.map((metric, index) => (
                        <div 
                          key={index} 
                          className={`flex items-center gap-3 p-2 cursor-pointer rounded ${
                            selectedPresentationField === metric.title ? "bg-white border-l-4 border-green-500" : "hover:bg-gray-50"
                          }`}
                          onClick={() => {
                            setSelectedPresentationField(metric.title);
                            console.log(`🎯 Presentation field selected: ${metric.title}`);
                          }}
                        >
                          <div className={`w-8 h-8 ${metric.status === "Good Job!" ? "bg-green-100" : "bg-red-100"} rounded-full flex items-center justify-center`}>
                            {metric.status === "Good Job!" ? 
                              <CheckCircle className="h-4 w-4 text-green-600" /> : 
                              <AlertCircle className="h-4 w-4 text-red-600" />
                            }
                          </div>
                          <span className="text-sm font-medium text-gray-700">{metric.title}</span>
                        </div>
                      ))}
                    </div>

                    {/* Feedback Content */}
                    <div className="flex-1 bg-white border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">{selectedPresentationField}</h3>
                        <Badge className={`${
                          getPresentationContent(selectedPresentationField).status === "Good Job!" ? "bg-green-100 text-green-700" :
                          getPresentationContent(selectedPresentationField).status === "On Track!" ? "bg-orange-100 text-orange-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {getPresentationContent(selectedPresentationField).status}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-6">
                        {getPresentationContent(selectedPresentationField).description}
                      </p>
                      
                      <div 
                        className="bg-gray-50 border rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-gray-100"
                        onClick={() => {
                          const content = getPresentationContent(selectedPresentationField);
                          let description = "";
                          
                          switch(selectedPresentationField) {
                            case "Number of Pages":
                              description = "Keep your resume to 1-2 pages for most positions. Entry-level: 1 page, Experienced professionals: 1-2 pages, Senior executives: 2-3 pages max. Prioritize most relevant and recent experiences.";
                              break;
                            case "Overall Format":
                              description = "Use consistent fonts (Arial, Calibri, or Times New Roman), proper margins (0.5-1 inch), clear section headers, and adequate white space. Ensure your resume is ATS-friendly with standard formatting.";
                              break;
                            case "Essential Sections":
                              description = "Include: Contact Information, Professional Summary/Objective, Work Experience, Education, Skills. Optional: Projects, Certifications, Volunteer Work, Awards. Tailor sections to your industry and experience level.";
                              break;
                            case "Section Specific":
                              description = "Work Experience: List in reverse chronological order with clear job titles, company names, dates, and 3-5 bullet points per role. Education: Include degree, institution, graduation year, and relevant coursework/honors.";
                              break;
                            case "Spell Check":
                              description = "Proofread multiple times, use spell-check tools, read aloud, and have someone else review. Check for grammar, punctuation, consistency in tenses, and proper formatting throughout the document.";
                              break;
                            default:
                              description = "Focus on creating a well-formatted, professional resume that's easy to read and ATS-compatible.";
                          }
                          
                          toast({
                            title: content.expandText,
                            description: description,
                          });
                        }}
                      >
                        <span className="text-sm font-medium text-gray-700">{getPresentationContent(selectedPresentationField).expandText}</span>
                        <Plus className="h-4 w-4 text-gray-500" />
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeSystemSection === "competencies" && (
                  <motion.div 
                    key="competencies"
                    className="flex gap-4"
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  >
                    {/* Categories Sidebar */}
                    <div className="w-36 space-y-1">
                      {competencyMetrics.map((metric, index) => (
                        <div 
                          key={index} 
                          className={`flex items-center gap-3 p-2 cursor-pointer rounded ${
                            selectedCompetencyField === metric.title ? "bg-white border-l-4 border-green-500" : "hover:bg-gray-50"
                          }`}
                          onClick={() => {
                            setSelectedCompetencyField(metric.title);
                            console.log(`🎯 Competency field selected: ${metric.title}`);
                          }}
                        >
                          <div className={`w-8 h-8 ${
                            metric.status === "Good Job!" ? "bg-green-100" : 
                            metric.status === "On Track!" ? "bg-orange-100" : "bg-red-100"
                          } rounded-full flex items-center justify-center`}>
                            {metric.status === "Good Job!" ? 
                              <CheckCircle className="h-4 w-4 text-green-600" /> : 
                              metric.status === "On Track!" ?
                              <Clock className="h-4 w-4 text-orange-600" /> :
                              <AlertCircle className="h-4 w-4 text-red-600" />
                            }
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">{metric.title}</span>
                            {metric.status !== "Good Job!" && (
                              <Clock className="h-3 w-3 text-orange-500" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Feedback Content */}
                    <div className="flex-1 bg-white border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <ChevronLeft className="h-4 w-4 text-gray-400" />
                        <h3 className="text-lg font-semibold text-gray-800">{selectedCompetencyField} Skills</h3>
                        <Badge className={`${
                          getCompetencyContent(selectedCompetencyField).status === "Good Job!" ? "bg-green-100 text-green-700" :
                          getCompetencyContent(selectedCompetencyField).status === "On Track!" ? "bg-orange-100 text-orange-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {getCompetencyContent(selectedCompetencyField).status}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-6">
                        {getCompetencyContent(selectedCompetencyField).description}
                      </p>
                      
                      <div 
                        className="bg-gray-50 border rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-gray-100 mb-6"
                        onClick={() => {
                          const content = getCompetencyContent(selectedCompetencyField);
                          let description = "";
                          
                          switch(selectedCompetencyField) {
                            case "Analytical":
                              description = "Analytical skills involve breaking down complex problems, examining data, identifying patterns, and making data-driven decisions. Show examples of research, data analysis, problem-solving, and strategic thinking in your experience.";
                              break;
                            case "Communication":
                              description = "Communication skills include verbal, written, and presentation abilities. Highlight experiences in public speaking, writing reports, leading meetings, training others, or collaborating across teams and departments.";
                              break;
                            case "Leadership":
                              description = "Leadership skills demonstrate your ability to guide, motivate, and influence others. Include examples of managing teams, leading projects, mentoring colleagues, driving change initiatives, or taking ownership of outcomes.";
                              break;
                            case "Teamwork":
                              description = "Teamwork skills show your ability to collaborate effectively with others. Highlight cross-functional projects, team achievements, conflict resolution, supporting colleagues, and contributing to group success.";
                              break;
                            case "Initiative":
                              description = "Initiative skills demonstrate proactive behavior and self-motivation. Show examples of identifying opportunities, proposing solutions, starting new projects, learning new skills independently, or going beyond job requirements.";
                              break;
                            default:
                              description = "Focus on demonstrating your core competencies through specific examples and measurable achievements in your work experience.";
                          }
                          
                          toast({
                            title: content.expandText,
                            description: description,
                          });
                        }}
                      >
                        <span className="text-sm font-medium text-gray-700">{getCompetencyContent(selectedCompetencyField).expandText}</span>
                        <Plus className="h-4 w-4 text-gray-500" />
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-gray-800 mb-3">Experiences you can consider</h4>
                        <div className="flex flex-wrap gap-2">
                          {getCompetencyContent(selectedCompetencyField).experiences?.map((experience, index) => (
                            <span key={index} className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 text-sm rounded">
                              {experience}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                </AnimatePresence>
                </div>
              </div>

              {/* Right 50% - Full Size Resume with Dynamic Highlights */}
              <div className="w-1/2 relative h-[calc(100vh-20px)]">
                {resumeData?.fileUrl ? (
                  <>
                    {/* PDF Viewer - Fit width, allow vertical scroll */}
                    <div className="h-full w-full relative">
                      <PDFViewerFitWidth
                        fileUrl={resumeData.fileUrl}
                        highlightedWords={[]} // We'll use our own highlighting system
                        misspelledWords={misspelledWords} // Dynamic misspelled words from analysis
                      />
                    </div>
                    
                    {/* Dynamic Highlight Overlays */}
                    <AnimatePresence>
                      {(() => {
                        console.log('Rendering highlights for types:', activeHighlights);
                        console.log('Available highlights:', dynamicHighlights);
                        return null;
                      })()}
                      {activeHighlights.length > 0 && Object.values(dynamicHighlights).flat().length > 0 && (
                        <div className="absolute inset-0 pointer-events-none">
                          {activeHighlights.map(highlightType => 
                            dynamicHighlights[highlightType as keyof DynamicHighlights]
                              ?.map(highlight => {
                                console.log('Rendering highlight:', highlight);
                                return (
                                  <motion.div
                                    key={highlight.id}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 0.7, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ duration: 0.3 }}
                                    className="absolute rounded-sm cursor-pointer pointer-events-auto"
                                    style={{
                                      top: highlight.coordinates.top,
                                      left: highlight.coordinates.left,
                                      width: highlight.coordinates.width,
                                      height: highlight.coordinates.height,
                                      backgroundColor: highlight.color,
                                      border: '2px solid rgba(255,255,255,0.5)',
                                      zIndex: 10,
                                    } as CSSProperties}
                                    onClick={() => {
                                      toast({
                                        title: `${highlight.type} Issue`,
                                        description: highlight.suggestion,
                                        variant: 'default',
                                      });
                                    }}
                                  />
                                );
                              })
                          )}
                        </div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-50">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <FileText className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">No resume uploaded</p>
                      <p className="text-gray-400 text-sm mt-1">Upload a resume to see highlighting</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="bullet">
            <Card className="p-8 text-center">
              <h3 className="text-lg font-semibold mb-4">Bullet Level Feedback</h3>
              <p className="text-muted-foreground mb-6">Individual bullet point analysis coming soon...</p>
              <Button 
                onClick={() => {
                  toast({
                    title: "Coming Soon",
                    description: "Bullet level feedback feature is under development!",
                  });
                }}
              >
                Get Notified
              </Button>
            </Card>
          </TabsContent>

          <TabsContent value="help">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Highlighting Guide</h3>
              <p className="text-gray-600 mb-6">Click on any analysis field in the left panel to automatically highlight corresponding issues on your resume. Here's what each color represents:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="w-6 h-6 bg-red-500 bg-opacity-30 border border-red-400 rounded flex-shrink-0 mt-1"></div>
                    <div>
                      <h4 className="font-semibold text-red-700">Spelling Issues</h4>
                      <p className="text-sm text-gray-600">Highlights misspelled words throughout your resume including:</p>
                      <ul className="text-xs text-gray-500 mt-1 list-disc list-inside">
                        <li>Words in header section</li>
                        <li>Misspelled technical terms</li>
                        <li>Common spelling errors in experience</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="w-6 h-6 bg-orange-500 bg-opacity-30 border border-orange-400 rounded flex-shrink-0 mt-1"></div>
                    <div>
                      <h4 className="font-semibold text-orange-700">Grammar Issues</h4>
                      <p className="text-sm text-gray-600">Identifies grammar problems such as:</p>
                      <ul className="text-xs text-gray-500 mt-1 list-disc list-inside">
                        <li>Passive voice usage</li>
                        <li>Incomplete sentences</li>
                        <li>Weak action verbs</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="w-6 h-6 bg-yellow-500 bg-opacity-30 border border-yellow-400 rounded flex-shrink-0 mt-1"></div>
                    <div>
                      <h4 className="font-semibold text-yellow-700">Redundancy</h4>
                      <p className="text-sm text-gray-600">Shows repeated content like:</p>
                      <ul className="text-xs text-gray-500 mt-1 list-disc list-inside">
                        <li>Overused phrases</li>
                        <li>Repetitive descriptions</li>
                        <li>Similar action words</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="w-6 h-6 bg-blue-500 bg-opacity-30 border border-blue-400 rounded flex-shrink-0 mt-1"></div>
                    <div>
                      <h4 className="font-semibold text-blue-700">Format Issues</h4>
                      <p className="text-sm text-gray-600">Highlights formatting problems including:</p>
                      <ul className="text-xs text-gray-500 mt-1 list-disc list-inside">
                        <li>Inconsistent font sizes</li>
                        <li>Misaligned bullet points</li>
                        <li>Date formatting issues</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="w-6 h-6 bg-green-500 bg-opacity-30 border border-green-400 rounded flex-shrink-0 mt-1"></div>
                    <div>
                      <h4 className="font-semibold text-green-700">Skills Enhancement</h4>
                      <p className="text-sm text-gray-600">Suggests improvements to:</p>
                      <ul className="text-xs text-gray-500 mt-1 list-disc list-inside">
                        <li>Technical skills section</li>
                        <li>Missing certifications</li>
                        <li>Skill organization</li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">How to Use:</h4>
                    <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                      <li>Click on any analysis field (Spell Check, Grammar, etc.)</li>
                      <li>Watch as your resume automatically highlights relevant issues</li>
                      <li>Hover over highlights to see specific suggestions</li>
                      <li>Click multiple fields to see combined highlights</li>
                    </ol>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default DetailedFeedback;