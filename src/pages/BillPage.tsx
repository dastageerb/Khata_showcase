
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Plus, Receipt, Trash2 } from 'lucide-react';

const BillPage: React.FC = () => {
  const { state, dispatch, generateId, addHistoryEntry } = useApp();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    customer_name: '',
    items: [{ product_name: '', quantity: 1, unit_price: 0 }],
    notes: ''
  });

  const calculateTotal = (items: any[]) => {
    return items.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customer_name || formData.items.length === 0) {
      toast({
        title: "Missing Information",
        description: "Customer name and items are required",
        variant: "destructive"
      });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });

    setTimeout(() => {
      // Generate new serial number
      const newSerialNo = `AMR-${state.settings.last_bill_serial + 1}`;
      
      const newBill = {
        id: generateId('bill'),
        serial_no: newSerialNo,
        customer_name: formData.customer_name,
        admin_phone: state.settings.admin_phone,
        date: new Date(),
        total_amount: calculateTotal(formData.items),
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
        'Bill generated'
      );

      dispatch({ type: 'ADD_BILL', payload: newBill });

      // Add bill items
      formData.items.forEach(item => {
        const billItem = {
          id: generateId('billitem'),
          bill_id: newBill.id,
          product_name: item.product_name,
          quantity: item.quantity,
          price: item.unit_price,
          amount: item.quantity * item.unit_price,
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
          'Bill item added'
        );
        
        dispatch({ type: 'ADD_BILL_ITEM', payload: billItem });
      });

      // Update settings with new serial number
      const updatedSettings = {
        ...state.settings,
        last_bill_serial: state.settings.last_bill_serial + 1,
        updated_at: new Date(),
        updated_by: state.currentUser?.id || 'system'
      };
      
      dispatch({ type: 'UPDATE_SETTINGS', payload: updatedSettings });

      toast({
        title: "Bill Generated",
        description: `Bill ${newSerialNo} has been generated for ${formData.customer_name}`
      });

      setFormData({ customer_name: '', items: [{ product_name: '', quantity: 1, unit_price: 0 }], notes: '' });
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
        <div className="flex items-center space-x-2 mb-6">
          <Receipt className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Generate Bill</h1>
        </div>

        <Card className="border-0 shadow-lg max-w-4xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">
              New Bill Form
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="customer" className="text-sm font-semibold text-gray-700">Customer Name</Label>
                <Input
                  id="customer"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  placeholder="Enter customer name"
                  className="h-10 text-sm"
                  required
                />
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-semibold text-gray-700">Bill Items</Label>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex gap-3 items-end p-4 border rounded-lg bg-gray-50">
                      <div className="flex-1">
                        <Label htmlFor={`product-${index}`} className="text-sm text-gray-600">Product Name</Label>
                        <Input
                          id={`product-${index}`}
                          value={item.product_name}
                          onChange={(e) => updateItem(index, 'product_name', e.target.value)}
                          placeholder="Enter product name"
                          className="h-10 text-sm mt-1"
                          required
                        />
                      </div>
                      
                      <div className="w-24">
                        <Label htmlFor={`quantity-${index}`} className="text-sm text-gray-600">Quantity</Label>
                        <Input
                          id={`quantity-${index}`}
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          className="h-10 text-sm mt-1"
                          required
                        />
                      </div>
                      
                      <div className="w-32">
                        <Label htmlFor={`price-${index}`} className="text-sm text-gray-600">Unit Price</Label>
                        <Input
                          id={`price-${index}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                          className="h-10 text-sm mt-1"
                          required
                        />
                      </div>
                      
                      <div className="w-32">
                        <Label className="text-sm text-gray-600">Amount</Label>
                        <div className="h-10 px-3 py-2 border rounded-md bg-gray-100 text-sm font-medium flex items-center">
                          {(item.quantity * item.unit_price).toFixed(2)}
                        </div>
                      </div>
                      
                      {formData.items.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(index)}
                          className="h-10 w-10 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={addItem}
                  className="w-full h-10 text-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-semibold text-gray-700">Notes (Optional)</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Enter notes"
                  className="h-10 text-sm"
                />
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-lg font-bold text-gray-900">
                  Total: {new Intl.NumberFormat('en-US', { 
                    style: 'currency', 
                    currency: 'PKR',
                    currencyDisplay: 'narrowSymbol'
                  }).format(calculateTotal(formData.items))}
                </div>

                <Button type="submit" disabled={state.isLoading} className="font-semibold text-sm h-10 px-8">
                  {state.isLoading ? 'Generating...' : 'Generate Bill'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BillPage;
