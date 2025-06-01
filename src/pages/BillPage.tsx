import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, Search, Receipt, MoreVertical, Edit, Trash2, FileText, Download } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

const BillPage: React.FC = () => {
  const { state, dispatch, generateId, addHistoryEntry } = useApp();
  const { toast } = useToast();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    customer_id: '',
    items: [{ product_name: '', quantity: 1, unit_price: 0 }],
    notes: ''
  });

  const filteredBills = state.bills.filter(bill => {
    const customer = state.customers.find(c => c.id === bill.customer_id);
    const customerName = customer ? customer.name.toLowerCase() : '';

    return customerName.includes(searchQuery.toLowerCase());
  });

  const calculateTotal = (items: any[]) => {
    return items.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customer_id || formData.items.length === 0) {
      toast({
        title: "Missing Information",
        description: "Customer and items are required",
        variant: "destructive"
      });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });

    setTimeout(() => {
      const newBill = {
        id: generateId('bill'),
        customer_id: formData.customer_id,
        items: formData.items,
        notes: formData.notes,
        total_amount: calculateTotal(formData.items),
        created_by: state.currentUser?.id || 'system',
        created_at: new Date(),
        updated_at: new Date(),
        updated_by: state.currentUser?.id || 'system',
        history: []
      };

      addHistoryEntry(
        newBill,
        'created',
        state.currentUser?.id || 'system',
        state.currentUser?.name || 'System',
        'Bill generated'
      );

      dispatch({ type: 'ADD_BILL', payload: newBill });

      toast({
        title: "Bill Generated",
        description: `Bill has been generated for customer`
      });

      setIsFormOpen(false);
      setFormData({ customer_id: '', items: [{ product_name: '', quantity: 1, unit_price: 0 }], notes: '' });
      dispatch({ type: 'SET_LOADING', payload: false });
    }, 1000);
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product_name: '', quantity: 1, unit_price: 0 }]
    });
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = formData.items.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    setFormData({ ...formData, items: newItems });
  };

  return (
    <div className="w-full min-h-screen overflow-x-auto">
      <div className="min-w-[320px] space-y-4 p-2 sm:p-4 font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Receipt className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Bills</h1>
            </div>
            <p className="text-sm text-gray-600">Manage your bills</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
              <Input
                placeholder="Search bills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-full sm:w-[200px] h-8 text-xs"
              />
            </div>
            
            <Button onClick={() => setIsFormOpen(true)} className="w-full sm:w-auto h-8 px-4 font-medium text-xs">
              <Plus className="h-3 w-3 mr-1" />
              Generate Bill
            </Button>
          </div>
        </div>

        {/* Bill Form Dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">Generate New Bill</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customer" className="text-xs font-semibold text-gray-700">Customer</Label>
                <select
                  id="customer"
                  value={formData.customer_id}
                  onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                  className="w-full h-8 text-xs border rounded-md px-2 py-1"
                  required
                >
                  <option value="">Select a customer</option>
                  {state.customers.map(customer => (
                    <option key={customer.id} value={customer.id}>{customer.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-700">Bill Items</Label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex gap-2 items-end p-2 border rounded-lg">
                      <div className="flex-1">
                        <Label htmlFor={`product-${index}`} className="text-xs text-gray-600">Product</Label>
                        <Input
                          id={`product-${index}`}
                          value={item.product_name}
                          onChange={(e) => updateItem(index, 'product_name', e.target.value)}
                          placeholder="Enter product name"
                          className="h-8 text-xs"
                          required
                        />
                      </div>
                      
                      <div className="w-20">
                        <Label htmlFor={`quantity-${index}`} className="text-xs text-gray-600">Qty</Label>
                        <Input
                          id={`quantity-${index}`}
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          className="h-8 text-xs"
                          required
                        />
                      </div>
                      
                      <div className="w-24">
                        <Label htmlFor={`price-${index}`} className="text-xs text-gray-600">Price</Label>
                        <Input
                          id={`price-${index}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                          className="h-8 text-xs"
                          required
                        />
                      </div>
                      
                      {formData.items.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(index)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                  className="w-full h-8 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-xs font-semibold text-gray-700">Notes (Optional)</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Enter notes"
                  className="h-8 text-xs"
                />
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm font-semibold text-gray-700">
                  Total: {new Intl.NumberFormat('en-US', { 
                    style: 'currency', 
                    currency: 'PKR',
                    currencyDisplay: 'narrowSymbol'
                  }).format(calculateTotal(formData.items))}
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} className="font-medium text-xs h-8">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={state.isLoading} className="font-semibold text-xs h-8">
                    {state.isLoading ? 'Generating...' : 'Generate Bill'}
                  </Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Bill List ({filteredBills.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredBills.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500 font-medium">
                  {searchQuery ? 'No bills found matching your search' : 'No bills found'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {!searchQuery && 'Generate your first bill to get started'}
                </p>
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <div className="min-w-[800px]">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-200">
                        <TableHead className="font-semibold text-gray-700 text-xs min-w-[150px]">Customer</TableHead>
                        <TableHead className="font-semibold text-gray-700 text-xs min-w-[120px]">Total Amount</TableHead>
                        <TableHead className="font-semibold text-gray-700 text-xs min-w-[120px]">Created</TableHead>
                        <TableHead className="font-semibold text-gray-700 text-xs min-w-[80px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBills.map((bill) => {
                        const customer = state.customers.find(c => c.id === bill.customer_id);
                        const customerName = customer ? customer.name : 'Unknown';

                        return (
                          <TableRow key={bill.id} className="hover:bg-gray-50 cursor-pointer border-gray-100 transition-colors">
                            <TableCell className="font-semibold text-gray-900 text-xs">{customerName}</TableCell>
                            <TableCell className="font-medium text-gray-700 text-xs">
                              {new Intl.NumberFormat('en-US', { 
                                style: 'currency', 
                                currency: 'PKR',
                                currencyDisplay: 'narrowSymbol'
                              }).format(bill.total_amount)}
                            </TableCell>
                            <TableCell className="text-xs text-gray-500 font-medium">
                              {format(new Date(bill.created_at), 'MMM d, yyyy')}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-primary/10">
                                    <MoreVertical className="h-3 w-3 text-primary" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="min-w-[140px]">
                                  <DropdownMenuItem className="text-xs">
                                    <Edit className="mr-2 h-3 w-3" />
                                    Edit Bill
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-xs text-red-600 focus:text-red-600">
                                    <Trash2 className="mr-2 h-3 w-3" />
                                    Delete Bill
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-xs">
                                    <Download className="mr-2 h-3 w-3" />
                                    Download Bill
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BillPage;
