
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, DollarSign, Users, Building, ShoppingCart } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, getYear, getMonth } from 'date-fns';

const SalesPage: React.FC = () => {
  const { state } = useApp();
  const [filterType, setFilterType] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Get all transactions
  const allTransactions = [
    ...state.customerTransactions,
    ...state.companyTransactions
  ];

  // Get available years with data
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    allTransactions.forEach(transaction => {
      years.add(getYear(new Date(transaction.date)));
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [allTransactions]);

  // Get months for current year
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Filter transactions based on selected filter
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    
    return allTransactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      
      switch (filterType) {
        case 'daily':
          return format(transactionDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');
        case 'weekly':
          return transactionDate >= startOfWeek(now) && transactionDate <= endOfWeek(now);
        case 'monthly':
          if (selectedMonth !== null) {
            return getYear(transactionDate) === selectedYear && getMonth(transactionDate) === selectedMonth;
          }
          return transactionDate >= startOfMonth(now) && transactionDate <= endOfMonth(now);
        case 'yearly':
          return getYear(transactionDate) === selectedYear;
        default:
          return true;
      }
    });
  }, [allTransactions, filterType, selectedMonth, selectedYear]);

  // Calculate statistics
  const totalRevenue = filteredTransactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalCustomers = new Set(
    filteredTransactions
      .filter(t => 'customer_id' in t)
      .map(t => (t as any).customer_id)
  ).size;

  const totalCompanies = new Set(
    filteredTransactions
      .filter(t => 'company_id' in t)
      .map(t => (t as any).company_id)
  ).size;

  // Chart data
  const chartData = useMemo(() => {
    const dataMap = new Map<string, { date: string; revenue: number; expenses: number }>();
    
    filteredTransactions.forEach(transaction => {
      let key: string;
      if (filterType === 'daily') {
        key = format(new Date(transaction.date), 'HH:mm');
      } else if (filterType === 'weekly') {
        key = format(new Date(transaction.date), 'EEE');
      } else if (filterType === 'monthly') {
        key = format(new Date(transaction.date), 'dd');
      } else {
        key = format(new Date(transaction.date), 'MMM');
      }

      if (!dataMap.has(key)) {
        dataMap.set(key, { date: key, revenue: 0, expenses: 0 });
      }

      const data = dataMap.get(key)!;
      if (transaction.type === 'credit') {
        data.revenue += transaction.amount;
      } else {
        data.expenses += transaction.amount;
      }
    });

    return Array.from(dataMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredTransactions, filterType]);

  const handleFilterChange = (type: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
    setFilterType(type);
    setSelectedMonth(null);
    if (type === 'yearly' && availableYears.length > 0) {
      setSelectedYear(availableYears[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Sales Analytics</h1>
        <p className="text-gray-600 mt-2">Track your business performance</p>
      </div>

      {/* Filter Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Main Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((type) => (
                <Button
                  key={type}
                  variant={filterType === type ? 'default' : 'outline'}
                  onClick={() => handleFilterChange(type)}
                  className="capitalize"
                >
                  {type}
                </Button>
              ))}
            </div>

            {/* Month Selection for Monthly Filter */}
            {filterType === 'monthly' && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Select Month ({selectedYear}):</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {monthNames.map((month, index) => (
                    <Button
                      key={month}
                      variant={selectedMonth === index ? 'default' : 'outline'}
                      onClick={() => setSelectedMonth(index)}
                      className="text-xs px-2 py-1 h-auto"
                    >
                      {month.slice(0, 3)}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Year Selection for Yearly Filter */}
            {filterType === 'yearly' && availableYears.length > 1 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Select Year:</p>
                <div className="flex flex-wrap gap-2">
                  {availableYears.map((year) => (
                    <Button
                      key={year}
                      variant={selectedYear === year ? 'default' : 'outline'}
                      onClick={() => setSelectedYear(year)}
                      className="text-sm"
                    >
                      {year}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  PKR {totalRevenue.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">
                  PKR {totalExpenses.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Customers</p>
                <p className="text-2xl font-bold text-blue-600">{totalCustomers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Companies</p>
                <p className="text-2xl font-bold text-purple-600">{totalCompanies}</p>
              </div>
              <Building className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue vs Expenses Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue vs Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    `PKR ${Number(value).toLocaleString()}`,
                    name === 'revenue' ? 'Revenue' : 'Expenses'
                  ]}
                />
                <Bar dataKey="revenue" fill="#22c55e" name="revenue" />
                <Bar dataKey="expenses" fill="#ef4444" name="expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Sales Growth Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Growth Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`PKR ${Number(value).toLocaleString()}`, 'Revenue']}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#22c55e" 
                  strokeWidth={3}
                  dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <ShoppingCart className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-lg font-semibold text-green-600">
                {filteredTransactions.filter(t => t.type === 'credit').length}
              </p>
              <p className="text-sm text-gray-600">Credit Transactions</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <p className="text-lg font-semibold text-red-600">
                {filteredTransactions.filter(t => t.type === 'debit').length}
              </p>
              <p className="text-sm text-gray-600">Debit Transactions</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-lg font-semibold text-blue-600">
                PKR {(totalRevenue - totalExpenses).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Net Profit</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesPage;
