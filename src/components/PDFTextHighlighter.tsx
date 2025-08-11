import React, { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

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

interface PDFTextHighlighterProps {
  fileUrl: string;
  highlightedWords: HighlightedWord[];
  onError?: () => void;
}

const PDFTextHighlighter: React.FC<PDFTextHighlighterProps> = ({
  fileUrl,
  highlightedWords,
  onError
}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [textItems, setTextItems] = useState<any[]>([]);
  const [pageWidth, setPageWidth] = useState<number>(600);
  const [error, setError] = useState<string | null>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setError(null);
  }

  function onDocumentLoadError(error: Error) {
    console.error('PDF load error:', error);
    setError('Failed to load PDF. Please try uploading a different file.');
    if (onError) {
      onError();
    }
  }

  const extractTextFromPage = async (pageNum: number) => {
    try {
      console.log('Extracting text from page:', pageNum);
      const pdf = await pdfjs.getDocument(fileUrl).promise;
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Get the current scale used for rendering
      const currentScale = typeof window !== 'undefined' && window.innerWidth < 640 ? 0.8 : 
                          typeof window !== 'undefined' && window.innerWidth < 1024 ? 1.2 : 1.5;
      
      const viewport = page.getViewport({ scale: currentScale });
      setPageWidth(viewport.width);
      
      console.log('Text content items found:', textContent.items.length);
      
      // Transform text items to include position information with correct scaling
      const items = textContent.items.map((item: any, index: number) => {
        const transform = item.transform;
        return {
          id: index,
          str: item.str,
          transform: transform,
          width: item.width * currentScale,
          height: item.height * currentScale,
          fontName: item.fontName,
          dir: item.dir
        };
      }).filter(item => item.str.trim().length > 0); // Filter out empty strings
      
      console.log('Processed text items:', items.length);
      setTextItems(items);
    } catch (error) {
      console.error('Error extracting text:', error);
      // If text extraction fails due to worker issues, trigger fallback
      if (error.message?.includes('worker') || error.message?.includes('CORS')) {
        setError('PDF text extraction unavailable due to security restrictions.');
        if (onError) {
          onError();
        }
      }
    }
  };

  useEffect(() => {
    if (fileUrl && pageNumber) {
      extractTextFromPage(pageNumber);
    }
  }, [fileUrl, pageNumber, highlightedWords]);

  const createTextHighlights = () => {
    if (!textItems.length || !highlightedWords.length) {
      console.log('No text items or highlighted words available');
      return [];
    }

    console.log('Creating highlights with:', textItems.length, 'text items and', highlightedWords.length, 'highlight words');
    const highlights: JSX.Element[] = [];

    textItems.forEach((textItem) => {
      // Check if any highlight word matches this text item
      const matchingHighlight = highlightedWords.find(hw => {
        const textLower = textItem.str.toLowerCase().trim();
        const wordLower = hw.word.toLowerCase().trim();
        
        // Check for exact match or partial match
        return textLower === wordLower || 
               textLower.includes(wordLower) || 
               wordLower.includes(textLower);
      });

      if (matchingHighlight && textItem.transform && textItem.str.trim().length > 0) {
        console.log('Matching text found:', textItem.str, 'for word:', matchingHighlight.word);
        
        const transform = textItem.transform;
        const x = transform[4];
        const y = transform[5];
        
        highlights.push(
          <div
            key={`highlight-${textItem.id}-${matchingHighlight.id}`}
            className={`absolute pointer-events-none border-2 ${
              matchingHighlight.color === 'red' 
                ? 'bg-red-200 bg-opacity-50 border-red-400' 
                : 'bg-yellow-200 bg-opacity-50 border-yellow-400'
            }`}
            style={{
              left: `${x}px`,
              top: `${y - (textItem.height || 12)}px`,
              width: `${textItem.width || textItem.str.length * 8}px`,
              height: `${textItem.height || 14}px`,
              zIndex: 10,
              animation: 'fadeIn 0.6s ease-in-out'
            }}
            title={`Highlighted: "${matchingHighlight.word}" - ${matchingHighlight.color === 'red' ? 'Consider improving' : 'Good word'}`}
          />
        );
      }
    });

    console.log('Created', highlights.length, 'highlight overlays');
    return highlights;
  };

  return (
    <div className="w-full h-full flex flex-col bg-gray-100">
      {/* Navigation */}
      <div className="flex items-center justify-between p-2 md:p-3 bg-white border-b">
        <button
          onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
          disabled={pageNumber <= 1}
          className="px-2 py-1 md:px-3 md:py-1 bg-blue-500 text-white rounded disabled:bg-gray-300 text-xs md:text-sm"
        >
          Prev
        </button>
        <span className="text-xs md:text-sm font-medium">
          Page {pageNumber} of {numPages}
        </span>
        <button
          onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
          disabled={pageNumber >= numPages}
          className="px-2 py-1 md:px-3 md:py-1 bg-blue-500 text-white rounded disabled:bg-gray-300 text-xs md:text-sm"
        >
          Next
        </button>
      </div>

      {/* PDF Viewer with Highlights */}
      <div className="flex-1 overflow-auto p-2 md:p-4">
        {error ? (
          <div className="flex flex-col items-center justify-center p-4 md:p-8 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-red-500 mb-4 text-sm md:text-base text-center">{error}</div>
            <div className="text-gray-500 text-xs md:text-sm text-center">
              PDF rendering is currently experiencing technical difficulties.<br/>
              Your resume preview will be available once the issue is resolved.
            </div>
          </div>
        ) : (
          <div className="relative inline-block w-full">
            <Document
              file={fileUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="flex items-center justify-center p-4 md:p-8">
                  <div className="text-gray-500 text-sm md:text-base">Loading PDF...</div>
                </div>
              }
              error={
                <div className="flex items-center justify-center p-4 md:p-8">
                  <div className="text-red-500 text-sm md:text-base">Error loading PDF</div>
                </div>
              }
              className="w-full flex justify-center"
            >
              <Page
                pageNumber={pageNumber}
                scale={typeof window !== 'undefined' && window.innerWidth < 640 ? 0.8 : typeof window !== 'undefined' && window.innerWidth < 1024 ? 1.2 : 1.5}
                renderTextLayer={true}
                renderAnnotationLayer={false}
                className="shadow-lg"
                width={typeof window !== 'undefined' && window.innerWidth < 640 ? Math.min(window.innerWidth - 40, 300) : undefined}
              />
            </Document>
            
            {/* Text Highlights Overlay */}
            <div 
              ref={textLayerRef}
              className="absolute top-0 left-0 pointer-events-none"
              style={{ width: `${pageWidth}px` }}
            >
              {createTextHighlights()}
            </div>
          </div>
        )}
      </div>

      {/* Highlight Legend */}
      {highlightedWords.length > 0 && (
        <div className="p-2 md:p-3 bg-white border-t">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-400 bg-opacity-40 border border-green-500"></div>
              <span>Good words to keep</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-400 bg-opacity-40 border border-red-500"></div>
              <span>Words to consider improving</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFTextHighlighter;
