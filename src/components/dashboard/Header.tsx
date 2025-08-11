import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, Menu, Search, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getUserInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getUserDisplayName = () => {
    if (currentUser?.name) return currentUser.name;
    if (currentUser?.email) return currentUser.email.split('@')[0];
    return "User";
  };

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6">
      {/* Left side - Logo and Navigation */}
      <div className="flex items-center space-x-2 lg:space-x-4">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">RS</span>
          </div>
          <span className="font-semibold text-foreground text-lg lg:text-xl">RScan</span>
        </div>
        <span className="text-muted-foreground text-sm lg:text-base hidden sm:inline">Student Dashboard</span>
      </div>

      {/* Right side - Actions and Profile */}
      <div className="flex items-center space-x-2 lg:space-x-4">
        <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground hover:text-foreground text-xs lg:text-sm"
            onClick={() => navigate("/resume-analysis")}
          >
            Resume Analysis
          </Button>
        </div>
        
        <div className="flex items-center space-x-2 lg:space-x-3">
          <Button variant="ghost" size="icon" className="relative h-8 w-8 lg:h-9 lg:w-9">
            <Search className="h-4 w-4 lg:h-5 lg:w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="relative h-8 w-8 lg:h-9 lg:w-9">
            <Bell className="h-4 w-4 lg:h-5 lg:w-5" />
          </Button>
          
          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 hover:bg-muted">
                  <Avatar className="h-7 w-7 lg:h-8 lg:w-8">
                    <AvatarFallback className="bg-gradient-primary text-white text-xs lg:text-sm">
                      {getUserInitials(currentUser?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs lg:text-sm font-medium hidden sm:inline">
                    {getUserDisplayName()}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate("/login")}
                className="text-xs lg:text-sm"
              >
                Sign In
              </Button>
              <Button 
                size="sm"
                onClick={() => navigate("/signup")}
                className="text-xs lg:text-sm"
              >
                Sign Up
              </Button>
            </div>
          )}
          
          <Button variant="ghost" size="icon" className="md:hidden h-8 w-8">
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;