
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AppProvider } from '@/context/AppContext';
import AuthWrapper from '@/components/auth/AuthWrapper';
import MainLayout from '@/components/layout/MainLayout';
import Index from '@/pages/Index';
import Homepage from '@/pages/Homepage';
import CustomersPage from '@/pages/CustomersPage';
import CustomerDetailPage from '@/pages/CustomerDetailPage';
import CompaniesPage from '@/pages/CompaniesPage';
import CompanyDetailPage from '@/pages/CompanyDetailPage';
import TransactionsPage from '@/pages/TransactionsPage';
import BillPage from '@/pages/BillPage';
import BillingHistoryPage from '@/pages/BillingHistoryPage';
import SettingsPage from '@/pages/SettingsPage';
import NotFound from '@/pages/NotFound';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <AuthWrapper>
              <MainLayout>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/home" element={<Homepage />} />
                  <Route path="/customers" element={<CustomersPage />} />
                  <Route path="/customers/:customerId" element={<CustomerDetailPage />} />
                  <Route path="/companies" element={<CompaniesPage />} />
                  <Route path="/companies/:companyId" element={<CompanyDetailPage />} />
                  <Route path="/transactions" element={<TransactionsPage />} />
                  <Route path="/bill" element={<BillPage />} />
                  <Route path="/billing-history" element={<BillingHistoryPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </MainLayout>
            </AuthWrapper>
            <Toaster />
          </div>
        </Router>
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
