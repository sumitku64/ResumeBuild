import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { FileText } from 'lucide-react';

// Set up the worker with correct version
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();

interface HighlightedWord {
  id: number;
  word: string;
  color: 'red' | 'green';
}

interface PDFViewerFitWidthProps {
  fileUrl: string;
  highlightedWords: HighlightedWord[];
  misspelledWords?: string[]; // Add support for misspelled words
  onError?: () => void;
}

const PDFViewerFitWidth: React.FC<PDFViewerFitWidthProps> = ({
  fileUrl,
  highlightedWords,
  misspelledWords = [],
  onError
}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [containerHeight, setContainerHeight] = useState<number>(800);
  const [pagesRendered, setPagesRendered] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  // Function to clear existing highlights
  const clearHighlights = useCallback(() => {
    document.querySelectorAll('.react-pdf__Page__textContent span[data-highlighted="true"]').forEach(span => {
      const htmlSpan = span as HTMLElement;
      htmlSpan.style.backgroundColor = '';
      htmlSpan.style.borderRadius = '';
      htmlSpan.style.padding = '';
      htmlSpan.removeAttribute('data-highlighted');
      htmlSpan.removeAttribute('title');
    });
  }, []);

  // Function to highlight misspelled words
  const highlightMisspelledWords = useCallback((wordsToHighlight: string[]) => {
    if (!wordsToHighlight.length) return;

    // Clear existing highlights first
    clearHighlights();

    console.log('Highlighting misspelled words:', wordsToHighlight);

    // Find all text layer containers
    document.querySelectorAll('.react-pdf__Page__textContent').forEach((textLayer, pageIndex) => {
      console.log(`Processing page ${pageIndex + 1} for spelling errors`);
      
      // Get all text spans in this page
      const spans = textLayer.querySelectorAll('span');
      
      spans.forEach((span, spanIndex) => {
        const text = span.textContent?.trim() || '';
        if (!text) return;

        // Check if this text contains any misspelled words (case-insensitive)
        const foundMisspelling = wordsToHighlight.find(misspelledWord => 
          text.toLowerCase().includes(misspelledWord.toLowerCase()) ||
          text.toLowerCase() === misspelledWord.toLowerCase()
        );

        if (foundMisspelling) {
          console.log(`Found misspelling: "${text}" contains "${foundMisspelling}"`);
          
          const htmlSpan = span as HTMLElement;
          htmlSpan.style.backgroundColor = '#fef3c7'; // Light yellow background
          htmlSpan.style.borderRadius = '2px';
          htmlSpan.style.padding = '1px 2px';
          htmlSpan.style.boxShadow = '0 0 0 1px #f59e0b'; // Yellow border
          htmlSpan.setAttribute('data-highlighted', 'true');
          htmlSpan.setAttribute('title', `Possible spelling error: "${foundMisspelling}"`);
        }
      });
    });
  }, [clearHighlights]);

  // Function to handle page render completion
  const onPageRenderSuccess = (pageNumber: number) => {
    console.log(`Page ${pageNumber} rendered successfully`);
    
    setPagesRendered(prev => {
      const newSet = new Set(prev);
      newSet.add(pageNumber);
      return newSet;
    });

    // Apply highlights after a short delay to ensure DOM is ready
    setTimeout(() => {
      highlightMisspelledWords(misspelledWords);
    }, 100);
  };

  // Re-apply highlights when misspelledWords change
  useEffect(() => {
    if (pagesRendered.size > 0) {
      setTimeout(() => {
        highlightMisspelledWords(misspelledWords);
      }, 100);
    }
  }, [misspelledWords, pagesRendered, highlightMisspelledWords]);

  // Re-apply highlights when scale changes (zoom)
  useEffect(() => {
    if (pagesRendered.size > 0) {
      setTimeout(() => {
        highlightMisspelledWords(misspelledWords);
      }, 200);
    }
  }, [scale, highlightMisspelledWords, misspelledWords, pagesRendered]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setError(null);
    console.log('PDF loaded with', numPages, 'pages');
  }

  function onDocumentLoadError(error: Error) {
    console.error('PDF load error:', error);
    setError('Failed to load PDF. Please try uploading a different file.');
    if (onError) {
      onError();
    }
  }

  // Calculate scale to fit width of container (allow vertical scrolling)
  useEffect(() => {
    if (containerRef.current && numPages > 0) {
      const containerWidth = containerRef.current.clientWidth - 40; // Account for padding
      
      // Assume standard PDF page dimensions (US Letter: 612x792 points)
      const pageWidth = 612;
      
      // Calculate scale to fit width only (height can scroll)
      const scaleByWidth = containerWidth / pageWidth;
      
      // Use width-based scale with reasonable limits
      const finalScale = Math.max(0.5, Math.min(scaleByWidth, 2.0));
      
      setScale(finalScale);
      console.log('Calculated width-fit scale:', finalScale, 'for container width:', containerWidth);
    }
  }, [numPages, containerHeight]);

  // Update container height on resize
  useEffect(() => {
    const updateContainerHeight = () => {
      if (containerRef.current) {
        const height = containerRef.current.clientHeight;
        setContainerHeight(height);
      }
    };

    updateContainerHeight();
    window.addEventListener('resize', updateContainerHeight);
    
    return () => window.removeEventListener('resize', updateContainerHeight);
  }, []);

  if (!fileUrl) {
    return (
      <div className="flex items-center justify-center h-full text-center p-6">
        <div>
          <FileText className="h-8 w-8 text-gray-400 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-gray-900 mb-1">No Resume Available</h3>
          <p className="text-xs text-gray-500">Upload a resume to see preview</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="h-full w-full overflow-y-auto overflow-x-hidden bg-gray-50 flex justify-center p-4">
      {error ? (
        <div className="flex items-center justify-center h-full text-center p-6">
          <div>
            <FileText className="h-8 w-8 text-red-400 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-gray-900 mb-1">Preview Error</h3>
            <p className="text-xs text-gray-500">{error}</p>
          </div>
        </div>
      ) : (
        <div className="relative w-full flex justify-center">
          <Document
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="flex items-center justify-center h-full p-8">
                <div className="text-gray-500">Loading resume...</div>
              </div>
            }
            error={
              <div className="flex items-center justify-center h-full p-8">
                <div className="text-red-500">Error loading PDF</div>
              </div>
            }
          >
            {/* Render all pages stacked vertically - Width fit, allow vertical scroll */}
            <div className="flex flex-col items-center space-y-4">
              {numPages > 1 && (
                <div className="text-xs text-gray-500 mb-2 px-3 py-1 bg-gray-100 rounded-full">
                  Full Resume ({numPages} {numPages === 1 ? 'page' : 'pages'})
                </div>
              )}
              {Array.from(new Array(numPages), (el, index) => (
                <Page
                  key={`page_${index + 1}`}
                  pageNumber={index + 1}
                  scale={scale}
                  renderTextLayer={true} // Enable text layer for highlighting support
                  renderAnnotationLayer={false}
                  className="shadow-lg border border-gray-300 bg-white"
                  onRenderSuccess={() => onPageRenderSuccess(index + 1)}
                />
              ))}
            </div>
          </Document>
        </div>
      )}
    </div>
  );
};

export default PDFViewerFitWidth;

// ⭐ CONSOLE TEST SNIPPET - Use this in browser console to test highlighting
// Copy and paste this in browser console after PDF loads:
/*
// Test the highlighting function
window.testSpellingHighlight = function() {
  const testWords = ['experience', 'management', 'development', 'successful'];
  
  console.log('🔍 Testing spelling highlight with words:', testWords);
  console.log('📄 Found text layers:', document.querySelectorAll('.react-pdf__Page__textContent').length);
  
  document.querySelectorAll('.react-pdf__Page__textContent').forEach((textLayer, pageIndex) => {
    console.log(`📄 Page ${pageIndex + 1} text content:`, textLayer);
    const spans = textLayer.querySelectorAll('span');
    console.log(`📄 Page ${pageIndex + 1} has ${spans.length} text spans`);
    
    spans.forEach((span, spanIndex) => {
      if (span.textContent) {
        console.log(`Text ${spanIndex}: "${span.textContent}"`);
      }
    });
  });
};

// Call the test function
window.testSpellingHighlight();
*/
