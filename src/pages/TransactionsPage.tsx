
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApp } from '@/context/AppContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { Download, Search } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Transaction } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

const TransactionsPage: React.FC = () => {
  const { state } = useApp();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  useEffect(() => {
    // Combine customer and company transactions
    let allTransactions: Transaction[] = [];
    
    if (activeTab === 'all' || activeTab === 'customer') {
      allTransactions = [...allTransactions, ...state.customerTransactions];
    }
    
    if (activeTab === 'all' || activeTab === 'company') {
      allTransactions = [...allTransactions, ...state.companyTransactions];
    }
    
    // Apply search filter
    let filteredTransactions = allTransactions;
    
    if (searchQuery) {
      filteredTransactions = filteredTransactions.filter(transaction => {
        const matchesDescription = transaction.purchase_description
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());
        
        const matchesBillId = transaction.bill_id
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
          
        const matchesAmount = transaction.amount.toString().includes(searchQuery);
        
        let entityName = '';
        if ('customer_id' in transaction) {
          const customer = state.customers.find(c => c.id === transaction.customer_id);
          entityName = customer?.name || '';
        } else if ('company_id' in transaction) {
          const company = state.companies.find(c => c.id === transaction.company_id);
          entityName = company?.name || '';
        }
        
        const matchesEntityName = entityName.toLowerCase().includes(searchQuery.toLowerCase());
        
        return matchesDescription || matchesBillId || matchesAmount || matchesEntityName;
      });
    }
    
    // Sort by latest date
    filteredTransactions.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    setTransactions(filteredTransactions);
  }, [
    activeTab,
    searchQuery,
    state.customerTransactions,
    state.companyTransactions,
    state.customers,
    state.companies
  ]);

  const handleExportData = () => {
    const csvHeader = 'Date,Entity,Type,Description,Amount,Payment Mode,Bill ID,Created,Updated\n';
    
    const transactionsData = transactions.map(transaction => {
      let entityName = '';
      let entityType = '';
      
      if ('customer_id' in transaction) {
        const customer = state.customers.find(c => c.id === transaction.customer_id);
        entityName = customer?.name || 'Unknown Customer';
        entityType = 'Customer';
      } else if ('company_id' in transaction) {
        const company = state.companies.find(c => c.id === transaction.company_id);
        entityName = company?.name || 'Unknown Company';
        entityType = 'Company';
      }
      
      return {
        'Date': format(new Date(transaction.date), 'yyyy-MM-dd'),
        'Entity': `${entityName} (${entityType})`,
        'Type': transaction.type.toUpperCase(),
        'Description': transaction.purchase_description || '',
        'Amount': transaction.amount,
        'Payment Mode': transaction.payment_mode,
        'Bill ID': transaction.bill_id,
        'Quantity': transaction.quantity,
        'Additional Notes': transaction.additional_notes || '',
        'Created': format(new Date(transaction.created_at), 'yyyy-MM-dd HH:mm'),
        'Updated': format(new Date(transaction.updated_at), 'yyyy-MM-dd HH:mm')
      };
    });

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(transactionsData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
    
    // Download the file
    XLSX.writeFile(workbook, `transactions-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    
    toast({
      title: "Export Complete",
      description: `${transactions.length} transactions exported successfully`,
    });
  };

  const getEntityName = (transaction: Transaction): string => {
    if ('customer_id' in transaction) {
      const customer = state.customers.find(c => c.id === transaction.customer_id);
      return customer?.name || 'Unknown Customer';
    } else if ('company_id' in transaction) {
      const company = state.companies.find(c => c.id === transaction.company_id);
      return company?.name || 'Unknown Company';
    }
    return 'Unknown Entity';
  };

  const getEntityType = (transaction: Transaction): string => {
    if ('customer_id' in transaction) {
      return 'Customer';
    } else if ('company_id' in transaction) {
      return 'Company';
    }
    return 'Unknown';
  };

  return (
    <div className="w-full min-h-screen overflow-x-auto">
      <div className="min-w-[320px] space-y-4 p-2 sm:p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold">Transactions</h1>
            <p className="text-gray-500 text-xs">View and manage all financial transactions</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
              <Input
                placeholder="Search transactions"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-full sm:w-[200px] text-xs h-8"
              />
            </div>
            
            <Button onClick={handleExportData} variant="outline" className="text-xs h-8 whitespace-nowrap">
              <Download className="h-3 w-3 mr-1" />
              Export Excel
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <div className="w-full overflow-x-auto">
            <TabsList className="grid grid-cols-3 mb-4 w-full sm:w-auto min-w-[300px]">
              <TabsTrigger value="all" className="text-xs">All Transactions</TabsTrigger>
              <TabsTrigger value="customer" className="text-xs">Customer</TabsTrigger>
              <TabsTrigger value="company" className="text-xs">Company</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="all" className="mt-0">
            <TransactionsList 
              transactions={transactions} 
              getEntityName={getEntityName}
              getEntityType={getEntityType}
            />
          </TabsContent>
          
          <TabsContent value="customer" className="mt-0">
            <TransactionsList 
              transactions={transactions} 
              getEntityName={getEntityName}
              getEntityType={getEntityType}
            />
          </TabsContent>
          
          <TabsContent value="company" className="mt-0">
            <TransactionsList 
              transactions={transactions} 
              getEntityName={getEntityName}
              getEntityType={getEntityType}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Helper component for transaction list table
interface TransactionsListProps {
  transactions: Transaction[];
  getEntityName: (transaction: Transaction) => string;
  getEntityType: (transaction: Transaction) => string;
}

const TransactionsList: React.FC<TransactionsListProps> = ({ 
  transactions, 
  getEntityName, 
  getEntityType
}) => {
  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <p className="text-lg font-medium text-gray-400 mb-4">No transactions found</p>
          <p className="text-gray-500 text-xs">Try adjusting your search criteria</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <div className="w-full overflow-x-auto">
        <div className="min-w-[1400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs min-w-[100px] sticky left-0 bg-white z-10 border-r">Date</TableHead>
                <TableHead className="text-xs min-w-[150px]">Entity</TableHead>
                <TableHead className="text-xs min-w-[80px]">Type</TableHead>
                <TableHead className="text-xs min-w-[180px]">Description</TableHead>
                <TableHead className="text-xs min-w-[80px]">Quantity</TableHead>
                <TableHead className="text-xs min-w-[120px]">Payment Mode</TableHead>
                <TableHead className="text-xs min-w-[120px]">Amount</TableHead>
                <TableHead className="text-xs min-w-[120px]">Bill ID</TableHead>
                <TableHead className="text-xs min-w-[100px]">Created</TableHead>
                <TableHead className="text-xs min-w-[100px] sticky right-0 bg-white z-10 border-l">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => {
                const entityName = getEntityName(transaction);
                const entityType = getEntityType(transaction);
                
                return (
                  <TableRow key={transaction.id} className="hover:bg-muted/50">
                    <TableCell className="whitespace-nowrap text-xs sticky left-0 bg-white z-10 border-r">
                      {format(new Date(transaction.date), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="flex flex-col">
                        <span className="font-medium whitespace-nowrap">{entityName}</span>
                        <span className={`text-xs px-1 py-0.5 rounded w-fit ${
                          entityType === 'Customer' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {entityType}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      <span className={`inline-flex items-center px-1 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                        transaction.type === 'credit' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.type === 'credit' ? '+' : '-'} {transaction.type.toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="max-w-[160px]">
                        <p className="font-medium truncate">{transaction.purchase_description || 'No description'}</p>
                        {transaction.additional_notes && (
                          <p className="text-xs text-gray-500 mt-1 truncate">{transaction.additional_notes}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs whitespace-nowrap">{transaction.quantity}</TableCell>
                    <TableCell className="whitespace-nowrap text-xs">{transaction.payment_mode}</TableCell>
                    <TableCell className={`font-bold whitespace-nowrap text-xs ${
                      transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'credit' ? '+' : '-'}{new Intl.NumberFormat('en-US', { 
                        style: 'currency', 
                        currency: 'PKR',
                        currencyDisplay: 'narrowSymbol'
                      }).format(transaction.amount)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs">{transaction.bill_id}</TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-gray-500">
                      {format(new Date(transaction.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-gray-500 sticky right-0 bg-white z-10 border-l">
                      {format(new Date(transaction.updated_at), 'MMM d, yyyy')}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  );
};

export default TransactionsPage;
