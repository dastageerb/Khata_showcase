
import React, { useState } from 'react';
import FloatingNavigation from '@/components/navigation/FloatingNavigation';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Import all page components
import Homepage from '@/pages/Homepage';
import CustomersPage from '@/pages/CustomersPage';
import CompaniesPage from '@/pages/CompaniesPage';
import TransactionsPage from '@/pages/TransactionsPage';
import BillPage from '@/pages/BillPage';
import BillingHistoryPage from '@/pages/BillingHistoryPage';
import SettingsPage from '@/pages/SettingsPage';
import CustomerDetailPage from '@/pages/CustomerDetailPage';
import CompanyDetailPage from '@/pages/CompanyDetailPage';

const MainLayout: React.FC = () => {
  const [currentPath, setCurrentPath] = useState('/');
  const [currentParams, setCurrentParams] = useState<{ [key: string]: string }>({});
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
        return <CustomersPage onNavigate={handleNavigate} />;
      case '/companies':
        return <CompaniesPage onNavigate={handleNavigate} />;
      case '/transactions':
        return <TransactionsPage />;
      case '/bill':
        return <BillPage />;
      case '/billing-history':
        return <BillingHistoryPage />;
      case '/settings':
        return <SettingsPage />;
      default:
        return <Homepage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <FloatingNavigation 
        currentPath={currentPath}
        onNavigate={(path) => handleNavigate(path)}
      />
      
      <div className="flex-1 ml-4 sm:ml-16">
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h1 className="text-lg sm:text-xl font-bold text-primary">
                {state.settings.shop_name}
              </h1>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium hidden sm:block">{state.currentUser?.name}</span>
              </div>
              <Button variant="outline" onClick={handleLogout} size="sm">
                <LogOut className="w-3.5 h-3.5 mr-1" />
                <span className="hidden sm:block">Logout</span>
              </Button>
            </div>
          </div>
        </header>
        
        <main className="container mx-auto px-4 py-4 sm:py-8">
          <div className="animate-fade-in">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
