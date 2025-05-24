
import React from 'react';
import { HistoryEntry } from '@/context/AppContext';
import { format } from 'date-fns';

interface HistoryTimelineProps {
  history: HistoryEntry[];
  limit?: number;
}

const HistoryTimeline: React.FC<HistoryTimelineProps> = ({ history, limit }) => {
  const displayHistory = limit ? history.slice(0, limit) : history;

  if (displayHistory.length === 0) {
    return (
      <div className="text-sm text-gray-500 text-center py-4">
        No history available
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {displayHistory.map((entry, index) => (
        <div key={index} className="flex items-start space-x-3">
          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
            entry.action === 'created' ? 'bg-green-500' :
            entry.action === 'updated' ? 'bg-blue-500' :
            entry.action === 'deleted' ? 'bg-red-500' : 'bg-gray-500'
          }`} />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900">
              {entry.action === 'created' ? 'Created' :
               entry.action === 'updated' ? 'Updated' :
               entry.action === 'deleted' ? 'Deleted' : entry.action}
            </div>
            <div className="text-xs text-gray-500">
              {format(new Date(entry.timestamp), 'MMM d, yyyy h:mm a')} by {entry.user_name}
            </div>
            <div className="text-sm text-gray-700 mt-1">
              {entry.changes}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HistoryTimeline;
