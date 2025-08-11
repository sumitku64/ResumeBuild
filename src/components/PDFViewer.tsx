import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import PDFTextHighlighter from './PDFTextHighlighter';

interface HighlightedWord {
  id: number;
  word: string;
  color: 'red' | 'green';
}

interface PDFViewerProps {
  fileUrl: string;
  highlightedWords: HighlightedWord[];
}

const PDFViewer: React.FC<PDFViewerProps> = ({ fileUrl, highlightedWords }) => {
  const [useAdvancedViewer, setUseAdvancedViewer] = useState(true);
  const [fallbackError, setFallbackError] = useState(false);

  // Reset on fileUrl change
  useEffect(() => {
    setUseAdvancedViewer(true);
    setFallbackError(false);
  }, [fileUrl]);

  const handleAdvancedViewerError = () => {
    console.warn('Advanced PDF viewer failed, falling back to basic viewer');
    setUseAdvancedViewer(false);
  };

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

  // Try advanced PDF viewer with highlighting first
  if (useAdvancedViewer) {
    return (
      <div className="h-full w-full">
        <PDFTextHighlighter 
          fileUrl={fileUrl}
          highlightedWords={highlightedWords}
          onError={handleAdvancedViewerError}
        />
      </div>
    );
  }

  // Fallback to basic iframe viewer
  return (
    <div className="h-full w-full flex flex-col">
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-2 md:p-3 mb-3 md:mb-4">
        <div className="flex">
          <div className="text-yellow-800 text-xs md:text-sm">
            <strong>Basic PDF Viewer:</strong> Advanced text highlighting is temporarily unavailable.
            Your resume is displayed below without highlighting features.
          </div>
        </div>
      </div>
      
      <div className="flex-1 bg-gray-100 rounded-md overflow-hidden">
        <iframe
          src={fileUrl}
          width="100%"
          height="100%"
          className="border-0"
          title="Resume Preview"
          onError={() => setFallbackError(true)}
        />
        
        {fallbackError && (
          <div className="flex items-center justify-center h-full text-center p-4 md:p-6">
            <div>
              <FileText className="h-6 w-6 md:h-8 md:w-8 text-red-400 mx-auto mb-3" />
              <h3 className="text-sm font-medium text-gray-900 mb-1">Preview Unavailable</h3>
              <p className="text-xs text-gray-500">
                Unable to display PDF preview. Your resume has been uploaded successfully.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFViewer;
