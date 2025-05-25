
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Combobox } from '@/components/ui/combobox';

const Homepage: React.FC = () => {
  const { state, dispatch, generateId, addHistoryEntry } = useApp();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    entity_type: 'customer' as 'customer' | 'company',
    entity_name: '',
    date: new Date().toISOString().split('T')[0],
    quantity: 1,
    payment_mode: '',
    bill_id: '',
    purchase_description: '',
    additional_notes: '',
    amount: 0,
    type: 'credit' as 'credit' | 'debit'
  });

  // Get options for entity dropdown
  const entityOptions = useMemo(() => {
    if (formData.entity_type === 'customer') {
      return state.customers.map(customer => ({
        value: customer.id,
        label: customer.name
      }));
    } else {
      return state.companies.map(company => ({
        value: company.id,
        label: company.name
      }));
    }
  }, [formData.entity_type, state.customers, state.companies]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.entity_name || !formData.amount || !formData.payment_mode) {
      toast({
        title: "Missing Information",
        description: "Entity name, amount and payment mode are required",
        variant: "destructive"
      });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });

    setTimeout(() => {
      if (formData.entity_type === 'customer') {
        const newTransaction = {
          id: generateId('ct'),
          customer_id: formData.entity_name,
          date: new Date(formData.date),
          quantity: formData.quantity,
          payment_mode: formData.payment_mode,
          bill_id: formData.bill_id || generateId('bill'),
          purchase_description: formData.purchase_description,
          additional_notes: formData.additional_notes,
          amount: formData.amount,
          type: formData.type,
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
          `Transaction recorded - ${formData.type} of ${formData.amount}`
        );

        dispatch({ type: 'ADD_CUSTOMER_TRANSACTION', payload: newTransaction });
      } else {
        const newTransaction = {
          id: generateId('comt'),
          company_id: formData.entity_name,
          date: new Date(formData.date),
          quantity: formData.quantity,
          payment_mode: formData.payment_mode,
          bill_id: formData.bill_id || generateId('bill'),
          purchase_description: formData.purchase_description,
          additional_notes: formData.additional_notes,
          amount: formData.amount,
          type: formData.type,
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
          `Transaction recorded - ${formData.type} of ${formData.amount}`
        );

        dispatch({ type: 'ADD_COMPANY_TRANSACTION', payload: newTransaction });
      }

      toast({
        title: "Transaction Added",
        description: `${formData.type === 'credit' ? 'Credit' : 'Debit'} transaction of ${formData.amount} has been recorded`
      });

      setFormData({
        entity_type: 'customer',
        entity_name: '',
        date: new Date().toISOString().split('T')[0],
        quantity: 1,
        payment_mode: '',
        bill_id: '',
        purchase_description: '',
        additional_notes: '',
        amount: 0,
        type: 'credit'
      });
      dispatch({ type: 'SET_LOADING', payload: false });
    }, 1000);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-center">Add New Transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Entity Type Tabs */}
            <Tabs value={formData.entity_type} onValueChange={(value: 'customer' | 'company') => setFormData({...formData, entity_type: value, entity_name: ''})}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="customer">Customer Transaction</TabsTrigger>
                <TabsTrigger value="company">Company Transaction</TabsTrigger>
              </TabsList>
              
              <TabsContent value="customer" className="mt-4">
                <div className="space-y-4">
                  {/* Entity Selection */}
                  <div>
                    <Label className="text-sm">Customer Name</Label>
                    <Combobox
                      options={entityOptions}
                      value={formData.entity_name}
                      onValueChange={(value) => setFormData({...formData, entity_name: value})}
                      placeholder="Select or search customer"
                      className="h-9"
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="company" className="mt-4">
                <div className="space-y-4">
                  {/* Entity Selection */}
                  <div>
                    <Label className="text-sm">Company Name</Label>
                    <Combobox
                      options={entityOptions}
                      value={formData.entity_name}
                      onValueChange={(value) => setFormData({...formData, entity_name: value})}
                      placeholder="Select or search company"
                      className="h-9"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Transaction Type */}
            <div className="flex items-center justify-center space-x-4">
              <Label className="text-sm">Type:</Label>
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant={formData.type === 'credit' ? 'default' : 'outline'}
                  onClick={() => setFormData({...formData, type: 'credit'})}
                  className={`h-9 px-4 text-sm ${formData.type === 'credit' ? 'bg-green-600 hover:bg-green-700' : 'border-green-600 text-green-600 hover:bg-green-50'}`}
                >
                  Credit (+)
                </Button>
                <Button
                  type="button"
                  variant={formData.type === 'debit' ? 'default' : 'outline'}
                  onClick={() => setFormData({...formData, type: 'debit'})}
                  className={`h-9 px-4 text-sm ${formData.type === 'debit' ? 'bg-red-600 hover:bg-red-700' : 'border-red-600 text-red-600 hover:bg-red-50'}`}
                >
                  Debit (-)
                </Button>
              </div>
            </div>

            {/* Amount and Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount" className="text-sm">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
                  required
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="date" className="text-sm">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                  className="h-9 text-sm"
                />
              </div>
            </div>

            {/* Payment Mode and Quantity */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="payment_mode" className="text-sm">Payment Mode</Label>
                <Select value={formData.payment_mode} onValueChange={(value) => setFormData({...formData, payment_mode: value})}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select payment mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Online">Online</SelectItem>
                    <SelectItem value="Check">Check</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="quantity" className="text-sm">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 1})}
                  className="h-9 text-sm"
                />
              </div>
            </div>

            {/* Bill ID and Purchase Description */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bill_id" className="text-sm">Bill ID (Optional)</Label>
                <Input
                  id="bill_id"
                  value={formData.bill_id}
                  onChange={(e) => setFormData({...formData, bill_id: e.target.value})}
                  placeholder="Enter bill ID"
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-sm">Purchase Description</Label>
                <Input
                  id="description"
                  value={formData.purchase_description}
                  onChange={(e) => setFormData({...formData, purchase_description: e.target.value})}
                  placeholder="Enter description"
                  className="h-9 text-sm"
                />
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <Label htmlFor="notes" className="text-sm">Additional Notes (Optional)</Label>
              <Input
                id="notes"
                value={formData.additional_notes}
                onChange={(e) => setFormData({...formData, additional_notes: e.target.value})}
                placeholder="Enter additional notes"
                className="h-9 text-sm"
              />
            </div>

            <Button type="submit" className="w-full h-10 text-sm" disabled={state.isLoading}>
              {state.isLoading ? 'Adding Transaction...' : 'Add Transaction'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Homepage;
