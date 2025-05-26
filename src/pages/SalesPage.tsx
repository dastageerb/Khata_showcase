
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useApp } from '@/context/AppContext';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, subWeeks, subMonths, subYears } from 'date-fns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const SalesPage: React.FC = () => {
  const { state } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState('daily');
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const currentYear = new Date().getFullYear();
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    state.bills.forEach(bill => {
      years.add(new Date(bill.date).getFullYear());
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [state.bills]);

  const getFilteredBills = () => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    if (selectedPeriod === 'monthly' && selectedMonth !== null) {
      const year = selectedYear || currentYear;
      startDate = startOfMonth(new Date(year, selectedMonth, 1));
      endDate = endOfMonth(new Date(year, selectedMonth, 1));
    } else if (selectedPeriod === 'yearly' && selectedYear !== null) {
      startDate = startOfYear(new Date(selectedYear, 0, 1));
      endDate = endOfYear(new Date(selectedYear, 0, 1));
    } else {
      switch (selectedPeriod) {
        case 'daily':
          startDate = startOfDay(now);
          endDate = endOfDay(now);
          break;
        case 'weekly':
          startDate = startOfWeek(now);
          endDate = endOfWeek(now);
          break;
        case 'monthly':
          startDate = startOfMonth(now);
          endDate = endOfMonth(now);
          break;
        case 'yearly':
          startDate = startOfYear(now);
          endDate = endOfYear(now);
          break;
        default:
          startDate = startOfDay(now);
          endDate = endOfDay(now);
      }
    }

    return state.bills.filter(bill => {
      const billDate = new Date(bill.date);
      return billDate >= startDate && billDate <= endDate;
    });
  };

  const filteredBills = getFilteredBills();

  const salesData = useMemo(() => {
    const data: { [key: string]: number } = {};
    
    filteredBills.forEach(bill => {
      const dateKey = format(new Date(bill.date), selectedPeriod === 'daily' ? 'HH:mm' : 'MMM dd');
      data[dateKey] = (data[dateKey] || 0) + bill.total_amount;
    });

    return Object.entries(data).map(([date, amount]) => ({
      date,
      amount,
    }));
  }, [filteredBills, selectedPeriod]);

  const topProducts = useMemo(() => {
    const productSales: { [key: string]: number } = {};
    
    filteredBills.forEach(bill => {
      const billItems = state.billItems.filter(item => item.bill_id === bill.id);
      billItems.forEach(item => {
        productSales[item.product_name] = (productSales[item.product_name] || 0) + item.amount;
      });
    });

    return Object.entries(productSales)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [filteredBills, state.billItems]);

  const totalSales = filteredBills.reduce((sum, bill) => sum + bill.total_amount, 0);
  const totalBills = filteredBills.length;
  const averageSale = totalBills > 0 ? totalSales / totalBills : 0;

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Sales Analytics</h1>
          <p className="text-gray-600">Track your sales performance and trends</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="space-y-4">
        <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Month Selection for Monthly View */}
        {selectedPeriod === 'monthly' && (
          <div className="flex flex-wrap gap-2">
            {months.map((month, index) => (
              <Button
                key={month}
                variant={selectedMonth === index ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedMonth(selectedMonth === index ? null : index)}
              >
                {month}
              </Button>
            ))}
          </div>
        )}

        {/* Year Selection for Yearly View */}
        {selectedPeriod === 'yearly' && (
          <div className="flex flex-wrap gap-2">
            {availableYears.map((year) => (
              <Button
                key={year}
                variant={selectedYear === year ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedYear(selectedYear === year ? null : year)}
              >
                {year}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs {totalSales.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBills}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Sale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs {averageSale.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sales Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`Rs ${value}`, 'Sales']} />
                <Bar dataKey="amount" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={topProducts}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {topProducts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`Rs ${value}`, 'Sales']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SalesPage;
