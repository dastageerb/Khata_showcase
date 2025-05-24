
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Edit2, Plus, Trash2, Search, Eye } from 'lucide-react';
import HistoryTimeline from '@/components/history/HistoryTimeline';
import HistoryDialog from '@/components/history/HistoryDialog';
import { Customer } from '@/context/AppContext';

const CustomersPage: React.FC = () => {
  const { state, dispatch, generateId, addHistoryEntry, calculateCustomerBalance } = useApp();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState(state.customers);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
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

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailOpen(true);
  };

  const handleViewHistory = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsHistoryOpen(true);
  };

  const handleConfirmDelete = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (!selectedCustomer) return;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    
    // Simulate loading
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
    
    // Pakistani phone number validation (simple version)
    const phoneRegex = /^\+92-\d{3}-\d{7}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast({
        title: "Invalid Phone Number",
        description: "Phone number should be in format: +92-300-1234567",
        variant: "destructive"
      });
      return;
    }
    
    // Pakistani NIC validation (if provided)
    if (formData.nic_number) {
      const nicRegex = /^\d{5}-\d{7}-\d{1}$/;
      if (!nicRegex.test(formData.nic_number)) {
        toast({
          title: "Invalid NIC Number",
          description: "NIC should be in format: 12345-6789012-3",
          variant: "destructive"
        });
        return;
      }
    }
    
    dispatch({ type: 'SET_LOADING', payload: true });
    
    // Simulate loading
    setTimeout(() => {
      if (isEditing) {
        // Get existing customer
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
        
        // Create updated customer with history
        const updatedCustomer = {
          ...existingCustomer,
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          nic_number: formData.nic_number,
          updated_at: new Date(),
          updated_by: state.currentUser?.id || 'system'
        };
        
        // Add history entry
        addHistoryEntry(
          updatedCustomer, 
          'updated', 
          state.currentUser?.id || 'system',
          state.currentUser?.name || 'System',
          'Customer information updated',
          {
            name: existingCustomer.name,
            phone: existingCustomer.phone,
            address: existingCustomer.address,
            nic_number: existingCustomer.nic_number
          },
          {
            name: formData.name,
            phone: formData.phone,
            address: formData.address,
            nic_number: formData.nic_number
          }
        );
        
        dispatch({ type: 'UPDATE_CUSTOMER', payload: updatedCustomer });
        
        toast({
          title: "Customer Updated",
          description: `${formData.name}'s information has been updated`
        });
      } else {
        // Create new customer
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
        
        // Add history entry
        addHistoryEntry(
          newCustomer, 
          'created', 
          state.currentUser?.id || 'system',
          state.currentUser?.name || 'System',
          'Customer profile created'
        );
        
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {customers.map((customer) => (
            <Card key={customer.id} className="transition-all hover:shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-center">
                  <span className="truncate">{customer.name}</span>
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleViewCustomer(customer)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleOpenForm(customer)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleConfirmDelete(customer)} 
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p>{customer.phone}</p>
                </div>
                
                {customer.address && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Address</p>
                    <p className="text-sm line-clamp-2">{customer.address}</p>
                  </div>
                )}
                
                {customer.nic_number && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">NIC Number</p>
                    <p>{customer.nic_number}</p>
                  </div>
                )}
                
                <div className="pt-2">
                  <p className="text-sm font-medium text-gray-500">Current Balance</p>
                  <p className="text-lg font-bold text-primary">
                    {new Intl.NumberFormat('en-US', { 
                      style: 'currency', 
                      currency: 'PKR',
                      currencyDisplay: 'narrowSymbol'
                    }).format(calculateCustomerBalance(customer.id))}
                  </p>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleViewHistory(customer)}
                  className="w-full"
                >
                  View History
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Customer Form Dialog */}
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
      
      {/* Customer Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Customer Details
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {selectedCustomer && (
              <>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Name</h3>
                    <p className="font-semibold">{selectedCustomer.name}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                    <p>{selectedCustomer.phone}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Address</h3>
                    <p>{selectedCustomer.address || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">NIC Number</h3>
                    <p>{selectedCustomer.nic_number || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Balance</h3>
                    <p className="font-bold text-primary">
                      {new Intl.NumberFormat('en-US', { 
                        style: 'currency', 
                        currency: 'PKR',
                        currencyDisplay: 'narrowSymbol'
                      }).format(calculateCustomerBalance(selectedCustomer.id))}
                    </p>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <HistoryTimeline history={selectedCustomer.history} limit={3} />
                  
                  {selectedCustomer.history.length > 3 && (
                    <Button 
                      variant="link" 
                      onClick={() => {
                        setIsDetailOpen(false);
                        setTimeout(() => setIsHistoryOpen(true), 100);
                      }}
                      className="mt-2 p-0 h-auto"
                    >
                      View complete history
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
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
      
      {/* History Dialog */}
      {selectedCustomer && (
        <HistoryDialog
          isOpen={isHistoryOpen}
          setIsOpen={setIsHistoryOpen}
          history={selectedCustomer.history}
          title={`Customer: ${selectedCustomer.name}`}
        />
      )}
    </div>
  );
};

export default CustomersPage;
