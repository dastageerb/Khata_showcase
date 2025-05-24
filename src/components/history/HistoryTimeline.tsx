
import React from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { HistoryEntry } from '@/context/AppContext';
import { cn } from '@/lib/utils';

interface HistoryTimelineProps {
  history: HistoryEntry[];
  className?: string;
  limit?: number;
}

const HistoryTimeline: React.FC<HistoryTimelineProps> = ({ history, className, limit }) => {
  const displayHistory = limit ? history.slice(0, limit) : history;
  
  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="font-semibold flex items-center gap-2 text-gray-700">
        <span className="inline-block">📋</span> Transaction History
      </h3>
      
      <div className="space-y-3">
        {displayHistory.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No history available</p>
        ) : (
          displayHistory.map((entry, index) => {
            const getActionColor = () => {
              switch (entry.action) {
                case 'created': return 'text-blue-500 bg-blue-100';
                case 'updated': return 'text-amber-500 bg-amber-100';
                case 'deleted': return 'text-red-500 bg-red-100';
                case 'status_changed': return 'text-purple-500 bg-purple-100';
                default: return 'text-gray-500 bg-gray-100';
              }
            };

            const getActionIcon = () => {
              switch (entry.action) {
                case 'created': return '🔵';
                case 'updated': return '🟡';
                case 'deleted': return '🔴';
                case 'status_changed': return '🟣';
                default: return '⚪';
              }
            };
            
            return (
              <div key={index} className="relative pl-6 pb-4">
                <div className={`absolute left-0 top-0 w-4 h-4 rounded-full flex items-center justify-center ${getActionColor()} text-xs font-bold`}>
                  {getActionIcon()}
                </div>
                
                {index !== displayHistory.length - 1 && (
                  <div className="absolute left-2 top-4 w-0.5 h-full bg-gray-200"></div>
                )}
                
                <div className="space-y-1">
                  <div className="font-medium text-sm">
                    {entry.action.charAt(0).toUpperCase() + entry.action.slice(1)} by {entry.user_name}
                  </div>
                  
                  <div className="text-xs text-gray-500 flex gap-1">
                    <span>{formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}</span>
                    <span>({format(new Date(entry.timestamp), 'MMM d, yyyy - h:mm a')})</span>
                  </div>
                  
                  <div className="text-sm text-gray-700">↳ {entry.changes}</div>
                  
                  {entry.old_values && entry.new_values && (
                    <div className="text-xs text-gray-600 pl-2 pt-1 space-y-1">
                      {Object.keys(entry.new_values).map(key => (
                        entry.old_values[key] !== entry.new_values[key] && (
                          <div key={key}>
                            ↳ {key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ')}: 
                            <span className="line-through text-gray-400 mx-1">
                              {typeof entry.old_values[key] === 'number' 
                                ? new Intl.NumberFormat('en-US', { 
                                    style: 'currency', 
                                    currency: 'PKR',
                                    currencyDisplay: 'narrowSymbol'
                                  }).format(entry.old_values[key]) 
                                : entry.old_values[key]?.toString()}
                            </span> 
                            →
                            <span className="font-medium ml-1">
                              {typeof entry.new_values[key] === 'number' 
                                ? new Intl.NumberFormat('en-US', { 
                                    style: 'currency', 
                                    currency: 'PKR',
                                    currencyDisplay: 'narrowSymbol'
                                  }).format(entry.new_values[key]) 
                                : entry.new_values[key]?.toString()}
                            </span>
                          </div>
                        )
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
      
      {limit && history.length > limit && (
        <div className="text-center pt-2">
          <button className="text-sm text-primary hover:underline">
            View complete history ({history.length - limit} more entries)
          </button>
        </div>
      )}
    </div>
  );
};

export default HistoryTimeline;
