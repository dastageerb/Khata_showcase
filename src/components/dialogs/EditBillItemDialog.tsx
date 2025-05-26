
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BillItem } from '@/context/AppContext';

interface EditBillItemDialogProps {
  billItem: BillItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedItem: BillItem) => void;
}

const EditBillItemDialog: React.FC<EditBillItemDialogProps> = ({
  billItem,
  isOpen,
  onClose,
  onUpdate
}) => {
  const [formData, setFormData] = useState({
    product_name: billItem?.product_name || '',
    quantity: billItem?.quantity || 1,
    price: billItem?.price || 0
  });

  React.useEffect(() => {
    if (billItem) {
      setFormData({
        product_name: billItem.product_name,
        quantity: billItem.quantity,
        price: billItem.price
      });
    }
  }, [billItem]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!billItem) return;

    const updatedItem: BillItem = {
      ...billItem,
      product_name: formData.product_name,
      quantity: formData.quantity,
      price: formData.price,
      amount: formData.quantity * formData.price,
      updated_at: new Date()
    };

    onUpdate(updatedItem);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Bill Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="product_name">Product Name</Label>
            <Input
              id="product_name"
              value={formData.product_name}
              onChange={(e) => setFormData({...formData, product_name: e.target.value})}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 1})}
                required
              />
            </div>
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                required
              />
            </div>
          </div>

          <div>
            <Label>Total Amount</Label>
            <Input
              value={`Rs ${(formData.quantity * formData.price).toFixed(2)}`}
              disabled
              className="bg-gray-100"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Update Item
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditBillItemDialog;
