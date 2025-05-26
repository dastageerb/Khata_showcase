
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Add New Transaction</h1>
        <p className="text-gray-500">Create new customer/company and record transactions</p>
      </div>

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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Customer Transaction</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCustomerSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="customerName">Customer Name *</Label>
                    <Input
                      id="customerName"
                      value={customerFormData.name}
                      onChange={(e) => setCustomerFormData({...customerFormData, name: e.target.value})}
                      placeholder="Enter customer name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerPhone">Phone Number *</Label>
                    <Input
                      id="customerPhone"
                      value={customerFormData.phone}
                      onChange={(e) => setCustomerFormData({...customerFormData, phone: e.target.value})}
                      placeholder="Enter phone number"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="customerNic">NIC Number</Label>
                    <Input
                      id="customerNic"
                      value={customerFormData.nic_number}
                      onChange={(e) => setCustomerFormData({...customerFormData, nic_number: e.target.value})}
                      placeholder="Enter NIC number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerAddress">Address</Label>
                    <Input
                      id="customerAddress"
                      value={customerFormData.address}
                      onChange={(e) => setCustomerFormData({...customerFormData, address: e.target.value})}
                      placeholder="Enter address"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="customerAmount">Amount *</Label>
                    <Input
                      id="customerAmount"
                      type="number"
                      step="0.01"
                      value={customerFormData.amount}
                      onChange={(e) => setCustomerFormData({...customerFormData, amount: parseFloat(e.target.value) || 0})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerQuantity">Quantity</Label>
                    <Input
                      id="customerQuantity"
                      type="number"
                      value={customerFormData.quantity}
                      onChange={(e) => setCustomerFormData({...customerFormData, quantity: parseInt(e.target.value) || 1})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerPaymentMode">Payment Mode *</Label>
                    <Select value={customerFormData.payment_mode} onValueChange={(value) => setCustomerFormData({...customerFormData, payment_mode: value})}>
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
                    <Label htmlFor="customerType">Transaction Type</Label>
                    <Select value={customerFormData.type} onValueChange={(value: 'credit' | 'debit') => setCustomerFormData({...customerFormData, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="credit">Credit (+)</SelectItem>
                        <SelectItem value="debit">Debit (-)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="customerBillId">Bill ID</Label>
                    <Input
                      id="customerBillId"
                      value={customerFormData.bill_id}
                      onChange={(e) => setCustomerFormData({...customerFormData, bill_id: e.target.value})}
                      placeholder="Enter bill ID (optional)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerDescription">Purchase Description</Label>
                    <Input
                      id="customerDescription"
                      value={customerFormData.purchase_description}
                      onChange={(e) => setCustomerFormData({...customerFormData, purchase_description: e.target.value})}
                      placeholder="Enter description"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="customerNotes">Additional Notes</Label>
                  <Textarea
                    id="customerNotes"
                    value={customerFormData.additional_notes}
                    onChange={(e) => setCustomerFormData({...customerFormData, additional_notes: e.target.value})}
                    placeholder="Enter additional notes (optional)"
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={state.isLoading}>
                  <Plus className="h-4 w-4 mr-2" />
                  {state.isLoading ? 'Adding...' : 'Add Customer Transaction'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5" />
                <span>Company Transaction</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCompanySubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      value={companyFormData.name}
                      onChange={(e) => setCompanyFormData({...companyFormData, name: e.target.value})}
                      placeholder="Enter company name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyContact">Contact Number *</Label>
                    <Input
                      id="companyContact"
                      value={companyFormData.contact_number}
                      onChange={(e) => setCompanyFormData({...companyFormData, contact_number: e.target.value})}
                      placeholder="Enter contact number"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="companyAddress">Address</Label>
                  <Input
                    id="companyAddress"
                    value={companyFormData.address}
                    onChange={(e) => setCompanyFormData({...companyFormData, address: e.target.value})}
                    placeholder="Enter company address"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="companyAmount">Amount *</Label>
                    <Input
                      id="companyAmount"
                      type="number"
                      step="0.01"
                      value={companyFormData.amount}
                      onChange={(e) => setCompanyFormData({...companyFormData, amount: parseFloat(e.target.value) || 0})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyQuantity">Quantity</Label>
                    <Input
                      id="companyQuantity"
                      type="number"
                      value={companyFormData.quantity}
                      onChange={(e) => setCompanyFormData({...companyFormData, quantity: parseInt(e.target.value) || 1})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyPaymentMode">Payment Mode *</Label>
                    <Select value={companyFormData.payment_mode} onValueChange={(value) => setCompanyFormData({...companyFormData, payment_mode: value})}>
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
                    <Label htmlFor="companyType">Transaction Type</Label>
                    <Select value={companyFormData.type} onValueChange={(value: 'credit' | 'debit') => setCompanyFormData({...companyFormData, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="credit">Credit (+)</SelectItem>
                        <SelectItem value="debit">Debit (-)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="companyBillId">Bill ID</Label>
                    <Input
                      id="companyBillId"
                      value={companyFormData.bill_id}
                      onChange={(e) => setCompanyFormData({...companyFormData, bill_id: e.target.value})}
                      placeholder="Enter bill ID (optional)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyDescription">Purchase Description</Label>
                    <Input
                      id="companyDescription"
                      value={companyFormData.purchase_description}
                      onChange={(e) => setCompanyFormData({...companyFormData, purchase_description: e.target.value})}
                      placeholder="Enter description"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="companyNotes">Additional Notes</Label>
                  <Textarea
                    id="companyNotes"
                    value={companyFormData.additional_notes}
                    onChange={(e) => setCompanyFormData({...companyFormData, additional_notes: e.target.value})}
                    placeholder="Enter additional notes (optional)"
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={state.isLoading}>
                  <Plus className="h-4 w-4 mr-2" />
                  {state.isLoading ? 'Adding...' : 'Add Company Transaction'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Homepage;
