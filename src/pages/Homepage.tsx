
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Combobox } from '@/components/ui/combobox';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, User, Plus } from 'lucide-react';

const Homepage: React.FC = () => {
  const { state, dispatch, generateId, addHistoryEntry } = useApp();
  const { toast } = useToast();
  
  // Customer form state
  const [customerFormData, setCustomerFormData] = useState({
    name: '',
    phone: '',
    nic_number: '',
    address: '',
    quantity: 1,
    payment_mode: '',
    bill_id: '',
    purchase_description: '',
    additional_notes: '',
    amount: 0,
    type: 'credit' as 'credit' | 'debit'
  });

  // Company form state
  const [companyFormData, setCompanyFormData] = useState({
    name: '',
    contact_number: '',
    address: '',
    quantity: 1,
    payment_mode: '',
    bill_id: '',
    purchase_description: '',
    additional_notes: '',
    amount: 0,
    type: 'credit' as 'credit' | 'debit'
  });

  // Customer options for combobox
  const customerOptions = state.customers.map(customer => ({
    value: customer.id,
    label: customer.name
  }));

  // Company options for combobox
  const companyOptions = state.companies.map(company => ({
    value: company.id,
    label: company.name
  }));

  const handleCustomerSelect = (customerId: string) => {
    const customer = state.customers.find(c => c.id === customerId);
    if (customer) {
      setCustomerFormData({
        ...customerFormData,
        name: customer.name,
        phone: customer.phone,
        nic_number: customer.nic_number || '',
        address: customer.address || ''
      });
    }
  };

  const handleCompanySelect = (companyId: string) => {
    const company = state.companies.find(c => c.id === companyId);
    if (company) {
      setCompanyFormData({
        ...companyFormData,
        name: company.name,
        contact_number: company.contact_number,
        address: company.address || ''
      });
    }
  };

  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerFormData.name || !customerFormData.phone || !customerFormData.amount || !customerFormData.payment_mode) {
      toast({
        title: "Missing Information",
        description: "Name, phone, amount, and payment mode are required",
        variant: "destructive"
      });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });

    setTimeout(() => {
      // Create customer if doesn't exist
      let customer = state.customers.find(c => c.phone === customerFormData.phone);
      
      if (!customer) {
        customer = {
          id: generateId('cust'),
          name: customerFormData.name,
          phone: customerFormData.phone,
          nic_number: customerFormData.nic_number,
          address: customerFormData.address,
          balance: 0,
          created_by: state.currentUser?.id || 'system',
          created_at: new Date(),
          updated_at: new Date(),
          updated_by: state.currentUser?.id || 'system',
          history: []
        };

        addHistoryEntry(
          customer,
          'created',
          state.currentUser?.id || 'system',
          state.currentUser?.name || 'System',
          'Customer profile created'
        );

        dispatch({ type: 'ADD_CUSTOMER', payload: customer });
      }

      // Create transaction
      const newTransaction = {
        id: generateId('ct'),
        customer_id: customer.id,
        date: new Date(),
        quantity: customerFormData.quantity,
        payment_mode: customerFormData.payment_mode,
        bill_id: customerFormData.bill_id || generateId('bill'),
        purchase_description: customerFormData.purchase_description,
        additional_notes: customerFormData.additional_notes,
        amount: customerFormData.amount,
        type: customerFormData.type,
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
        `Transaction recorded - ${customerFormData.type} of ${customerFormData.amount}`
      );

      dispatch({ type: 'ADD_CUSTOMER_TRANSACTION', payload: newTransaction });

      toast({
        title: "Success",
        description: `Customer transaction recorded successfully`
      });

      // Reset form
      setCustomerFormData({
        name: '',
        phone: '',
        nic_number: '',
        address: '',
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

  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!companyFormData.name || !companyFormData.contact_number || !companyFormData.amount || !companyFormData.payment_mode) {
      toast({
        title: "Missing Information",
        description: "Name, contact number, amount, and payment mode are required",
        variant: "destructive"
      });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });

    setTimeout(() => {
      // Create company if doesn't exist
      let company = state.companies.find(c => c.contact_number === companyFormData.contact_number);
      
      if (!company) {
        company = {
          id: generateId('comp'),
          name: companyFormData.name,
          contact_number: companyFormData.contact_number,
          address: companyFormData.address,
          balance: 0,
          created_by: state.currentUser?.id || 'system',
          created_at: new Date(),
          updated_at: new Date(),
          updated_by: state.currentUser?.id || 'system',
          history: []
        };

        addHistoryEntry(
          company,
          'created',
          state.currentUser?.id || 'system',
          state.currentUser?.name || 'System',
          'Company profile created'
        );

        dispatch({ type: 'ADD_COMPANY', payload: company });
      }

      // Create transaction
      const newTransaction = {
        id: generateId('comt'),
        company_id: company.id,
        date: new Date(),
        quantity: companyFormData.quantity,
        payment_mode: companyFormData.payment_mode,
        bill_id: companyFormData.bill_id || generateId('bill'),
        purchase_description: companyFormData.purchase_description,
        additional_notes: companyFormData.additional_notes,
        amount: companyFormData.amount,
        type: companyFormData.type,
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
        `Transaction recorded - ${companyFormData.type} of ${companyFormData.amount}`
      );

      dispatch({ type: 'ADD_COMPANY_TRANSACTION', payload: newTransaction });

      toast({
        title: "Success",
        description: `Company transaction recorded successfully`
      });

      // Reset form
      setCompanyFormData({
        name: '',
        contact_number: '',
        address: '',
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
    <div className="max-w-5xl mx-auto bg-white p-6 md:p-8 rounded-lg shadow-lg">
      <h1 className="text-xl font-bold text-center text-primary mb-6">Add New Transaction</h1>
      
      <Tabs defaultValue="customer" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="customer" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Customer Transaction</span>
          </TabsTrigger>
          <TabsTrigger value="company" className="flex items-center space-x-2">
            <Building className="h-4 w-4" />
            <span>Company Transaction</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customer">
          <form onSubmit={handleCustomerSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="customerName" className="text-sm font-medium text-gray-700 block mb-2">Customer Name</Label>
                <Combobox
                  options={customerOptions}
                  value={state.customers.find(c => c.name === customerFormData.name)?.id || ''}
                  onValueChange={handleCustomerSelect}
                  placeholder="Search or select customer"
                  className="w-full"
                />
                {customerFormData.name && !state.customers.find(c => c.name === customerFormData.name) && (
                  <Input
                    value={customerFormData.name}
                    onChange={(e) => setCustomerFormData({...customerFormData, name: e.target.value})}
                    placeholder="Enter new customer name"
                    className="mt-2 border border-gray-300 rounded-md"
                  />
                )}
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 block mb-2">Type</Label>
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant={customerFormData.type === 'credit' ? 'default' : 'outline'}
                    onClick={() => setCustomerFormData({...customerFormData, type: 'credit'})}
                    className={`flex-1 ${customerFormData.type === 'credit' ? 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200' : 'bg-gray-100 text-gray-700 border-gray-300'}`}
                  >
                    Credit (+)
                  </Button>
                  <Button
                    type="button"
                    variant={customerFormData.type === 'debit' ? 'default' : 'outline'}
                    onClick={() => setCustomerFormData({...customerFormData, type: 'debit'})}
                    className={`flex-1 ${customerFormData.type === 'debit' ? 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200' : 'bg-gray-100 text-gray-700 border-gray-300'}`}
                  >
                    Debit (-)
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="customerAmount" className="text-sm font-medium text-gray-700 block mb-2">Amount</Label>
                <Input
                  id="customerAmount"
                  type="number"
                  step="0.01"
                  value={customerFormData.amount}
                  onChange={(e) => setCustomerFormData({...customerFormData, amount: parseFloat(e.target.value) || 0})}
                  className="border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <Label htmlFor="customerQuantity" className="text-sm font-medium text-gray-700 block mb-2">Quantity</Label>
                <Input
                  id="customerQuantity"
                  type="number"
                  value={customerFormData.quantity}
                  onChange={(e) => setCustomerFormData({...customerFormData, quantity: parseInt(e.target.value) || 1})}
                  className="border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <Label htmlFor="customerPaymentMode" className="text-sm font-medium text-gray-700 block mb-2">Payment Mode</Label>
                <Select value={customerFormData.payment_mode} onValueChange={(value) => setCustomerFormData({...customerFormData, payment_mode: value})}>
                  <SelectTrigger className="border border-gray-300 rounded-md">
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
                <Label htmlFor="customerDate" className="text-sm font-medium text-gray-700 block mb-2">Date</Label>
                <Input
                  id="customerDate"
                  type="date"
                  value={new Date().toISOString().split('T')[0]}
                  className="border border-gray-300 rounded-md"
                  readOnly
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="customerPhone" className="text-sm font-medium text-gray-700 block mb-2">Phone Number</Label>
                <Input
                  id="customerPhone"
                  value={customerFormData.phone}
                  onChange={(e) => setCustomerFormData({...customerFormData, phone: e.target.value})}
                  placeholder="Enter phone number"
                  className="border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <Label htmlFor="customerBillId" className="text-sm font-medium text-gray-700 block mb-2">Bill ID (Optional)</Label>
                <Input
                  id="customerBillId"
                  value={customerFormData.bill_id}
                  onChange={(e) => setCustomerFormData({...customerFormData, bill_id: e.target.value})}
                  placeholder="Enter bill ID"
                  className="border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="customerDescription" className="text-sm font-medium text-gray-700 block mb-2">Purchase Description</Label>
              <Input
                id="customerDescription"
                value={customerFormData.purchase_description}
                onChange={(e) => setCustomerFormData({...customerFormData, purchase_description: e.target.value})}
                placeholder="Enter description"
                className="border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <Label htmlFor="customerNotes" className="text-sm font-medium text-gray-700 block mb-2">Additional Notes (Optional)</Label>
              <Textarea
                id="customerNotes"
                value={customerFormData.additional_notes}
                onChange={(e) => setCustomerFormData({...customerFormData, additional_notes: e.target.value})}
                placeholder="Enter additional notes"
                rows={3}
                className="border border-gray-300 rounded-md"
              />
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white" disabled={state.isLoading}>
              <Plus className="h-4 w-4 mr-2" />
              {state.isLoading ? 'Adding...' : 'Add Transaction'}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="company">
          <form onSubmit={handleCompanySubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="companyName" className="text-sm font-medium text-gray-700 block mb-2">Company Name</Label>
                <Combobox
                  options={companyOptions}
                  value={state.companies.find(c => c.name === companyFormData.name)?.id || ''}
                  onValueChange={handleCompanySelect}
                  placeholder="Search or select company"
                  className="w-full"
                />
                {companyFormData.name && !state.companies.find(c => c.name === companyFormData.name) && (
                  <Input
                    value={companyFormData.name}
                    onChange={(e) => setCompanyFormData({...companyFormData, name: e.target.value})}
                    placeholder="Enter new company name"
                    className="mt-2 border border-gray-300 rounded-md"
                  />
                )}
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 block mb-2">Type</Label>
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant={companyFormData.type === 'credit' ? 'default' : 'outline'}
                    onClick={() => setCompanyFormData({...companyFormData, type: 'credit'})}
                    className={`flex-1 ${companyFormData.type === 'credit' ? 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200' : 'bg-gray-100 text-gray-700 border-gray-300'}`}
                  >
                    Credit (+)
                  </Button>
                  <Button
                    type="button"
                    variant={companyFormData.type === 'debit' ? 'default' : 'outline'}
                    onClick={() => setCompanyFormData({...companyFormData, type: 'debit'})}
                    className={`flex-1 ${companyFormData.type === 'debit' ? 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200' : 'bg-gray-100 text-gray-700 border-gray-300'}`}
                  >
                    Debit (-)
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="companyAmount" className="text-sm font-medium text-gray-700 block mb-2">Amount</Label>
                <Input
                  id="companyAmount"
                  type="number"
                  step="0.01"
                  value={companyFormData.amount}
                  onChange={(e) => setCompanyFormData({...companyFormData, amount: parseFloat(e.target.value) || 0})}
                  className="border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <Label htmlFor="companyQuantity" className="text-sm font-medium text-gray-700 block mb-2">Quantity</Label>
                <Input
                  id="companyQuantity"
                  type="number"
                  value={companyFormData.quantity}
                  onChange={(e) => setCompanyFormData({...companyFormData, quantity: parseInt(e.target.value) || 1})}
                  className="border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <Label htmlFor="companyPaymentMode" className="text-sm font-medium text-gray-700 block mb-2">Payment Mode</Label>
                <Select value={companyFormData.payment_mode} onValueChange={(value) => setCompanyFormData({...companyFormData, payment_mode: value})}>
                  <SelectTrigger className="border border-gray-300 rounded-md">
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
                <Label htmlFor="companyDate" className="text-sm font-medium text-gray-700 block mb-2">Date</Label>
                <Input
                  id="companyDate"
                  type="date"
                  value={new Date().toISOString().split('T')[0]}
                  className="border border-gray-300 rounded-md"
                  readOnly
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="companyContact" className="text-sm font-medium text-gray-700 block mb-2">Contact Number</Label>
                <Input
                  id="companyContact"
                  value={companyFormData.contact_number}
                  onChange={(e) => setCompanyFormData({...companyFormData, contact_number: e.target.value})}
                  placeholder="Enter contact number"
                  className="border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <Label htmlFor="companyBillId" className="text-sm font-medium text-gray-700 block mb-2">Bill ID (Optional)</Label>
                <Input
                  id="companyBillId"
                  value={companyFormData.bill_id}
                  onChange={(e) => setCompanyFormData({...companyFormData, bill_id: e.target.value})}
                  placeholder="Enter bill ID"
                  className="border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="companyDescription" className="text-sm font-medium text-gray-700 block mb-2">Purchase Description</Label>
              <Input
                id="companyDescription"
                value={companyFormData.purchase_description}
                onChange={(e) => setCompanyFormData({...companyFormData, purchase_description: e.target.value})}
                placeholder="Enter description"
                className="border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <Label htmlFor="companyNotes" className="text-sm font-medium text-gray-700 block mb-2">Additional Notes (Optional)</Label>
              <Textarea
                id="companyNotes"
                value={companyFormData.additional_notes}
                onChange={(e) => setCompanyFormData({...companyFormData, additional_notes: e.target.value})}
                placeholder="Enter additional notes"
                rows={3}
                className="border border-gray-300 rounded-md"
              />
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white" disabled={state.isLoading}>
              <Plus className="h-4 w-4 mr-2" />
              {state.isLoading ? 'Adding...' : 'Add Transaction'}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Homepage;
