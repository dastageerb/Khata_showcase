import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ArrowLeft, Plus, User, Trash2, Edit } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import EditCustomerDialog from '@/components/dialogs/EditCustomerDialog';
import EditTransactionDialog from '@/components/dialogs/EditTransactionDialog';

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
  const [isEditCustomerDialogOpen, setIsEditCustomerDialogOpen] = useState(false);
  const [isEditTransactionDialogOpen, setIsEditTransactionDialogOpen] = useState(false);
  const [editTransaction, setEditTransaction] = useState(null);
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
        <p className="text-lg text-gray-500">Customer not found</p>
      </div>
    );
  }

  const handleUpdateCustomer = (updatedCustomer) => {
    dispatch({ type: 'UPDATE_CUSTOMER', payload: updatedCustomer });
    toast({
      title: "Customer Updated",
      description: "Customer information has been updated successfully",
    });
  };

  const handleUpdateTransaction = (updatedTransaction) => {
    dispatch({ type: 'UPDATE_CUSTOMER_TRANSACTION', payload: updatedTransaction });
    toast({
      title: "Transaction Updated",
      description: "Transaction has been updated successfully",
    });
  };

  const handleEditTransaction = (transaction) => {
    setEditTransaction(transaction);
    setIsEditTransactionDialogOpen(true);
  };

  const handleDeleteCustomer = () => {
    dispatch({ type: 'DELETE_CUSTOMER', payload: customerId });
    toast({
      title: "Customer Deleted",
      description: `${customer.name} has been deleted successfully`,
    });
    onNavigate('/customers');
  };

  const handleClearRecord = () => {
    customerTransactions.forEach(transaction => {
      dispatch({ type: 'DELETE_CUSTOMER_TRANSACTION', payload: transaction.id });
    });
    toast({
      title: "Records Cleared",
      description: "All transaction records have been cleared",
    });
  };

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
        id: generateId('cust'),
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
    <div className="w-full min-h-screen overflow-x-auto bg-gray-50">
      <div className="min-w-[320px] p-2 sm:p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center mb-4">
          <Button 
            variant="ghost" 
            onClick={() => onNavigate('/customers')} 
            className="p-2 hover:bg-slate-200 rounded-full mr-2"
          >
            <ArrowLeft className="h-4 w-4 text-gray-600" />
          </Button>
          <h1 className="text-lg font-bold text-gray-700 ml-2">Customer Details</h1>
        </div>

        {/* Customer Profile Card */}
        <div className="bg-white shadow-lg rounded-xl p-4 mb-4 w-full overflow-x-auto">
          <div className="min-w-[600px] flex items-center justify-between">
            <div className="flex items-center min-w-[300px]">
              <div className="bg-primary p-2 rounded-full text-white mr-3 flex-shrink-0">
                <User className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-primary truncate">{customer.name}</h2>
                <p className="text-xs text-gray-500 truncate">Phone: {customer.phone}</p>
                <p className="text-xs text-gray-500 truncate">Address: {customer.address || 'Not provided'}</p>
                <p className="text-xs text-gray-500 truncate">NIC: {customer.nic_number || 'Not provided'}</p>
              </div>
            </div>
            
            <div className="text-center min-w-[120px] flex-shrink-0">
              <p className="text-xs text-gray-500 mb-1">Balance</p>
              <p className={`text-xl font-bold ${
                balance >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {balance >= 0 ? '' : '-'}Rs {Math.abs(balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
            
            <div className="flex items-center space-x-2 min-w-[120px] justify-end flex-shrink-0">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="ghost"
                    className="p-2 hover:bg-gray-200 rounded-full text-gray-600"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-sm">Delete Customer</AlertDialogTitle>
                    <AlertDialogDescription className="text-xs">
                      Are you sure you want to delete {customer.name}? This action cannot be undone and will remove all associated transactions.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteCustomer} className="bg-red-600 hover:bg-red-700 text-xs">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              
              <Button 
                variant="ghost"
                className="p-2 hover:bg-gray-200 rounded-full text-gray-600"
                title="Edit"
                onClick={() => setIsEditCustomerDialogOpen(true)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost"
                onClick={() => setIsTransactionFormOpen(true)}
                className="p-2 hover:bg-gray-200 rounded-full text-gray-600"
                title="Add Transaction"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white shadow-lg rounded-xl p-4 w-full overflow-x-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-2 md:mb-0">
              Transaction History ({customerTransactions.length})
            </h2>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline"
                  className="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs h-8 whitespace-nowrap"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Clear Record
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-sm">Clear All Records</AlertDialogTitle>
                  <AlertDialogDescription className="text-xs">
                    Are you sure you want to clear all transaction records for {customer.name}? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearRecord} className="bg-red-600 hover:bg-red-700 text-xs">
                    Clear All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          
          {customerTransactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-xs">No transactions found</p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <div className="min-w-[1400px]">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="px-4 py-2 text-slate-600 font-medium min-w-[100px] text-xs sticky left-0 bg-slate-50 z-10 border-r">Date</TableHead>
                      <TableHead className="px-4 py-2 text-slate-600 font-medium min-w-[80px] text-xs">Type</TableHead>
                      <TableHead className="px-4 py-2 text-slate-600 font-medium min-w-[150px] text-xs">Description</TableHead>
                      <TableHead className="px-4 py-2 text-slate-600 font-medium min-w-[120px] text-xs">Payment</TableHead>
                      <TableHead className="px-4 py-2 text-slate-600 font-medium min-w-[80px] text-xs">Qty</TableHead>
                      <TableHead className="px-4 py-2 text-slate-600 font-medium min-w-[120px] text-xs">Amount</TableHead>
                      <TableHead className="px-4 py-2 text-slate-600 font-medium min-w-[120px] text-xs">Bill ID</TableHead>
                      <TableHead className="px-4 py-2 text-slate-600 font-medium min-w-[100px] text-xs">Created</TableHead>
                      <TableHead className="px-4 py-2 text-slate-600 font-medium min-w-[150px] text-xs">Notes</TableHead>
                      <TableHead className="px-4 py-2 text-slate-600 font-medium text-center min-w-[100px] text-xs sticky right-0 bg-slate-50 z-10 border-l">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerTransactions.map((transaction) => (
                      <TableRow key={transaction.id} className="hover:bg-slate-50 border-b">
                        <TableCell className="px-4 py-3 whitespace-nowrap text-xs sticky left-0 bg-white z-10 border-r">
                          {format(new Date(transaction.date), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-xs">
                          <span className={`inline-flex items-center px-1 py-0.5 rounded-full text-xs font-medium ${
                            transaction.type === 'credit' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {transaction.type === 'credit' ? '+' : '-'}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3 font-medium text-gray-900 text-xs">
                          <div className="max-w-[130px] truncate" title={transaction.purchase_description || 'No description'}>
                            {transaction.purchase_description || 'No description'}
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-xs whitespace-nowrap">{transaction.payment_mode}</TableCell>
                        <TableCell className="px-4 py-3 text-xs">{transaction.quantity}</TableCell>
                        <TableCell className={`px-4 py-3 font-medium text-xs whitespace-nowrap ${
                          transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'credit' ? '+' : '-'}Rs {transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-xs whitespace-nowrap">{transaction.bill_id}</TableCell>
                        <TableCell className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                          {format(new Date(transaction.created_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-xs">
                          <div className="max-w-[130px] truncate" title={transaction.additional_notes || 'No notes'}>
                            {transaction.additional_notes || 'No notes'}
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-center sticky right-0 bg-white z-10 border-l">
                          <Button
                            variant="ghost"
                            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                            title="Edit Transaction"
                            onClick={() => handleEditTransaction(transaction)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Form Dialog */}
      <Dialog open={isTransactionFormOpen} onOpenChange={setIsTransactionFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">Add Transaction for {customer.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitTransaction} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="type" className="text-xs">Transaction Type</Label>
                <Select value={formData.type} onValueChange={(value: 'credit' | 'debit') => setFormData({...formData, type: value})}>
                  <SelectTrigger className="text-xs h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit" className="text-xs">Credit (+)</SelectItem>
                    <SelectItem value="debit" className="text-xs">Debit (-)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="amount" className="text-xs">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
                  required
                  className="text-xs h-8"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="date" className="text-xs">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
                className="text-xs h-8"
              />
            </div>

            <div>
              <Label htmlFor="payment_mode" className="text-xs">Payment Mode</Label>
              <Select value={formData.payment_mode} onValueChange={(value) => setFormData({...formData, payment_mode: value})}>
                <SelectTrigger className="text-xs h-8">
                  <SelectValue placeholder="Select payment mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash" className="text-xs">Cash</SelectItem>
                  <SelectItem value="Bank Transfer" className="text-xs">Bank Transfer</SelectItem>
                  <SelectItem value="Online" className="text-xs">Online</SelectItem>
                  <SelectItem value="Check" className="text-xs">Check</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="bill_id" className="text-xs">Bill ID (Optional)</Label>
              <Input
                id="bill_id"
                value={formData.bill_id}
                onChange={(e) => setFormData({...formData, bill_id: e.target.value})}
                placeholder="Enter bill ID"
                className="text-xs h-8"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-xs">Purchase Description (Optional)</Label>
              <Input
                id="description"
                value={formData.purchase_description}
                onChange={(e) => setFormData({...formData, purchase_description: e.target.value})}
                placeholder="Enter description"
                className="text-xs h-8"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-3">
              <Button type="button" variant="outline" onClick={() => setIsTransactionFormOpen(false)} className="text-xs h-8">
                Cancel
              </Button>
              <Button type="submit" disabled={state.isLoading} className="text-xs h-8">
                {state.isLoading ? 'Adding...' : 'Add Transaction'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Customer Dialog */}
      <EditCustomerDialog
        customer={customer}
        isOpen={isEditCustomerDialogOpen}
        onClose={() => setIsEditCustomerDialogOpen(false)}
        onUpdate={handleUpdateCustomer}
      />

      {/* Edit Transaction Dialog */}
      <EditTransactionDialog
        transaction={editTransaction}
        isOpen={isEditTransactionDialogOpen}
        onClose={() => {
          setIsEditTransactionDialogOpen(false);
          setEditTransaction(null);
        }}
        onUpdate={handleUpdateTransaction}
      />
    </div>
  );
};

export default CustomerDetailPage;
