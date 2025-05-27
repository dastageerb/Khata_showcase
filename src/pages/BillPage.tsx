import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X, Plus, Printer, Save, Minus } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

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
  const [customerName, setCustomerName] = useState('');
  const [customerSuggestions, setCustomerSuggestions] = useState<any[]>([]);
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [currentItem, setCurrentItem] = useState({
    product_name: '',
    quantity: 1,
    price: 0
  });
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [generatedBill, setGeneratedBill] = useState<any>(null);

  // Filter customers based on typed name
  useEffect(() => {
    if (customerName.trim()) {
      const filtered = state.customers.filter(customer => 
        customer.name.toLowerCase().includes(customerName.toLowerCase())
      );
      setCustomerSuggestions(filtered);
      setShowCustomerSuggestions(filtered.length > 0);
    } else {
      setCustomerSuggestions([]);
      setShowCustomerSuggestions(false);
    }
  }, [customerName, state.customers]);

  const handleSelectCustomer = (customer: any) => {
    setCustomerName(customer.name);
    setShowCustomerSuggestions(false);
  };

  const handleAddItem = () => {
    if (!currentItem.product_name || currentItem.quantity <= 0 || currentItem.price <= 0) {
      toast({
        title: "Invalid Item",
        description: "Please enter product name, valid quantity and price",
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

  const handleUpdateItemQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) return;
    
    setBillItems(billItems.map(item => 
      item.id === id 
        ? { ...item, quantity: newQuantity, amount: newQuantity * item.price }
        : item
    ));
  };

  const calculateTotal = () => {
    return billItems.reduce((sum, item) => sum + item.amount, 0);
  };

  const handleGenerateBill = () => {
    if (!customerName.trim()) {
      toast({
        title: "Customer Required",
        description: "Please enter a customer name for this bill",
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
    
    setTimeout(() => {
      // Find or use the customer
      let selectedCustomer = state.customers.find(c => c.name.toLowerCase() === customerName.toLowerCase());
      
      // Increment bill serial number
      const newSerialNumber = state.settings.last_bill_serial + 1;
      const billSerialNo = `AMR-${newSerialNumber}`;
      
      // Create new bill
      const newBill = {
        id: generateId('bill'),
        serial_no: billSerialNo,
        customer_name: customerName,
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
      
      addHistoryEntry(
        newBill,
        'created',
        state.currentUser?.id || 'system',
        state.currentUser?.name || 'System',
        `Bill generated for ${customerName} - Total: ${calculateTotal()}`
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
        
        addHistoryEntry(
          billItem,
          'created',
          state.currentUser?.id || 'system',
          state.currentUser?.name || 'System',
          `Bill item added: ${item.product_name} x${item.quantity}`
        );
        
        return billItem;
      });
      
      newBillItems.forEach(item => {
        dispatch({ type: 'ADD_BILL_ITEM', payload: item });
      });
      
      // If customer exists, record transaction
      if (selectedCustomer) {
        const newTransaction = {
          id: generateId('ct'),
          customer_id: selectedCustomer.id,
          date: new Date(),
          quantity: billItems.reduce((total, item) => total + item.quantity, 0),
          payment_mode: "Cash",
          bill_id: billSerialNo,
          purchase_description: `Bill #${billSerialNo}`,
          additional_notes: `${billItems.length} items purchased`,
          amount: calculateTotal(),
          type: 'debit' as 'debit',
          created_by: state.currentUser?.id || 'system',
          created_at: new Date(),
          updated_at: new Date(),
          updated_by: state.currentUser?.id || 'system',
          history: []
        };
        
        addHistoryEntry(
          newTransaction,
          'created',
          state.currentUser?.id || 'system',
          state.currentUser?.name || 'System',
          `Transaction recorded from bill - Debit: ${calculateTotal()}`
        );
        
        dispatch({ type: 'ADD_CUSTOMER_TRANSACTION', payload: newTransaction });
      }
      
      // Update settings with new bill serial
      const updatedSettings = {
        ...state.settings,
        last_bill_serial: newSerialNumber,
        updated_at: new Date(),
        updated_by: state.currentUser?.id || 'system'
      };
      
      dispatch({ type: 'UPDATE_SETTINGS', payload: updatedSettings });
      
      setGeneratedBill({
        ...newBill,
        items: [...billItems],
        customerName: customerName,
        customerPhone: selectedCustomer?.phone || '',
        customerAddress: selectedCustomer?.address || ''
      });
      
      setCustomerName('');
      setBillItems([]);
      
      toast({
        title: "Bill Generated",
        description: `Bill #${billSerialNo} has been created successfully`,
      });
      
      setIsPrintDialogOpen(true);
      dispatch({ type: 'SET_LOADING', payload: false });
    }, 1000);
  };

  return (
    <div className="space-y-8 font-inter">
      <div>
        <h1 className="text-2xl font-bold font-inter">Create New Bill</h1>
        <p className="text-gray-500 font-inter">Generate a new bill for a customer</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6 lg:col-span-2">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="font-inter">Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2 relative">
                  <Label htmlFor="customer" className="font-inter">Customer Name</Label>
                  <Input
                    id="customer"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Type customer name..."
                    onFocus={() => customerName && setShowCustomerSuggestions(customerSuggestions.length > 0)}
                    className="rounded-xl font-inter"
                  />
                  {showCustomerSuggestions && (
                    <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-40 overflow-y-auto">
                      {customerSuggestions.map((customer) => (
                        <div
                          key={customer.id}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer font-inter"
                          onClick={() => handleSelectCustomer(customer)}
                        >
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-gray-500">{customer.phone}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="font-inter">Bill Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-12 sm:col-span-5">
                    <Label htmlFor="product" className="mb-2 block font-inter">Product Name</Label>
                    <Input
                      id="product"
                      value={currentItem.product_name}
                      onChange={(e) => setCurrentItem({...currentItem, product_name: e.target.value})}
                      placeholder="Enter product name..."
                      className="rounded-xl font-inter"
                    />
                  </div>
                  
                  <div className="col-span-4 sm:col-span-2">
                    <Label htmlFor="quantity" className="mb-2 block font-inter">Qty</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={currentItem.quantity}
                      onChange={(e) => setCurrentItem({
                        ...currentItem,
                        quantity: parseInt(e.target.value) || 0
                      })}
                      className="rounded-xl font-inter"
                    />
                  </div>
                  
                  <div className="col-span-8 sm:col-span-3">
                    <Label htmlFor="price" className="mb-2 block font-inter">Unit Price</Label>
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
                      className="rounded-xl font-inter"
                    />
                  </div>
                  
                  <div className="col-span-12 sm:col-span-2 pt-6 sm:pt-0">
                    <Label className="hidden sm:block mb-2 font-inter">&nbsp;</Label>
                    <Button onClick={handleAddItem} className="w-full bg-primary hover:bg-primary/90 rounded-xl font-inter">
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
                
                {billItems.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-2xl">
                    <p className="text-gray-500 font-inter">No items added to this bill yet</p>
                    <p className="text-sm text-gray-400 mt-1 font-inter">Add products using the form above</p>
                  </div>
                ) : (
                  <div className="border rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-inter">
                              Product
                            </th>
                            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider font-inter">
                              Qty
                            </th>
                            <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider font-inter">
                              Price
                            </th>
                            <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider font-inter">
                              Amount
                            </th>
                            <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider font-inter">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {billItems.map((item, index) => (
                            <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 font-inter">{item.product_name}</div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-center">
                                <div className="flex items-center justify-center space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUpdateItemQuantity(item.id, item.quantity - 1)}
                                    className="h-6 w-6 p-0 rounded-lg"
                                    disabled={item.quantity <= 1}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="text-sm min-w-[2rem] text-center font-inter">{item.quantity}</span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUpdateItemQuantity(item.id, item.quantity + 1)}
                                    className="h-6 w-6 p-0 rounded-lg"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-inter">
                                {new Intl.NumberFormat('en-US', { 
                                  style: 'currency', 
                                  currency: 'PKR',
                                  currencyDisplay: 'narrowSymbol'
                                }).format(item.price)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium font-inter">
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
                                  className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                          <tr className="bg-gray-100">
                            <td colSpan={3} className="px-4 py-4 whitespace-nowrap text-right font-bold font-inter">
                              Total Amount:
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-right font-bold font-inter">
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
                  </div>
                )}
                
                <div className="pt-4 flex justify-end">
                  <Button 
                    onClick={handleGenerateBill}
                    className="bg-primary hover:bg-primary/90 rounded-xl font-inter"
                    disabled={state.isLoading || billItems.length === 0}
                  >
                    {state.isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                        <span className="font-inter">Generating...</span>
                      </div>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        <span className="font-inter">Generate Bill</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card className="h-fit sticky top-20 rounded-2xl">
          <CardHeader>
            <CardTitle className="font-inter">Shop Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500 font-inter">Shop Name</p>
                <p className="font-semibold font-inter">{state.settings.shop_name}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500 font-inter">Address</p>
                <p className="font-inter">{state.settings.shop_address}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500 font-inter">Contact</p>
                <p className="font-inter">{state.settings.admin_phone}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500 font-inter">Last Bill Number</p>
                <p className="font-inter">AMR-{state.settings.last_bill_serial}</p>
              </div>
              
              <div className="pt-2">
                <p className="text-sm text-gray-500 font-inter">
                  The next bill will be numbered AMR-{state.settings.last_bill_serial + 1}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Print Dialog */}
      <Dialog open={isPrintDialogOpen} onOpenChange={setIsPrintDialogOpen}>
        <DialogContent className="sm:max-w-xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between font-inter">
              <span>Bill Preview</span>
              <Button variant="outline" size="sm" className="rounded-xl font-inter">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="border rounded-2xl p-6 space-y-6">
            {generatedBill && (
              <>
                <div className="text-center space-y-1">
                  <h2 className="text-xl font-bold font-inter">{state.settings.shop_name}</h2>
                  <p className="text-sm font-inter">{state.settings.shop_address}</p>
                  <p className="text-sm font-inter">Contact: {state.settings.admin_phone}</p>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 font-inter">Bill #:</p>
                    <p className="font-semibold font-inter">{generatedBill.serial_no}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-500 font-inter">Date:</p>
                    <p className="font-inter">{new Date(generatedBill.date).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500 font-inter">Customer:</p>
                  <p className="font-semibold font-inter">{generatedBill.customerName}</p>
                  {generatedBill.customerPhone && (
                    <p className="text-sm font-inter">{generatedBill.customerPhone}</p>
                  )}
                  {generatedBill.customerAddress && (
                    <p className="text-sm font-inter">{generatedBill.customerAddress}</p>
                  )}
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 text-sm font-medium text-gray-500">
                    <div className="col-span-5 font-inter">Item</div>
                    <div className="col-span-2 text-center font-inter">Qty</div>
                    <div className="col-span-2 text-right font-inter">Rate</div>
                    <div className="col-span-3 text-right font-inter">Amount</div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    {generatedBill.items.map((item: any, index: number) => (
                      <div key={index} className="grid grid-cols-12 gap-2 text-sm">
                        <div className="col-span-5 font-inter">{item.product_name}</div>
                        <div className="col-span-2 text-center font-inter">{item.quantity}</div>
                        <div className="col-span-2 text-right font-inter">
                          {new Intl.NumberFormat('en-US', { 
                            style: 'currency', 
                            currency: 'PKR',
                            currencyDisplay: 'narrowSymbol'
                          }).format(item.price)}
                        </div>
                        <div className="col-span-3 text-right font-inter">
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
                    <div className="col-span-9 text-right font-inter">Total:</div>
                    <div className="col-span-3 text-right font-inter">
                      {new Intl.NumberFormat('en-US', { 
                        style: 'currency', 
                        currency: 'PKR',
                        currencyDisplay: 'narrowSymbol'
                      }).format(generatedBill.total_amount)}
                    </div>
                  </div>
                </div>
                
                <div className="text-center pt-6 space-y-1 text-sm">
                  <p className="font-inter">Thank you for your business!</p>
                  <p className="font-inter">For any inquiries, please contact us at {state.settings.admin_phone}</p>
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
