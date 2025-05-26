
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import { CalendarIcon, Receipt, DollarSign, ShoppingCart, Package } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { format, subDays, isAfter, isBefore } from 'date-fns';

const SalesPage: React.FC = () => {
  const { state } = useApp();
  const [timeFilter, setTimeFilter] = useState('Daily');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 7),
    to: new Date()
  });

  // Calculate sales data based on bills
  const filteredBills = state.bills.filter(bill => {
    const billDate = new Date(bill.date);
    return isAfter(billDate, dateRange.from) && isBefore(billDate, dateRange.to);
  });

  const totalRevenue = filteredBills.reduce((sum, bill) => sum + bill.total_amount, 0);
  const totalBills = filteredBills.length;
  const avgBillValue = totalBills > 0 ? totalRevenue / totalBills : 0;
  const totalItemsSold = state.billItems
    .filter(item => filteredBills.some(bill => bill.id === item.bill_id))
    .reduce((sum, item) => sum + item.quantity, 0);

  // Top selling products
  const productSales: Record<string, { quantity: number; revenue: number }> = {};
  
  state.billItems.forEach(item => {
    const bill = filteredBills.find(bill => bill.id === item.bill_id);
    if (bill) {
      if (!productSales[item.product_name]) {
        productSales[item.product_name] = { quantity: 0, revenue: 0 };
      }
      productSales[item.product_name].quantity += item.quantity;
      productSales[item.product_name].revenue += item.amount;
    }
  });

  const topProducts = Object.entries(productSales)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 4);

  // Daily sales data for chart
  const dailySalesData = [];
  for (let i = 6; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const dateKey = format(date, 'yyyy-MM-dd');
    const dayBills = state.bills.filter(bill => 
      format(new Date(bill.date), 'yyyy-MM-dd') === dateKey
    );
    const dayRevenue = dayBills.reduce((sum, bill) => sum + bill.total_amount, 0);
    
    dailySalesData.push({
      date: format(date, 'MMM dd'),
      sales: dayRevenue
    });
  }

  // Mock growth data (in real app, compare with previous period)
  const revenueGrowth = 15.2;
  const unitsSoldGrowth = 10.5;
  const newCustomers = 25;

  const handleTimeFilterChange = (filter: string) => {
    setTimeFilter(filter);
    const today = new Date();
    
    switch (filter) {
      case 'Daily':
        setDateRange({ from: subDays(today, 1), to: today });
        break;
      case 'Weekly':
        setDateRange({ from: subDays(today, 7), to: today });
        break;
      case 'Monthly':
        setDateRange({ from: subDays(today, 30), to: today });
        break;
      case 'Yearly':
        setDateRange({ from: subDays(today, 365), to: today });
        break;
      default:
        setDateRange({ from: subDays(today, 7), to: today });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Dashboard</h1>
          <p className="text-gray-600 mt-1">Track and analyze your sales performance.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {['Daily', 'Weekly', 'Monthly', 'Yearly'].map((filter) => (
              <Button
                key={filter}
                variant={timeFilter === filter ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleTimeFilterChange(filter)}
                className={`px-4 py-2 text-sm rounded-md transition-colors ${
                  timeFilter === filter
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                }`}
              >
                {filter}
              </Button>
            ))}
          </div>
          
          <Button variant="outline" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Select Date Range
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Overview Card */}
        <Card className="lg:row-span-2">
          <CardHeader>
            <CardTitle className="text-lg text-gray-700">Sales Overview</CardTitle>
            <p className="text-sm text-gray-500">Daily Sales</p>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4">
            <div className="relative w-32 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[{ value: 75 }, { value: 25 }]}
                    cx="50%"
                    cy="50%"
                    startAngle={90}
                    endAngle={450}
                    innerRadius={40}
                    outerRadius={60}
                    dataKey="value"
                  >
                    <Cell fill="#3B82F6" />
                    <Cell fill="#E5E7EB" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">
                Rs {totalRevenue.toLocaleString()}
              </p>
              <p className="text-gray-500">Total Sales</p>
            </div>
          </CardContent>
        </Card>

        {/* Key Statistics */}
        <div className="lg:col-span-2 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <Receipt className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500 mb-1">Total Bills</p>
              <p className="text-3xl font-bold text-gray-900">{totalBills}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">Rs {totalRevenue.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <ShoppingCart className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500 mb-1">Avg. Bill Value</p>
              <p className="text-2xl font-bold text-gray-900">Rs {avgBillValue.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Package className="h-8 w-8 text-orange-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500 mb-1">Items Sold</p>
              <p className="text-3xl font-bold text-gray-900">{totalItemsSold}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-gray-700">Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-sm font-medium text-gray-500 border-b pb-2">
                <span>PRODUCT NAME</span>
                <span className="text-center">UNITS SOLD</span>
                <span className="text-right">REVENUE</span>
              </div>
              
              {topProducts.map((product, index) => (
                <div key={product.name} className="grid grid-cols-3 gap-4 text-sm py-2">
                  <span className="text-gray-900 font-medium">{product.name}</span>
                  <span className="text-center text-gray-700">{product.quantity}</span>
                  <span className="text-right text-gray-900 font-medium">
                    Rs {product.revenue.toLocaleString()}
                  </span>
                </div>
              ))}
              
              {topProducts.length === 0 && (
                <p className="text-center text-gray-500 py-4">No sales data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sales Growth */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-gray-700">Sales Growth</CardTitle>
            <p className="text-sm text-gray-500">Compared to previous period</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Revenue Growth</span>
                <span className="text-sm font-medium text-green-600">+{revenueGrowth}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(revenueGrowth * 2, 100)}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Units Sold Growth</span>
                <span className="text-sm font-medium text-green-600">+{unitsSoldGrowth}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(unitsSoldGrowth * 2, 100)}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">New Customers</span>
                <span className="text-sm font-medium text-blue-600">+{newCustomers}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(newCustomers * 2, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SalesPage;
