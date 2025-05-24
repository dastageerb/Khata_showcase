
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Users, Building2, Receipt, TrendingUp, ArrowUpIcon, ArrowDownIcon } from 'lucide-react';
import { format } from 'date-fns';

const Homepage: React.FC = () => {
  const { state, dispatch, generateId, addHistoryEntry } = useApp();
  const { toast } = useToast();

  // Calculate totals
  const totalCustomers = state.customers.length;
  const totalCompanies = state.companies.length;
  const totalBills = state.bills.length;

  // Calculate total revenue from bills
  const totalRevenue = state.bills.reduce((sum, bill) => sum + bill.total_amount, 0);

  // Recent transactions (latest 5)
  const allTransactions = [...state.customerTransactions, ...state.companyTransactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Recent bills (latest 5)
  const recentBills = state.bills
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const getEntityName = (transaction: any) => {
    if (transaction.customer_id) {
      const customer = state.customers.find(c => c.id === transaction.customer_id);
      return customer?.name || 'Unknown Customer';
    } else if (transaction.company_id) {
      const company = state.companies.find(c => c.id === transaction.company_id);
      return company?.name || 'Unknown Company';
    }
    return 'Unknown';
  };

  const handleQuickAction = (action: string) => {
    console.log(`Quick action: ${action}`);
    
    if (action === 'add-customer-transaction') {
      const sampleTransaction = {
        id: generateId('ct'),
        customer_id: state.customers[0]?.id || 'sample',
        date: new Date(),
        quantity: 1,
        payment_mode: "Cash",
        bill_id: generateId('bill'),
        purchase_description: "Quick transaction",
        additional_notes: "Added from dashboard",
        amount: 1000,
        type: 'credit' as 'credit',
        created_by: state.currentUser?.id || 'system',
        created_at: new Date(),
        updated_at: new Date(),
        updated_by: state.currentUser?.id || 'system',
        history: []
      };

      addHistoryEntry(
        sampleTransaction,
        'created',
        state.currentUser?.id || 'system',
        state.currentUser?.name || 'System',
        'Quick transaction added from dashboard'
      );

      dispatch({ type: 'ADD_CUSTOMER_TRANSACTION', payload: sampleTransaction });
      
      toast({
        title: "Transaction Added",
        description: "Sample customer transaction added successfully",
      });
    } else if (action === 'add-company-transaction') {
      const sampleTransaction = {
        id: generateId('comt'),
        company_id: state.companies[0]?.id || 'sample',
        date: new Date(),
        quantity: 1,
        payment_mode: "Bank Transfer",
        bill_id: generateId('bill'),
        purchase_description: "Quick company transaction",
        additional_notes: "Added from dashboard",
        amount: 2000,
        type: 'debit' as 'debit',
        created_by: state.currentUser?.id || 'system',
        created_at: new Date(),
        updated_at: new Date(),
        updated_by: state.currentUser?.id || 'system',
        history: []
      };

      addHistoryEntry(
        sampleTransaction,
        'created',
        state.currentUser?.id || 'system',
        state.currentUser?.name || 'System',
        'Quick company transaction added from dashboard'
      );

      dispatch({ type: 'ADD_COMPANY_TRANSACTION', payload: sampleTransaction });
      
      toast({
        title: "Transaction Added",
        description: "Sample company transaction added successfully",
      });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500">Welcome to Al Mehran Radiator Management System</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              Active customers in system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCompanies}</div>
            <p className="text-xs text-muted-foreground">
              Registered companies
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBills}</div>
            <p className="text-xs text-muted-foreground">
              Bills generated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('en-US', { 
                style: 'currency', 
                currency: 'PKR',
                currencyDisplay: 'narrowSymbol'
              }).format(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              From all bills
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {allTransactions.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No recent transactions</p>
              ) : (
                allTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'credit' ? 'bg-green-200' : 'bg-red-200'
                      }`}>
                        {transaction.type === 'credit' ? (
                          <ArrowUpIcon className="h-4 w-4 text-green-600" />
                        ) : (
                          <ArrowDownIcon className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{getEntityName(transaction)}</p>
                        <p className="text-sm text-gray-500">
                          {transaction.purchase_description || 'No description'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${
                        transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'credit' ? '+' : '-'}{new Intl.NumberFormat('en-US', { 
                          style: 'currency', 
                          currency: 'PKR',
                          currencyDisplay: 'narrowSymbol'
                        }).format(transaction.amount)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(transaction.date), 'MMM d')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Bills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBills.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No recent bills</p>
              ) : (
                recentBills.map((bill) => (
                  <div key={bill.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{bill.serial_no}</p>
                      <p className="text-sm text-gray-500">{bill.customer_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">
                        {new Intl.NumberFormat('en-US', { 
                          style: 'currency', 
                          currency: 'PKR',
                          currencyDisplay: 'narrowSymbol'
                        }).format(bill.total_amount)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(bill.date), 'MMM d')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col space-y-2"
              onClick={() => handleQuickAction('add-customer-transaction')}
            >
              <ArrowUpIcon className="h-5 w-5 text-green-600" />
              <span className="text-xs">Add Customer Credit</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col space-y-2"
              onClick={() => handleQuickAction('add-company-transaction')}
            >
              <ArrowDownIcon className="h-5 w-5 text-red-600" />
              <span className="text-xs">Add Company Debit</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col space-y-2"
              onClick={() => window.location.href = '/bill'}
            >
              <Receipt className="h-5 w-5" />
              <span className="text-xs">Create Bill</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col space-y-2"
              onClick={() => window.location.href = '/settings'}
            >
              <TrendingUp className="h-5 w-5" />
              <span className="text-xs">View Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Homepage;
