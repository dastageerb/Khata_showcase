
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Building } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

interface CompanyDetailPageProps {
  companyId: string;
  onNavigate: (path: string, params?: { [key: string]: string }) => void;
}

const CompanyDetailPage: React.FC<CompanyDetailPageProps> = ({ companyId, onNavigate }) => {
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
    <div className="h-screen flex flex-col">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => onNavigate('/companies')} className="p-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Company Details</h1>
        </div>
      </div>

      {/* Profile Section - Fixed at top */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
        <div className="flex items-center space-x-4">
          {/* Profile Circle */}
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
            <Building className="w-6 h-6 text-white" />
          </div>
          
          {/* Company Info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold truncate">{company.name}</h2>
            <div className="grid grid-cols-2 gap-2 mt-1 text-xs text-gray-600">
              <div className="truncate">
                <span className="font-medium">Contact:</span> {company.contact_number}
              </div>
              <div className="col-span-2 truncate">
                <span className="font-medium">Address:</span> {company.address || 'Not provided'}
              </div>
            </div>
          </div>

          {/* Balance Info */}
          <div className="text-right flex-shrink-0">
            <div className="text-xs text-gray-500 mb-1">Balance</div>
            <div className={`text-lg font-bold ${
              balance >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {new Intl.NumberFormat('en-US', { 
                style: 'currency', 
                currency: 'PKR',
                currencyDisplay: 'narrowSymbol'
              }).format(balance)}
            </div>
            <Button 
              onClick={() => setIsTransactionFormOpen(true)}
              size="sm"
              className="mt-1"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </div>

      {/* Transaction History - Scrollable */}
      <Card className="flex-1 flex flex-col">
        <CardHeader className="pb-4">
          <CardTitle>Transaction History ({companyTransactions.length})</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          {companyTransactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No transactions found</p>
            </div>
          ) : (
            <div className="overflow-auto h-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky top-0 bg-white min-w-24">Date</TableHead>
                    <TableHead className="sticky top-0 bg-white min-w-16">Type</TableHead>
                    <TableHead className="sticky top-0 bg-white min-w-32">Description</TableHead>
                    <TableHead className="sticky top-0 bg-white min-w-24">Payment</TableHead>
                    <TableHead className="sticky top-0 bg-white min-w-20">Qty</TableHead>
                    <TableHead className="sticky top-0 bg-white min-w-24">Amount</TableHead>
                    <TableHead className="sticky top-0 bg-white min-w-24">Bill ID</TableHead>
                    <TableHead className="sticky top-0 bg-white min-w-24">Created</TableHead>
                    <TableHead className="sticky top-0 bg-white min-w-32">Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companyTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(transaction.date), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.type === 'credit' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {transaction.type === 'credit' ? '+' : '-'}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-32">
                        <div className="truncate" title={transaction.purchase_description || 'No description'}>
                          {transaction.purchase_description || 'No description'}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{transaction.payment_mode}</TableCell>
                      <TableCell className="text-center">{transaction.quantity}</TableCell>
                      <TableCell className={`font-bold whitespace-nowrap ${
                        transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'credit' ? '+' : '-'}{new Intl.NumberFormat('en-US', { 
                          style: 'currency', 
                          currency: 'PKR',
                          currencyDisplay: 'narrowSymbol'
                        }).format(transaction.amount)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{transaction.bill_id}</TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(transaction.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="max-w-32">
                        <div className="truncate" title={transaction.additional_notes || 'No notes'}>
                          {transaction.additional_notes || 'No notes'}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
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
              <Label htmlFor="bill_id">Bill ID (Optional)</Label>
              <Input
                id="bill_id"
                value={formData.bill_id}
                onChange={(e) => setFormData({...formData, bill_id: e.target.value})}
                placeholder="Enter bill ID"
              />
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
