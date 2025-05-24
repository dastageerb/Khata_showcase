
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

  return <>{children}</>;
};

export default AuthWrapper;
