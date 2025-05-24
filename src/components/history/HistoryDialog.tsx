
import React from 'react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { HistoryEntry } from '@/context/AppContext';

interface HistoryDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  history: HistoryEntry[];
  title: string;
}

const HistoryDialog: React.FC<HistoryDialogProps> = ({ isOpen, setIsOpen, history, title }) => {
  // Group history by date
  const groupedHistory: Record<string, HistoryEntry[]> = {};
  
  history.forEach(entry => {
    const date = format(new Date(entry.timestamp), 'MMMM d, yyyy');
    if (!groupedHistory[date]) {
      groupedHistory[date] = [];
    }
    groupedHistory[date].push(entry);
  });
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="inline-block">📜</span> 
            Complete History - {title}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-6">
            {Object.keys(groupedHistory).length === 0 ? (
              <p className="text-center text-gray-500 italic py-8">No history available</p>
            ) : (
              Object.entries(groupedHistory).map(([date, entries]) => (
                <div key={date} className="space-y-3">
                  <div className="bg-gray-100 rounded-md px-3 py-1.5 font-medium text-sm">
                    {date}
                  </div>
                  
                  <div className="space-y-4 pl-1">
                    {entries.map((entry, idx) => {
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
                        <div key={idx} className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span>{getActionIcon()}</span>
                            <span className="font-medium">
                              {format(new Date(entry.timestamp), 'h:mm a')}
                            </span>
                            <span>-</span>
                            <span>
                              {entry.action.charAt(0).toUpperCase() + entry.action.slice(1)} by {entry.user_name}
                            </span>
                          </div>
                          
                          <div className="pl-6 text-sm text-gray-700">
                            {entry.changes}
                          </div>
                          
                          {entry.old_values && entry.new_values && (
                            <div className="pl-6 space-y-1 text-sm">
                              {Object.keys(entry.new_values).map(key => (
                                entry.old_values[key] !== entry.new_values[key] && (
                                  <div key={key} className="flex items-start">
                                    <span className="min-w-[120px] text-gray-500">
                                      • {key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ')}:
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <span className="line-through text-gray-400">
                                        {typeof entry.old_values[key] === 'number' 
                                          ? new Intl.NumberFormat('en-US', { 
                                              style: 'currency', 
                                              currency: 'PKR',
                                              currencyDisplay: 'narrowSymbol'
                                            }).format(entry.old_values[key]) 
                                          : entry.old_values[key]?.toString() || 'N/A'}
                                      </span>
                                      <span>→</span>
                                      <span className="font-medium">
                                        {typeof entry.new_values[key] === 'number' 
                                          ? new Intl.NumberFormat('en-US', { 
                                              style: 'currency', 
                                              currency: 'PKR',
                                              currencyDisplay: 'narrowSymbol'
                                            }).format(entry.new_values[key]) 
                                          : entry.new_values[key]?.toString() || 'N/A'}
                                      </span>
                                    </div>
                                  </div>
                                )
                              ))}
                            </div>
                          )}
                          
                          {idx < entries.length - 1 && (
                            <Separator className="my-3" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default HistoryDialog;
