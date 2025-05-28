
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import HistoryTimeline from '@/components/history/HistoryTimeline';

const SettingsPage: React.FC = () => {
  const { state, dispatch, addHistoryEntry } = useApp();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    shop_name: state.settings.shop_name,
    shop_address: 'Near MCB bank Gaari khata, station road Hyderabad',
    admin_phone: '022-2783373',
    last_bill_serial: state.settings.last_bill_serial
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSaveSettings = () => {
    if (!formData.shop_name || !formData.shop_address || !formData.admin_phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    // Parse bill serial to number
    const lastBillSerial = parseInt(formData.last_bill_serial.toString());
    if (isNaN(lastBillSerial)) {
      toast({
        title: "Invalid Bill Serial",
        description: "Bill serial must be a valid number",
        variant: "destructive"
      });
      return;
    }
    
    dispatch({ type: 'SET_LOADING', payload: true });
    
    // Simulate loading
    setTimeout(() => {
      // Create updated settings
      const updatedSettings = {
        ...state.settings,
        shop_name: formData.shop_name,
        shop_address: formData.shop_address,
        admin_phone: formData.admin_phone,
        last_bill_serial: lastBillSerial,
        updated_at: new Date(),
        updated_by: state.currentUser?.id || 'system'
      };
      
      // Add history entry
      addHistoryEntry(
        updatedSettings,
        'updated',
        state.currentUser?.id || 'system',
        state.currentUser?.name || 'System',
        'Shop settings updated',
        {
          shop_name: state.settings.shop_name,
          shop_address: state.settings.shop_address,
          admin_phone: state.settings.admin_phone,
          last_bill_serial: state.settings.last_bill_serial
        },
        {
          shop_name: formData.shop_name,
          shop_address: formData.shop_address,
          admin_phone: formData.admin_phone,
          last_bill_serial: lastBillSerial
        }
      );
      
      dispatch({ type: 'UPDATE_SETTINGS', payload: updatedSettings });
      
      toast({
        title: "Settings Updated",
        description: "Shop settings have been updated successfully"
      });
      
      dispatch({ type: 'SET_LOADING', payload: false });
    }, 1000);
  };
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-left">Settings</h1>
        <p className="text-gray-500 text-left">Manage your shop settings and account</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Shop Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="shop_name">Shop Name</Label>
                <Input
                  id="shop_name"
                  name="shop_name"
                  value={formData.shop_name}
                  onChange={handleChange}
                  placeholder="Enter shop name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="shop_address">Shop Address</Label>
                <Input
                  id="shop_address"
                  name="shop_address"
                  value={formData.shop_address}
                  onChange={handleChange}
                  placeholder="Enter shop address"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="admin_phone">Admin Phone Number</Label>
                <Input
                  id="admin_phone"
                  name="admin_phone"
                  value={formData.admin_phone}
                  onChange={handleChange}
                  placeholder="022-2783373"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="last_bill_serial">Last Bill Serial Number</Label>
                <Input
                  id="last_bill_serial"
                  name="last_bill_serial"
                  type="number"
                  value={formData.last_bill_serial}
                  onChange={handleChange}
                  placeholder="Enter last bill serial number"
                />
                <p className="text-sm text-gray-500">
                  Next bill number will be AMR-{parseInt(formData.last_bill_serial.toString()) + 1}
                </p>
              </div>
              
              <div className="pt-4">
                <Button 
                  onClick={handleSaveSettings}
                  className="bg-primary hover:bg-primary/90"
                  disabled={state.isLoading}
                >
                  {state.isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    'Save Settings'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Settings History</CardTitle>
            </CardHeader>
            <CardContent>
              <HistoryTimeline history={state.settings.history} />
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="font-semibold">{state.currentUser?.name}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p>{state.currentUser?.email}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Role</p>
                <p>{state.currentUser?.role}</p>
              </div>
              
              <Separator />
              
              <Button variant="outline" className="w-full">
                Edit Profile
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Database Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div>
                  <p className="text-sm font-medium text-gray-500">Users</p>
                  <p className="font-semibold">{state.users.length}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Customers</p>
                  <p className="font-semibold">{state.customers.length}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Companies</p>
                  <p className="font-semibold">{state.companies.length}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Transactions</p>
                  <p className="font-semibold">
                    {state.customerTransactions.length + state.companyTransactions.length}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Bills</p>
                  <p className="font-semibold">{state.bills.length}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Products</p>
                  <p className="font-semibold">{state.products.length}</p>
                </div>
              </div>
              
              <div className="pt-2">
                <p className="text-xs text-gray-500">
                  Note: In this prototype, data is stored in memory and will be reset on page refresh.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
