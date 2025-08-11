import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Brain, 
  TrendingUp, 
  Eye, 
  Search, 
  CheckCircle,
  Loader2
} from "lucide-react";

interface AnalysisProgressProps {
  isVisible: boolean;
  onComplete: () => void;
}

const AnalysisProgress = ({ isVisible, onComplete }: AnalysisProgressProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  const analysisSteps = [
    {
      id: 1,
      text: "Reading your resume…",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      id: 2,
      text: "Extracting your skills & experience…",
      icon: Brain,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      id: 3,
      text: "Comparing with job market trends…",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      id: 4,
      text: "Analyzing structure & clarity…",
      icon: Eye,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    },
    {
      id: 5,
      text: "Evaluating keyword relevance…",
      icon: Search,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100"
    },
    {
      id: 6,
      text: "Preparing comprehensive analysis…",
      icon: CheckCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100"
    }
  ];

  useEffect(() => {
    if (!isVisible) return;

    const stepDuration = 1500; // 1.5 seconds per step
    const totalDuration = stepDuration * analysisSteps.length;
    
    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const increment = 100 / (totalDuration / 50); // Update every 50ms
        return Math.min(prev + increment, 100);
      });
    }, 50);

    // Step progression
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        const nextStep = prev + 1;
        if (nextStep >= analysisSteps.length) {
          clearInterval(stepInterval);
          clearInterval(progressInterval);
          
          // Complete animation and redirect after a brief pause
          setTimeout(() => {
            onComplete();
            navigate('/resume-analysis');
          }, 500);
          
          return prev;
        }
        return nextStep;
      });
    }, stepDuration);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, [isVisible, navigate, onComplete]);

  if (!isVisible) return null;

  const CurrentIcon = currentStep < analysisSteps.length ? analysisSteps[currentStep].icon : CheckCircle;
  const currentStepData = currentStep < analysisSteps.length ? analysisSteps[currentStep] : analysisSteps[analysisSteps.length - 1];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4 p-8">
        <div className="text-center space-y-6">
          {/* Main Icon with Animation */}
          <div className="flex justify-center">
            <div className={`relative w-16 h-16 ${currentStepData.bgColor} rounded-full flex items-center justify-center`}>
              <CurrentIcon className={`h-8 w-8 ${currentStepData.color} animate-pulse`} />
              <Loader2 className="absolute inset-0 h-16 w-16 text-gray-300 animate-spin opacity-20" />
            </div>
          </div>

          {/* Title */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Analyzing Your Resume
            </h2>
            <p className="text-sm text-gray-500">
              Please wait while we process your document
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-gray-400">
              {Math.round(progress)}% Complete
            </p>
          </div>

          {/* Current Step with Typewriter Effect */}
          <div className="min-h-[60px] flex items-center justify-center">
            <p 
              key={currentStep}
              className="text-base font-medium text-gray-700 animate-in fade-in-50 duration-300"
            >
              {currentStep < analysisSteps.length ? analysisSteps[currentStep].text : "Analysis Complete!"}
            </p>
          </div>

          {/* Step Indicators */}
          <div className="flex justify-center space-x-2">
            {analysisSteps.map((step, index) => {
              const StepIcon = step.icon;
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep;
              
              return (
                <div
                  key={step.id}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCompleted 
                      ? `${step.bgColor} ${step.color}` 
                      : isCurrent 
                      ? `${step.bgColor} ${step.color} scale-110 shadow-md` 
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  <StepIcon className="h-4 w-4" />
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AnalysisProgress;
