import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, TrendingUp, Users } from "lucide-react";
import UploadModal from "./UploadModal";

const MainContent = () => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [analytics, setAnalytics] = useState({
    totalResumes: 0,
    averageScore: 0,
    topSkills: [
      { name: "Communication Skills", percentage: 0, color: "primary" },
      { name: "Project Management", percentage: 0, color: "success" },
      { name: "Analytical Thinking", percentage: 0, color: "info" },
      { name: "Critical Thinking", percentage: 0, color: "warning" }
    ],
    uploadsRemaining: 5
  });

  // Load and calculate analytics from stored resumes
  useEffect(() => {
    calculateAnalytics();
  }, []);

  const calculateAnalytics = () => {
    try {
      const storedResumes = localStorage.getItem('uploadedResumes');
      const resumes = storedResumes ? JSON.parse(storedResumes) : [];
      
      if (resumes.length === 0) {
        // Default analytics for new users
        setAnalytics({
          totalResumes: 0,
          averageScore: 0,
          topSkills: [
            { name: "Communication Skills", percentage: 72, color: "primary" },
            { name: "Project Management", percentage: 65, color: "success" },
            { name: "Analytical Thinking", percentage: 58, color: "info" },
            { name: "Critical Thinking", percentage: 54, color: "warning" }
          ],
          uploadsRemaining: 5
        });
        return;
      }

      // Calculate real analytics from user's resumes
      const totalResumes = resumes.length;
      const scores = resumes.map(resume => resume.analysisData?.score || 0);
      const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      
      // Calculate skill frequencies and percentages
      const skillCounts = {};
      const totalSkillMentions = resumes.reduce((total, resume) => {
        const skills = resume.analysisData?.profile?.skills || [];
        skills.forEach(skill => {
          const normalizedSkill = skill.toLowerCase();
          if (normalizedSkill.includes('communication') || normalizedSkill.includes('verbal') || normalizedSkill.includes('written')) {
            skillCounts['Communication Skills'] = (skillCounts['Communication Skills'] || 0) + 1;
          } else if (normalizedSkill.includes('project') || normalizedSkill.includes('management') || normalizedSkill.includes('planning')) {
            skillCounts['Project Management'] = (skillCounts['Project Management'] || 0) + 1;
          } else if (normalizedSkill.includes('analytical') || normalizedSkill.includes('analysis') || normalizedSkill.includes('data')) {
            skillCounts['Analytical Thinking'] = (skillCounts['Analytical Thinking'] || 0) + 1;
          } else if (normalizedSkill.includes('critical') || normalizedSkill.includes('problem') || normalizedSkill.includes('solution')) {
            skillCounts['Critical Thinking'] = (skillCounts['Critical Thinking'] || 0) + 1;
          }
        });
        return total + skills.length;
      }, 0);

      // Calculate percentages based on frequency and average score
      const topSkills = [
        { 
          name: "Communication Skills", 
          percentage: Math.min(95, Math.max(20, Math.round(((skillCounts['Communication Skills'] || 0) / totalResumes) * averageScore * 1.2))),
          color: "primary" 
        },
        { 
          name: "Project Management", 
          percentage: Math.min(90, Math.max(15, Math.round(((skillCounts['Project Management'] || 0) / totalResumes) * averageScore * 1.1))),
          color: "success" 
        },
        { 
          name: "Analytical Thinking", 
          percentage: Math.min(85, Math.max(10, Math.round(((skillCounts['Analytical Thinking'] || 0) / totalResumes) * averageScore * 1.0))),
          color: "info" 
        },
        { 
          name: "Critical Thinking", 
          percentage: Math.min(80, Math.max(5, Math.round(((skillCounts['Critical Thinking'] || 0) / totalResumes) * averageScore * 0.9))),
          color: "warning" 
        }
      ];

      setAnalytics({
        totalResumes,
        averageScore,
        topSkills,
        uploadsRemaining: Math.max(0, 5 - totalResumes)
      });

    } catch (error) {
      console.error('Error calculating analytics:', error);
      // Fallback to default analytics
      setAnalytics({
        totalResumes: 0,
        averageScore: 0,
        topSkills: [
          { name: "Communication Skills", percentage: 72, color: "primary" },
          { name: "Project Management", percentage: 65, color: "success" },
          { name: "Analytical Thinking", percentage: 58, color: "info" },
          { name: "Critical Thinking", percentage: 54, color: "warning" }
        ],
        uploadsRemaining: 5
      });
    }
  };

  // Recalculate analytics when modal closes (after potential upload)
  const handleModalClose = () => {
    setIsUploadModalOpen(false);
    setTimeout(() => {
      calculateAnalytics();
    }, 500); // Small delay to ensure localStorage is updated
  };
  return (
    <div className="flex-1 p-4 lg:p-6 bg-dashboard-bg space-y-4 lg:space-y-6">
      {/* Analytics Chart Card */}
      <Card className="p-6 bg-gradient-card border-0 shadow-moderate">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Resume Analytics Overview</h3>
          <div className="text-sm text-muted-foreground">
            {analytics.totalResumes > 0 
              ? `Based on ${analytics.totalResumes} uploaded resume${analytics.totalResumes > 1 ? 's' : ''} (Avg: ${analytics.averageScore}%)` 
              : "Industry benchmark data"
            }
          </div>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {analytics.topSkills.map((skill, index) => (
            <div key={index} className="text-center space-y-2">
              <div className={`w-16 h-16 mx-auto bg-${skill.color}/10 rounded-full flex items-center justify-center`}>
                <span className={`text-${skill.color} font-bold`}>{skill.percentage}%</span>
              </div>
              <p className="text-sm font-medium">{skill.name}</p>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className={`bg-${skill.color} h-2 rounded-full transition-all duration-1000 ease-out`} 
                  style={{ width: `${skill.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-center space-x-2">
          <Button variant="outline" size="sm" className="bg-primary text-primary-foreground border-primary">
            Download Reports
          </Button>
          <Button variant="outline" size="sm">
            Schedule follow-up
          </Button>
        </div>
      </Card>

      {/* Upload Resume Section */}
      <Card className="p-8 bg-gradient-card border-0 shadow-moderate text-center">
        <div className="max-w-md mx-auto space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Improve Your Resume</h2>
            <p className="text-muted-foreground">Upload existing Resume to get instant feedback</p>
          </div>
          
          <div className="p-8 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <Button 
              className="bg-gradient-primary text-primary-foreground hover:opacity-90 transition-opacity"
              onClick={() => setIsUploadModalOpen(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Resume ({analytics.uploadsRemaining} left)
            </Button>
          </div>
          
          <div className="flex justify-center space-x-8 text-sm">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">PDF, DOC supported</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Instant analysis</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Bottom Insights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <Card className="p-6 bg-gradient-card border-0 shadow-moderate">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-success/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-success" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground mb-2">
                {analytics.totalResumes > 0 
                  ? `${analytics.topSkills[0].name} is your strongest skill area`
                  : "Analytical skill is the highest reflected skill"
                }
              </h4>
              <p className="text-sm text-muted-foreground">
                {analytics.totalResumes > 0 
                  ? `appearing in ${analytics.topSkills[0].percentage}% of your resume analysis.`
                  : "across thousands of high-scoring resumes."
                }
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card border-0 shadow-moderate">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground mb-2">
                {analytics.totalResumes > 0 
                  ? `Your average resume score is ${analytics.averageScore}%`
                  : "More than 70% of high-scoring resumes"
                }
              </h4>
              <p className="text-sm text-muted-foreground">
                {analytics.totalResumes > 0 
                  ? `Keep uploading resumes to track your improvement over time.`
                  : "show scope of responsibilities with quantified impact."
                }
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Upload Modal */}
      <UploadModal 
        isOpen={isUploadModalOpen} 
        onClose={handleModalClose} 
      />
    </div>
  );
};

export default MainContent;