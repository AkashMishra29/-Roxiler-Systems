import React from 'react';
import { User, Mail, Shield, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Profile: React.FC = () => {
  const { user } = useAuth();

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'store_owner':
        return 'bg-blue-100 text-blue-800';
      case 'user':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Full system access with user and store management capabilities';
      case 'store_owner':
        return 'Manage your own stores and products with comprehensive analytics';
      case 'user':
        return 'Browse stores and products with basic user functionality';
      default:
        return 'Standard user access';
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-500">Manage your account information and settings</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8">
          <div className="flex items-center">
            <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center">
              <User className="h-10 w-10 text-white" />
            </div>
            <div className="ml-6">
              <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
              <p className="text-blue-100">{user?.email}</p>
            </div>
          </div>
        </div>
        
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="flex items-center px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                  <User className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-900">{user?.name}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="flex items-center px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                  <Mail className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-900">{user?.email}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <div className="flex items-center px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                  <Shield className="h-5 w-5 text-gray-400 mr-3" />
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user?.role || '')}`}>
                    {user?.role?.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Status
                </label>
                <div className="flex items-center px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    ACTIVE
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Role Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Role Permissions</h3>
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="flex">
            <Shield className="h-5 w-5 text-blue-400 mt-0.5" />
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-800 capitalize">
                {user?.role?.replace('_', ' ')} Access
              </h4>
              <p className="mt-1 text-sm text-blue-700">
                {getRoleDescription(user?.role || '')}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Available Features:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {user?.role === 'admin' && (
              <>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  User Management
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  Store Management
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  Product Management
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  System Analytics
                </div>
              </>
            )}
            {user?.role === 'store_owner' && (
              <>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  Own Store Management
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  Product Management
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  Inventory Tracking
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  Store Analytics
                </div>
              </>
            )}
            {user?.role === 'user' && (
              <>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  Browse Stores
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  View Products
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  Dashboard Access
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  Profile Management
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Security</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-900">Password</p>
              <p className="text-sm text-gray-500">Last updated recently</p>
            </div>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Change Password
            </button>
          </div>
          
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
              <p className="text-sm text-gray-500">Add an extra layer of security</p>
            </div>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Enable 2FA
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;