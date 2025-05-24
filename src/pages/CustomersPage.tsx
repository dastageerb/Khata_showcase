import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Edit2, Plus, Trash2, Search } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Customer } from '@/context/AppContext';

const CustomersPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, dispatch, generateId, calculateCustomerBalance } = useApp();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState(state.customers);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    phone: '',
    address: '',
    nic_number: ''
  });

  useEffect(() => {
    // Filter customers based on search query
    if (searchQuery) {
      const filtered = state.customers.filter(customer => 
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery) ||
        (customer.nic_number && customer.nic_number.includes(searchQuery))
      );
      setCustomers(filtered);
    } else {
      setCustomers(state.customers);
    }
  }, [searchQuery, state.customers]);

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      phone: '',
      address: '',
      nic_number: ''
    });
    setIsEditing(false);
  };

  const handleOpenForm = (customer: Customer | null = null) => {
    if (customer) {
      setFormData({
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        address: customer.address || '',
        nic_number: customer.nic_number || ''
      });
      setIsEditing(true);
    } else {
      resetForm();
    }
    setIsFormOpen(true);
  };

  const handleRowClick = (customer: Customer) => {
    navigate(`/customers/${customer.id}`);
  };

  const handleConfirmDelete = (e: React.MouseEvent, customer: Customer) => {
    e.stopPropagation();
    setSelectedCustomer(customer);
    setIsDeleteDialogOpen(true);
  };

  const handleEdit = (e: React.MouseEvent, customer: Customer) => {
    e.stopPropagation();
    handleOpenForm(customer);
  };

  const handleDelete = () => {
    if (!selectedCustomer) return;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    
    setTimeout(() => {
      dispatch({ type: 'DELETE_CUSTOMER', payload: selectedCustomer.id });
      
      toast({
        title: "Customer Deleted",
        description: `${selectedCustomer.name} has been removed from your customers`
      });
      
      setIsDeleteDialogOpen(false);
      setSelectedCustomer(null);
      dispatch({ type: 'SET_LOADING', payload: false });
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone) {
      toast({
        title: "Missing Information",
        description: "Name and phone number are required",
        variant: "destructive"
      });
      return;
    }
    
    dispatch({ type: 'SET_LOADING', payload: true });
    
    setTimeout(() => {
      if (isEditing) {
        const existingCustomer = state.customers.find(c => c.id === formData.id);
        if (!existingCustomer) {
          toast({
            title: "Error",
            description: "Customer not found",
            variant: "destructive"
          });
          dispatch({ type: 'SET_LOADING', payload: false });
          return;
        }
        
        const updatedCustomer = {
          ...existingCustomer,
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          nic_number: formData.nic_number,
          updated_at: new Date(),
          updated_by: state.currentUser?.id || 'system'
        };
        
        dispatch({ type: 'UPDATE_CUSTOMER', payload: updatedCustomer });
        
        toast({
          title: "Customer Updated",
          description: `${formData.name}'s information has been updated`
        });
      } else {
        const newCustomer = {
          id: generateId('customer'),
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          nic_number: formData.nic_number,
          balance: 0,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: state.currentUser?.id || 'system',
          updated_by: state.currentUser?.id || 'system',
          history: []
        };
        
        dispatch({ type: 'ADD_CUSTOMER', payload: newCustomer });
        
        toast({
          title: "Customer Added",
          description: `${formData.name} has been added to your customers`
        });
      }
      
      setIsFormOpen(false);
      resetForm();
      dispatch({ type: 'SET_LOADING', payload: false });
    }, 1000);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Customers</h1>
          <p className="text-gray-500">Manage your customer database</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search customers"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full sm:w-[250px]"
            />
          </div>
          
          <Button onClick={() => handleOpenForm()} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>
      </div>
      
      {customers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className="text-xl font-medium text-gray-400 mb-4">No customers found</p>
            {searchQuery ? (
              <p className="text-gray-500">Try using different search terms</p>
            ) : (
              <Button onClick={() => handleOpenForm()} className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Customer
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>NIC Number</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow 
                  key={customer.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleRowClick(customer)}
                >
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>{customer.address || 'Not provided'}</TableCell>
                  <TableCell>{customer.nic_number || 'Not provided'}</TableCell>
                  <TableCell className="font-bold text-primary">
                    {new Intl.NumberFormat('en-US', { 
                      style: 'currency', 
                      currency: 'PKR',
                      currencyDisplay: 'narrowSymbol'
                    }).format(calculateCustomerBalance(customer.id))}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => handleEdit(e, customer)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => handleConfirmDelete(e, customer)} 
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Customer' : 'Add New Customer'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Customer Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter customer name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+92-300-1234567"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address (Optional)</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter customer address"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nic">NIC Number (Optional)</Label>
              <Input
                id="nic"
                value={formData.nic_number}
                onChange={(e) => setFormData({ ...formData, nic_number: e.target.value })}
                placeholder="12345-6789012-3"
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-primary hover:bg-primary/90"
                disabled={state.isLoading}
              >
                {state.isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>{isEditing ? 'Updating...' : 'Adding...'}</span>
                  </div>
                ) : (
                  isEditing ? 'Update Customer' : 'Add Customer'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-500">Delete Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Are you sure you want to delete <strong>{selectedCustomer?.name}</strong>?</p>
            <p className="text-sm text-gray-500">
              This will permanently remove the customer and all their associated data.
              This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={state.isLoading}
              >
                {state.isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Deleting...</span>
                  </div>
                ) : (
                  'Delete Customer'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomersPage;
