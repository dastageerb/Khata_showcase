
import React from 'react';
import CustomersPage from './CustomersPage';
import CompaniesPage from './CompaniesPage';

interface ContactsPageProps {
  onNavigate: (path: string, params?: { [key: string]: string }) => void;
}

const ContactsPage: React.FC<ContactsPageProps> = ({ onNavigate }) => {
  // Check current path to determine which page to show
  const currentPath = window.location.pathname;
  
  if (currentPath === '/customers') {
    return <CustomersPage onNavigate={onNavigate} />;
  } else if (currentPath === '/companies') {
    return <CompaniesPage onNavigate={onNavigate} />;
  }
  
  // Default to customers if path is ambiguous
  return <CustomersPage onNavigate={onNavigate} />;
};

export default ContactsPage;
