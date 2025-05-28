
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Search, ChevronRight, Users, Building2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

interface ContactsPageProps {
  onNavigate: (path: string, params?: { [key: string]: string }) => void;
}

const ContactsPage: React.FC<ContactsPageProps> = ({ onNavigate }) => {
  const { state, dispatch, generateId, addHistoryEntry, calculateCustomerBalance, calculateCompanyBalance } = useApp();
  const { toast } = useToast();
  
  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false);
  const [isCompanyFormOpen, setIsCompanyFormOpen] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [companySearchQuery, setCompanySearchQuery] = useState('');
  const [customerFormData, setCustomerFormData] = useState({
    name: '',
    phone: '',
    address: '',
    nic_number: ''
  });
  const [companyFormData, setCompanyFormData] = useState({
    name: '',
    contact_number: '',
    address: ''
  });

  const filteredCustomers = state.customers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
    customer.phone.includes(customerSearchQuery) ||
    (customer.address && customer.address.toLowerCase().includes(customerSearchQuery.toLowerCase())) ||
    (customer.nic_number && customer.nic_number.includes(customerSearchQuery))
  );

  const filteredCompanies = state.companies.filter(company =>
    company.name.toLowerCase().includes(companySearchQuery.toLowerCase()) ||
    company.contact_number.includes(companySearchQuery) ||
    (company.address && company.address.toLowerCase().includes(companySearchQuery.toLowerCase()))
  );

  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerFormData.name || !customerFormData.phone) {
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
        name: customerFormData.name,
        phone: customerFormData.phone,
        address: customerFormData.address,
        nic_number: customerFormData.nic_number,
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
        description: `${customerFormData.name} has been added to your customer list`
      });

      setIsCustomerFormOpen(false);
      setCustomerFormData({ name: '', phone: '', address: '', nic_number: '' });
      dispatch({ type: 'SET_LOADING', payload: false });
    }, 1000);
  };

  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!companyFormData.name || !companyFormData.contact_number) {
      toast({
        title: "Missing Information",
        description: "Company name and contact number are required",
        variant: "destructive"
      });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });

    setTimeout(() => {
      const newCompany = {
        id: generateId('comp'),
        name: companyFormData.name,
        contact_number: companyFormData.contact_number,
        address: companyFormData.address,
        balance: 0,
        created_by: state.currentUser?.id || 'system',
        created_at: new Date(),
        updated_at: new Date(),
        updated_by: state.currentUser?.id || 'system',
        history: []
      };

      addHistoryEntry(
        newCompany,
        'created',
        state.currentUser?.id || 'system',
        state.currentUser?.name || 'System',
        'Company profile created'
      );

      dispatch({ type: 'ADD_COMPANY', payload: newCompany });

      toast({
        title: "Company Added",
        description: `${companyFormData.name} has been added to your company list`
      });

      setIsCompanyFormOpen(false);
      setCompanyFormData({ name: '', contact_number: '', address: '' });
      dispatch({ type: 'SET_LOADING', payload: false });
    }, 1000);
  };

  const handleCustomerClick = (customerId: string) => {
    onNavigate(`/customers/${customerId}`, { customerId });
  };

  const handleCompanyClick = (companyId: string) => {
    onNavigate(`/companies/${companyId}`, { companyId });
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">Contacts</h1>
          <p className="text-xs text-gray-500">Manage customers and companies</p>
        </div>
      </div>

      <Tabs defaultValue="customers" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 h-8">
          <TabsTrigger value="customers" className="text-xs flex items-center gap-1">
            <Users className="h-3 w-3" />
            Customers ({filteredCustomers.length})
          </TabsTrigger>
          <TabsTrigger value="companies" className="text-xs flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            Companies ({filteredCompanies.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="flex-1 flex flex-col space-y-3 mt-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
              <Input
                placeholder="Search customers"
                value={customerSearchQuery}
                onChange={(e) => setCustomerSearchQuery(e.target.value)}
                className="pl-7 h-8 text-xs"
              />
            </div>
            <Button onClick={() => setIsCustomerFormOpen(true)} size="sm" className="h-8 text-xs">
              <Plus className="h-3 w-3 mr-1" />
              Add Customer
            </Button>
          </div>

          <Card className="flex-1 flex flex-col min-h-0">
            <CardHeader className="py-2">
              <CardTitle className="text-sm">Customer List</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              {filteredCustomers.length === 0 ? (
                <div className="flex items-center justify-center h-32">
                  <p className="text-xs text-gray-500">
                    {customerSearchQuery ? 'No customers found matching your search' : 'No customers found'}
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-full">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs h-8">Name</TableHead>
                        <TableHead className="text-xs h-8">Phone</TableHead>
                        <TableHead className="text-xs h-8">Address</TableHead>
                        <TableHead className="text-xs h-8">NIC</TableHead>
                        <TableHead className="text-xs h-8">Balance</TableHead>
                        <TableHead className="text-xs h-8">Created</TableHead>
                        <TableHead className="text-xs h-8">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCustomers.map((customer) => {
                        const balance = calculateCustomerBalance(customer.id);
                        
                        return (
                          <TableRow 
                            key={customer.id} 
                            className="hover:bg-muted/50 cursor-pointer h-8"
                            onClick={() => handleCustomerClick(customer.id)}
                          >
                            <TableCell className="text-xs font-medium py-1">{customer.name}</TableCell>
                            <TableCell className="text-xs py-1">{customer.phone}</TableCell>
                            <TableCell className="text-xs py-1 max-w-24">
                              <div className="truncate">{customer.address || 'Not provided'}</div>
                            </TableCell>
                            <TableCell className="text-xs py-1">{customer.nic_number || 'Not provided'}</TableCell>
                            <TableCell className={`text-xs py-1 font-bold ${
                              balance >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {new Intl.NumberFormat('en-US', { 
                                style: 'currency', 
                                currency: 'PKR',
                                currencyDisplay: 'narrowSymbol'
                              }).format(balance)}
                            </TableCell>
                            <TableCell className="text-xs py-1 text-gray-500">
                              {format(new Date(customer.created_at), 'MMM d, yyyy')}
                            </TableCell>
                            <TableCell className="py-1">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCustomerClick(customer.id);
                                }}
                                className="h-6 w-6 p-0"
                              >
                                <ChevronRight className="h-3 w-3" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="companies" className="flex-1 flex flex-col space-y-3 mt-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
              <Input
                placeholder="Search companies"
                value={companySearchQuery}
                onChange={(e) => setCompanySearchQuery(e.target.value)}
                className="pl-7 h-8 text-xs"
              />
            </div>
            <Button onClick={() => setIsCompanyFormOpen(true)} size="sm" className="h-8 text-xs">
              <Plus className="h-3 w-3 mr-1" />
              Add Company
            </Button>
          </div>

          <Card className="flex-1 flex flex-col min-h-0">
            <CardHeader className="py-2">
              <CardTitle className="text-sm">Company Directory</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              {filteredCompanies.length === 0 ? (
                <div className="flex items-center justify-center h-32">
                  <p className="text-xs text-gray-500">
                    {companySearchQuery ? 'No companies found matching your search' : 'No companies found'}
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-full">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs h-8">Company Name</TableHead>
                        <TableHead className="text-xs h-8">Contact</TableHead>
                        <TableHead className="text-xs h-8">Address</TableHead>
                        <TableHead className="text-xs h-8">Balance</TableHead>
                        <TableHead className="text-xs h-8">Created</TableHead>
                        <TableHead className="text-xs h-8">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCompanies.map((company) => {
                        const balance = calculateCompanyBalance(company.id);
                        
                        return (
                          <TableRow 
                            key={company.id} 
                            className="hover:bg-muted/50 cursor-pointer h-8"
                            onClick={() => handleCompanyClick(company.id)}
                          >
                            <TableCell className="text-xs font-medium py-1">{company.name}</TableCell>
                            <TableCell className="text-xs py-1">{company.contact_number}</TableCell>
                            <TableCell className="text-xs py-1 max-w-24">
                              <div className="truncate">{company.address || 'Not provided'}</div>
                            </TableCell>
                            <TableCell className={`text-xs py-1 font-bold ${
                              balance >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {new Intl.NumberFormat('en-US', { 
                                style: 'currency', 
                                currency: 'PKR',
                                currencyDisplay: 'narrowSymbol'
                              }).format(balance)}
                            </TableCell>
                            <TableCell className="text-xs py-1 text-gray-500">
                              {format(new Date(company.created_at), 'MMM d, yyyy')}
                            </TableCell>
                            <TableCell className="py-1">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCompanyClick(company.id);
                                }}
                                className="h-6 w-6 p-0"
                              >
                                <ChevronRight className="h-3 w-3" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Customer Form Dialog */}
      <Dialog open={isCustomerFormOpen} onOpenChange={setIsCustomerFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">Add New Customer</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCustomerSubmit} className="space-y-3">
            <div>
              <Label htmlFor="name" className="text-xs">Customer Name</Label>
              <Input
                id="name"
                value={customerFormData.name}
                onChange={(e) => setCustomerFormData({...customerFormData, name: e.target.value})}
                placeholder="Enter customer name"
                required
                className="h-8 text-xs"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-xs">Phone Number</Label>
              <Input
                id="phone"
                value={customerFormData.phone}
                onChange={(e) => setCustomerFormData({...customerFormData, phone: e.target.value})}
                placeholder="Enter phone number"
                required
                className="h-8 text-xs"
              />
            </div>

            <div>
              <Label htmlFor="address" className="text-xs">Address (Optional)</Label>
              <Input
                id="address"
                value={customerFormData.address}
                onChange={(e) => setCustomerFormData({...customerFormData, address: e.target.value})}
                placeholder="Enter address"
                className="h-8 text-xs"
              />
            </div>

            <div>
              <Label htmlFor="nic" className="text-xs">NIC Number (Optional)</Label>
              <Input
                id="nic"
                value={customerFormData.nic_number}
                onChange={(e) => setCustomerFormData({...customerFormData, nic_number: e.target.value})}
                placeholder="Enter NIC number"
                className="h-8 text-xs"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-3">
              <Button type="button" variant="outline" onClick={() => setIsCustomerFormOpen(false)} className="h-8 text-xs">
                Cancel
              </Button>
              <Button type="submit" disabled={state.isLoading} className="h-8 text-xs">
                {state.isLoading ? 'Adding...' : 'Add Customer'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Company Form Dialog */}
      <Dialog open={isCompanyFormOpen} onOpenChange={setIsCompanyFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">Add New Company</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCompanySubmit} className="space-y-3">
            <div>
              <Label htmlFor="company-name" className="text-xs">Company Name</Label>
              <Input
                id="company-name"
                value={companyFormData.name}
                onChange={(e) => setCompanyFormData({...companyFormData, name: e.target.value})}
                placeholder="Enter company name"
                required
                className="h-8 text-xs"
              />
            </div>

            <div>
              <Label htmlFor="contact" className="text-xs">Contact Number</Label>
              <Input
                id="contact"
                value={companyFormData.contact_number}
                onChange={(e) => setCompanyFormData({...companyFormData, contact_number: e.target.value})}
                placeholder="Enter contact number"
                required
                className="h-8 text-xs"
              />
            </div>

            <div>
              <Label htmlFor="company-address" className="text-xs">Address (Optional)</Label>
              <Input
                id="company-address"
                value={companyFormData.address}
                onChange={(e) => setCompanyFormData({...companyFormData, address: e.target.value})}
                placeholder="Enter address"
                className="h-8 text-xs"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-3">
              <Button type="button" variant="outline" onClick={() => setIsCompanyFormOpen(false)} className="h-8 text-xs">
                Cancel
              </Button>
              <Button type="submit" disabled={state.isLoading} className="h-8 text-xs">
                {state.isLoading ? 'Adding...' : 'Add Company'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactsPage;
