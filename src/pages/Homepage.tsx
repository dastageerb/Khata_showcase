
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/context/AppContext';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const Homepage: React.FC = () => {
  const { state, dispatch, generateId, addHistoryEntry } = useApp();
  const { toast } = useToast();
  
  // Form state
  const [transactionType, setTransactionType] = useState('customer');
  const [entityId, setEntityId] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [quantity, setQuantity] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [amount, setAmount] = useState('');

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!entityId) {
      toast({
        title: "Missing Information",
        description: `Please select a ${transactionType === 'customer' ? 'customer' : 'company'}`,
        variant: "destructive"
      });
      return;
    }

    if (!date || !amount || !quantity || !description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });

    // Simulate loading
    setTimeout(() => {
      const amountValue = parseFloat(amount);
      
      if (transactionType === 'customer') {
        const customer = state.customers.find(c => c.id === entityId);
        if (!customer) {
          toast({
            title: "Error",
            description: "Selected customer not found",
            variant: "destructive"
          });
          dispatch({ type: 'SET_LOADING', payload: false });
          return;
        }
        
        // Create customer transaction
        const newTransaction = {
          id: generateId('ct'),
          customer_id: entityId,
          date: date,
          quantity: parseInt(quantity),
          payment_mode: paymentMode,
          bill_id: `AMR-${state.settings.last_bill_serial + 1}`,
          purchase_description: description,
          additional_notes: notes,
          amount: amountValue,
          created_by: state.currentUser?.id || 'system',
          created_at: new Date(),
          updated_at: new Date(),
          updated_by: state.currentUser?.id || 'system',
          history: []
        };
        
        // Add history entry
        addHistoryEntry(
          newTransaction, 
          'created', 
          state.currentUser?.id || 'system',
          state.currentUser?.name || 'System',
          'Transaction recorded',
          null,
          {
            amount: amountValue,
            payment_mode: paymentMode,
            quantity: parseInt(quantity)
          }
        );
        
        dispatch({ type: 'ADD_CUSTOMER_TRANSACTION', payload: newTransaction });
        
        toast({
          title: "Transaction Added",
          description: `Transaction for ${customer.name} has been recorded`
        });
      } else {
        const company = state.companies.find(c => c.id === entityId);
        if (!company) {
          toast({
            title: "Error",
            description: "Selected company not found",
            variant: "destructive"
          });
          dispatch({ type: 'SET_LOADING', payload: false });
          return;
        }
        
        // Create company transaction
        const newTransaction = {
          id: generateId('comt'),
          company_id: entityId,
          date: date,
          quantity: parseInt(quantity),
          payment_mode: paymentMode,
          bill_id: `AMR-${state.settings.last_bill_serial + 1}`,
          purchase_description: description,
          additional_notes: notes,
          amount: amountValue,
          created_by: state.currentUser?.id || 'system',
          created_at: new Date(),
          updated_at: new Date(),
          updated_by: state.currentUser?.id || 'system',
          history: []
        };
        
        // Add history entry
        addHistoryEntry(
          newTransaction, 
          'created', 
          state.currentUser?.id || 'system',
          state.currentUser?.name || 'System',
          'Company transaction recorded',
          null,
          {
            amount: amountValue,
            payment_mode: paymentMode,
            quantity: parseInt(quantity)
          }
        );
        
        dispatch({ type: 'ADD_COMPANY_TRANSACTION', payload: newTransaction });
        
        toast({
          title: "Transaction Added",
          description: `Transaction for ${company.name} has been recorded`
        });
      }
      
      // Reset form
      setEntityId('');
      setDate(new Date());
      setQuantity('');
      setPaymentMode('Cash');
      setDescription('');
      setNotes('');
      setAmount('');
      
      dispatch({ type: 'SET_LOADING', payload: false });
    }, 1000);
  };

  // Get recent transactions
  const recentCustomerTransactions = state.customerTransactions
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  
  const recentCompanyTransactions = state.companyTransactions
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Add New Transaction</CardTitle>
            <CardDescription>
              Record a new financial transaction
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="customer" onValueChange={setTransactionType} className="w-full">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="customer">Customer Transaction</TabsTrigger>
                <TabsTrigger value="company">Company Transaction</TabsTrigger>
              </TabsList>
              
              <TabsContent value="customer" className="mt-0">
                <form onSubmit={handleAddTransaction} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customer">Customer</Label>
                      <Select value={entityId} onValueChange={setEntityId}>
                        <SelectTrigger id="customer">
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                        <SelectContent>
                          {state.customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            id="date"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !date && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="Enter quantity"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="payment-mode">Payment Mode</Label>
                      <Select value={paymentMode} onValueChange={setPaymentMode}>
                        <SelectTrigger id="payment-mode">
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
                    
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount (PKR)</Label>
                      <Input
                        id="amount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter amount"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Purchase description"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any additional information"
                      rows={3}
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/90"
                    disabled={state.isLoading}
                  >
                    {state.isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>Recording...</span>
                      </div>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Record Transaction
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="company" className="mt-0">
                <form onSubmit={handleAddTransaction} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <Select value={entityId} onValueChange={setEntityId}>
                        <SelectTrigger id="company">
                          <SelectValue placeholder="Select company" />
                        </SelectTrigger>
                        <SelectContent>
                          {state.companies.map((company) => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            id="date"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !date && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="Enter quantity"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="payment-mode">Payment Mode</Label>
                      <Select value={paymentMode} onValueChange={setPaymentMode}>
                        <SelectTrigger id="payment-mode">
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
                    
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount (PKR)</Label>
                      <Input
                        id="amount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter amount"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Purchase description"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any additional information"
                      rows={3}
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/90"
                    disabled={state.isLoading}
                  >
                    {state.isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>Recording...</span>
                      </div>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Record Transaction
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>Current financial summary</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500">Total Customers</h3>
              <p className="text-2xl font-bold">{state.customers.length}</p>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500">Total Companies</h3>
              <p className="text-2xl font-bold">{state.companies.length}</p>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500">Total Transactions</h3>
              <p className="text-2xl font-bold">
                {state.customerTransactions.length + state.companyTransactions.length}
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500">Bills Generated</h3>
              <p className="text-2xl font-bold">{state.bills.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Customer Transactions</CardTitle>
            <CardDescription>Last 5 customer transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {recentCustomerTransactions.length > 0 ? (
              <div className="space-y-4">
                {recentCustomerTransactions.map((transaction) => {
                  const customer = state.customers.find(c => c.id === transaction.customer_id);
                  
                  return (
                    <div key={transaction.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{customer?.name || 'Unknown Customer'}</h3>
                          <p className="text-sm text-gray-500">{format(new Date(transaction.date), 'PP')}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">
                            {new Intl.NumberFormat('en-US', { 
                              style: 'currency', 
                              currency: 'PKR',
                              currencyDisplay: 'narrowSymbol'
                            }).format(transaction.amount)}
                          </p>
                          <p className="text-xs">{transaction.payment_mode}</p>
                        </div>
                      </div>
                      <p className="text-sm mt-2">{transaction.purchase_description}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No customer transactions yet</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Company Transactions</CardTitle>
            <CardDescription>Last 5 company transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {recentCompanyTransactions.length > 0 ? (
              <div className="space-y-4">
                {recentCompanyTransactions.map((transaction) => {
                  const company = state.companies.find(c => c.id === transaction.company_id);
                  
                  return (
                    <div key={transaction.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{company?.name || 'Unknown Company'}</h3>
                          <p className="text-sm text-gray-500">{format(new Date(transaction.date), 'PP')}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">
                            {new Intl.NumberFormat('en-US', { 
                              style: 'currency', 
                              currency: 'PKR',
                              currencyDisplay: 'narrowSymbol'
                            }).format(transaction.amount)}
                          </p>
                          <p className="text-xs">{transaction.payment_mode}</p>
                        </div>
                      </div>
                      <p className="text-sm mt-2">{transaction.purchase_description}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No company transactions yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Homepage;
