
import React, { useState } from 'react';
import { Home, Users, Building, Activity, Receipt, Archive, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavigationItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
}

const navigationItems: NavigationItem[] = [
  { id: 'home', icon: Home, label: 'Homepage', path: '/' },
  { id: 'customers', icon: Users, label: 'Customers', path: '/customers' },
  { id: 'companies', icon: Building, label: 'Companies', path: '/companies' },
  { id: 'transactions', icon: Activity, label: 'Transactions', path: '/transactions' },
  { id: 'bill', icon: Receipt, label: 'Bill', path: '/bill' },
  { id: 'history', icon: Archive, label: 'Billing History', path: '/billing-history' },
  { id: 'settings', icon: Settings, label: 'Settings', path: '/settings' },
];

interface FloatingNavigationProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

const FloatingNavigation: React.FC<FloatingNavigationProps> = ({ currentPath, onNavigate }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-50">
      <div 
        className={`bg-white rounded-2xl shadow-2xl border border-gray-200 transition-all duration-500 ease-in-out ${
          isExpanded ? 'w-48 p-4' : 'w-16 p-2'
        }`}
      >
        <div className="flex flex-col space-y-2">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? 'default' : 'ghost'}
                className={`
                  transition-all duration-300 ease-in-out transform hover:scale-105
                  ${isExpanded ? 'justify-start px-3 py-2' : 'p-3 justify-center'}
                  ${isActive ? 'bg-primary text-white shadow-lg' : 'hover:bg-gray-100'}
                  ${!isExpanded ? 'w-12 h-12' : 'w-full h-10'}
                `}
                onClick={() => {
                  onNavigate(item.path);
                  if (!isExpanded) setIsExpanded(true);
                }}
                style={{
                  animationDelay: `${index * 50}ms`
                }}
              >
                <Icon className={`${isExpanded ? 'w-4 h-4 mr-2' : 'w-5 h-5'} transition-all duration-300`} />
                {isExpanded && (
                  <span className="text-sm font-medium whitespace-nowrap animate-fade-in">
                    {item.label}
                  </span>
                )}
              </Button>
            );
          })}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            className={`
              transition-all duration-300 transform hover:scale-105
              ${isExpanded ? 'w-full justify-center' : 'w-12 h-12 p-0 justify-center'}
            `}
          >
            <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
              {isExpanded ? '←' : '→'}
            </div>
            {isExpanded && <span className="ml-2">Collapse</span>}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FloatingNavigation;
