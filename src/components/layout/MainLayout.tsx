
import React, { useState } from 'react';
import FloatingNavigation from '@/components/navigation/FloatingNavigation';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
      <FloatingNavigation 
        currentPath={currentPath}
        onNavigate={(path) => handleNavigate(path)}
        onExpandedChange={setIsNavExpanded}
      />
      
      <div className={`flex-1 transition-all duration-300 flex flex-col ${isNavExpanded ? 'ml-48 sm:ml-52' : 'ml-4 sm:ml-16'}`}>
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40 shrink-0">
          <div className="container mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h1 className="text-lg font-bold text-primary tracking-tight font-inter">
                {state.settings.shop_name}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 bg-gray-50 px-3 py-2 rounded-xl">
                <User className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-gray-700 hidden sm:block font-inter">{state.currentUser?.name}</span>
              </div>
              <Button variant="outline" onClick={handleLogout} size="sm" className="font-medium rounded-xl font-inter text-xs h-8">
                <LogOut className="w-3 h-3 mr-2" />
                <span className="hidden sm:block">Logout</span>
              </Button>
            </div>
          </div>
        </header>
        
        <main className="container mx-auto px-6 py-4 flex-1 min-h-0">
          <div className="animate-fade-in h-full">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
