
import React, { useState } from 'react';
import FloatingNavigation from '@/components/navigation/FloatingNavigation';
import MobileBottomNavigation from '@/components/navigation/MobileBottomNavigation';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

// Import all page components
import Homepage from '@/pages/Homepage';
import ContactsPage from '@/pages/ContactsPage';
import TransactionsPage from '@/pages/TransactionsPage';
import BillPage from '@/pages/BillPage';
import BillingHistoryPage from '@/pages/BillingHistoryPage';
import SalesPage from '@/pages/SalesPage';
import SettingsPage from '@/pages/SettingsPage';
import CustomerDetailPage from '@/pages/CustomerDetailPage';
import CompanyDetailPage from '@/pages/CompanyDetailPage';

const MainLayout: React.FC = () => {
  const [currentPath, setCurrentPath] = useState('/');
  const [currentParams, setCurrentParams] = useState<{ [key: string]: string }>({});
  const [isNavExpanded, setIsNavExpanded] = useState(false);
  const { state, dispatch } = useApp();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleLogout = () => {
    dispatch({ type: 'SET_CURRENT_USER', payload: null });
    setCurrentPath('/');
    toast({
      title: "Logged out successfully",
      description: "You've been logged out of the system",
    });
  };

  const handleNavigate = (path: string, params?: { [key: string]: string }) => {
    setCurrentPath(path);
    setCurrentParams(params || {});
    // Update window location for ContactsPage routing
    window.history.pushState({}, '', path);
  };

  const renderContent = () => {
    if (currentPath.startsWith('/customers/') && currentParams.customerId) {
      return <CustomerDetailPage customerId={currentParams.customerId} onNavigate={handleNavigate} />;
    }
    if (currentPath.startsWith('/companies/') && currentParams.companyId) {
      return <CompanyDetailPage companyId={currentParams.companyId} onNavigate={handleNavigate} />;
    }
    
    switch (currentPath) {
      case '/':
        return <Homepage />;
      case '/customers':
      case '/companies':
        return <ContactsPage onNavigate={handleNavigate} />;
      case '/transactions':
        return <TransactionsPage />;
      case '/bill':
        return <BillPage />;
      case '/sales':
        return <SalesPage />;
      case '/billing-history':
        return <BillingHistoryPage />;
      case '/settings':
        return <SettingsPage />;
      default:
        return <Homepage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-inter overflow-hidden">
      {!isMobile && (
        <FloatingNavigation 
          currentPath={currentPath}
          onNavigate={(path) => handleNavigate(path)}
          onExpandedChange={setIsNavExpanded}
        />
      )}
      
      <div className={`flex-1 transition-all duration-300 flex flex-col overflow-hidden ${
        !isMobile ? (isNavExpanded ? 'ml-48 sm:ml-52' : 'ml-4 sm:ml-16') : ''
      }`}>
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40 shrink-0">
          <div className="container mx-auto px-4 py-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h1 className="text-sm font-bold text-primary tracking-tight font-inter">
                {state.settings.shop_name}
              </h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 bg-gray-50 px-2 py-1 rounded-lg">
                <User className="w-3 h-3 text-primary" />
                <span className="text-xs font-semibold text-gray-700 hidden sm:block font-inter">{state.currentUser?.name}</span>
              </div>
              <Button variant="outline" onClick={handleLogout} size="sm" className="font-medium rounded-lg font-inter text-xs h-7">
                <LogOut className="w-3 h-3 mr-1" />
                <span className="hidden sm:block">Logout</span>
              </Button>
            </div>
          </div>
        </header>
        
        <main className={`flex-1 min-h-0 overflow-hidden ${isMobile ? 'pb-16' : ''}`}>
          <div className="animate-fade-in h-full overflow-auto">
            {renderContent()}
          </div>
        </main>
      </div>

      <MobileBottomNavigation 
        currentPath={currentPath}
        onNavigate={handleNavigate}
      />
    </div>
  );
};

export default MainLayout;
