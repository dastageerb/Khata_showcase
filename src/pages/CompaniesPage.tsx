
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Edit2, Plus, Trash2, Search, Eye } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import HistoryDialog from '@/components/history/HistoryDialog';
import { Company } from '@/context/AppContext';

const CompaniesPage: React.FC = () => {
  const { state, dispatch, generateId, calculateCompanyBalance } = useApp();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [companies, setCompanies] = useState(state.companies);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    contact_number: '',
    address: ''
  });

  useEffect(() => {
    if (searchQuery) {
      const filtered = state.companies.filter(company => 
        company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.contact_number.includes(searchQuery)
      );
      setCompanies(filtered);
    } else {
      setCompanies(state.companies);
    }
  }, [searchQuery, state.companies]);

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      contact_number: '',
      address: ''
    });
    setIsEditing(false);
  };

  const handleOpenForm = (company: Company | null = null) => {
    if (company) {
      setFormData({
        id: company.id,
        name: company.name,
        contact_number: company.contact_number,
        address: company.address || ''
      });
      setIsEditing(true);
    } else {
      resetForm();
    }
    setIsFormOpen(true);
  };

  const handleViewCompany = (company: Company) => {
    setSelectedCompany(company);
    setIsDetailOpen(true);
  };

  const handleViewHistory = (company: Company) => {
    setSelectedCompany(company);
    setIsHistoryOpen(true);
  };

  const handleConfirmDelete = (company: Company) => {
    setSelectedCompany(company);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (!selectedCompany) return;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    
    setTimeout(() => {
      dispatch({ type: 'DELETE_COMPANY', payload: selectedCompany.id });
      
      toast({
        title: "Company Deleted",
        description: `${selectedCompany.name} has been removed from your companies`
      });
      
      setIsDeleteDialogOpen(false);
      setSelectedCompany(null);
      dispatch({ type: 'SET_LOADING', payload: false });
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.contact_number) {
      toast({
        title: "Missing Information",
        description: "Name and contact number are required",
        variant: "destructive"
      });
      return;
    }
    
    dispatch({ type: 'SET_LOADING', payload: true });
    
    setTimeout(() => {
      if (isEditing) {
        const existingCompany = state.companies.find(c => c.id === formData.id);
        if (!existingCompany) {
          toast({
            title: "Error",
            description: "Company not found",
            variant: "destructive"
          });
          dispatch({ type: 'SET_LOADING', payload: false });
          return;
        }
        
        const updatedCompany = {
          ...existingCompany,
          name: formData.name,
          contact_number: formData.contact_number,
          address: formData.address,
          updated_at: new Date(),
          updated_by: state.currentUser?.id || 'system'
        };
        
        dispatch({ type: 'UPDATE_COMPANY', payload: updatedCompany });
        
        toast({
          title: "Company Updated",
          description: `${formData.name}'s information has been updated`
        });
      } else {
        const newCompany = {
          id: generateId('company'),
          name: formData.name,
          contact_number: formData.contact_number,
          address: formData.address,
          balance: 0,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: state.currentUser?.id || 'system',
          updated_by: state.currentUser?.id || 'system',
          history: []
        };
        
        dispatch({ type: 'ADD_COMPANY', payload: newCompany });
        
        toast({
          title: "Company Added",
          description: `${formData.name} has been added to your companies`
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
          <h1 className="text-2xl font-bold">Companies</h1>
          <p className="text-gray-500">Manage your company database</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search companies"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full sm:w-[250px]"
            />
          </div>
          
          <Button onClick={() => handleOpenForm()} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Add Company
          </Button>
        </div>
      </div>
      
      {companies.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className="text-xl font-medium text-gray-400 mb-4">No companies found</p>
            {searchQuery ? (
              <p className="text-gray-500">Try using different search terms</p>
            ) : (
              <Button onClick={() => handleOpenForm()} className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Company
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
                <TableHead>Contact Number</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => (
                <TableRow key={company.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">{company.name}</TableCell>
                  <TableCell>{company.contact_number}</TableCell>
                  <TableCell>{company.address || 'Not provided'}</TableCell>
                  <TableCell className="font-bold text-primary">
                    {new Intl.NumberFormat('en-US', { 
                      style: 'currency', 
                      currency: 'PKR',
                      currencyDisplay: 'narrowSymbol'
                    }).format(calculateCompanyBalance(company.id))}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleViewCompany(company)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleOpenForm(company)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleConfirmDelete(company)} 
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

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Company' : 'Add New Company'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter company name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contact">Contact Number</Label>
              <Input
                id="contact"
                value={formData.contact_number}
                onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
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
                placeholder="Enter company address"
                rows={3}
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
                  isEditing ? 'Update Company' : 'Add Company'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Company Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Company Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {selectedCompany && (
              <>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Name</h3>
                    <p className="font-semibold">{selectedCompany.name}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Contact Number</h3>
                    <p>{selectedCompany.contact_number}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Address</h3>
                    <p>{selectedCompany.address || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Balance</h3>
                    <p className="font-bold text-primary">
                      {new Intl.NumberFormat('en-US', { 
                        style: 'currency', 
                        currency: 'PKR',
                        currencyDisplay: 'narrowSymbol'
                      }).format(calculateCompanyBalance(selectedCompany.id))}
                    </p>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsDetailOpen(false);
                      setTimeout(() => setIsHistoryOpen(true), 100);
                    }}
                    className="w-full"
                  >
                    View Transaction History
                  </Button>
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
            <DialogTitle className="text-red-500">Delete Company</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Are you sure you want to delete <strong>{selectedCompany?.name}</strong>?</p>
            <p className="text-sm text-gray-500">
              This will permanently remove the company and all their associated data.
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
                  'Delete Company'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* History Dialog */}
      {selectedCompany && (
        <HistoryDialog
          isOpen={isHistoryOpen}
          setIsOpen={setIsHistoryOpen}
          history={selectedCompany.history}
          title={`Company: ${selectedCompany.name}`}
        />
      )}
    </div>
  );
};

export default CompaniesPage;
