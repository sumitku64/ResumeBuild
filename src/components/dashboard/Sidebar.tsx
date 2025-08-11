import { Card } from "@/components/ui/card";
import { FileText, TrendingUp, Users, Target } from "lucide-react";

const Sidebar = () => {
  return (
    <div className="w-full lg:w-80 bg-dashboard-sidebar p-4 lg:p-6 space-y-4 lg:space-y-6">
      {/* Best Practices Section */}
      <Card className="p-6 bg-gradient-card border-0 shadow-soft">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-muted-foreground uppercase tracking-wide">
            Best Practices
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">24x7 Insights</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  See actionable feedback powered by sophisticated data analysis, pattern recognition, 
                  natural language processing and predictive science.
                </p>
              </div>
            </div>
          </div>

          {/* Progress Indicators */}
          <div className="flex justify-center space-x-2 pt-4">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <div className="w-2 h-2 bg-muted rounded-full"></div>
            <div className="w-2 h-2 bg-muted rounded-full"></div>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="space-y-4">
        <Card className="p-4 bg-gradient-card border-0 shadow-soft hover:shadow-moderate transition-all duration-300">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-info/10 rounded-lg">
              <Target className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Skill Focus</p>
              <p className="font-semibold text-sm">Analytical skill is the highest reflected skill across thousands of high-scoring resumes.</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-card border-0 shadow-soft hover:shadow-moderate transition-all duration-300">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <Users className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Impact Scope</p>
              <p className="font-semibold text-sm">More than 70% of high-scoring resumes show scope of responsibilities with quantified impact.</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-card border-0 shadow-soft hover:shadow-moderate transition-all duration-300">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-warning/10 rounded-lg">
              <FileText className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Experience Tips</p>
              <p className="font-semibold text-sm">An average high-scoring resume has 15 bullets for the Experience section.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Sidebar;