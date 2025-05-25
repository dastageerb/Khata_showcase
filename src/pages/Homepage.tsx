
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Plus, TrendingUp, TrendingDown, Users, Building } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const Homepage: React.FC = () => {
  const { state, dispatch, generateId, addHistoryEntry, calculateCustomerBalance, calculateCompanyBalance } = useApp();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [isCustomerTransaction, setIsCustomerTransaction] = useState(true);
  const [isCreditTransaction, setIsCreditTransaction] = useState(true);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    entity_id: '',
    quantity: 1,
    payment_mode: '',
    bill_id: '',
    purchase_description: '',
    additional_notes: '',
    amount: 0
  });

  const entities = isCustomerTransaction ? state.customers : state.companies;
  const allTransactions = [...state.customerTransactions, ...state.companyTransactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  const handleSubmitTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.payment_mode || !formData.entity_id) {
      toast({
        title: "Missing Information",
        description: "Amount, payment mode, and entity selection are required",
        variant: "destructive"
      });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });

    setTimeout(() => {
      const transactionType = isCreditTransaction ? 'credit' : 'debit';
      
      if (isCustomerTransaction) {
        const newTransaction = {
          id: generateId('ct'),
          customer_id: formData.entity_id,
          date: new Date(formData.date),
          quantity: formData.quantity,
          payment_mode: formData.payment_mode,
          bill_id: formData.bill_id || generateId('bill'),
          purchase_description: formData.purchase_description,
          additional_notes: formData.additional_notes,
          amount: formData.amount,
          type: transactionType,
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
          `Transaction recorded - ${transactionType} of ${formData.amount}`
        );

        dispatch({ type: 'ADD_CUSTOMER_TRANSACTION', payload: newTransaction });
      } else {
        const newTransaction = {
          id: generateId('comt'),
          company_id: formData.entity_id,
          date: new Date(formData.date),
          quantity: formData.quantity,
          payment_mode: formData.payment_mode,
          bill_id: formData.bill_id || generateId('bill'),
          purchase_description: formData.purchase_description,
          additional_notes: formData.additional_notes,
          amount: formData.amount,
          type: transactionType,
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
          `Transaction recorded - ${transactionType} of ${formData.amount}`
        );

        dispatch({ type: 'ADD_COMPANY_TRANSACTION', payload: newTransaction });
      }

      toast({
        title: "Transaction Added",
        description: `${transactionType === 'credit' ? 'Credit' : 'Debit'} transaction of ${formData.amount} has been recorded`
      });

      setIsAddTransactionOpen(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        entity_id: '',
        quantity: 1,
        payment_mode: '',
        bill_id: '',
        purchase_description: '',
        additional_notes: '',
        amount: 0
      });
      dispatch({ type: 'SET_LOADING', payload: false });
    }, 1000);
  };

  const getEntityName = (transaction: any): string => {
    if ('customer_id' in transaction) {
      const customer = state.customers.find(c => c.id === transaction.customer_id);
      return customer?.name || 'Unknown Customer';
    } else if ('company_id' in transaction) {
      const company = state.companies.find(c => c.id === transaction.company_id);
      return company?.name || 'Unknown Company';
    }
    return 'Unknown Entity';
  };

  const getEntityType = (transaction: any): string => {
    if ('customer_id' in transaction) {
      return 'Customer';
    } else if ('company_id' in transaction) {
      return 'Company';
    }
    return 'Unknown';
  };

  const totalCustomerBalance = state.customers.reduce((total, customer) => 
    total + calculateCustomerBalance(customer.id), 0
  );

  const totalCompanyBalance = state.companies.reduce((total, company) => 
    total + calculateCompanyBalance(company.id), 0
  );

  const totalBalance = totalCustomerBalance + totalCompanyBalance;

  if (!isAddTransactionOpen) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-500">Welcome to your financial management dashboard</p>
          </div>
          <Button onClick={() => setIsAddTransactionOpen(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add New Transaction
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat('en-US', { 
                  style: 'currency', 
                  currency: 'PKR',
                  currencyDisplay: 'narrowSymbol'
                }).format(totalBalance)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customer Balance</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat('en-US', { 
                  style: 'currency', 
                  currency: 'PKR',
                  currencyDisplay: 'narrowSymbol'
                }).format(totalCustomerBalance)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Company Balance</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat('en-US', { 
                  style: 'currency', 
                  currency: 'PKR',
                  currencyDisplay: 'narrowSymbol'
                }).format(totalCompanyBalance)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {state.customerTransactions.length + state.companyTransactions.length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {allTransactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No transactions found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Payment Mode</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allTransactions.map((transaction) => {
                      const entityName = getEntityName(transaction);
                      const entityType = getEntityType(transaction);
                      
                      return (
                        <TableRow key={transaction.id} className="hover:bg-muted/50">
                          <TableCell className="whitespace-nowrap">
                            {format(new Date(transaction.date), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{entityName}</span>
                              <span className={`text-xs px-2 py-1 rounded w-fit ${
                                entityType === 'Customer' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                              }`}>
                                {entityType}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              transaction.type === 'credit' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {transaction.type === 'credit' ? '+' : '-'} {transaction.type.toUpperCase()}
                            </span>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="truncate">
                              {transaction.purchase_description || 'No description'}
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">{transaction.payment_mode}</TableCell>
                          <TableCell className={`font-bold whitespace-nowrap ${
                            transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'credit' ? '+' : '-'}{new Intl.NumberFormat('en-US', { 
                              style: 'currency', 
                              currency: 'PKR',
                              currencyDisplay: 'narrowSymbol'
                            }).format(transaction.amount)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-sm text-gray-500">
                            {format(new Date(transaction.created_at), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-sm text-gray-500">
                            {format(new Date(transaction.updated_at), 'MMM d, yyyy')}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Add New Transaction</h1>
        <Button variant="outline" onClick={() => setIsAddTransactionOpen(false)}>
          Cancel
        </Button>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Transaction Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitTransaction} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium">Customer Transaction</span>
                  <Switch
                    checked={!isCustomerTransaction}
                    onCheckedChange={(checked) => {
                      setIsCustomerTransaction(!checked);
                      setFormData({...formData, entity_id: ''});
                    }}
                  />
                  <span className="text-sm font-medium">Company Transaction</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <span className={`text-sm font-medium ${isCreditTransaction ? 'text-green-600' : ''}`}>
                    Credit (+)
                  </span>
                  <Switch
                    checked={!isCreditTransaction}
                    onCheckedChange={(checked) => setIsCreditTransaction(!checked)}
                    className="data-[state=checked]:bg-red-500"
                  />
                  <span className={`text-sm font-medium ${!isCreditTransaction ? 'text-red-600' : ''}`}>
                    Debit (-)
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="entity">{isCustomerTransaction ? 'Customer' : 'Company'}</Label>
                <Select value={formData.entity_id} onValueChange={(value) => setFormData({...formData, entity_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${isCustomerTransaction ? 'customer' : 'company'}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {entities.map((entity) => (
                      <SelectItem key={entity.id} value={entity.id}>
                        {entity.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddTransactionOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={state.isLoading}>
                {state.isLoading ? 'Adding...' : 'Add Transaction'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Homepage;
