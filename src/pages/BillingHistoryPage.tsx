import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  ChevronDown, 
  ChevronUp, 
  Calendar as CalendarIcon, 
  Download, 
  Printer,
  Search, 
  SlidersHorizontal,
  Edit,
  Trash2
} from 'lucide-react';
import { format, isToday, isYesterday, isThisWeek, isThisMonth } from 'date-fns';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Bill, BillItem } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import EditBillItemDialog from '@/components/dialogs/EditBillItemDialog';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const BillingHistoryPage: React.FC = () => {
  const { state, dispatch } = useApp();
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
  const [editBillItem, setEditBillItem] = useState<BillItem | null>(null);
  const [isEditItemDialogOpen, setIsEditItemDialogOpen] = useState(false);
  
  // Calculate bill total from its items
  const calculateBillTotal = (billId: string) => {
    const billItems = state.billItems.filter(item => item.bill_id === billId);
    return billItems.reduce((sum, item) => sum + item.amount, 0);
  };
  
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
  
  const handleClearFilters = () => {
    setDateFilter({ from: undefined, to: undefined });
    setStatusFilter('');
  };
  
  const handleExportData = () => {
    // Create workbook with multiple sheets
    const workbook = XLSX.utils.book_new();
    
    // Bills data
    const billsData = bills.map(bill => ({
      'Serial No': bill.serial_no,
      'Customer': bill.customer_name,
      'Date': format(new Date(bill.date), 'yyyy-MM-dd'),
      'Total Amount': calculateBillTotal(bill.id),
      'Status': bill.status,
      'Created': format(new Date(bill.created_at), 'yyyy-MM-dd HH:mm'),
      'Updated': format(new Date(bill.updated_at), 'yyyy-MM-dd HH:mm')
    }));
    
    const billsWorksheet = XLSX.utils.json_to_sheet(billsData);
    XLSX.utils.book_append_sheet(workbook, billsWorksheet, 'Bills');
    
    // Bill items data
    const billItemsData = state.billItems
      .filter(item => bills.some(bill => bill.id === item.bill_id))
      .map(item => {
        const bill = bills.find(b => b.id === item.bill_id);
        return {
          'Bill Serial': bill?.serial_no || '',
          'Customer': bill?.customer_name || '',
          'Product': item.product_name,
          'Quantity': item.quantity,
          'Price': item.price,
          'Amount': item.amount,
          'Date': bill ? format(new Date(bill.date), 'yyyy-MM-dd') : ''
        };
      });
    
    const itemsWorksheet = XLSX.utils.json_to_sheet(billItemsData);
    XLSX.utils.book_append_sheet(workbook, itemsWorksheet, 'Bill Items');
    
    // Download the file
    XLSX.writeFile(workbook, `billing-history-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    
    toast({
      title: "Export Complete",
      description: `Billing history exported successfully`,
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
  
  const handleDownloadPDF = async (bill: Bill) => {
    const printElement = document.getElementById('bill-print-content');
    if (!printElement) return;
    
    try {
      const canvas = await html2canvas(printElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 190;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 10;
      
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`bill-${bill.serial_no}.pdf`);
      
      toast({
        title: "PDF Downloaded",
        description: `Bill ${bill.serial_no} downloaded as PDF`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    }
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
  
  const handleUpdateBillItem = (updatedItem: BillItem) => {
    dispatch({ type: 'UPDATE_BILL_ITEM', payload: updatedItem });
    
    // Update the bill total amount
    const bill = state.bills.find(b => b.id === updatedItem.bill_id);
    if (bill) {
      const newTotal = calculateBillTotal(updatedItem.bill_id);
      const updatedBill = {
        ...bill,
        total_amount: newTotal,
        updated_at: new Date(),
        updated_by: state.currentUser?.id || 'system'
      };
      dispatch({ type: 'UPDATE_BILL', payload: updatedBill });
    }
    
    toast({
      title: "Item Updated",
      description: "Bill item has been updated successfully",
    });
  };

  const handleDeleteBillItem = (itemId: string) => {
    const item = state.billItems.find(i => i.id === itemId);
    if (!item) return;
    
    dispatch({ type: 'DELETE_BILL_ITEM', payload: itemId });
    
    // Update the bill total amount
    const bill = state.bills.find(b => b.id === item.bill_id);
    if (bill) {
      const newTotal = calculateBillTotal(item.bill_id);
      const updatedBill = {
        ...bill,
        total_amount: newTotal,
        updated_at: new Date(),
        updated_by: state.currentUser?.id || 'system'
      };
      dispatch({ type: 'UPDATE_BILL', payload: updatedBill });
    }
    
    toast({
      title: "Item Deleted",
      description: "Bill item has been deleted successfully",
    });
  };

  const handleEditBillItem = (item: BillItem) => {
    setEditBillItem(item);
    setIsEditItemDialogOpen(true);
  };

  // Check if bill has been edited (items modified after bill creation)
  const isBillEdited = (bill: Bill) => {
    const billItems = getBillItems(bill.id);
    return billItems.some(item => item.updated_at.getTime() > bill.created_at.getTime());
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Billing History</h1>
          <p className="text-gray-500">View and manage your billing history</p>
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
            Export Excel
          </Button>
        </div>
      </div>
      
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
              {dateBills.map((bill) => {
                const currentTotal = calculateBillTotal(bill.id);
                const isEdited = isBillEdited(bill);
                
                return (
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
                              {isEdited && (
                                <span className="text-xs px-2 py-1 rounded bg-orange-100 text-orange-700 flex items-center">
                                  <Edit className="h-3 w-3 mr-1" />
                                  Edited
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              {format(new Date(bill.date), 'h:mm a')} • Customer: <span className="font-semibold">{bill.customer_name}</span>
                            </p>
                            <div className="text-xs text-gray-400 mt-1">
                              Created: {format(new Date(bill.created_at), 'MMM d, yyyy h:mm a')}
                              {bill.created_at.getTime() !== bill.updated_at.getTime() && (
                                <span className="ml-2">
                                  Updated: {format(new Date(bill.updated_at), 'MMM d, yyyy h:mm a')}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="font-bold text-primary">
                              {new Intl.NumberFormat('en-US', { 
                                style: 'currency', 
                                currency: 'PKR',
                                currencyDisplay: 'narrowSymbol'
                              }).format(currentTotal)}
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
                                className="text-xs h-8"
                              >
                                <Edit className="h-3 w-3 mr-1" />Edit
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
                                <div className="col-span-2 text-right">Amount</div>
                                <div className="col-span-1 text-center">Actions</div>
                              </div>
                              
                              <Separator />
                              
                              <div className="overflow-x-auto">
                                <div className="space-y-2 min-w-[600px]">
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
                                      <div className="col-span-2 text-right">
                                        {new Intl.NumberFormat('en-US', { 
                                          style: 'currency', 
                                          currency: 'PKR',
                                          currencyDisplay: 'narrowSymbol'
                                        }).format(item.amount)}
                                      </div>
                                      <div className="col-span-1 text-center">
                                        <div className="flex space-x-1 justify-center">
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="p-1 h-6 w-6"
                                            onClick={() => handleEditBillItem(item)}
                                          >
                                            <Edit className="h-3 w-3" />
                                          </Button>
                                          <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                className="p-1 h-6 w-6 text-red-600"
                                              >
                                                <Trash2 className="h-3 w-3" />
                                              </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                              <AlertDialogHeader>
                                                <AlertDialogTitle>Delete Bill Item</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                  Are you sure you want to delete "{item.product_name}"? This action cannot be undone.
                                                </AlertDialogDescription>
                                              </AlertDialogHeader>
                                              <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction 
                                                  onClick={() => handleDeleteBillItem(item.id)}
                                                  className="bg-red-600 hover:bg-red-700"
                                                >
                                                  Delete
                                                </AlertDialogAction>
                                              </AlertDialogFooter>
                                            </AlertDialogContent>
                                          </AlertDialog>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))
      )}
      
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
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => selectedBill && handleDownloadPDF(selectedBill)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div id="bill-print-content" className="border rounded-lg p-6 space-y-6">
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
                      }).format(calculateBillTotal(selectedBill.id))}
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
      
      {/* Edit Bill Item Dialog */}
      <EditBillItemDialog
        billItem={editBillItem}
        isOpen={isEditItemDialogOpen}
        onClose={() => {
          setIsEditItemDialogOpen(false);
          setEditBillItem(null);
        }}
        onUpdate={handleUpdateBillItem}
      />
    </div>
  );
};

export default BillingHistoryPage;
