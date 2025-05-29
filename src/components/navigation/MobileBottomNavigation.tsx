import React from 'react';
import { Home, Users, Building, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface NavigationItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
}

const navigationItems: NavigationItem[] = [
  { id: 'home', icon: Home, label: 'Home', path: '/' },
  { id: 'customers', icon: Users, label: 'Customers', path: '/customers' },
  { id: 'companies', icon: Building, label: 'Companies', path: '/companies' },
  { id: 'transactions', icon: Activity, label: 'Transactions', path: '/transactions' }
];

interface MobileBottomNavigationProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

const MobileBottomNavigation: React.FC<MobileBottomNavigationProps> = ({ currentPath, onNavigate }) => {
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
      <div className="flex justify-around items-center py-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              className={`flex flex-col items-center justify-center p-2 h-auto space-y-1 ${
                isActive ? 'text-primary' : 'text-gray-500'
              }`}
              onClick={() => onNavigate(item.path)}
            >
              <Icon className="h-4 w-4" />
              <span className="text-xs">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNavigation;