import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Plus, User, Trash2, Edit } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

interface CustomerDetailPageProps {
  customerId: string;
  onNavigate: (path: string, params?: { [key: string]: string }) => void;
}

const CustomerDetailPage: React.FC<CustomerDetailPageProps> = ({ customerId, onNavigate }) => {
  const { state, dispatch, generateId, addHistoryEntry, calculateCustomerBalance } = useApp();
  const { toast } = useToast();
  
  const customer = state.customers.find(c => c.id === customerId);
  const customerTransactions = state.customerTransactions.filter(t => t.customer_id === customerId);
  
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

  if (!customer) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-xl text-gray-500">Customer not found</p>
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
        id: generateId('ct'),
        customer_id: customer.id,
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

  const balance = calculateCustomerBalance(customer.id);

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6 md:mb-8">
          <Button 
            variant="ghost" 
            onClick={() => onNavigate('/customers')} 
            className="p-2 hover:bg-slate-200 rounded-full mr-2"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-700 ml-2">Customer Details</h1>
        </div>

        {/* Customer Profile Card */}
        <div className="bg-white shadow-lg rounded-xl p-6 mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center">
            <div className="flex items-center mb-4 md:mb-0 md:mr-8">
              <div className="bg-primary p-3 rounded-full text-white mr-4">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-primary">{customer.name}</h2>
                <p className="text-sm text-gray-500">Phone: {customer.phone}</p>
                <p className="text-sm text-gray-500">NIC: {customer.nic_number || 'Not provided'}</p>
                <p className="text-sm text-gray-500">Address: {customer.address || 'Not provided'}</p>
              </div>
            </div>
            
            <div className="flex-grow text-center mb-4 md:mb-0">
              <p className="text-sm text-gray-500 mb-1">Balance</p>
              <p className={`text-3xl font-bold ${
                balance >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {balance >= 0 ? '' : '-'}Rs {Math.abs(balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost"
                className="p-2 hover:bg-gray-200 rounded-full text-gray-600"
                title="Delete"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost"
                className="p-2 hover:bg-gray-200 rounded-full text-gray-600"
                title="Edit"
              >
                <Edit className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost"
                onClick={() => setIsTransactionFormOpen(true)}
                className="p-2 hover:bg-gray-200 rounded-full text-gray-600"
                title="Add Transaction"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white shadow-lg rounded-xl p-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 md:mb-0">
              Transaction History ({customerTransactions.length})
            </h2>
            <Button 
              variant="outline"
              className="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Record
            </Button>
          </div>
          
          {customerTransactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No transactions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="px-6 py-3 text-slate-600 font-medium">Date</TableHead>
                    <TableHead className="px-6 py-3 text-slate-600 font-medium">Type</TableHead>
                    <TableHead className="px-6 py-3 text-slate-600 font-medium">Description</TableHead>
                    <TableHead className="px-6 py-3 text-slate-600 font-medium">Payment</TableHead>
                    <TableHead className="px-6 py-3 text-slate-600 font-medium">Qty</TableHead>
                    <TableHead className="px-6 py-3 text-slate-600 font-medium">Amount</TableHead>
                    <TableHead className="px-6 py-3 text-slate-600 font-medium">Bill ID</TableHead>
                    <TableHead className="px-6 py-3 text-slate-600 font-medium">Created</TableHead>
                    <TableHead className="px-6 py-3 text-slate-600 font-medium">Notes</TableHead>
                    <TableHead className="px-6 py-3 text-slate-600 font-medium text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerTransactions.map((transaction) => (
                    <TableRow key={transaction.id} className="hover:bg-slate-50 border-b">
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        {format(new Date(transaction.date), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.type === 'credit' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {transaction.type === 'credit' ? '+' : '-'}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-4 font-medium text-gray-900 max-w-32">
                        <div className="truncate" title={transaction.purchase_description || 'No description'}>
                          {transaction.purchase_description || 'No description'}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">{transaction.payment_mode}</TableCell>
                      <TableCell className="px-6 py-4">{transaction.quantity}</TableCell>
                      <TableCell className={`px-6 py-4 font-medium ${
                        transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'credit' ? '+' : '-'}Rs {transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="px-6 py-4">{transaction.bill_id}</TableCell>
                      <TableCell className="px-6 py-4 text-sm text-gray-500">
                        {format(new Date(transaction.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="px-6 py-4 max-w-32">
                        <div className="truncate" title={transaction.additional_notes || 'No notes'}>
                          {transaction.additional_notes || 'No notes'}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-center">
                        <Button
                          variant="ghost"
                          className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                          title="Edit Transaction"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Form Dialog */}
      <Dialog open={isTransactionFormOpen} onOpenChange={setIsTransactionFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Transaction for {customer.name}</DialogTitle>
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

export default CustomerDetailPage;
