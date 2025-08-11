import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, BarChart3, TrendingUp, Users, Target, Calendar, AlertCircle } from "lucide-react";

const RightSidebar = () => {
  return (
    <div className="w-full xl:w-80 bg-dashboard-sidebar p-4 xl:p-6 space-y-4 xl:space-y-6">
      {/* Steps to Follow */}
      <Card className="p-6 bg-gradient-card border-0 shadow-soft">
        <h3 className="font-semibold text-foreground mb-4 flex items-center">
          <FileText className="h-4 w-4 mr-2 text-primary" />
          Steps to follow
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-semibold">
              1
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <Upload className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Upload existing resume</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-xs font-semibold">
              2
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Get instant score and check detailed feedback</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Community Insights */}
      <Card className="p-6 bg-gradient-card border-0 shadow-soft">
        <h3 className="font-semibold text-foreground mb-4 flex items-center">
          <Users className="h-4 w-4 mr-2 text-primary" />
          Community Insights
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
            <AlertCircle className="h-4 w-4 text-info mt-0.5" />
            <div>
              <p className="text-sm text-foreground">Resumes are observed to secure, on average, a score of <span className="font-semibold">74</span> on the RScan platform</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
            <TrendingUp className="h-4 w-4 text-success mt-0.5" />
            <div>
              <p className="text-sm text-foreground"><span className="font-semibold">16</span> is the surge in score observed for users once they incorporate RScan feedback</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
            <Target className="h-4 w-4 text-primary mt-0.5" />
            <div>
              <p className="text-sm text-foreground">Analytical skill is the highest reflected skill in resumes of RScan users</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
            <FileText className="h-4 w-4 text-warning mt-0.5" />
            <div>
              <p className="text-sm text-foreground"><span className="font-semibold">450</span> is the average number of words constituting most resumes</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
            <Calendar className="h-4 w-4 text-info mt-0.5" />
            <div>
              <p className="text-sm text-foreground">'DEVELOPED' and 'MANAGED' are the most frequently used action verbs in resumes</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
            <BarChart3 className="h-4 w-4 text-success mt-0.5" />
            <div>
              <p className="text-sm text-foreground"><span className="font-semibold">20</span> is the average number of bullets identified in most resumes</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Help Button */}
      <div className="fixed bottom-6 right-6">
        <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 transition-transform">
          <span className="text-primary-foreground font-bold text-lg">?</span>
        </div>
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-destructive rounded-full flex items-center justify-center">
          <span className="text-destructive-foreground text-xs">!</span>
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;