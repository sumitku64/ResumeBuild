import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, MoreVertical, TrendingUp, FileText, Target } from "lucide-react";
import Header from "@/components/dashboard/Header";
import RightSidebar from "@/components/dashboard/RightSidebar";
import { generateRandomAnalysis } from "@/utils/analysisGenerator";

const ResumeAnalysis = () => {
  const navigate = useNavigate();
  const [analysisData, setAnalysisData] = useState(() => {
    const stored = localStorage.getItem('resumeAnalysis');
    return stored ? JSON.parse(stored) : generateRandomAnalysis();
  });
  
  const { score, name, uploadDate, uploadTime, metrics, improvementSteps } = analysisData;
  const maxScore = 100;
  const targetScore = 76; // Green Zone threshold
  const pointsNeeded = Math.max(0, targetScore - score);

  // Calculate the percentage for the arc
  const percentage = (score / maxScore) * 100;
  const circumference = 2 * Math.PI * 90; // radius of 90
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const improvementStepsWithIcons = improvementSteps.map((step, index) => ({
    ...step,
    icon: [Target, FileText, TrendingUp][index],
    color: ["bg-primary", "bg-info", "bg-success"][index]
  }));

  const metricsWithColors = metrics.map(metric => ({
    ...metric,
    color: metric.score / metric.maxScore > 0.7 ? "text-success" : 
           metric.score / metric.maxScore > 0.5 ? "text-warning" : "text-destructive"
  }));

  return (
    <div className="min-h-screen bg-dashboard-bg">
      <Header />
      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 p-4 md:p-6 space-y-6">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Resume Module</h1>
            </div>
            <Button className="bg-gradient-primary text-primary-foreground hover:opacity-90 w-full sm:w-auto">
              <Upload className="h-4 w-4 mr-2" />
              Upload Resume (5 left)
            </Button>
          </div>

          {/* Resume Info */}
          <Card className="p-6 bg-gradient-card border-0 shadow-moderate">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">{name}</h2>
                <p className="text-sm text-muted-foreground">Uploaded - {uploadDate} at {uploadTime}</p>
              </div>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </Card>

          {/* Score Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Score Chart */}
            <Card className="p-6 bg-gradient-card border-0 shadow-moderate">
              <h3 className="text-lg font-semibold text-foreground mb-6">Your Score</h3>
              
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8">
                {/* Circular Progress */}
                <div className="relative w-32 h-32 sm:w-48 sm:h-48">
                  <svg className="w-32 h-32 sm:w-48 sm:h-48 transform -rotate-90" viewBox="0 0 200 200">
                    {/* Background circle */}
                    <circle
                      cx="100"
                      cy="100"
                      r="90"
                      stroke="hsl(var(--muted))"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    {/* Progress arc */}
                    <circle
                      cx="100"
                      cy="100"
                      r="90"
                      stroke="url(#gradient)"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                    {/* Gradient definition */}
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f97316" />
                        <stop offset="70%" stopColor="#fb923c" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                  </svg>
                  {/* Score text */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl sm:text-5xl font-bold text-warning">{score}</span>
                  </div>
                </div>

                {/* Score Legend */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-4 h-4 bg-destructive rounded"></div>
                    <span className="text-sm text-muted-foreground">Needs Work</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-4 h-4 bg-warning rounded"></div>
                    <span className="text-sm text-muted-foreground">On Track</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-4 h-4 bg-success rounded"></div>
                    <span className="text-sm text-muted-foreground">Good Job</span>
                  </div>
                </div>
              </div>

              {/* RScan Benchmark */}
              <div className="mt-6 flex items-center justify-center space-x-2">
                <div className="w-6 h-6 bg-gradient-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs">RS</span>
                </div>
                <span className="text-sm text-muted-foreground">Benchmarked against millions of Resumes</span>
              </div>
            </Card>

            {/* Improvement Section */}
            <Card className="p-6 bg-gradient-card border-0 shadow-moderate">
              <div className="space-y-6">
                <div>
                  <h3 className={`text-xl font-semibold mb-2 ${score >= targetScore ? 'text-success' : 'text-warning'}`}>
                    {score >= targetScore ? 'Excellent work!' : 'You are on track!'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {pointsNeeded > 0 ? (
                      <>You need only <span className="font-semibold text-foreground">{pointsNeeded} points</span> to reach the{" "}
                      <span className="font-semibold text-success">Green Zone</span></>
                    ) : (
                      <span className="font-semibold text-success">You've reached the Green Zone!</span>
                    )}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-primary mb-4">Steps to Improve Your Score</h4>
                  <div className="space-y-4">
                    {improvementStepsWithIcons.map((step, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className={`p-2 ${step.color}/10 rounded-lg`}>
                          <step.icon className={`h-4 w-4 ${step.color.replace('bg-', 'text-')}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h5 className="font-medium text-foreground">{step.title}</h5>
                            <Badge variant="secondary" className="bg-primary text-primary-foreground px-2 py-0.5 text-xs">
                              {step.points}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90"
                  onClick={() => navigate("/detailed-feedback")}
                >
                  View Detailed Feedback
                </Button>
              </div>
            </Card>
          </div>

          {/* Bottom Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {metricsWithColors.map((metric, index) => (
              <Card key={index} className="p-6 bg-gradient-card border-0 shadow-moderate text-center">
                <div className={`text-3xl font-bold ${metric.color} mb-2`}>
                  {metric.score}
                  <span className="text-lg text-muted-foreground">/{metric.maxScore}</span>
                </div>
                <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
              </Card>
            ))}
          </div>
        </div>

        <RightSidebar />
      </div>
    </div>
  );
};

export default ResumeAnalysis;