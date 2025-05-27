
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
      toast({
        title: "Easter Egg Activated! 🥚",
        description: "Signup option is now available!",
      });
      onShowSignup();
      setTitleClickCount(0);
    } else if (newCount > 2) {
      toast({
        title: `${5 - newCount} more taps...`,
        description: "Keep tapping to unlock something special!",
      });
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 font-sans">
      <Card className="w-full max-w-md shadow-xl animate-fade-in border-0">
        <CardHeader className="text-center space-y-6 pb-8">
          <div 
            onClick={handleTitleClick}
            className="cursor-pointer select-none transition-all duration-300 hover:scale-105"
          >
            <h1 className="text-4xl font-bold text-primary tracking-tight">
              Al Mehran Radiator
            </h1>
            <p className="text-base text-gray-600 mt-3 font-medium">Financial Management Portal</p>
          </div>
          {titleClickCount > 0 && titleClickCount < 5 && (
            <div className="flex justify-center space-x-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    i < titleClickCount ? 'bg-primary animate-bounce' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-8 px-8 pb-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-5">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@admin.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 text-base transition-all duration-300 focus:ring-2 focus:ring-primary border-gray-200"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="admin"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 text-base transition-all duration-300 focus:ring-2 focus:ring-primary border-gray-200"
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 bg-primary hover:bg-primary/90 transition-all duration-300 transform hover:scale-[1.02] text-base font-semibold"
              disabled={state.isLoading}
            >
              {state.isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Signing In...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
          
          <div className="text-center">
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm font-medium text-gray-600 mb-3">Demo Credentials</p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="text-left">
                  <p className="font-semibold text-gray-700">Email:</p>
                  <p className="font-mono text-primary">admin@admin.com</p>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-700">Password:</p>
                  <p className="font-mono text-primary">admin</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500">💡 Tip: Tap the title 5 times for signup!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginScreen;
