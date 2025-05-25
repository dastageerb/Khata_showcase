
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AppProvider } from '@/context/AppContext';
import Index from '@/pages/Index';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Index />
            <Toaster />
          </div>
        </Router>
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
