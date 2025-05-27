import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Search, ChevronRight, Building2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

interface CompaniesPageProps {
  onNavigate: (path: string, params?: { [key: string]: string }) => void;
}

const CompaniesPage: React.FC<CompaniesPageProps> = ({ onNavigate }) => {
  const { state, dispatch, generateId, addHistoryEntry, calculateCompanyBalance } = useApp();
  const { toast } = useToast();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    contact_number: '',
    address: ''
  });

  const filteredCompanies = state.companies.filter(company =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.contact_number.includes(searchQuery) ||
    (company.address && company.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.contact_number) {
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
        name: formData.name,
        contact_number: formData.contact_number,
        address: formData.address,
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
        description: `${formData.name} has been added to your company list`
      });

      setIsFormOpen(false);
      setFormData({ name: '', contact_number: '', address: '' });
      dispatch({ type: 'SET_LOADING', payload: false });
    }, 1000);
  };

  const handleCompanyClick = (companyId: string) => {
    onNavigate(`/companies/${companyId}`, { companyId });
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <Building2 className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Companies</h1>
          </div>
          <p className="text-lg text-gray-600">Manage your business partnerships and suppliers</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full sm:w-[280px] h-11 text-base"
            />
          </div>
          
          <Button onClick={() => setIsFormOpen(true)} className="w-full sm:w-auto h-11 px-6 font-semibold">
            <Plus className="h-5 w-5 mr-2" />
            Add Company
          </Button>
        </div>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-gray-900">
            Company Directory ({filteredCompanies.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCompanies.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-lg text-gray-500 font-medium">
                {searchQuery ? 'No companies found matching your search' : 'No companies found'}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {!searchQuery && 'Add your first company to get started'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200">
                    <TableHead className="font-semibold text-gray-700 text-sm">Company Name</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-sm">Contact</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-sm">Address</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-sm">Balance</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-sm">Created</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-sm">Updated</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-sm">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompanies.map((company) => {
                    const balance = calculateCompanyBalance(company.id);
                    
                    return (
                      <TableRow 
                        key={company.id} 
                        className="hover:bg-gray-50 cursor-pointer border-gray-100 transition-colors"
                        onClick={() => handleCompanyClick(company.id)}
                      >
                        <TableCell className="font-semibold text-gray-900 text-base">{company.name}</TableCell>
                        <TableCell className="font-medium text-gray-700">{company.contact_number}</TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate text-gray-600">{company.address || 'Not provided'}</div>
                        </TableCell>
                        <TableCell className={`font-bold text-lg ${
                          balance >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {new Intl.NumberFormat('en-US', { 
                            style: 'currency', 
                            currency: 'PKR',
                            currencyDisplay: 'narrowSymbol'
                          }).format(balance)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500 font-medium">
                          {format(new Date(company.created_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500 font-medium">
                          {format(new Date(company.updated_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCompanyClick(company.id);
                            }}
                            className="h-9 w-9 p-0 hover:bg-primary/10"
                          >
                            <ChevronRight className="h-4 w-4 text-primary" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Company Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Add New Company</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-3">
              <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Company Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Enter company name"
                required
                className="h-11 text-base"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="contact" className="text-sm font-semibold text-gray-700">Contact Number</Label>
              <Input
                id="contact"
                value={formData.contact_number}
                onChange={(e) => setFormData({...formData, contact_number: e.target.value})}
                placeholder="Enter contact number"
                required
                className="h-11 text-base"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="address" className="text-sm font-semibold text-gray-700">Address (Optional)</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="Enter address"
                className="h-11 text-base"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} className="font-medium">
                Cancel
              </Button>
              <Button type="submit" disabled={state.isLoading} className="font-semibold">
                {state.isLoading ? 'Adding...' : 'Add Company'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompaniesPage;
