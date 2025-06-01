
import React from 'react';
import CustomersPage from './CustomersPage';
import CompaniesPage from './CompaniesPage';
import { useApp } from '@/context/AppContext';

interface ContactsPageProps {
  onNavigate: (path: string, params?: { [key: string]: string }) => void;
}

const ContactsPage: React.FC<ContactsPageProps> = ({ onNavigate }) => {
  const { state } = useApp();
  
  // Get current path from the MainLayout context or check the window location
  const getCurrentPath = () => {
    // This will be passed from MainLayout, but as fallback check window
    return window.location.pathname;
  };
  
  const currentPath = getCurrentPath();
  
  if (currentPath === '/companies' || currentPath.startsWith('/companies')) {
    return <CompaniesPage onNavigate={onNavigate} />;
  } else {
    // Default to customers for /customers path or any other path
    return <CustomersPage onNavigate={onNavigate} />;
  }
};

export default ContactsPage;
