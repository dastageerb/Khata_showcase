
import React from 'react';
import { useApp } from '@/context/AppContext';

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { state, dispatch } = useApp();

  // Auto-login for demo purposes
  React.useEffect(() => {
    if (!state.currentUser) {
      dispatch({ 
        type: 'SET_CURRENT_USER', 
        payload: state.users.find(u => u.role === 'ADMIN') || null 
      });
    }
  }, [state.currentUser, state.users, dispatch]);

  if (!state.currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Financial Management System</h1>
          <p className="text-gray-600">Please wait while we prepare your dashboard...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthWrapper;
