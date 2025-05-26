
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Transaction } from '@/context/AppContext';

interface EditTransactionDialogProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedTransaction: Transaction) => void;
}

const EditTransactionDialog: React.FC<EditTransactionDialogProps> = ({
  transaction,
  isOpen,
  onClose,
  onUpdate
}) => {
  const [formData, setFormData] = useState({
    date: transaction?.date ? new Date(transaction.date).toISOString().split('T')[0] : '',
    quantity: transaction?.quantity || 1,
    payment_mode: transaction?.payment_mode || '',
    bill_id: transaction?.bill_id || '',
    purchase_description: transaction?.purchase_description || '',
    additional_notes: transaction?.additional_notes || '',
    amount: transaction?.amount || 0,
    type: transaction?.type || 'credit' as 'credit' | 'debit'
  });

  React.useEffect(() => {
    if (transaction) {
      setFormData({
        date: new Date(transaction.date).toISOString().split('T')[0],
        quantity: transaction.quantity,
        payment_mode: transaction.payment_mode,
        bill_id: transaction.bill_id,
        purchase_description: transaction.purchase_description || '',
        additional_notes: transaction.additional_notes || '',
        amount: transaction.amount,
        type: transaction.type
      });
    }
  }, [transaction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transaction) return;

    const updatedTransaction: Transaction = {
      ...transaction,
      date: new Date(formData.date),
      quantity: formData.quantity,
      payment_mode: formData.payment_mode,
      bill_id: formData.bill_id,
      purchase_description: formData.purchase_description,
      additional_notes: formData.additional_notes,
      amount: formData.amount,
      type: formData.type,
      updated_at: new Date()
    };

    onUpdate(updatedTransaction);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Label htmlFor="bill_id">Bill ID</Label>
            <Input
              id="bill_id"
              value={formData.bill_id}
              onChange={(e) => setFormData({...formData, bill_id: e.target.value})}
              placeholder="Enter bill ID"
            />
          </div>

          <div>
            <Label htmlFor="description">Purchase Description</Label>
            <Input
              id="description"
              value={formData.purchase_description}
              onChange={(e) => setFormData({...formData, purchase_description: e.target.value})}
              placeholder="Enter description"
            />
          </div>

          <div>
            <Label htmlFor="additional_notes">Additional Notes</Label>
            <Input
              id="additional_notes"
              value={formData.additional_notes}
              onChange={(e) => setFormData({...formData, additional_notes: e.target.value})}
              placeholder="Enter notes"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Update Transaction
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTransactionDialog;
