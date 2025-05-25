
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';

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
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Add New Transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant={formData.entity_type === 'customer' ? 'default' : 'outline'}
                  onClick={() => setFormData({...formData, entity_type: 'customer'})}
                  className="h-8"
                >
                  Customer
                </Button>
                <Button
                  type="button"
                  variant={formData.entity_type === 'company' ? 'default' : 'outline'}
                  onClick={() => setFormData({...formData, entity_type: 'company'})}
                  className="h-8"
                >
                  Company
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant={formData.type === 'credit' ? 'default' : 'outline'}
                  onClick={() => setFormData({...formData, type: 'credit'})}
                  className={`h-8 ${formData.type === 'credit' ? 'bg-green-600 hover:bg-green-700' : 'border-green-600 text-green-600 hover:bg-green-50'}`}
                >
                  Credit (+)
                </Button>
                <Button
                  type="button"
                  variant={formData.type === 'debit' ? 'default' : 'outline'}
                  onClick={() => setFormData({...formData, type: 'debit'})}
                  className={`h-8 ${formData.type === 'debit' ? 'bg-red-600 hover:bg-red-700' : 'border-red-600 text-red-600 hover:bg-red-50'}`}
                >
                  Debit (-)
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="entity_name">{formData.entity_type === 'customer' ? 'Customer' : 'Company'} Name</Label>
              <Input
                id="entity_name"
                value={formData.entity_name}
                onChange={(e) => setFormData({...formData, entity_name: e.target.value})}
                placeholder={`Enter ${formData.entity_type} name`}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="payment_mode">Payment Mode</Label>
              <Select value={formData.payment_mode} onValueChange={(value) => setFormData({...formData, payment_mode: value})}>
                <SelectTrigger>
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
              <Label htmlFor="description">Purchase Description (Optional)</Label>
              <Input
                id="description"
                value={formData.purchase_description}
                onChange={(e) => setFormData({...formData, purchase_description: e.target.value})}
                placeholder="Enter description"
              />
            </div>

            <Button type="submit" className="w-full" disabled={state.isLoading}>
              {state.isLoading ? 'Adding Transaction...' : 'Add Transaction'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Homepage;
