import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';
import { 
  ChevronDown, 
  ChevronUp, 
  Calendar as CalendarIcon, 
  Download, 
  Printer,
  Search, 
  SlidersHorizontal 
} from 'lucide-react';
import { format, isToday, isYesterday, isThisWeek, isThisMonth } from 'date-fns';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Bill, BillItem } from '@/context/AppContext';
import { cn } from '@/lib/utils';

// Import chart components
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const BillingHistoryPage: React.FC = () => {
  const { state } = useApp();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined
  });
  const [statusFilter, setStatusFilter] = useState('');
  const [bills, setBills] = useState<Bill[]>([]);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [expandedBills, setExpandedBills] = useState<Record<string, boolean>>({});
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [salesData, setSalesData] = useState<any[]>([]);
  
  // Filter and sort bills
  useEffect(() => {
    let filteredBills = [...state.bills];
    
    // Apply search filter
    if (searchQuery) {
      filteredBills = filteredBills.filter(bill => 
        bill.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bill.serial_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bill.total_amount.toString().includes(searchQuery)
      );
    }
    
    // Apply date filter
    if (dateFilter.from || dateFilter.to) {
      filteredBills = filteredBills.filter(bill => {
        const billDate = new Date(bill.date);
        
        if (dateFilter.from && dateFilter.to) {
          return billDate >= dateFilter.from && billDate <= dateFilter.to;
        } else if (dateFilter.from) {
          return billDate >= dateFilter.from;
        } else if (dateFilter.to) {
          return billDate <= dateFilter.to;
        }
        
        return true;
      });
    }
    
    // Apply status filter
    if (statusFilter) {
      filteredBills = filteredBills.filter(bill => bill.status === statusFilter);
    }
    
    // Sort by latest date
    filteredBills.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setBills(filteredBills);
  }, [searchQuery, dateFilter, statusFilter, state.bills]);
  
  // Generate sales data for charts
  useEffect(() => {
    // Group by day for the last 7 days
    const dailySales: Record<string, { date: string, sales: number, count: number }> = {};
    
    // Use all bills for the chart data
    state.bills.forEach(bill => {
      const billDate = new Date(bill.date);
      const dateKey = format(billDate, 'yyyy-MM-dd');
      const displayDate = format(billDate, 'MMM dd');
      
      if (!dailySales[dateKey]) {
        dailySales[dateKey] = { date: displayDate, sales: 0, count: 0 };
      }
      
      dailySales[dateKey].sales += bill.total_amount;
      dailySales[dateKey].count += 1;
    });
    
    // Convert to array and sort by date
    const salesDataArray = Object.values(dailySales)
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(-7); // Last 7 days
    
    setSalesData(salesDataArray);
  }, [state.bills]);
  
  const handleClearFilters = () => {
    setDateFilter({ from: undefined, to: undefined });
    setStatusFilter('');
  };
  
  const handleExportData = () => {
    // Simulate exporting data as CSV
    const csvHeader = 'Serial No,Customer,Date,Total Amount,Status\n';
    
    const csvRows = bills.map(bill => {
      const date = format(new Date(bill.date), 'yyyy-MM-dd');
      const customerName = bill.customer_name.replace(/,/g, ';'); // Replace commas to avoid CSV issues
      
      return `${bill.serial_no},"${customerName}",${date},${bill.total_amount},${bill.status}`;
    }).join('\n');
    
    const csvContent = csvHeader + csvRows;
    
    // In a real app, we would create a download link
    // For this prototype, we'll just show a toast notification
    console.log('CSV Export:', csvContent);
    
    toast({
      title: "Export Simulated",
      description: `${bills.length} bills exported (see console for data)`,
    });
  };
  
  const toggleBillExpand = (billId: string) => {
    setExpandedBills(prev => ({
      ...prev,
      [billId]: !prev[billId]
    }));
  };
  
  const handlePrintBill = (bill: Bill) => {
    setSelectedBill(bill);
    setIsPrintDialogOpen(true);
  };
  
  const getBillItems = (billId: string) => {
    return state.billItems.filter(item => item.bill_id === billId);
  };
  
  const formatDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    if (isThisWeek(date)) return format(date, 'EEEE'); // Day name
    if (isThisMonth(date)) return format(date, 'MMMM d'); // Month and day
    return format(date, 'MMMM d, yyyy'); // Full date
  };
  
  // Group bills by date
  const groupedBills: Record<string, Bill[]> = {};
  bills.forEach(bill => {
    const dateKey = format(new Date(bill.date), 'yyyy-MM-dd');
    if (!groupedBills[dateKey]) {
      groupedBills[dateKey] = [];
    }
    groupedBills[dateKey].push(bill);
  });
  
  // Prepare chart data for customer vs company transactions
  const customerTotal = state.customerTransactions.reduce((sum, t) => sum + t.amount, 0);
  const companyTotal = state.companyTransactions.reduce((sum, t) => sum + t.amount, 0);
  
  const entityComparisonData = [
    { name: 'Customer', value: customerTotal },
    { name: 'Company', value: companyTotal }
  ];
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Billing History</h1>
          <p className="text-gray-500">View and analyze your billing history</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search bills"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full sm:w-[250px]"
            />
          </div>
          
          <Button onClick={() => setIsFilterDialogOpen(true)} variant="outline">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
            {(dateFilter.from || dateFilter.to || statusFilter) && (
              <span className="ml-2 bg-primary w-2 h-2 rounded-full" />
            )}
          </Button>
          
          <Button onClick={handleExportData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="history">
        <TabsList className="mb-4">
          <TabsTrigger value="history">Billing History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="history" className="space-y-6">
          {Object.keys(groupedBills).length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <p className="text-xl font-medium text-gray-400 mb-4">No bills found</p>
                <p className="text-gray-500">Try adjusting your filters or search criteria</p>
              </CardContent>
            </Card>
          ) : (
            Object.entries(groupedBills).map(([dateKey, dateBills]) => (
              <div key={dateKey} className="space-y-2">
                <h3 className="font-medium text-gray-500">
                  {formatDateLabel(new Date(dateKey))}
                </h3>
                
                <div className="space-y-4">
                  {dateBills.map((bill) => (
                    <Card key={bill.id} className="transition-all hover:shadow-sm">
                      <CardContent className="p-0">
                        <div className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold">{bill.serial_no}</span>
                                <span className={`text-xs px-2 py-1 rounded ${
                                  bill.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-500 mt-1">
                                {format(new Date(bill.date), 'h:mm a')} • Customer: {bill.customer_name}
                              </p>
                            </div>
                            
                            <div className="text-right">
                              <p className="font-bold text-primary">
                                {new Intl.NumberFormat('en-US', { 
                                  style: 'currency', 
                                  currency: 'PKR',
                                  currencyDisplay: 'narrowSymbol'
                                }).format(bill.total_amount)}
                              </p>
                              <div className="flex space-x-1 mt-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => toggleBillExpand(bill.id)}
                                  className="text-xs h-8"
                                >
                                  {expandedBills[bill.id] ? (
                                    <><ChevronUp className="h-3 w-3 mr-1" />Hide items</>
                                  ) : (
                                    <><ChevronDown className="h-3 w-3 mr-1" />Show items</>
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handlePrintBill(bill)}
                                  className="text-xs h-8"
                                >
                                  <Printer className="h-3 w-3 mr-1" />Print
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          {expandedBills[bill.id] && (
                            <div className="mt-4 border-t pt-4">
                              <div className="space-y-2">
                                <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500">
                                  <div className="col-span-5">Item</div>
                                  <div className="col-span-2 text-center">Qty</div>
                                  <div className="col-span-2 text-right">Rate</div>
                                  <div className="col-span-3 text-right">Amount</div>
                                </div>
                                
                                <Separator />
                                
                                <div className="space-y-2">
                                  {getBillItems(bill.id).map((item: BillItem) => (
                                    <div key={item.id} className="grid grid-cols-12 gap-2 text-sm">
                                      <div className="col-span-5">{item.product_name}</div>
                                      <div className="col-span-2 text-center">{item.quantity}</div>
                                      <div className="col-span-2 text-right">
                                        {new Intl.NumberFormat('en-US', { 
                                          style: 'currency', 
                                          currency: 'PKR',
                                          currencyDisplay: 'narrowSymbol'
                                        }).format(item.price)}
                                      </div>
                                      <div className="col-span-3 text-right">
                                        {new Intl.NumberFormat('en-US', { 
                                          style: 'currency', 
                                          currency: 'PKR',
                                          currencyDisplay: 'narrowSymbol'
                                        }).format(item.amount)}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          )}
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales Trend (Last 7 Days)</CardTitle>
                <CardDescription>Daily sales amount</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: any) => [
                        new Intl.NumberFormat('en-US', { 
                          style: 'currency', 
                          currency: 'PKR',
                          currencyDisplay: 'narrowSymbol'
                        }).format(value),
                        'Sales'
                      ]}
                    />
                    <Legend />
                    <Bar name="Sales Amount" dataKey="sales" fill="#1B56FD" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Transaction Distribution</CardTitle>
                <CardDescription>Customer vs Company transactions</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={entityComparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: any) => [
                        new Intl.NumberFormat('en-US', { 
                          style: 'currency', 
                          currency: 'PKR',
                          currencyDisplay: 'narrowSymbol'
                        }).format(value),
                        'Total Amount'
                      ]}
                    />
                    <Legend />
                    <Bar name="Transaction Amount" dataKey="value" fill="#1B56FD" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Key Statistics</CardTitle>
              <CardDescription>Overall billing performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500">Total Bills</h3>
                  <p className="text-2xl font-bold">{state.bills.length}</p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {new Intl.NumberFormat('en-US', { 
                      style: 'currency', 
                      currency: 'PKR',
                      currencyDisplay: 'narrowSymbol'
                    }).format(state.bills.reduce((sum, bill) => sum + bill.total_amount, 0))}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500">Avg. Bill Value</h3>
                  <p className="text-2xl font-bold">
                    {state.bills.length > 0 ? 
                      new Intl.NumberFormat('en-US', { 
                        style: 'currency', 
                        currency: 'PKR',
                        currencyDisplay: 'narrowSymbol'
                      }).format(state.bills.reduce((sum, bill) => sum + bill.total_amount, 0) / state.bills.length) :
                      'N/A'
                    }
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500">Items Sold</h3>
                  <p className="text-2xl font-bold">{state.billItems.reduce((sum, item) => sum + item.quantity, 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Filter Dialog */}
      <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Filter Bills</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Date Range</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="from-date" className="text-xs">From</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        id="from-date"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateFilter.from && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFilter.from ? format(dateFilter.from, "PP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateFilter.from}
                        onSelect={(date) => setDateFilter(prev => ({ ...prev, from: date }))}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="to-date" className="text-xs">To</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        id="to-date"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateFilter.to && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFilter.to ? format(dateFilter.to, "PP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateFilter.to}
                        onSelect={(date) => setDateFilter(prev => ({ ...prev, to: date }))}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="">All</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClearFilters}
              >
                Clear Filters
              </Button>
              
              <Button
                type="button"
                className="bg-primary hover:bg-primary/90"
                onClick={() => setIsFilterDialogOpen(false)}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Print Dialog */}
      <Dialog open={isPrintDialogOpen} onOpenChange={setIsPrintDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Bill Preview</span>
              <Button variant="outline" size="sm">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="border rounded-lg p-6 space-y-6">
            {selectedBill && (
              <>
                <div className="text-center space-y-1">
                  <h2 className="text-xl font-bold">{state.settings.shop_name}</h2>
                  <p className="text-sm">{state.settings.shop_address}</p>
                  <p className="text-sm">Contact: {state.settings.admin_phone}</p>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Bill #:</p>
                    <p className="font-semibold">{selectedBill.serial_no}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-500">Date:</p>
                    <p>{format(new Date(selectedBill.date), 'PPP')}</p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Customer:</p>
                  <p className="font-semibold">{selectedBill.customer_name}</p>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 text-sm font-medium text-gray-500">
                    <div className="col-span-5">Item</div>
                    <div className="col-span-2 text-center">Qty</div>
                    <div className="col-span-2 text-right">Rate</div>
                    <div className="col-span-3 text-right">Amount</div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    {getBillItems(selectedBill.id).map((item: BillItem) => (
                      <div key={item.id} className="grid grid-cols-12 gap-2 text-sm">
                        <div className="col-span-5">{item.product_name}</div>
                        <div className="col-span-2 text-center">{item.quantity}</div>
                        <div className="col-span-2 text-right">
                          {new Intl.NumberFormat('en-US', { 
                            style: 'currency', 
                            currency: 'PKR',
                            currencyDisplay: 'narrowSymbol'
                          }).format(item.price)}
                        </div>
                        <div className="col-span-3 text-right">
                          {new Intl.NumberFormat('en-US', { 
                            style: 'currency', 
                            currency: 'PKR',
                            currencyDisplay: 'narrowSymbol'
                          }).format(item.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-12 gap-2 font-bold">
                    <div className="col-span-9 text-right">Total:</div>
                    <div className="col-span-3 text-right">
                      {new Intl.NumberFormat('en-US', { 
                        style: 'currency', 
                        currency: 'PKR',
                        currencyDisplay: 'narrowSymbol'
                      }).format(selectedBill.total_amount)}
                    </div>
                  </div>
                </div>
                
                <div className="text-center pt-6 space-y-1 text-sm">
                  <p>Thank you for your business!</p>
                  <p>For any inquiries, please contact us at {state.settings.admin_phone}</p>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BillingHistoryPage;
