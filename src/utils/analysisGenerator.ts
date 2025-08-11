// Utility to generate random analysis data
export const generateRandomAnalysis = () => {
  const scores = [45, 52, 61, 68, 73, 79, 84, 88, 91];
  const candidateProfiles = [
    {
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      phone: "+1 (555) 123-4567",
      location: "New York, NY",
      website: "sarahjohnson.dev",
      summary: "Experienced software engineer with 5+ years in full-stack development. Passionate about creating scalable web applications and leading cross-functional teams to deliver high-quality software solutions.",
      workExperience: [
        {
          company: "TechCorp Solutions",
          position: "Senior Software Engineer",
          duration: "Jan 2022 - Present",
          bullets: [
            "Led development of microservices architecture serving 100K+ daily active users",
            "Implemented CI/CD pipelines reducing deployment time by 60%",
            "Mentored 3 junior developers and conducted code reviews",
            "Collaborated with product team to define technical requirements"
          ]
        },
        {
          company: "StartupXYZ",
          position: "Full Stack Developer",
          duration: "Mar 2020 - Dec 2021",
          bullets: [
            "Built responsive web applications using React and Node.js",
            "Optimized database queries improving application performance by 40%",
            "Integrated third-party APIs and payment processing systems"
          ]
        }
      ],
      education: [
        {
          institution: "University of California, Berkeley",
          degree: "Bachelor of Science in Computer Science",
          duration: "2016 - 2020",
          gpa: "3.8 GPA"
        }
      ]
    },
    {
      name: "Michael Chen",
      email: "michael.chen@email.com", 
      phone: "+1 (555) 987-6543",
      location: "San Francisco, CA",
      website: "michaelchen.io",
      summary: "Data scientist and machine learning engineer with expertise in Python, TensorFlow, and cloud platforms. Passionate about leveraging data to drive business decisions and build intelligent systems.",
      workExperience: [
        {
          company: "DataFlow Analytics",
          position: "Senior Data Scientist",
          duration: "Jun 2021 - Present",
          bullets: [
            "Developed ML models improving customer retention by 25%",
            "Built real-time data pipelines processing 1M+ events daily",
            "Collaborated with business stakeholders to identify key metrics",
            "Presented findings to C-level executives driving strategic decisions"
          ]
        },
        {
          company: "AI Innovations Inc",
          position: "Machine Learning Engineer",
          duration: "Sep 2019 - May 2021",
          bullets: [
            "Implemented deep learning models for computer vision applications",
            "Deployed models to production using Docker and Kubernetes",
            "Optimized model inference time by 50% through quantization"
          ]
        }
      ],
      education: [
        {
          institution: "Stanford University",
          degree: "Master of Science in Computer Science",
          duration: "2017 - 2019",
          gpa: "3.9 GPA"
        }
      ]
    },
    {
      name: "Alex Rodriguez",
      email: "alex.rodriguez@email.com",
      phone: "+1 (555) 456-7890", 
      location: "Austin, TX",
      website: "alexrodriguez.com",
      summary: "Product manager with 4+ years of experience in agile development environments. Skilled in user research, product strategy, and cross-functional team leadership to deliver customer-centric solutions.",
      workExperience: [
        {
          company: "Product Innovations Co",
          position: "Senior Product Manager",
          duration: "Feb 2022 - Present", 
          bullets: [
            "Led product roadmap for mobile app with 500K+ monthly active users",
            "Conducted user research resulting in 30% increase in user engagement",
            "Coordinated with engineering teams to deliver features on schedule",
            "Analyzed product metrics to identify optimization opportunities"
          ]
        },
        {
          company: "Growth Solutions LLC",
          position: "Product Manager",
          duration: "Aug 2020 - Jan 2022",
          bullets: [
            "Managed product backlog and sprint planning for agile teams",
            "Launched new feature resulting in 15% revenue increase",
            "Collaborated with UX designers to improve user experience"
          ]
        }
      ],
      education: [
        {
          institution: "University of Texas at Austin",
          degree: "Bachelor of Business Administration",
          duration: "2016 - 2020",
          gpa: "3.7 GPA"
        }
      ]
    }
  ];
  
  const score = scores[Math.floor(Math.random() * scores.length)];
  const profile = candidateProfiles[Math.floor(Math.random() * candidateProfiles.length)];
  
  // Generate metrics based on score
  const impactScore = Math.floor(score * 0.4 + Math.random() * 5);
  const presentationScore = Math.floor(score * 0.3 + Math.random() * 5);
  const competenciesScore = Math.floor(score * 0.3 + Math.random() * 5);
  
  const improvementSteps = [
    {
      title: "Showcase more competencies",
      points: `+${Math.floor(Math.random() * 10 + 8)}`,
      description: "Include more experiences as per your target function to showcase soft skills."
    },
    {
      title: "Remove overused and filler words", 
      points: `+${Math.floor(Math.random() * 8 + 5)}`,
      description: "Avoid repetition and the use of filler words in your resume."
    },
    {
      title: "Improve bullet structure",
      points: `+${Math.floor(Math.random() * 7 + 4)}`,
      description: "Begin resume bullets with action verbs and quantify your work."
    }
  ];
  
  return {
    score,
    name: `${profile.name} Resume`,
    profile,
    uploadDate: new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    uploadTime: new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }),
    metrics: [
      { label: "Impact", score: impactScore, maxScore: 40 },
      { label: "Presentation", score: presentationScore, maxScore: 30 },
      { label: "Competencies", score: competenciesScore, maxScore: 30 }
    ],
    improvementSteps
  };
};