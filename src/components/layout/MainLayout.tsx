
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

const MainLayout: React.FC = () => {
  const [currentPath, setCurrentPath] = useState('/');
  const { state, dispatch } = useApp();
  const { toast } = useToast();

  const handleLogout = () => {
    dispatch({ type: 'SET_CURRENT_USER', payload: null });
    toast({
      title: "Logged out successfully",
      description: "You've been logged out of the system",
    });
  };

  const renderContent = () => {
    switch (currentPath) {
      case '/':
        return <Homepage />;
      case '/customers':
        return <CustomersPage />;
      case '/companies':
        return <CompaniesPage />;
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-primary">
              {state.settings.shop_name}
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">{state.currentUser?.name}</span>
            </div>
            <Button variant="outline" onClick={handleLogout} size="sm">
              <LogOut className="w-3.5 h-3.5 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="animate-fade-in">
          {renderContent()}
        </div>
      </main>
      
      <FloatingNavigation 
        currentPath={currentPath}
        onNavigate={setCurrentPath}
      />
    </div>
  );
};

export default MainLayout;
