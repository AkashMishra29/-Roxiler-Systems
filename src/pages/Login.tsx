import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, BarChart3, Users, Store, Package } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LoginForm {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { user, login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.email, data.password);
    } catch (error) {
      // Error is handled by the AuthContext
    }
  };

  const demoAccounts = [
    { role: 'Admin', email: 'admin@admin.com', password: 'admin123', color: 'bg-red-500' },
    { role: 'Store Owner', email: 'owner@store.com', password: 'owner123', color: 'bg-blue-500' },
    { role: 'User', email: 'user@user.com', password: 'user123', color: 'bg-green-500' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left side - Login Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <div className="flex items-center">
              <BarChart3 className="h-12 w-12 text-blue-600" />
              <h1 className="ml-3 text-2xl font-bold text-gray-900">Store Manager</h1>
            </div>
            <h2 className="mt-8 text-2xl font-bold leading-9 tracking-tight text-gray-900">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Manage your stores and products with ease
            </p>
          </div>

          <div className="mt-10">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                  Password
                </label>
                <div className="mt-2 relative">
                  <input
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                    })}
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className="block w-full rounded-md border-0 py-1.5 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>
            </form>

            {/* Demo Accounts */}
            <div className="mt-10">
              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm font-medium leading-6">
                  <span className="bg-white px-6 text-gray-900">Demo Accounts</span>
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                {demoAccounts.map((account) => (
                  <button
                    key={account.role}
                    type="button"
                    onClick={() => handleSubmit((data) => login(account.email, account.password))()}
                    className="flex items-center justify-between w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <div className="flex items-center">
                      <div className={`h-3 w-3 rounded-full ${account.color} mr-3`}></div>
                      <span>{account.role}</span>
                    </div>
                    <span className="text-xs text-gray-500">{account.email}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Features */}
      <div className="relative hidden w-0 flex-1 lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="relative h-full flex flex-col justify-center items-center text-white px-12">
            <div className="max-w-md text-center">
              <h2 className="text-3xl font-bold mb-8">Powerful Store Management</h2>
              <div className="space-y-6">
                <div className="flex items-center text-left">
                  <Users className="h-8 w-8 mr-4 text-blue-200" />
                  <div>
                    <h3 className="font-semibold">User Management</h3>
                    <p className="text-sm text-blue-100">Manage different user roles and permissions</p>
                  </div>
                </div>
                <div className="flex items-center text-left">
                  <Store className="h-8 w-8 mr-4 text-blue-200" />
                  <div>
                    <h3 className="font-semibold">Store Operations</h3>
                    <p className="text-sm text-blue-100">Complete store management and analytics</p>
                  </div>
                </div>
                <div className="flex items-center text-left">
                  <Package className="h-8 w-8 mr-4 text-blue-200" />
                  <div>
                    <h3 className="font-semibold">Product Control</h3>
                    <p className="text-sm text-blue-100">Inventory tracking and product management</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;