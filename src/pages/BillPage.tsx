
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X, Plus, Printer, Save, Search } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface BillItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
  amount: number;
}

const BillPage: React.FC = () => {
  const { state, dispatch, generateId, addHistoryEntry } = useApp();
  const { toast } = useToast();
  const [customer, setCustomer] = useState('');
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [openProductSelect, setOpenProductSelect] = useState(false);
  const [currentItem, setCurrentItem] = useState({
    product_name: '',
    quantity: 1,
    price: 0
  });
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [generatedBill, setGeneratedBill] = useState<any>(null);

  // Filter products based on search term
  const filteredProducts = state.products.filter(product => 
    product.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const handleSelectProduct = (productName: string) => {
    const selectedProduct = state.products.find(p => p.name === productName);
    
    if (selectedProduct) {
      setCurrentItem({
        product_name: selectedProduct.name,
        quantity: 1,
        price: selectedProduct.last_price
      });
    }
    
    setOpenProductSelect(false);
  };

  const handleAddItem = () => {
    if (!currentItem.product_name || currentItem.quantity <= 0 || currentItem.price <= 0) {
      toast({
        title: "Invalid Item",
        description: "Please select a product and enter valid quantity and price",
        variant: "destructive"
      });
      return;
    }
    
    const newItem: BillItem = {
      id: generateId('temp-item'),
      product_name: currentItem.product_name,
      quantity: currentItem.quantity,
      price: currentItem.price,
      amount: currentItem.quantity * currentItem.price
    };
    
    setBillItems([...billItems, newItem]);
    
    // Reset current item
    setCurrentItem({
      product_name: '',
      quantity: 1,
      price: 0
    });
  };

  const handleRemoveItem = (id: string) => {
    setBillItems(billItems.filter(item => item.id !== id));
  };

  const calculateTotal = () => {
    return billItems.reduce((sum, item) => sum + item.amount, 0);
  };

  const handleGenerateBill = () => {
    if (!customer) {
      toast({
        title: "Customer Required",
        description: "Please select a customer for this bill",
        variant: "destructive"
      });
      return;
    }
    
    if (billItems.length === 0) {
      toast({
        title: "Empty Bill",
        description: "Please add at least one item to the bill",
        variant: "destructive"
      });
      return;
    }
    
    dispatch({ type: 'SET_LOADING', payload: true });
    
    // Simulate loading
    setTimeout(() => {
      const selectedCustomer = state.customers.find(c => c.id === customer);
      
      if (!selectedCustomer) {
        toast({
          title: "Error",
          description: "Selected customer not found",
          variant: "destructive"
        });
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }
      
      // Increment bill serial number
      const newSerialNumber = state.settings.last_bill_serial + 1;
      const billSerialNo = `AMR-${newSerialNumber}`;
      
      // Create new bill
      const newBill = {
        id: generateId('bill'),
        serial_no: billSerialNo,
        customer_name: selectedCustomer.name,
        admin_phone: state.settings.admin_phone,
        date: new Date(),
        total_amount: calculateTotal(),
        created_by: state.currentUser?.id || 'system',
        created_at: new Date(),
        updated_at: new Date(),
        updated_by: state.currentUser?.id || 'system',
        status: 'completed',
        history: []
      };
      
      // Add history entry for the bill
      addHistoryEntry(
        newBill, 
        'created', 
        state.currentUser?.id || 'system',
        state.currentUser?.name || 'System',
        'Bill generated',
        null,
        {
          total_amount: calculateTotal(),
          customer_name: selectedCustomer.name,
          serial_no: billSerialNo
        }
      );
      
      dispatch({ type: 'ADD_BILL', payload: newBill });
      
      // Create bill items
      const newBillItems = billItems.map(item => {
        const billItem = {
          id: generateId('bi'),
          bill_id: newBill.id,
          product_name: item.product_name,
          quantity: item.quantity,
          price: item.price,
          amount: item.amount,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: state.currentUser?.id || 'system',
          updated_by: state.currentUser?.id || 'system',
          history: []
        };
        
        // Add history entry for the bill item
        addHistoryEntry(
          billItem, 
          'created', 
          state.currentUser?.id || 'system',
          state.currentUser?.name || 'System',
          'Bill item added',
          null,
          {
            product_name: item.product_name,
            quantity: item.quantity,
            price: item.price,
            amount: item.amount
          }
        );
        
        return billItem;
      });
      
      // Dispatch all bill items
      newBillItems.forEach(item => {
        dispatch({ type: 'ADD_BILL_ITEM', payload: item });
      });
      
      // Record this as a customer transaction as well
      const newTransaction = {
        id: generateId('ct'),
        customer_id: customer,
        date: new Date(),
        quantity: billItems.reduce((total, item) => total + item.quantity, 0),
        payment_mode: "Cash", // Default to cash
        bill_id: billSerialNo,
        purchase_description: `Bill #${billSerialNo}`,
        additional_notes: `${billItems.length} items purchased`,
        amount: calculateTotal(),
        created_by: state.currentUser?.id || 'system',
        created_at: new Date(),
        updated_at: new Date(),
        updated_by: state.currentUser?.id || 'system',
        history: []
      };
      
      // Add history entry for the transaction
      addHistoryEntry(
        newTransaction, 
        'created', 
        state.currentUser?.id || 'system',
        state.currentUser?.name || 'System',
        'Transaction recorded from bill',
        null,
        {
          amount: calculateTotal(),
          bill_id: billSerialNo
        }
      );
      
      dispatch({ type: 'ADD_CUSTOMER_TRANSACTION', payload: newTransaction });
      
      // Store generated bill for print dialog
      setGeneratedBill({
        ...newBill,
        items: [...billItems],
        customerName: selectedCustomer.name,
        customerPhone: selectedCustomer.phone,
        customerAddress: selectedCustomer.address
      });
      
      // Reset the form
      setCustomer('');
      setBillItems([]);
      
      // Show success message
      toast({
        title: "Bill Generated",
        description: `Bill #${billSerialNo} has been created successfully`,
      });
      
      // Open print dialog
      setIsPrintDialogOpen(true);
      
      dispatch({ type: 'SET_LOADING', payload: false });
    }, 1000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Create New Bill</h1>
        <p className="text-gray-500">Generate a new bill for a customer</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customer">Select Customer</Label>
                  <Select value={customer} onValueChange={setCustomer}>
                    <SelectTrigger id="customer">
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {state.customers.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {customer && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Name</p>
                      <p className="font-semibold">
                        {state.customers.find(c => c.id === customer)?.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone</p>
                      <p>{state.customers.find(c => c.id === customer)?.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Address</p>
                      <p className="text-sm">
                        {state.customers.find(c => c.id === customer)?.address || 'Not provided'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Bill Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Add item form */}
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-12 sm:col-span-5">
                    <Label htmlFor="product" className="mb-2 block">Product</Label>
                    <Popover open={openProductSelect} onOpenChange={setOpenProductSelect}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openProductSelect}
                          className="w-full justify-between"
                        >
                          {currentItem.product_name || "Select product..."}
                          <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput 
                            placeholder="Search products..." 
                            value={productSearch}
                            onValueChange={setProductSearch}
                          />
                          <CommandEmpty>No products found.</CommandEmpty>
                          <CommandGroup>
                            {filteredProducts.map((product) => (
                              <CommandItem
                                key={product.id}
                                value={product.name}
                                onSelect={handleSelectProduct}
                              >
                                <div className="flex justify-between w-full">
                                  <span>{product.name}</span>
                                  <span className="text-gray-500">
                                    {new Intl.NumberFormat('en-US', { 
                                      style: 'currency', 
                                      currency: 'PKR',
                                      currencyDisplay: 'narrowSymbol'
                                    }).format(product.last_price)}
                                  </span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="col-span-4 sm:col-span-2">
                    <Label htmlFor="quantity" className="mb-2 block">Qty</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={currentItem.quantity}
                      onChange={(e) => setCurrentItem({
                        ...currentItem,
                        quantity: parseInt(e.target.value) || 0
                      })}
                    />
                  </div>
                  
                  <div className="col-span-8 sm:col-span-3">
                    <Label htmlFor="price" className="mb-2 block">Unit Price</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={currentItem.price}
                      onChange={(e) => setCurrentItem({
                        ...currentItem,
                        price: parseFloat(e.target.value) || 0
                      })}
                    />
                  </div>
                  
                  <div className="col-span-12 sm:col-span-2 pt-6 sm:pt-0">
                    <Label className="hidden sm:block mb-2">&nbsp;</Label>
                    <Button onClick={handleAddItem} className="w-full bg-primary hover:bg-primary/90">
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
                
                {/* Items list */}
                {billItems.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No items added to this bill yet</p>
                    <p className="text-sm text-gray-400 mt-1">Add products using the form above</p>
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Product
                          </th>
                          <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Qty
                          </th>
                          <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Price
                          </th>
                          <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {billItems.map((item, index) => (
                          <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{item.product_name}</div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-center text-sm">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                              {new Intl.NumberFormat('en-US', { 
                                style: 'currency', 
                                currency: 'PKR',
                                currencyDisplay: 'narrowSymbol'
                              }).format(item.price)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                              {new Intl.NumberFormat('en-US', { 
                                style: 'currency', 
                                currency: 'PKR',
                                currencyDisplay: 'narrowSymbol'
                              }).format(item.amount)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleRemoveItem(item.id)}
                                className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-gray-100">
                          <td colSpan={3} className="px-4 py-4 whitespace-nowrap text-right font-bold">
                            Total Amount:
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right font-bold">
                            {new Intl.NumberFormat('en-US', { 
                              style: 'currency', 
                              currency: 'PKR',
                              currencyDisplay: 'narrowSymbol'
                            }).format(calculateTotal())}
                          </td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
                
                <div className="pt-4 flex justify-end">
                  <Button 
                    onClick={handleGenerateBill}
                    className="bg-primary hover:bg-primary/90"
                    disabled={state.isLoading || billItems.length === 0}
                  >
                    {state.isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>Generating...</span>
                      </div>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Generate Bill
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card className="h-fit sticky top-20">
          <CardHeader>
            <CardTitle>Shop Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Shop Name</p>
                <p className="font-semibold">{state.settings.shop_name}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Address</p>
                <p>{state.settings.shop_address}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Contact</p>
                <p>{state.settings.admin_phone}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Last Bill Number</p>
                <p>AMR-{state.settings.last_bill_serial}</p>
              </div>
              
              <div className="pt-2">
                <p className="text-sm text-gray-500">
                  The next bill will be numbered AMR-{state.settings.last_bill_serial + 1}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
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
            {generatedBill && (
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
                    <p className="font-semibold">{generatedBill.serial_no}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-500">Date:</p>
                    <p>{new Date(generatedBill.date).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Customer:</p>
                  <p className="font-semibold">{generatedBill.customerName}</p>
                  <p className="text-sm">{generatedBill.customerPhone}</p>
                  {generatedBill.customerAddress && (
                    <p className="text-sm">{generatedBill.customerAddress}</p>
                  )}
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
                    {generatedBill.items.map((item: any, index: number) => (
                      <div key={index} className="grid grid-cols-12 gap-2 text-sm">
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
                      }).format(generatedBill.total_amount)}
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

export default BillPage;
