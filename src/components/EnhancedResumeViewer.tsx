import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Loader2 } from 'lucide-react';
import { AnalysisIssue } from '@/utils/resumeAnalyzer';
import HighlightOverlay from './HighlightOverlay';
import { Card } from './ui/card';

interface ResumeData {
  extractedText?: string;
  fileUrl?: string;
  score?: number;
  metrics?: Array<{ score: number; maxScore: number }>;
}

interface EnhancedResumeViewerProps {
  resumeData: ResumeData | null;
  activeHighlights: string[];
  analysisIssues: AnalysisIssue[];
  onIssueClick?: (issue: AnalysisIssue) => void;
}

const EnhancedResumeViewer: React.FC<EnhancedResumeViewerProps> = ({
  resumeData,
  activeHighlights,
  analysisIssues,
  onIssueClick
}) => {
  const [loading, setLoading] = useState(true);
  const [resumeText, setResumeText] = useState('');

  useEffect(() => {
    // Simulate loading and extract text from resume data
    setTimeout(() => {
      if (resumeData?.extractedText) {
        setResumeText(resumeData.extractedText);
      } else {
        // Fallback sample resume text for demonstration
        setResumeText(`JOHN DOE
Software Engineer

Contact Information:
Email: john.doe@email.com
Phone: (555) 123-4567
Location: San Francisco, CA

EXPERIENCE

Senior Software Engineer | TechCorp Inc. | 2022 - Present
• Responsible for developing and maintaining web applications using React and Node.js
• Worked on improving application performance by 25%
• Helped with managing a team of 5 developers
• Was involved in the implementation of new features

Software Developer | StartupXYZ | 2020 - 2022
• Developement of mobile applications using React Native
• Participated in code reviews and testing
• Contributed to the company's sucessful product launch
• Handled customer support tickets

EDUCATION

Bachelor of Science in Computer Science
University of California, Berkeley | 2016 - 2020
GPA: 3.8/4.0

SKILLS

Technical Skills: JavaScript, Python, React, Node.js, SQL, MongoDB
Soft Skills: Leadership, Communication, Problem Solving

PROJECTS

E-commerce Platform | 2021
• Built a full-stack e-commerce platform
• Implemented payment processing
• Created user authentication system

Portfolio Website | 2020
• Designed and developed personal portfolio website
• Used modern web technologies`);
      }
      setLoading(false);
    }, 1000);
  }, [resumeData]);

  if (loading) {
    return (
      <motion.div 
        className="flex items-center justify-center h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading resume...</p>
        </div>
      </motion.div>
    );
  }

  if (!resumeText) {
    return (
      <motion.div 
        className="flex items-center justify-center h-full text-center p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div>
          <FileText className="h-8 w-8 text-gray-400 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-gray-900 mb-1">No Resume Available</h3>
          <p className="text-xs text-gray-500">Upload a resume to see preview and analysis</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="h-full w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full p-4 overflow-auto">
        {/* Header */}
        <motion.div 
          className="mb-4 pb-3 border-b border-gray-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Resume Preview</h3>
            {activeHighlights.length > 0 && (
              <motion.div 
                className="flex items-center space-x-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <span className="text-xs text-gray-500">Active Highlights:</span>
                <div className="flex space-x-1">
                  {activeHighlights.map((highlight, index) => (
                    <motion.span
                      key={highlight}
                      className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                    >
                      {highlight.replace(/([A-Z])/g, ' $1').trim()}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Resume Content with Highlighting */}
        <motion.div 
          className="resume-viewer-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <HighlightOverlay
            resumeText={resumeText}
            activeHighlights={activeHighlights}
            analysisIssues={analysisIssues}
            onIssueClick={onIssueClick}
          />
        </motion.div>

        {/* Legend for highlights */}
        {activeHighlights.length > 0 && (
          <motion.div 
            className="mt-6 pt-4 border-t border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h4 className="text-sm font-medium text-gray-900 mb-3">Highlight Legend</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {activeHighlights.map((highlight, index) => {
                const issuesOfType = analysisIssues.filter(issue => issue.type === highlight);
                const color = issuesOfType.length > 0 ? issuesOfType[0].color : '#gray';
                
                return (
                  <motion.div
                    key={highlight}
                    className="flex items-center space-x-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                  >
                    <div 
                      className="w-3 h-3 rounded-full border"
                      style={{ backgroundColor: color + '60', borderColor: color }}
                    ></div>
                    <span className="text-xs text-gray-600">
                      {highlight.replace(/([A-Z])/g, ' $1').trim()} ({issuesOfType.length})
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
};

export default EnhancedResumeViewer;
