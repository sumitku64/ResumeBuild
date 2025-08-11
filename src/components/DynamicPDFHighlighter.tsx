// Dynamic PDF Highlighter with Real Analysis
import React, { useState, useEffect, useRef } from 'react';
import { Document, Page } from 'react-pdf';
import { motion, AnimatePresence } from 'framer-motion';
import { DynamicPDFTextExtractor } from '@/utils/dynamicPDFExtractor';
import { RealAnalysisEngine, AnalysisResults, AnalysisIssue, TextItem } from '@/utils/realAnalysisEngine';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { 
  FileText, 
  Loader2, 
  AlertCircle, 
  CheckCircle, 
  Zap,
  Eye,
  X
} from 'lucide-react';

interface DynamicHighlighterProps {
  fileUrl: string;
  onAnalysisComplete?: (results: AnalysisResults) => void;
}

interface HighlightColor {
  bg: string;
  border: string;
  text: string;
}

const highlightColors: Record<string, HighlightColor> = {
  spelling: { bg: 'bg-red-500', border: 'border-red-600', text: 'text-red-700' },
  grammar: { bg: 'bg-orange-500', border: 'border-orange-600', text: 'text-orange-700' },
  redundancy: { bg: 'bg-yellow-500', border: 'border-yellow-600', text: 'text-yellow-700' },
  format: { bg: 'bg-purple-500', border: 'border-purple-600', text: 'text-purple-700' },
  skills: { bg: 'bg-green-500', border: 'border-green-600', text: 'text-green-700' }
};

const DynamicPDFHighlighter: React.FC<DynamicHighlighterProps> = ({ 
  fileUrl, 
  onAnalysisComplete 
}) => {
  // State management
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Analysis results
  const [textItems, setTextItems] = useState<TextItem[]>([]);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults>({
    spelling: [], grammar: [], redundancy: [], format: [], skills: []
  });
  const [activeHighlights, setActiveHighlights] = useState<string[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<AnalysisIssue | null>(null);
  
  // PDF rendering
  const [pageWidth, setPageWidth] = useState<number>(600);
  const [pageHeight, setPageHeight] = useState<number>(800);
  const [scale, setScale] = useState<number>(1.0);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate responsive scale
  useEffect(() => {
    const calculateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const targetWidth = Math.min(containerWidth - 40, 800);
        return Math.max(0.5, Math.min(1.5, targetWidth / 600));
      }
      return 1.0;
    };

    setScale(calculateScale());
    window.addEventListener('resize', () => setScale(calculateScale()));
    return () => window.removeEventListener('resize', () => setScale(calculateScale()));
  }, []);

  // PDF load handlers
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
    console.log('✅ PDF loaded successfully:', numPages, 'pages');
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('❌ PDF load failed:', error);
    setError(`Failed to load PDF: ${error.message}`);
    setLoading(false);
  };

  // Extract text and analyze when PDF loads
  useEffect(() => {
    if (!fileUrl || loading) return;

    const performAnalysis = async () => {
      setAnalyzing(true);
      setError(null);

      try {
        console.log('🔍 Starting text extraction and analysis...');
        
        // Extract text with coordinates
        const extractionResult = await DynamicPDFTextExtractor.extractTextWithCoordinates(
          fileUrl, 
          pageNumber, 
          scale
        );

        if (!extractionResult.success) {
          throw new Error(extractionResult.error || 'Text extraction failed');
        }

        console.log('✅ Text extracted:', extractionResult.textItems.length, 'items');
        setTextItems(extractionResult.textItems);
        setPageWidth(extractionResult.pageWidth);
        setPageHeight(extractionResult.pageHeight);

        // Perform real analysis
        console.log('🧠 Analyzing text...');
        const analysis = RealAnalysisEngine.analyzeText(extractionResult.textItems);
        
        console.log('✅ Analysis complete:', {
          spelling: analysis.spelling.length,
          grammar: analysis.grammar.length,
          redundancy: analysis.redundancy.length,
          format: analysis.format.length,
          skills: analysis.skills.length
        });

        setAnalysisResults(analysis);
        onAnalysisComplete?.(analysis);

        // Show analysis summary
        const totalIssues = Object.values(analysis).reduce((sum, arr) => sum + arr.length, 0);
        toast({
          title: "Analysis Complete",
          description: `Found ${totalIssues} potential improvements`,
          duration: 3000,
        });

      } catch (error) {
        console.error('❌ Analysis failed:', error);
        const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
        setError(errorMessage);
        toast({
          title: "Analysis Failed",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setAnalyzing(false);
      }
    };

    performAnalysis();
  }, [fileUrl, pageNumber, scale, loading, onAnalysisComplete]);

  // Toggle highlight type
  const toggleHighlight = (type: string) => {
    setActiveHighlights(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
    
    setSelectedIssue(null);
  };

  // Handle issue click
  const handleIssueClick = (issue: AnalysisIssue) => {
    setSelectedIssue(selectedIssue?.id === issue.id ? null : issue);
  };

  // Render highlights for active types
  const renderHighlights = () => {
    const highlights: JSX.Element[] = [];

    activeHighlights.forEach(type => {
      analysisResults[type as keyof AnalysisResults]?.forEach((issue, index) => {
        const colors = highlightColors[type];
        const isSelected = selectedIssue?.id === issue.id;
        
        highlights.push(
          <motion.div
            key={`${type}-${index}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: isSelected ? 0.8 : 0.4, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className={`absolute cursor-pointer ${colors.bg} ${colors.border} border-2 rounded-sm`}
            style={{
              left: `${issue.coordinates.x}px`,
              top: `${issue.coordinates.y}px`,
              width: `${Math.max(issue.coordinates.width, 20)}px`,
              height: `${Math.max(issue.coordinates.height, 16)}px`,
              zIndex: isSelected ? 20 : 10,
            }}
            onClick={() => handleIssueClick(issue)}
            title={`${type}: ${issue.suggestion}`}
          />
        );
      });
    });

    return highlights;
  };

  // Get total issues count for a type
  const getIssueCount = (type: string) => {
    return analysisResults[type as keyof AnalysisResults]?.length || 0;
  };

  // Analysis type buttons
  const analysisTypes = [
    { key: 'spelling', label: 'Spell Check', icon: AlertCircle },
    { key: 'grammar', label: 'Grammar', icon: Zap },
    { key: 'redundancy', label: 'Redundancy', icon: Eye },
    { key: 'format', label: 'Format', icon: FileText },
    { key: 'skills', label: 'Skills', icon: CheckCircle },
  ];

  if (error) {
    return (
      <Card className="p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-700 mb-2">Analysis Error</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </Card>
    );
  }

  return (
    <div className="flex h-full">
      {/* Left Panel: Analysis Controls */}
      <div className="w-1/3 p-4 bg-gray-50 border-r overflow-y-auto">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Resume Analysis</h3>
            {analyzing && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
          </div>

          {/* Analysis Status */}
          <div className="text-sm text-gray-600">
            {analyzing ? (
              <span className="flex items-center">
                <Loader2 className="w-3 h-3 animate-spin mr-1" />
                Analyzing PDF content...
              </span>
            ) : (
              <span className="flex items-center">
                <CheckCircle className="w-3 h-3 text-green-500 mr-1" />
                Analysis complete • {textItems.length} text items
              </span>
            )}
          </div>

          {/* Analysis Type Buttons */}
          <div className="space-y-2">
            {analysisTypes.map(({ key, label, icon: Icon }) => {
              const count = getIssueCount(key);
              const isActive = activeHighlights.includes(key);
              const colors = highlightColors[key];

              return (
                <Button
                  key={key}
                  variant={isActive ? "default" : "outline"}
                  className={`w-full justify-between ${isActive ? colors.bg : ''}`}
                  onClick={() => toggleHighlight(key)}
                  disabled={analyzing || count === 0}
                >
                  <span className="flex items-center">
                    <Icon className="w-4 h-4 mr-2" />
                    {label}
                  </span>
                  <Badge variant={count > 0 ? "destructive" : "secondary"}>
                    {count}
                  </Badge>
                </Button>
              );
            })}
          </div>

          {/* Active Highlights Legend */}
          {activeHighlights.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Active Highlights</h4>
              {activeHighlights.map(type => {
                const colors = highlightColors[type];
                return (
                  <div key={type} className="flex items-center text-xs">
                    <div className={`w-3 h-3 ${colors.bg} ${colors.border} border rounded mr-2`} />
                    <span className="capitalize">{type}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Selected Issue Details */}
          <AnimatePresence>
            {selectedIssue && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-white p-4 rounded-lg border shadow-sm"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium capitalize">{selectedIssue.type} Issue</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedIssue(null)}
                    className="p-1 h-auto"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Text:</strong> "{selectedIssue.text}"
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Suggestion:</strong> {selectedIssue.suggestion}
                </p>
                <Badge variant="outline" className="mt-2">
                  {selectedIssue.severity} priority
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right Panel: PDF with Highlights */}
      <div className="flex-1 relative" ref={containerRef}>
        <div className="h-full overflow-auto bg-gray-100">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
                <p className="text-gray-600">Loading PDF...</p>
              </div>
            </div>
          ) : (
            <div className="relative p-4">
              <Document
                file={fileUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                className="flex justify-center"
              >
                <div className="relative">
                  <Page
                    pageNumber={pageNumber}
                    scale={scale}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    className="shadow-lg"
                  />
                  
                  {/* Dynamic Highlight Overlay */}
                  <div className="absolute inset-0">
                    <AnimatePresence>
                      {renderHighlights()}
                    </AnimatePresence>
                  </div>
                </div>
              </Document>

              {/* Page Navigation */}
              {numPages > 1 && (
                <div className="flex items-center justify-center mt-4 space-x-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                    disabled={pageNumber <= 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {pageNumber} of {numPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
                    disabled={pageNumber >= numPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DynamicPDFHighlighter;
