
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, Search, ChevronRight, Users, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

interface CustomersPageProps {
  onNavigate: (path: string, params?: { [key: string]: string }) => void;
}

const CustomersPage: React.FC<CustomersPageProps> = ({ onNavigate }) => {
  const { state, dispatch, generateId, addHistoryEntry, calculateCustomerBalance } = useApp();
  const { toast } = useToast();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    nic_number: ''
  });

  const filteredCustomers = state.customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery) ||
    (customer.address && customer.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (customer.nic_number && customer.nic_number.includes(searchQuery))
  );

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
      const newCustomer = {
        id: generateId('cust'),
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        nic_number: formData.nic_number,
        balance: 0,
        created_by: state.currentUser?.id || 'system',
        created_at: new Date(),
        updated_at: new Date(),
        updated_by: state.currentUser?.id || 'system',
        history: []
      };

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
        description: `${formData.name} has been added to your customer list`
      });

      setIsFormOpen(false);
      setFormData({ name: '', phone: '', address: '', nic_number: '' });
      dispatch({ type: 'SET_LOADING', payload: false });
    }, 1000);
  };

  const handleCustomerClick = (customerId: string) => {
    onNavigate(`/customers/${customerId}`, { customerId });
  };

  const handleEditCustomer = (customer: any, e: React.MouseEvent) => {
    e.stopPropagation();
    // Add edit functionality here
    console.log('Edit customer:', customer);
  };

  const handleDeleteCustomer = (customer: any, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (window.confirm(`Are you sure you want to delete ${customer.name}?`)) {
      dispatch({ type: 'DELETE_CUSTOMER', payload: customer.id });
      toast({
        title: "Customer Deleted",
        description: `${customer.name} has been removed from your customer list`,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="w-full min-h-screen overflow-x-auto">
      <div className="min-w-[320px] space-y-4 p-2 sm:p-4 font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Users className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Customers</h1>
            </div>
            <p className="text-sm text-gray-600">Manage your customer database</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
              <Input
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-full sm:w-[200px] h-8 text-xs"
              />
            </div>
            
            <Button onClick={() => setIsFormOpen(true)} className="w-full sm:w-auto h-8 px-4 font-medium text-xs">
              <Plus className="h-3 w-3 mr-1" />
              Add Customer
            </Button>
          </div>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Customer List ({filteredCustomers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500 font-medium">
                  {searchQuery ? 'No customers found matching your search' : 'No customers found'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {!searchQuery && 'Add your first customer to get started'}
                </p>
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <div className="min-w-[1200px]">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-200">
                        <TableHead className="font-semibold text-gray-700 text-xs min-w-[150px] sticky left-0 bg-white z-10 border-r">Name</TableHead>
                        <TableHead className="font-semibold text-gray-700 text-xs min-w-[120px]">Phone</TableHead>
                        <TableHead className="font-semibold text-gray-700 text-xs min-w-[180px]">Address</TableHead>
                        <TableHead className="font-semibold text-gray-700 text-xs min-w-[140px]">NIC Number</TableHead>
                        <TableHead className="font-semibold text-gray-700 text-xs min-w-[120px]">Balance</TableHead>
                        <TableHead className="font-semibold text-gray-700 text-xs min-w-[100px]">Created</TableHead>
                        <TableHead className="font-semibold text-gray-700 text-xs min-w-[100px]">Updated</TableHead>
                        <TableHead className="font-semibold text-gray-700 text-xs min-w-[80px] sticky right-0 bg-white z-10 border-l">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCustomers.map((customer) => {
                        const balance = calculateCustomerBalance(customer.id);
                        
                        return (
                          <TableRow 
                            key={customer.id} 
                            className="hover:bg-gray-50 cursor-pointer border-gray-100 transition-colors"
                            onClick={() => handleCustomerClick(customer.id)}
                          >
                            <TableCell className="font-semibold text-gray-900 text-xs sticky left-0 bg-white z-10 border-r">{customer.name}</TableCell>
                            <TableCell className="font-medium text-gray-700 text-xs">{customer.phone}</TableCell>
                            <TableCell className="max-w-xs">
                              <div className="truncate text-gray-600 text-xs">{customer.address || 'Not provided'}</div>
                            </TableCell>
                            <TableCell className="text-gray-600 text-xs">{customer.nic_number || 'Not provided'}</TableCell>
                            <TableCell className={`font-bold text-xs ${
                              balance >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {new Intl.NumberFormat('en-US', { 
                                style: 'currency', 
                                currency: 'PKR',
                                currencyDisplay: 'narrowSymbol'
                              }).format(balance)}
                            </TableCell>
                            <TableCell className="text-xs text-gray-500 font-medium">
                              {format(new Date(customer.created_at), 'MMM d, yyyy')}
                            </TableCell>
                            <TableCell className="text-xs text-gray-500 font-medium">
                              {format(new Date(customer.updated_at), 'MMM d, yyyy')}
                            </TableCell>
                            <TableCell className="sticky right-0 bg-white z-10 border-l">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={(e) => e.stopPropagation()}
                                    className="h-6 w-6 p-0 hover:bg-primary/10"
                                  >
                                    <MoreVertical className="h-3 w-3 text-primary" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="min-w-[140px]">
                                  <DropdownMenuItem onClick={(e) => handleEditCustomer(customer, e)} className="text-xs">
                                    <Edit className="mr-2 h-3 w-3" />
                                    Edit Customer
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={(e) => handleDeleteCustomer(customer, e)} 
                                    className="text-xs text-red-600 focus:text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-3 w-3" />
                                    Delete Customer
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer Form Dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">Add New Customer</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-semibold text-gray-700">Customer Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter customer name"
                  required
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs font-semibold text-gray-700">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="Enter phone number"
                  required
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-xs font-semibold text-gray-700">Address (Optional)</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Enter address"
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nic" className="text-xs font-semibold text-gray-700">NIC Number (Optional)</Label>
                <Input
                  id="nic"
                  value={formData.nic_number}
                  onChange={(e) => setFormData({...formData, nic_number: e.target.value})}
                  placeholder="Enter NIC number"
                  className="h-8 text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} className="font-medium text-xs h-8">
                  Cancel
                </Button>
                <Button type="submit" disabled={state.isLoading} className="font-semibold text-xs h-8">
                  {state.isLoading ? 'Adding...' : 'Add Customer'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CustomersPage;
