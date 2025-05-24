
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';

interface SignupScreenProps {
  onBack: () => void;
}

const SignupScreen: React.FC<SignupScreenProps> = ({ onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    userType: 'USER' as 'USER' | 'ADMIN'
  });
  const { state, dispatch, generateId, addHistoryEntry } = useApp();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'SET_LOADING', payload: true });

    // Simulate loading
    setTimeout(() => {
      const newUser = {
        id: generateId('user'),
        email: formData.email,
        name: formData.name,
        role: formData.userType,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 'self',
        updated_by: 'self',
        history: []
      };

      addHistoryEntry(newUser, 'created', 'self', formData.name, 'User account created');
      dispatch({ type: 'ADD_USER', payload: newUser });
      
      toast({
        title: "Account Created!",
        description: `Welcome ${formData.name}! You can now login.`,
      });
      
      onBack();
      dispatch({ type: 'SET_LOADING', payload: false });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl animate-fade-in">
        <CardHeader className="text-center space-y-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="absolute top-4 left-4 p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-3xl font-bold text-primary">Create Account</h1>
          <p className="text-gray-500">Join Al Mehran Radiator Portal</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                className="transition-all duration-300 focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <Input
                id="signup-email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
                className="transition-all duration-300 focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="signup-password">Password</Label>
              <Input
                id="signup-password"
                type="password"
                placeholder="Minimum 8 characters"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required
                minLength={8}
                className="transition-all duration-300 focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <div className="space-y-3">
              <Label>User Type</Label>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant={formData.userType === 'USER' ? 'default' : 'outline'}
                  className={`flex-1 transition-all duration-300 ${
                    formData.userType === 'USER' ? 'bg-primary hover:bg-primary/90' : ''
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, userType: 'USER' }))}
                >
                  User
                </Button>
                <Button
                  type="button"
                  variant={formData.userType === 'ADMIN' ? 'default' : 'outline'}
                  className={`flex-1 transition-all duration-300 ${
                    formData.userType === 'ADMIN' ? 'bg-primary hover:bg-primary/90' : ''
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, userType: 'ADMIN' }))}
                >
                  Admin
                </Button>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 transition-all duration-300 transform hover:scale-105"
              disabled={state.isLoading}
            >
              {state.isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Creating Account...</span>
                </div>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignupScreen;
