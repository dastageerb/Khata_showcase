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
    <div className="space-y-6 overflow-x-auto">
      <div className="min-w-[1200px]">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Transactions</h1>
            <p className="text-gray-500">View and manage all financial transactions</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search transactions"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full sm:w-[250px]"
              />
            </div>
            
            <Button onClick={handleExportData} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4 w-full sm:w-auto">
            <TabsTrigger value="all">All Transactions</TabsTrigger>
            <TabsTrigger value="customer">Customer</TabsTrigger>
            <TabsTrigger value="company">Company</TabsTrigger>
          </TabsList>
          
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
          <p className="text-xl font-medium text-gray-400 mb-4">No transactions found</p>
          <p className="text-gray-500">Try adjusting your search criteria</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <div className="overflow-x-auto">
        <div className="min-w-[1400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Payment Mode</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Bill ID</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => {
                const entityName = getEntityName(transaction);
                const entityType = getEntityType(transaction);
                
                return (
                  <TableRow key={transaction.id} className="hover:bg-muted/50">
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(transaction.date), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{entityName}</span>
                        <span className={`text-xs px-2 py-1 rounded w-fit ${
                          entityType === 'Customer' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {entityType}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        transaction.type === 'credit' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.type === 'credit' ? '+' : '-'} {transaction.type.toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="font-medium truncate">{transaction.purchase_description || 'No description'}</p>
                        {transaction.additional_notes && (
                          <p className="text-sm text-gray-500 mt-1 truncate">{transaction.additional_notes}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{transaction.quantity}</TableCell>
                    <TableCell className="whitespace-nowrap">{transaction.payment_mode}</TableCell>
                    <TableCell className={`font-bold whitespace-nowrap ${
                      transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'credit' ? '+' : '-'}{new Intl.NumberFormat('en-US', { 
                        style: 'currency', 
                        currency: 'PKR',
                        currencyDisplay: 'narrowSymbol'
                      }).format(transaction.amount)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{transaction.bill_id}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(transaction.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-gray-500">
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
