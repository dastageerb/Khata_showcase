
import React, { useState, useEffect } from 'react';
import { Home, Users, Building, Activity, Receipt, Archive, Settings, TrendingUp } from 'lucide-react';
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
  { id: 'sales', icon: TrendingUp, label: 'Sales', path: '/sales' },
  { id: 'history', icon: Archive, label: 'Billing History', path: '/billing-history' },
  { id: 'settings', icon: Settings, label: 'Settings', path: '/settings' },
];

interface FloatingNavigationProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onExpandedChange?: (expanded: boolean) => void;
}

const FloatingNavigation: React.FC<FloatingNavigationProps> = ({ currentPath, onNavigate, onExpandedChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (onExpandedChange) {
      onExpandedChange(isExpanded);
    }
  }, [isExpanded, onExpandedChange]);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="fixed left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-50">
      <div 
        className={`bg-white rounded-2xl shadow-2xl border border-gray-200 transition-all duration-500 ease-in-out ${
          isExpanded ? 'w-44 sm:w-48 p-3 sm:p-4' : 'w-14 sm:w-16 p-2'
        }`}
      >
        <div className="flex flex-col space-y-1 sm:space-y-2">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');
            
            return (
              <Button
                key={item.id}
                variant={isActive ? 'default' : 'ghost'}
                className={`
                  transition-all duration-300 ease-in-out transform hover:scale-105
                  ${isExpanded ? 'justify-start px-2 sm:px-3 py-2' : 'p-2 sm:p-3 justify-center'}
                  ${isActive ? 'bg-primary text-white shadow-lg' : 'hover:bg-gray-100'}
                  ${!isExpanded ? 'w-10 h-10 sm:w-12 sm:h-12' : 'w-full h-9 sm:h-10'}
                  text-xs sm:text-sm
                `}
                onClick={() => {
                  onNavigate(item.path);
                  if (!isExpanded) setIsExpanded(true);
                }}
                style={{
                  animationDelay: `${index * 50}ms`
                }}
              >
                <Icon className={`${isExpanded ? 'w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2' : 'w-4 h-4 sm:w-5 sm:h-5'} transition-all duration-300`} />
                {isExpanded && (
                  <span className="font-medium whitespace-nowrap animate-fade-in text-xs sm:text-sm">
                    {item.label}
                  </span>
                )}
              </Button>
            );
          })}
        </div>
        
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleToggle}
            className={`
              transition-all duration-300 transform hover:scale-105
              ${isExpanded ? 'w-full justify-center' : 'w-10 h-10 sm:w-12 sm:h-12 p-0 justify-center'}
              text-xs sm:text-sm
            `}
          >
            <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
              {isExpanded ? '←' : '→'}
            </div>
            {isExpanded && <span className="ml-1 sm:ml-2 text-xs sm:text-sm">Collapse</span>}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FloatingNavigation;
