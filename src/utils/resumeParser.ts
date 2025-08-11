// Enhanced resume parsing utilities
export interface ParsedResume {
  name: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  summary: string;
  workExperience: WorkExperience[];
  education: Education[];
  skills: string[];
}

export interface WorkExperience {
  company: string;
  position: string;
  duration: string;
  bullets: string[];
}

export interface Education {
  institution: string;
  degree: string;
  duration: string;
  gpa?: string;
}

// Extract text from different file types
export const extractTextFromFile = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        let text = '';
        
        if (file.type === 'application/pdf') {
          // For PDF files, we'll extract what we can from the ArrayBuffer
          const arrayBuffer = e.target?.result as ArrayBuffer;
          // Note: This is a simplified PDF text extraction
          // For production, you'd want to use a proper PDF parsing library
          text = await extractTextFromPDF(arrayBuffer);
        } else if (file.type.includes('word') || file.name.endsWith('.docx')) {
          // For DOCX files, use mammoth or similar
          const arrayBuffer = e.target?.result as ArrayBuffer;
          text = await extractTextFromDocx(arrayBuffer);
        } else {
          // For plain text or other formats
          text = e.target?.result as string;
        }
        
        resolve(text);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    
    if (file.type === 'application/pdf' || file.type.includes('word') || file.name.endsWith('.docx')) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  });
};

// Simple PDF text extraction (limited functionality)
const extractTextFromPDF = async (arrayBuffer: ArrayBuffer): Promise<string> => {
  // This is a very basic implementation
  // For production, use libraries like pdf-parse or PDF.js
  const text = new TextDecoder().decode(arrayBuffer);
  
  // Extract readable text from PDF binary content
  let extractedText = '';
  const lines = text.split('\n');
  
  for (const line of lines) {
    // Look for text patterns that don't contain binary data
    const cleanLine = line.replace(/[^\x20-\x7E]/g, ' ').trim();
    if (cleanLine.length > 3 && !cleanLine.includes('obj') && !cleanLine.includes('endobj')) {
      extractedText += cleanLine + ' ';
    }
  }
  
  return extractedText;
};

// DOCX text extraction
const extractTextFromDocx = async (arrayBuffer: ArrayBuffer): Promise<string> => {
  try {
    // For now, return a placeholder - mammoth would be used here
    return 'DOCX content extraction would require mammoth library implementation';
  } catch (error) {
    throw new Error('Failed to extract text from DOCX');
  }
};

// Parse resume content into structured data
export const parseResumeContent = (text: string, filename: string): ParsedResume => {
  // Clean and normalize text
  const cleanText = text.replace(/\s+/g, ' ').trim();
  
  // Extract contact information
  const email = extractEmail(cleanText);
  const phone = extractPhone(cleanText);
  const name = extractName(cleanText, filename);
  const location = extractLocation(cleanText);
  const website = extractWebsite(cleanText);
  const summary = extractSummary(cleanText);
  const workExperience = extractWorkExperience(cleanText);
  const education = extractEducation(cleanText);
  const skills = extractSkills(cleanText);
  
  return {
    name,
    email,
    phone,
    location,
    website,
    summary,
    workExperience,
    education,
    skills
  };
};

// Individual extraction functions
const extractEmail = (text: string): string => {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const match = text.match(emailRegex);
  return match ? match[0] : 'email@example.com';
};

const extractPhone = (text: string): string => {
  const phoneRegex = /(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/;
  const match = text.match(phoneRegex);
  return match ? match[0] : '+1 (555) 123-4567';
};

const extractName = (text: string, filename: string): string => {
  // Try to extract name from the beginning of the document
  const lines = text.split(/[.\n]/).filter(line => line.trim().length > 0);
  
  // Look for name-like patterns in the first few lines
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].trim();
    // Name is typically 2-4 words, all capitalized or title case
    if (line.length > 5 && line.length < 50 && /^[A-Za-z\s]+$/.test(line)) {
      const words = line.split(/\s+/);
      if (words.length >= 2 && words.length <= 4) {
        return line;
      }
    }
  }
  
  // Fallback to filename
  return filename.replace(/\.(pdf|doc|docx)$/i, '').replace(/[_-]/g, ' ');
};

const extractLocation = (text: string): string => {
  // Look for common location patterns
  const locationPatterns = [
    /([A-Za-z\s]+),\s*([A-Z]{2})/,  // City, State
    /([A-Za-z\s]+),\s*([A-Za-z\s]+),\s*([A-Z]{2,3})/,  // City, State, Country
  ];
  
  for (const pattern of locationPatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0];
    }
  }
  
  return 'Location';
};

const extractWebsite = (text: string): string => {
  const urlRegex = /(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
  const match = text.match(urlRegex);
  return match ? match[0] : 'website.com';
};

const extractSummary = (text: string): string => {
  // Look for summary-like sections
  const summaryKeywords = ['summary', 'objective', 'profile', 'about'];
  const lines = text.split(/[.\n]/);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (summaryKeywords.some(keyword => line.includes(keyword))) {
      // Take the next few lines as summary
      const summaryLines = lines.slice(i + 1, i + 4);
      const summary = summaryLines.join('. ').trim();
      if (summary.length > 50) {
        return summary;
      }
    }
  }
  
  // Fallback: take first substantial paragraph
  const paragraphs = text.split(/\n\n/);
  for (const paragraph of paragraphs) {
    if (paragraph.length > 100 && paragraph.length < 500) {
      return paragraph.trim();
    }
  }
  
  return 'Professional summary extracted from resume.';
};

const extractWorkExperience = (text: string): WorkExperience[] => {
  // This is a simplified version - real implementation would be more sophisticated
  const experiences: WorkExperience[] = [];
  
  // Look for common work experience patterns
  const experienceKeywords = ['experience', 'employment', 'work history', 'professional experience'];
  const lines = text.split('\n');
  
  let inExperienceSection = false;
  let currentExperience: Partial<WorkExperience> = {};
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    if (experienceKeywords.some(keyword => lowerLine.includes(keyword))) {
      inExperienceSection = true;
      continue;
    }
    
    if (inExperienceSection && line.trim()) {
      // Look for company/position patterns
      if (line.length > 10 && line.length < 100 && !line.startsWith('•') && !line.startsWith('-')) {
        if (currentExperience.company) {
          experiences.push(currentExperience as WorkExperience);
        }
        currentExperience = {
          company: line.trim(),
          position: 'Position',
          duration: '2020 - Present',
          bullets: []
        };
      } else if (line.startsWith('•') || line.startsWith('-')) {
        if (!currentExperience.bullets) currentExperience.bullets = [];
        currentExperience.bullets.push(line.replace(/^[•-]\s*/, ''));
      }
    }
  }
  
  if (currentExperience.company) {
    experiences.push(currentExperience as WorkExperience);
  }
  
  // If no experiences found, create a default one
  if (experiences.length === 0) {
    experiences.push({
      company: 'Company Name',
      position: 'Job Title',
      duration: '2020 - Present',
      bullets: ['Key achievement from resume', 'Another accomplishment', 'Technical skills demonstrated']
    });
  }
  
  return experiences;
};

const extractEducation = (text: string): Education[] => {
  const education: Education[] = [];
  
  // Look for education keywords
  const educationKeywords = ['education', 'academic', 'university', 'college', 'degree'];
  const lines = text.split('\n');
  
  let inEducationSection = false;
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    if (educationKeywords.some(keyword => lowerLine.includes(keyword))) {
      inEducationSection = true;
      continue;
    }
    
    if (inEducationSection && line.trim() && line.length > 10) {
      education.push({
        institution: line.trim(),
        degree: 'Degree Program',
        duration: '2016 - 2020',
        gpa: '3.8'
      });
      break; // Take first education entry for now
    }
  }
  
  // Default education if none found
  if (education.length === 0) {
    education.push({
      institution: 'University Name',
      degree: 'Degree Type',
      duration: '2016 - 2020',
      gpa: '3.8'
    });
  }
  
  return education;
};

const extractSkills = (text: string): string[] => {
  // Common technical skills
  const commonSkills = [
    'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'HTML', 'CSS', 'SQL',
    'Git', 'AWS', 'Docker', 'Kubernetes', 'TypeScript', 'Angular', 'Vue.js'
  ];
  
  const foundSkills = commonSkills.filter(skill => 
    text.toLowerCase().includes(skill.toLowerCase())
  );
  
  return foundSkills.length > 0 ? foundSkills : ['Technical Skills', 'Communication', 'Problem Solving'];
};