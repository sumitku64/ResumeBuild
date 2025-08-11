import Header from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/Sidebar";
import MainContent from "@/components/dashboard/MainContent";
import RightSidebar from "@/components/dashboard/RightSidebar";

const Index = () => {
  return (
    <div className="min-h-screen bg-dashboard-bg">
      <Header />
      <div className="flex flex-col lg:flex-row">
        {/* Desktop sidebars */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        <MainContent />
        <div className="hidden xl:block">
          <RightSidebar />
        </div>
      </div>
    </div>
  );
};

export default Index;
