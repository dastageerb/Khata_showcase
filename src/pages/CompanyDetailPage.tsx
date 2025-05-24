
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Plus } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

const CompanyDetailPage: React.FC = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const { state, dispatch, generateId, addHistoryEntry, calculateCompanyBalance } = useApp();
  const { toast } = useToast();
  
  const company = state.companies.find(c => c.id === companyId);
  const companyTransactions = state.companyTransactions.filter(t => t.company_id === companyId);
  
  const [isTransactionFormOpen, setIsTransactionFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    quantity: 1,
    payment_mode: '',
    bill_id: '',
    purchase_description: '',
    additional_notes: '',
    amount: 0,
    type: 'credit' as 'credit' | 'debit'
  });

  if (!company) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-xl text-gray-500">Company not found</p>
      </div>
    );
  }

  const handleSubmitTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.payment_mode) {
      toast({
        title: "Missing Information",
        description: "Amount and payment mode are required",
        variant: "destructive"
      });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });

    setTimeout(() => {
      const newTransaction = {
        id: generateId('comt'),
        company_id: company.id,
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

      toast({
        title: "Transaction Added",
        description: `${formData.type === 'credit' ? 'Credit' : 'Debit'} transaction of ${formData.amount} has been recorded`
      });

      setIsTransactionFormOpen(false);
      setFormData({
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

  const balance = calculateCompanyBalance(company.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate('/companies')} className="p-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{company.name}</h1>
          <p className="text-gray-500">Company Details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Name</h3>
              <p className="font-semibold">{company.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Contact Number</h3>
              <p>{company.contact_number}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Address</h3>
              <p>{company.address || 'Not provided'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Balance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {new Intl.NumberFormat('en-US', { 
                  style: 'currency', 
                  currency: 'PKR',
                  currencyDisplay: 'narrowSymbol'
                }).format(balance)}
              </div>
              <p className="text-gray-500 mb-4">Current Balance</p>
              <Button 
                onClick={() => setIsTransactionFormOpen(true)}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {companyTransactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No transactions found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Payment Mode</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Bill ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companyTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {format(new Date(transaction.date), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        transaction.type === 'credit' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {transaction.type === 'credit' ? '+' : '-'} {transaction.type.toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell>{transaction.purchase_description || 'No description'}</TableCell>
                    <TableCell>{transaction.payment_mode}</TableCell>
                    <TableCell className={`font-bold ${
                      transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'credit' ? '+' : '-'}{new Intl.NumberFormat('en-US', { 
                        style: 'currency', 
                        currency: 'PKR',
                        currencyDisplay: 'narrowSymbol'
                      }).format(transaction.amount)}
                    </TableCell>
                    <TableCell>{transaction.bill_id}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Transaction Form Dialog */}
      <Dialog open={isTransactionFormOpen} onOpenChange={setIsTransactionFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Transaction for {company.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitTransaction} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Transaction Type</Label>
                <Select value={formData.type} onValueChange={(value: 'credit' | 'debit') => setFormData({...formData, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit">Credit (+)</SelectItem>
                    <SelectItem value="debit">Debit (-)</SelectItem>
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
              <Button type="button" variant="outline" onClick={() => setIsTransactionFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={state.isLoading}>
                {state.isLoading ? 'Adding...' : 'Add Transaction'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompanyDetailPage;
