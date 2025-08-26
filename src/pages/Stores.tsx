import React, { useEffect, useState } from 'react';
import { Plus, Store as StoreIcon, Edit2, Trash2, Search } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../contexts/AuthContext';

interface Store {
  id: string;
  name: string;
  description: string;
  category: string;
  ownerId: string;
  status: string;
  createdAt: string;
}

interface StoreForm {
  name: string;
  description: string;
  category: string;
  status: string;
}

const Stores: React.FC = () => {
  const { user } = useAuth();
  const { request, loading } = useApi();
  const [stores, setStores] = useState<Store[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StoreForm>();

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      const data = await request('/api/stores');
      setStores(data);
    } catch (error) {
      console.error('Failed to load stores:', error);
    }
  };

  const onSubmit = async (data: StoreForm) => {
    try {
      if (editingStore) {
        await request(`/api/stores/${editingStore.id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        }, {
          showSuccessToast: true
        });
      } else {
        await request('/api/stores', {
          method: 'POST',
          body: JSON.stringify(data),
        }, {
          showSuccessToast: true
        });
      }
      
      await loadStores();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save store:', error);
    }
  };

  const deleteStore = async (id: string) => {
    if (!confirm('Are you sure you want to delete this store?')) return;

    try {
      await request(`/api/stores/${id}`, {
        method: 'DELETE',
      }, {
        showSuccessToast: true
      });
      await loadStores();
    } catch (error) {
      console.error('Failed to delete store:', error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingStore(null);
    reset();
  };

  const handleEditStore = (store: Store) => {
    setEditingStore(store);
    reset({
      name: store.name,
      description: store.description,
      category: store.category,
      status: store.status,
    });
    setShowModal(true);
  };

  const filteredStores = stores.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         store.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || store.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const categories = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Beauty', 'Food'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stores</h1>
          <p className="text-gray-500">Manage your stores and their information</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-white rounded-lg shadow px-4 py-2">
            <div className="flex items-center text-sm text-gray-600">
              <StoreIcon className="h-4 w-4 mr-2" />
              {stores.length} stores
            </div>
          </div>
          {(user?.role === 'admin' || user?.role === 'store_owner') && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Store
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search stores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStores.map((store) => (
          <div key={store.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{store.name}</h3>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(store.status)}`}>
                  {store.status.toUpperCase()}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{store.description}</p>
              <div className="flex items-center justify-between">
                <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                  {store.category}
                </span>
                {(user?.role === 'admin' || user?.role === 'store_owner') && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditStore(store)}
                      className="text-blue-600 hover:text-blue-900 p-2 rounded-md hover:bg-blue-50"
                      title="Edit store"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteStore(store.id)}
                      className="text-red-600 hover:text-red-900 p-2 rounded-md hover:bg-red-50"
                      title="Delete store"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {filteredStores.length === 0 && (
          <div className="col-span-full text-center py-12">
            <StoreIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No stores found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedCategory ? 'Try adjusting your filters' : 'Get started by creating your first store'}
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingStore ? 'Edit Store' : 'Add New Store'}
              </h3>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Store Name
                  </label>
                  <input
                    {...register('name', { required: 'Store name is required' })}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter store name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    {...register('description', { required: 'Description is required' })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter store description"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    {...register('category', { required: 'Category is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    {...register('status', { required: 'Status is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  {errors.status && (
                    <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : (editingStore ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stores;