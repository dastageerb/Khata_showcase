
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, Search, ChevronRight, Building2, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import EditCompanyDialog from '@/components/dialogs/EditCompanyDialog';

interface CompaniesPageProps {
  onNavigate: (path: string, params?: { [key: string]: string }) => void;
}

const CompaniesPage: React.FC<CompaniesPageProps> = ({ onNavigate }) => {
  const { state, dispatch, generateId, addHistoryEntry, calculateCompanyBalance } = useApp();
  const { toast } = useToast();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
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

  const handleEditCompany = (company: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCompany(company);
    setIsEditDialogOpen(true);
  };

  const handleDeleteCompany = (company: any, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (window.confirm(`Are you sure you want to delete ${company.name}?`)) {
      dispatch({ type: 'DELETE_COMPANY', payload: company.id });
      toast({
        title: "Company Deleted",
        description: `${company.name} has been removed from your company list`,
        variant: "destructive"
      });
    }
  };

  const handleUpdateCompany = (updatedCompany: any) => {
    dispatch({ type: 'UPDATE_COMPANY', payload: updatedCompany });
    
    addHistoryEntry(
      updatedCompany,
      'updated',
      state.currentUser?.id || 'system',
      state.currentUser?.name || 'System',
      'Company information updated'
    );

    toast({
      title: "Company Updated",
      description: `${updatedCompany.name} has been updated successfully`
    });
  };

  return (
    <div className="w-full min-h-screen overflow-x-auto">
      <div className="min-w-[320px] space-y-4 p-2 sm:p-4 font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Building2 className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Companies</h1>
            </div>
            <p className="text-sm text-gray-600">Manage your business partnerships and suppliers</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
              <Input
                placeholder="Search companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-full sm:w-[200px] h-8 text-xs"
              />
            </div>
            
            <Button onClick={() => setIsFormOpen(true)} className="w-full sm:w-auto h-8 px-4 font-medium text-xs">
              <Plus className="h-3 w-3 mr-1" />
              Add Company
            </Button>
          </div>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Company Directory ({filteredCompanies.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredCompanies.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500 font-medium">
                  {searchQuery ? 'No companies found matching your search' : 'No companies found'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {!searchQuery && 'Add your first company to get started'}
                </p>
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <div className="min-w-[1200px]">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-200">
                        <TableHead className="font-semibold text-gray-700 text-xs min-w-[150px] sticky left-0 bg-white z-10 border-r">Company Name</TableHead>
                        <TableHead className="font-semibold text-gray-700 text-xs min-w-[120px]">Contact</TableHead>
                        <TableHead className="font-semibold text-gray-700 text-xs min-w-[180px]">Address</TableHead>
                        <TableHead className="font-semibold text-gray-700 text-xs min-w-[120px]">Balance</TableHead>
                        <TableHead className="font-semibold text-gray-700 text-xs min-w-[100px]">Created</TableHead>
                        <TableHead className="font-semibold text-gray-700 text-xs min-w-[100px]">Updated</TableHead>
                        <TableHead className="font-semibold text-gray-700 text-xs min-w-[80px] sticky right-0 bg-white z-10 border-l">Actions</TableHead>
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
                            <TableCell className="font-semibold text-gray-900 text-xs sticky left-0 bg-white z-10 border-r">{company.name}</TableCell>
                            <TableCell className="font-medium text-gray-700 text-xs">{company.contact_number}</TableCell>
                            <TableCell className="max-w-xs">
                              <div className="truncate text-gray-600 text-xs">{company.address || 'Not provided'}</div>
                            </TableCell>
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
                              {format(new Date(company.created_at), 'MMM d, yyyy')}
                            </TableCell>
                            <TableCell className="text-xs text-gray-500 font-medium">
                              {format(new Date(company.updated_at), 'MMM d, yyyy')}
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
                                  <DropdownMenuItem onClick={(e) => handleEditCompany(company, e)} className="text-xs">
                                    <Edit className="mr-2 h-3 w-3" />
                                    Edit Company
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={(e) => handleDeleteCompany(company, e)} 
                                    className="text-xs text-red-600 focus:text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-3 w-3" />
                                    Delete Company
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

        {/* Company Form Dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">Add New Company</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-semibold text-gray-700">Company Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter company name"
                  required
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact" className="text-xs font-semibold text-gray-700">Contact Number</Label>
                <Input
                  id="contact"
                  value={formData.contact_number}
                  onChange={(e) => setFormData({...formData, contact_number: e.target.value})}
                  placeholder="Enter contact number"
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

              <div className="flex justify-end space-x-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} className="font-medium text-xs h-8">
                  Cancel
                </Button>
                <Button type="submit" disabled={state.isLoading} className="font-semibold text-xs h-8">
                  {state.isLoading ? 'Adding...' : 'Add Company'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Company Dialog */}
        <EditCompanyDialog
          company={selectedCompany}
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setSelectedCompany(null);
          }}
          onUpdate={handleUpdateCompany}
        />
      </div>
    </div>
  );
};

export default CompaniesPage;
