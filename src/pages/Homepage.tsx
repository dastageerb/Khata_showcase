
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

  const [showSuggestions, setShowSuggestions] = useState(false);

  // Get suggestions based on entity type
  const suggestions = useMemo(() => {
    if (formData.entity_type === 'customer') {
      return state.customerTransactions
        .map(t => t.customer_id)
        .filter((id, index, self) => self.indexOf(id) === index && id.toLowerCase().includes(formData.entity_name.toLowerCase()))
        .slice(0, 5);
    } else {
      return state.companyTransactions
        .map(t => t.company_id)
        .filter((id, index, self) => self.indexOf(id) === index && id.toLowerCase().includes(formData.entity_name.toLowerCase()))
        .slice(0, 5);
    }
  }, [formData.entity_type, formData.entity_name, state.customerTransactions, state.companyTransactions]);

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
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Add New Transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Entity Type Selection */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant={formData.entity_type === 'customer' ? 'default' : 'outline'}
                onClick={() => setFormData({...formData, entity_type: 'customer', entity_name: ''})}
                className="h-16 text-lg"
              >
                Customer Transaction
              </Button>
              <Button
                type="button"
                variant={formData.entity_type === 'company' ? 'default' : 'outline'}
                onClick={() => setFormData({...formData, entity_type: 'company', entity_name: ''})}
                className="h-16 text-lg"
              >
                Company Transaction
              </Button>
            </div>

            {/* Entity Name with Autocomplete */}
            <div className="relative">
              <Label htmlFor="entity_name">
                {formData.entity_type === 'customer' ? 'Customer Name' : 'Company Name'}
              </Label>
              <Input
                id="entity_name"
                value={formData.entity_name}
                onChange={(e) => {
                  setFormData({...formData, entity_name: e.target.value});
                  setShowSuggestions(e.target.value.length > 0);
                }}
                onFocus={() => setShowSuggestions(formData.entity_name.length > 0)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder={`Enter ${formData.entity_type} name`}
                required
                className="text-lg h-12"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setFormData({...formData, entity_name: suggestion});
                        setShowSuggestions(false);
                      }}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Transaction Type */}
            <div className="flex items-center justify-center space-x-4">
              <Label className="text-lg">Transaction Type:</Label>
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant={formData.type === 'credit' ? 'default' : 'outline'}
                  onClick={() => setFormData({...formData, type: 'credit'})}
                  className={`h-12 px-6 ${formData.type === 'credit' ? 'bg-green-600 hover:bg-green-700' : 'border-green-600 text-green-600 hover:bg-green-50'}`}
                >
                  Credit (+)
                </Button>
                <Button
                  type="button"
                  variant={formData.type === 'debit' ? 'default' : 'outline'}
                  onClick={() => setFormData({...formData, type: 'debit'})}
                  className={`h-12 px-6 ${formData.type === 'debit' ? 'bg-red-600 hover:bg-red-700' : 'border-red-600 text-red-600 hover:bg-red-50'}`}
                >
                  Debit (-)
                </Button>
              </div>
            </div>

            {/* Amount and Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount" className="text-lg">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
                  required
                  className="text-lg h-12"
                />
              </div>
              <div>
                <Label htmlFor="date" className="text-lg">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                  className="text-lg h-12"
                />
              </div>
            </div>

            {/* Payment Mode and Quantity */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="payment_mode" className="text-lg">Payment Mode</Label>
                <Select value={formData.payment_mode} onValueChange={(value) => setFormData({...formData, payment_mode: value})}>
                  <SelectTrigger className="h-12 text-lg">
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
                <Label htmlFor="quantity" className="text-lg">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 1})}
                  className="text-lg h-12"
                />
              </div>
            </div>

            {/* Bill ID */}
            <div>
              <Label htmlFor="bill_id" className="text-lg">Bill ID (Optional)</Label>
              <Input
                id="bill_id"
                value={formData.bill_id}
                onChange={(e) => setFormData({...formData, bill_id: e.target.value})}
                placeholder="Enter bill ID or leave empty for auto-generation"
                className="text-lg h-12"
              />
            </div>

            {/* Purchase Description */}
            <div>
              <Label htmlFor="description" className="text-lg">Purchase Description (Optional)</Label>
              <Input
                id="description"
                value={formData.purchase_description}
                onChange={(e) => setFormData({...formData, purchase_description: e.target.value})}
                placeholder="Enter description"
                className="text-lg h-12"
              />
            </div>

            {/* Additional Notes */}
            <div>
              <Label htmlFor="notes" className="text-lg">Additional Notes (Optional)</Label>
              <Input
                id="notes"
                value={formData.additional_notes}
                onChange={(e) => setFormData({...formData, additional_notes: e.target.value})}
                placeholder="Enter additional notes"
                className="text-lg h-12"
              />
            </div>

            <Button type="submit" className="w-full h-14 text-lg" disabled={state.isLoading}>
              {state.isLoading ? 'Adding Transaction...' : 'Add Transaction'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Homepage;
