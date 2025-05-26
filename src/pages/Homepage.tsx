
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Search, Calendar } from 'lucide-react';
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
    <div className="max-w-5xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader className="pb-4 text-center">
          <CardTitle className="text-xl font-bold text-[#4A90E2]">Add New Transaction</CardTitle>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Entity Type Tabs */}
            <Tabs value={formData.entity_type} onValueChange={(value: 'customer' | 'company') => setFormData({...formData, entity_type: value, entity_name: ''})}>
              <TabsList className="grid w-full grid-cols-2 bg-[#F0F0F0] p-1 rounded-lg">
                <TabsTrigger 
                  value="customer" 
                  className="font-medium text-sm data-[state=active]:bg-[#4A90E2] data-[state=active]:text-white data-[state=active]:shadow-md"
                >
                  Customer Transaction
                </TabsTrigger>
                <TabsTrigger 
                  value="company"
                  className="font-medium text-sm data-[state=active]:bg-[#4A90E2] data-[state=active]:text-white data-[state=active]:shadow-md"
                >
                  Company Transaction
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="customer" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Customer Name */}
                  <div>
                    <Label className="block mb-2 font-medium text-[#333333] text-sm">Customer Name</Label>
                    <div className="relative">
                      <Combobox
                        options={entityOptions}
                        value={formData.entity_name}
                        onValueChange={(value) => setFormData({...formData, entity_name: value})}
                        placeholder="Search or select customer"
                        className="w-full border border-[#E0E0E0] rounded-md text-sm text-[#4F4F4F] pr-10"
                      />
                      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  
                  {/* Transaction Type */}
                  <div>
                    <Label className="block mb-2 font-medium text-[#333333] text-sm">Type</Label>
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        onClick={() => setFormData({...formData, type: 'credit'})}
                        className={`flex-1 font-medium text-sm rounded-md border transition-all ${
                          formData.type === 'credit' 
                            ? 'bg-[rgba(76,175,80,0.15)] text-[#2E7D32] border-[rgba(76,175,80,0.3)] hover:bg-[rgba(76,175,80,0.2)]' 
                            : 'bg-[#F0F0F0] text-[#4F4F4F] border-[#E0E0E0] hover:bg-[#E0E0E0]'
                        }`}
                      >
                        Credit (+)
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setFormData({...formData, type: 'debit'})}
                        className={`flex-1 font-medium text-sm rounded-md border transition-all ${
                          formData.type === 'debit' 
                            ? 'bg-[rgba(244,67,54,0.15)] text-[#C62828] border-[rgba(244,67,54,0.3)] hover:bg-[rgba(244,67,54,0.2)]' 
                            : 'bg-[#F0F0F0] text-[#4F4F4F] border-[#E0E0E0] hover:bg-[#E0E0E0]'
                        }`}
                      >
                        Debit (-)
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="company" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Company Name */}
                  <div>
                    <Label className="block mb-2 font-medium text-[#333333] text-sm">Company Name</Label>
                    <div className="relative">
                      <Combobox
                        options={entityOptions}
                        value={formData.entity_name}
                        onValueChange={(value) => setFormData({...formData, entity_name: value})}
                        placeholder="Search or select company"
                        className="w-full border border-[#E0E0E0] rounded-md text-sm text-[#4F4F4F] pr-10"
                      />
                      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  
                  {/* Transaction Type */}
                  <div>
                    <Label className="block mb-2 font-medium text-[#333333] text-sm">Type</Label>
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        onClick={() => setFormData({...formData, type: 'credit'})}
                        className={`flex-1 font-medium text-sm rounded-md border transition-all ${
                          formData.type === 'credit' 
                            ? 'bg-[rgba(76,175,80,0.15)] text-[#2E7D32] border-[rgba(76,175,80,0.3)] hover:bg-[rgba(76,175,80,0.2)]' 
                            : 'bg-[#F0F0F0] text-[#4F4F4F] border-[#E0E0E0] hover:bg-[#E0E0E0]'
                        }`}
                      >
                        Credit (+)
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setFormData({...formData, type: 'debit'})}
                        className={`flex-1 font-medium text-sm rounded-md border transition-all ${
                          formData.type === 'debit' 
                            ? 'bg-[rgba(244,67,54,0.15)] text-[#C62828] border-[rgba(244,67,54,0.3)] hover:bg-[rgba(244,67,54,0.2)]' 
                            : 'bg-[#F0F0F0] text-[#4F4F4F] border-[#E0E0E0] hover:bg-[#E0E0E0]'
                        }`}
                      >
                        Debit (-)
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Amount, Quantity, Payment Mode, Date Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label className="block mb-2 font-medium text-[#333333] text-sm">Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
                  required
                  className="border border-[#E0E0E0] rounded-md text-sm text-[#4F4F4F] focus:border-[#4A90E2]"
                />
              </div>
              <div>
                <Label className="block mb-2 font-medium text-[#333333] text-sm">Quantity</Label>
                <Input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 1})}
                  className="border border-[#E0E0E0] rounded-md text-sm text-[#4F4F4F] focus:border-[#4A90E2]"
                />
              </div>
              <div>
                <Label className="block mb-2 font-medium text-[#333333] text-sm">Payment Mode</Label>
                <Select value={formData.payment_mode} onValueChange={(value) => setFormData({...formData, payment_mode: value})}>
                  <SelectTrigger className="border border-[#E0E0E0] rounded-md text-sm text-[#4F4F4F] focus:border-[#4A90E2]">
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
              <div className="relative">
                <Label className="block mb-2 font-medium text-[#333333] text-sm">Date</Label>
                <div className="relative">
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                    className="border border-[#E0E0E0] rounded-md text-sm text-[#4F4F4F] focus:border-[#4A90E2] pr-10"
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Bill ID and Purchase Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="block mb-2 font-medium text-[#333333] text-sm">Bill ID (Optional)</Label>
                <Input
                  value={formData.bill_id}
                  onChange={(e) => setFormData({...formData, bill_id: e.target.value})}
                  placeholder="Enter bill ID"
                  className="border border-[#E0E0E0] rounded-md text-sm text-[#4F4F4F] focus:border-[#4A90E2]"
                />
              </div>
              <div>
                <Label className="block mb-2 font-medium text-[#333333] text-sm">Purchase Description</Label>
                <Input
                  value={formData.purchase_description}
                  onChange={(e) => setFormData({...formData, purchase_description: e.target.value})}
                  placeholder="Enter description"
                  className="border border-[#E0E0E0] rounded-md text-sm text-[#4F4F4F] focus:border-[#4A90E2]"
                />
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <Label className="block mb-2 font-medium text-[#333333] text-sm">Additional Notes (Optional)</Label>
              <Textarea
                value={formData.additional_notes}
                onChange={(e) => setFormData({...formData, additional_notes: e.target.value})}
                placeholder="Enter additional notes"
                rows={3}
                className="border border-[#E0E0E0] rounded-md text-sm text-[#4F4F4F] focus:border-[#4A90E2] resize-none"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-[#4A90E2] hover:bg-[#357ABD] text-white font-medium text-sm py-3 rounded-md transition-colors" 
              disabled={state.isLoading}
            >
              {state.isLoading ? 'Adding Transaction...' : 'Add Transaction'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Homepage;
