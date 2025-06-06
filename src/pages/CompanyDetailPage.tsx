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
import { ArrowLeft, Plus, Building, Trash2, Edit } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import EditCompanyDialog from '@/components/dialogs/EditCompanyDialog';
import EditTransactionDialog from '@/components/dialogs/EditTransactionDialog';

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
  const [isEditCompanyDialogOpen, setIsEditCompanyDialogOpen] = useState(false);
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

  if (!company) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-xl text-gray-500">Company not found</p>
      </div>
    );
  }

  const handleUpdateCompany = (updatedCompany) => {
    dispatch({ type: 'UPDATE_COMPANY', payload: updatedCompany });
    toast({
      title: "Company Updated",
      description: "Company information has been updated successfully",
    });
  };

  const handleUpdateTransaction = (updatedTransaction) => {
    dispatch({ type: 'UPDATE_COMPANY_TRANSACTION', payload: updatedTransaction });
    toast({
      title: "Transaction Updated",
      description: "Transaction has been updated successfully",
    });
  };

  const handleEditTransaction = (transaction) => {
    setEditTransaction(transaction);
    setIsEditTransactionDialogOpen(true);
  };

  const handleDeleteCompany = () => {
    dispatch({ type: 'DELETE_COMPANY', payload: companyId });
    toast({
      title: "Company Deleted",
      description: `${company.name} has been deleted successfully`,
    });
    onNavigate('/companies');
  };

  const handleClearRecord = () => {
    companyTransactions.forEach(transaction => {
      dispatch({ type: 'DELETE_COMPANY_TRANSACTION', payload: transaction.id });
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
    <div className="w-full min-h-screen overflow-x-auto bg-gray-50">
      <div className="min-w-[320px] p-2 sm:p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center mb-4">
          <Button 
            variant="ghost" 
            onClick={() => onNavigate('/companies')} 
            className="p-2 hover:bg-slate-200 rounded-full mr-2"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Button>
          <h1 className="text-xl font-bold text-gray-700 ml-2">Company Details</h1>
        </div>

        {/* Company Profile Card */}
        <div className="bg-white shadow-lg rounded-xl p-4 mb-4 w-full overflow-x-auto">
          <div className="min-w-[600px] flex items-center justify-between">
            <div className="flex items-center min-w-[300px]">
              <div className="bg-primary p-3 rounded-full text-white mr-4 flex-shrink-0">
                <Building className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-semibold text-primary truncate">{company.name}</h2>
                <p className="text-sm text-gray-500 truncate">Contact: {company.contact_number}</p>
                <p className="text-sm text-gray-500 truncate">Address: {company.address || 'Not provided'}</p>
              </div>
            </div>
            
            <div className="text-center min-w-[150px] flex-shrink-0">
              <p className="text-sm text-gray-500 mb-1">Balance</p>
              <p className={`text-2xl font-bold ${
                balance >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {balance >= 0 ? '' : '-'}Rs {Math.abs(balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
            
            <div className="flex items-center space-x-2 min-w-[150px] justify-end flex-shrink-0">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="ghost"
                    className="p-2 hover:bg-gray-200 rounded-full text-gray-600"
                    title="Delete"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Company</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete {company.name}? This action cannot be undone and will remove all associated transactions.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteCompany} className="bg-red-600 hover:bg-red-700">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              
              <Button 
                variant="ghost"
                className="p-2 hover:bg-gray-200 rounded-full text-gray-600"
                title="Edit"
                onClick={() => setIsEditCompanyDialogOpen(true)}
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
        <div className="bg-white shadow-lg rounded-xl p-4 w-full overflow-x-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 md:mb-0">
              Transaction History ({companyTransactions.length})
            </h2>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline"
                  className="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-700 whitespace-nowrap"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Record
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear All Records</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to clear all transaction records for {company.name}? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearRecord} className="bg-red-600 hover:bg-red-700">
                    Clear All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          
          {companyTransactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No transactions found</p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <div className="min-w-[1400px]">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="px-6 py-3 text-slate-600 font-medium min-w-[120px] sticky left-0 bg-slate-50 z-10 border-r">Date</TableHead>
                      <TableHead className="px-6 py-3 text-slate-600 font-medium min-w-[80px]">Type</TableHead>
                      <TableHead className="px-6 py-3 text-slate-600 font-medium min-w-[150px]">Description</TableHead>
                      <TableHead className="px-6 py-3 text-slate-600 font-medium min-w-[120px]">Payment</TableHead>
                      <TableHead className="px-6 py-3 text-slate-600 font-medium min-w-[80px]">Qty</TableHead>
                      <TableHead className="px-6 py-3 text-slate-600 font-medium min-w-[120px]">Amount</TableHead>
                      <TableHead className="px-6 py-3 text-slate-600 font-medium min-w-[120px]">Bill ID</TableHead>
                      <TableHead className="px-6 py-3 text-slate-600 font-medium min-w-[120px]">Created</TableHead>
                      <TableHead className="px-6 py-3 text-slate-600 font-medium min-w-[150px]">Notes</TableHead>
                      <TableHead className="px-6 py-3 text-slate-600 font-medium text-center min-w-[100px] sticky right-0 bg-slate-50 z-10 border-l">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companyTransactions.map((transaction) => (
                      <TableRow key={transaction.id} className="hover:bg-slate-50 border-b">
                        <TableCell className="px-6 py-4 whitespace-nowrap sticky left-0 bg-white z-10 border-r">
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
                        <TableCell className="px-6 py-4 font-medium text-gray-900">
                          <div className="max-w-[130px] truncate" title={transaction.purchase_description || 'No description'}>
                            {transaction.purchase_description || 'No description'}
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap">{transaction.payment_mode}</TableCell>
                        <TableCell className="px-6 py-4">{transaction.quantity}</TableCell>
                        <TableCell className={`px-6 py-4 font-medium whitespace-nowrap ${
                          transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'credit' ? '+' : '-'}Rs {transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap">{transaction.bill_id}</TableCell>
                        <TableCell className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                          {format(new Date(transaction.created_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="max-w-[130px] truncate" title={transaction.additional_notes || 'No notes'}>
                            {transaction.additional_notes || 'No notes'}
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-center sticky right-0 bg-white z-10 border-l">
                          <Button
                            variant="ghost"
                            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                            title="Edit Transaction"
                            onClick={() => handleEditTransaction(transaction)}
                          >
                            <Edit className="h-4 w-4" />
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

      {/* Edit Company Dialog */}
      <EditCompanyDialog
        company={company}
        isOpen={isEditCompanyDialogOpen}
        onClose={() => setIsEditCompanyDialogOpen(false)}
        onUpdate={handleUpdateCompany}
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

export default CompanyDetailPage;
