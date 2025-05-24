
import React from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import LoginScreen from '@/components/auth/LoginScreen';
import SignupScreen from '@/components/auth/SignupScreen';
import MainLayout from '@/components/layout/MainLayout';

const Index: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

const AppContent: React.FC = () => {
  const { state } = useApp();
  const [showLoginScreen, setShowLoginScreen] = React.useState(true);
  
  if (state.currentUser) {
    return <MainLayout />;
  }
  
  return showLoginScreen ? (
    <LoginScreen onShowSignup={() => setShowLoginScreen(false)} />
  ) : (
    <SignupScreen onBack={() => setShowLoginScreen(true)} />
  );
};

export default Index;
