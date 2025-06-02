import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';

interface LoginScreenProps {
  onShowSignup: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onShowSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [titleClickCount, setTitleClickCount] = useState(0);
  const { state, dispatch } = useApp();
  const { toast } = useToast();

  const handleTitleClick = () => {
    const newCount = titleClickCount + 1;
    setTitleClickCount(newCount);
    
    if (newCount === 5) {
      onShowSignup();
      setTitleClickCount(0);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'SET_LOADING', payload: true });

    // Simulate loading
    setTimeout(() => {
      const user = state.users.find(u => u.email === email);
      
      if (user && password === 'admin') { // Template password
        dispatch({ type: 'SET_CURRENT_USER', payload: user });
        toast({
          title: "Welcome back!",
          description: `Logged in as ${user.name}`,
        });
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid credentials. Use admin@admin.com / admin",
          variant: "destructive"
        });
      }
      
      dispatch({ type: 'SET_LOADING', payload: false });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 font-inter">
      <div className="w-full max-w-6xl mx-auto">
        <Card className="w-full max-w-md mx-auto shadow-2xl animate-fade-in border-0 rounded-3xl">
          <CardHeader className="text-center space-y-6 pb-8">
            <div 
              onClick={handleTitleClick}
              className="cursor-pointer select-none"
            >
              <h1 className="text-4xl font-bold text-primary tracking-tight font-inter">
                Khata Pro
              </h1>
              <p className="text-base text-gray-600 mt-3 font-medium font-inter">Financial Management Portal</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-8 px-8 pb-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-5">
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700 font-inter text-left block">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@admin.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 text-base transition-all duration-300 focus:ring-2 focus:ring-primary border-gray-200 rounded-xl font-inter"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700 font-inter text-left block">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="admin"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 text-base transition-all duration-300 focus:ring-2 focus:ring-primary border-gray-200 rounded-xl font-inter"
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 bg-primary hover:bg-primary/90 transition-all duration-300 transform hover:scale-[1.02] text-base font-semibold rounded-xl font-inter"
                disabled={state.isLoading}
              >
                {state.isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    <span className="font-inter">Signing In...</span>
                  </div>
                ) : (
                  <span className="font-inter">Sign In</span>
                )}
              </Button>
            </form>
            
            <div className="text-center">
              <div className="bg-gray-50 rounded-2xl p-4 mb-4">
                <p className="text-sm font-medium text-gray-600 mb-3 font-inter">Demo Credentials</p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="text-left">
                    <p className="font-semibold text-gray-700 font-inter">Email:</p>
                    <p className="font-mono text-primary">admin@admin.com</p>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-700 font-inter">Password:</p>
                    <p className="font-mono text-primary">admin</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginScreen;