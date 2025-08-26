import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Store, Package, TrendingUp, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useApi } from '../hooks/useApi';

interface DashboardStats {
  totalUsers?: number;
  totalStores?: number;
  totalProducts?: number;
  activeStores?: number;
  totalStock?: number;
  totalValue?: number;
  availableStores?: number;
  availableProducts?: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { request } = useApi();
  const [stats, setStats] = useState<DashboardStats>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const data = await request('/api/dashboard/stats');
      setStats(data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatsCards = () => {
    if (user?.role === 'admin') {
      return [
        {
          name: 'Total Users',
          value: stats.totalUsers || 0,
          icon: Users,
          color: 'bg-blue-500',
          change: '+4.75%',
        },
        {
          name: 'Total Stores',
          value: stats.totalStores || 0,
          icon: Store,
          color: 'bg-green-500',
          change: '+12.5%',
        },
        {
          name: 'Total Products',
          value: stats.totalProducts || 0,
          icon: Package,
          color: 'bg-purple-500',
          change: '+8.2%',
        },
        {
          name: 'Active Stores',
          value: stats.activeStores || 0,
          icon: TrendingUp,
          color: 'bg-orange-500',
          change: '+2.1%',
        },
      ];
    } else if (user?.role === 'store_owner') {
      return [
        {
          name: 'My Stores',
          value: stats.totalStores || 0,
          icon: Store,
          color: 'bg-blue-500',
          change: '+0%',
        },
        {
          name: 'My Products',
          value: stats.totalProducts || 0,
          icon: Package,
          color: 'bg-green-500',
          change: '+5.2%',
        },
        {
          name: 'Total Stock',
          value: stats.totalStock || 0,
          icon: Activity,
          color: 'bg-purple-500',
          change: '+15.3%',
        },
        {
          name: 'Inventory Value',
          value: `$${(stats.totalValue || 0).toLocaleString()}`,
          icon: TrendingUp,
          color: 'bg-orange-500',
          change: '+8.7%',
        },
      ];
    } else {
      return [
        {
          name: 'Available Stores',
          value: stats.availableStores || 0,
          icon: Store,
          color: 'bg-blue-500',
          change: '+2.1%',
        },
        {
          name: 'Available Products',
          value: stats.availableProducts || 0,
          icon: Package,
          color: 'bg-green-500',
          change: '+8.2%',
        },
      ];
    }
  };

  const chartData = [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 600 },
    { name: 'Apr', value: 800 },
    { name: 'May', value: 500 },
    { name: 'Jun', value: 700 },
  ];

  const pieData = [
    { name: 'Electronics', value: 35, color: '#3B82F6' },
    { name: 'Clothing', value: 25, color: '#10B981' },
    { name: 'Books', value: 20, color: '#F59E0B' },
    { name: 'Home & Garden', value: 20, color: '#EF4444' },
  ];

  const statsCards = getStatsCards();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-500 capitalize">
          {user?.role?.replace('_', ' ')} Dashboard
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.name}
              className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6 sm:py-6"
            >
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${item.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">
                      {item.name}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {item.value}
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="absolute bottom-0 right-0 p-2">
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                  {item.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      {user?.role !== 'user' && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Bar Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Monthly Performance
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Category Distribution
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {[
            { action: 'New store created', time: '2 hours ago', type: 'store' },
            { action: 'Product inventory updated', time: '4 hours ago', type: 'product' },
            { action: 'User registered', time: '6 hours ago', type: 'user' },
            { action: 'Store status changed', time: '1 day ago', type: 'store' },
          ].map((activity, index) => (
            <div key={index} className="px-6 py-4 flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Activity className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                <p className="text-sm text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;