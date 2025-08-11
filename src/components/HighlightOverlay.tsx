import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnalysisIssue } from '@/utils/resumeAnalyzer';

interface HighlightOverlayProps {
  resumeText: string;
  activeHighlights: string[]; // Array of active highlight types
  analysisIssues: AnalysisIssue[];
  onIssueClick?: (issue: AnalysisIssue) => void;
}

interface HighlightedChunk {
  text: string;
  isHighlighted: boolean;
  issues: AnalysisIssue[];
  startIndex: number;
  endIndex: number;
}

const HighlightOverlay: React.FC<HighlightOverlayProps> = ({
  resumeText,
  activeHighlights,
  analysisIssues,
  onIssueClick
}) => {
  const [highlightedText, setHighlightedText] = useState<HighlightedChunk[]>([]);

  const generateHighlightedText = React.useCallback(() => {
    if (!resumeText || activeHighlights.length === 0) {
      setHighlightedText([{
        text: resumeText,
        isHighlighted: false,
        issues: [],
        startIndex: 0,
        endIndex: resumeText.length
      }]);
      return;
    }

    // Filter issues based on active highlights
    const activeIssues = analysisIssues.filter(issue => 
      activeHighlights.includes(issue.type)
    );

    if (activeIssues.length === 0) {
      setHighlightedText([{
        text: resumeText,
        isHighlighted: false,
        issues: [],
        startIndex: 0,
        endIndex: resumeText.length
      }]);
      return;
    }

    // Sort issues by start index
    const sortedIssues = [...activeIssues].sort((a, b) => a.startIndex - b.startIndex);

    const chunks: HighlightedChunk[] = [];
    let currentIndex = 0;

    sortedIssues.forEach(issue => {
      // Add text before the issue (if any)
      if (issue.startIndex > currentIndex) {
        chunks.push({
          text: resumeText.slice(currentIndex, issue.startIndex),
          isHighlighted: false,
          issues: [],
          startIndex: currentIndex,
          endIndex: issue.startIndex
        });
      }

      // Add the highlighted issue
      chunks.push({
        text: resumeText.slice(issue.startIndex, issue.endIndex),
        isHighlighted: true,
        issues: [issue],
        startIndex: issue.startIndex,
        endIndex: issue.endIndex
      });

      currentIndex = Math.max(currentIndex, issue.endIndex);
    });

    // Add remaining text (if any)
    if (currentIndex < resumeText.length) {
      chunks.push({
        text: resumeText.slice(currentIndex),
        isHighlighted: false,
        issues: [],
        startIndex: currentIndex,
        endIndex: resumeText.length
      });
    }

    setHighlightedText(chunks);
  }, [resumeText, activeHighlights, analysisIssues]);

  useEffect(() => {
    generateHighlightedText();
  }, [generateHighlightedText]);

  const getHighlightStyle = (issues: AnalysisIssue[]) => {
    if (issues.length === 0) return {};

    // If multiple issues overlap, blend colors or show the highest priority
    const primaryIssue = issues.reduce((prev, current) => 
      prev.severity === 'high' ? prev : current
    );

    return {
      backgroundColor: primaryIssue.color + '40', // 40 for opacity
      borderBottom: `2px solid ${primaryIssue.color}`,
      borderRadius: '2px',
      cursor: 'pointer',
      position: 'relative' as const,
      transition: 'all 0.3s ease'
    };
  };

  const handleChunkClick = (chunk: HighlightedChunk) => {
    if (chunk.isHighlighted && chunk.issues.length > 0 && onIssueClick) {
      onIssueClick(chunk.issues[0]);
    }
  };

  return (
    <div className="relative">
      <div className="resume-content whitespace-pre-wrap font-mono text-sm leading-relaxed">
        <AnimatePresence>
          {highlightedText.map((chunk, index) => (
            <motion.span
              key={`${index}-${chunk.startIndex}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, delay: index * 0.01 }}
              style={chunk.isHighlighted ? getHighlightStyle(chunk.issues) : {}}
              className={chunk.isHighlighted ? 'highlighted-text hover:shadow-lg' : ''}
              onClick={() => handleChunkClick(chunk)}
              title={chunk.isHighlighted && chunk.issues.length > 0 ? chunk.issues[0].suggestion : ''}
            >
              {chunk.text}
              {chunk.isHighlighted && chunk.issues.length > 0 && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute -top-8 left-0 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg z-10 pointer-events-none"
                  style={{ display: 'none' }}
                >
                  {chunk.issues[0].type.replace(/([A-Z])/g, ' $1').trim()}
                </motion.div>
              )}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default HighlightOverlay;
