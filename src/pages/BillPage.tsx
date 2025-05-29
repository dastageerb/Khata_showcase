
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Minus, Printer, Download, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Bill, BillItem, Product } from '@/context/AppContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface BillItemForm {
  product_name: string;
  quantity: number;
  price: number;
  amount: number;
}

const BillPage: React.FC = () => {
  const { state, dispatch, generateId, addHistoryEntry } = useApp();
  const { toast } = useToast();
  
  const [customerName, setCustomerName] = useState('');
  const [billItems, setBillItems] = useState<BillItemForm[]>([
    { product_name: '', quantity: 1, price: 0, amount: 0 }
  ]);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [generatedBill, setGeneratedBill] = useState<Bill | null>(null);
  const [generatedBillItems, setGeneratedBillItems] = useState<BillItem[]>([]);

  const addBillItem = () => {
    setBillItems([...billItems, { product_name: '', quantity: 1, price: 0, amount: 0 }]);
  };

  const removeBillItem = (index: number) => {
    if (billItems.length > 1) {
      setBillItems(billItems.filter((_, i) => i !== index));
    }
  };

  const updateBillItem = (index: number, field: keyof BillItemForm, value: string | number) => {
    const updatedItems = [...billItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Calculate amount when quantity or price changes
    if (field === 'quantity' || field === 'price') {
      updatedItems[index].amount = updatedItems[index].quantity * updatedItems[index].price;
    }
    
    setBillItems(updatedItems);
  };

  const getProductSuggestions = (input: string): Product[] => {
    if (!input) return [];
    return state.products.filter(product => 
      product.name.toLowerCase().includes(input.toLowerCase())
    ).slice(0, 5);
  };

  const selectProduct = (index: number, product: Product) => {
    updateBillItem(index, 'product_name', product.name);
    updateBillItem(index, 'price', product.last_price);
    updateBillItem(index, 'amount', billItems[index].quantity * product.last_price);
  };

  const calculateTotal = () => {
    return billItems.reduce((sum, item) => sum + item.amount, 0);
  };

  const generateBill = () => {
    if (!customerName.trim()) {
      toast({
        title: "Error",
        description: "Please enter customer name",
        variant: "destructive"
      });
      return;
    }

    if (billItems.some(item => !item.product_name.trim() || item.quantity <= 0 || item.price <= 0)) {
      toast({
        title: "Error", 
        description: "Please fill all bill items with valid data",
        variant: "destructive"
      });
      return;
    }

    const billId = generateId('bill');
    const serialNo = `AMR-${state.settings.last_bill_serial + 1}`;
    const currentUser = state.currentUser;
    
    if (!currentUser) {
      toast({
        title: "Error",
        description: "No user logged in",
        variant: "destructive"
      });
      return;
    }

    // Create bill
    const newBill: Bill = {
      id: billId,
      serial_no: serialNo,
      customer_name: customerName,
      admin_phone: state.settings.admin_phone,
      date: new Date(),
      total_amount: calculateTotal(),
      created_by: currentUser.id,
      created_at: new Date(),
      updated_at: new Date(),
      updated_by: currentUser.id,
      status: 'completed',
      history: []
    };

    // Add history entry
    addHistoryEntry(
      newBill,
      'created',
      currentUser.id,
      currentUser.name,
      `Bill ${serialNo} created for customer ${customerName}`
    );

    // Create bill items
    const newBillItems: BillItem[] = billItems.map(item => {
      const billItem: BillItem = {
        id: generateId('bill-item'),
        bill_id: billId,
        product_name: item.product_name,
        quantity: item.quantity,
        price: item.price,
        amount: item.amount,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: currentUser.id,
        updated_by: currentUser.id,
        history: []
      };

      addHistoryEntry(
        billItem,
        'created',
        currentUser.id,
        currentUser.name,
        `Bill item ${item.product_name} added to bill ${serialNo}`
      );

      return billItem;
    });

    // Update or create products
    billItems.forEach(item => {
      const existingProduct = state.products.find(p => p.name.toLowerCase() === item.product_name.toLowerCase());
      
      if (existingProduct) {
        const updatedProduct = {
          ...existingProduct,
          last_price: item.price,
          usage_count: existingProduct.usage_count + 1,
          updated_at: new Date(),
          updated_by: currentUser.id
        };

        addHistoryEntry(
          updatedProduct,
          'updated',
          currentUser.id,
          currentUser.name,
          `Product updated: price changed to ${item.price}, usage count increased`
        );

        dispatch({ type: 'UPDATE_PRODUCT', payload: updatedProduct });
      } else {
        const newProduct: Product = {
          id: generateId('product'),
          name: item.product_name,
          last_price: item.price,
          usage_count: 1,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: currentUser.id,
          updated_by: currentUser.id,
          history: []
        };

        addHistoryEntry(
          newProduct,
          'created',
          currentUser.id,
          currentUser.name,
          `New product created: ${item.product_name}`
        );

        dispatch({ type: 'ADD_PRODUCT', payload: newProduct });
      }
    });

    // Update settings with new serial number
    const updatedSettings = {
      ...state.settings,
      last_bill_serial: state.settings.last_bill_serial + 1,
      updated_at: new Date(),
      updated_by: currentUser.id
    };

    addHistoryEntry(
      updatedSettings,
      'updated',
      currentUser.id,
      currentUser.name,
      `Bill serial number updated to ${updatedSettings.last_bill_serial}`
    );

    // Dispatch actions
    dispatch({ type: 'ADD_BILL', payload: newBill });
    newBillItems.forEach(item => {
      dispatch({ type: 'ADD_BILL_ITEM', payload: item });
    });
    dispatch({ type: 'UPDATE_SETTINGS', payload: updatedSettings });

    // Set for print dialog
    setGeneratedBill(newBill);
    setGeneratedBillItems(newBillItems);
    setIsPrintDialogOpen(true);

    // Reset form
    setCustomerName('');
    setBillItems([{ product_name: '', quantity: 1, price: 0, amount: 0 }]);

    toast({
      title: "Bill Generated",
      description: `Bill ${serialNo} has been created successfully`,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const printElement = document.getElementById('bill-print-content');
    if (!printElement) return;

    try {
      const canvas = await html2canvas(printElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 190;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 10;

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`bill-${generatedBill?.serial_no}.pdf`);

      toast({
        title: "PDF Downloaded",
        description: `Bill ${generatedBill?.serial_no} downloaded as PDF`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-left">Generate Bill</h1>
        <p className="text-gray-500 text-left text-sm">Create new bills for customers</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Bill Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customer-name" className="text-sm">Customer Name</Label>
              <Input
                id="customer-name"
                placeholder="Enter customer name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-sm">Date</Label>
              <Input
                value={format(new Date(), 'yyyy-MM-dd')}
                readOnly
                className="bg-gray-50 text-sm"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-medium">Bill Items</h3>
              <Button onClick={addBillItem} size="sm" variant="outline" className="text-xs">
                <Plus className="h-3 w-3 mr-1" />
                Add Item
              </Button>
            </div>

            <div className="space-y-3">
              {billItems.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5 relative">
                    <Label className="text-xs">Product Name</Label>
                    <Input
                      placeholder="Enter product name"
                      value={item.product_name}
                      onChange={(e) => updateBillItem(index, 'product_name', e.target.value)}
                      className="text-sm"
                    />
                    {item.product_name && getProductSuggestions(item.product_name).length > 0 && (
                      <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1">
                        {getProductSuggestions(item.product_name).map((product) => (
                          <div
                            key={product.id}
                            className="p-2 hover:bg-gray-50 cursor-pointer text-sm"
                            onClick={() => selectProduct(index, product)}
                          >
                            <div className="font-medium">{product.name}</div>
                            <div className="text-xs text-gray-500">
                              Last Price: {new Intl.NumberFormat('en-US', { 
                                style: 'currency', 
                                currency: 'PKR',
                                currencyDisplay: 'narrowSymbol'
                              }).format(product.last_price)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateBillItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      className="text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Price</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.price}
                      onChange={(e) => updateBillItem(index, 'price', parseFloat(e.target.value) || 0)}
                      className="text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Amount</Label>
                    <Input
                      value={new Intl.NumberFormat('en-US', { 
                        style: 'currency', 
                        currency: 'PKR',
                        currencyDisplay: 'narrowSymbol'
                      }).format(item.amount)}
                      readOnly
                      className="bg-gray-50 text-sm"
                    />
                  </div>
                  <div className="col-span-1">
                    {billItems.length > 1 && (
                      <Button
                        onClick={() => removeBillItem(index)}
                        size="sm"
                        variant="outline"
                        className="p-1 h-8 w-8"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <span className="text-base font-medium">Total Amount:</span>
              <span className="text-lg font-bold text-primary">
                {new Intl.NumberFormat('en-US', { 
                  style: 'currency', 
                  currency: 'PKR',
                  currencyDisplay: 'narrowSymbol'
                }).format(calculateTotal())}
              </span>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={generateBill} size="lg" className="font-semibold">
                Generate Bill
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Print Dialog */}
      <Dialog open={isPrintDialogOpen} onOpenChange={setIsPrintDialogOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Bill Generated Successfully
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPrintDialogOpen(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex gap-2 justify-end">
              <Button onClick={handlePrint} variant="outline" size="sm">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button onClick={handleDownloadPDF} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>

            <div id="bill-print-content" className="border rounded-lg p-6 bg-white">
              {generatedBill && (
                <div className="space-y-4">
                  <div className="text-center border-b pb-4">
                    <h2 className="text-xl font-bold">{state.settings.shop_name}</h2>
                    <p className="text-sm text-gray-600">{state.settings.shop_address}</p>
                    <p className="text-sm text-gray-600">Contact: {state.settings.admin_phone}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Bill No:</strong> {generatedBill.serial_no}</p>
                      <p><strong>Customer:</strong> {generatedBill.customer_name}</p>
                    </div>
                    <div className="text-right">
                      <p><strong>Date:</strong> {format(new Date(generatedBill.date), 'dd/MM/yyyy')}</p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Item</th>
                          <th className="text-center py-2">Qty</th>
                          <th className="text-right py-2">Price</th>
                          <th className="text-right py-2">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {generatedBillItems.map((item) => (
                          <tr key={item.id} className="border-b">
                            <td className="py-2">{item.product_name}</td>
                            <td className="text-center py-2">{item.quantity}</td>
                            <td className="text-right py-2">
                              {new Intl.NumberFormat('en-US', { 
                                style: 'currency', 
                                currency: 'PKR',
                                currencyDisplay: 'narrowSymbol'
                              }).format(item.price)}
                            </td>
                            <td className="text-right py-2">
                              {new Intl.NumberFormat('en-US', { 
                                style: 'currency', 
                                currency: 'PKR',
                                currencyDisplay: 'narrowSymbol'
                              }).format(item.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold">Total:</span>
                      <span className="text-lg font-bold">
                        {new Intl.NumberFormat('en-US', { 
                          style: 'currency', 
                          currency: 'PKR',
                          currencyDisplay: 'narrowSymbol'
                        }).format(generatedBill.total_amount)}
                      </span>
                    </div>
                  </div>

                  <div className="text-center text-sm text-gray-500 border-t pt-4">
                    <p>Thank you for your business!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BillPage;
