import React, { useEffect, useState } from 'react';
import { Plus, Package as PackageIcon, Edit2, Trash2, Search } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../contexts/AuthContext';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  storeId: string;
  image: string;
  createdAt: string;
}

interface Store {
  id: string;
  name: string;
}

interface ProductForm {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  storeId: string;
  image: string;
}

const Products: React.FC = () => {
  const { user } = useAuth();
  const { request, loading } = useApi();
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductForm>();

  useEffect(() => {
    loadProducts();
    loadStores();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await request('/api/products');
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const loadStores = async () => {
    try {
      const data = await request('/api/stores');
      setStores(data);
    } catch (error) {
      console.error('Failed to load stores:', error);
    }
  };

  const onSubmit = async (data: ProductForm) => {
    try {
      const productData = {
        ...data,
        price: parseFloat(data.price.toString()),
        stock: parseInt(data.stock.toString()),
      };

      if (editingProduct) {
        await request(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          body: JSON.stringify(productData),
        }, {
          showSuccessToast: true
        });
      } else {
        await request('/api/products', {
          method: 'POST',
          body: JSON.stringify(productData),
        }, {
          showSuccessToast: true
        });
      }
      
      await loadProducts();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save product:', error);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await request(`/api/products/${id}`, {
        method: 'DELETE',
      }, {
        showSuccessToast: true
      });
      await loadProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    reset();
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    reset({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
      storeId: product.storeId,
      image: product.image,
    });
    setShowModal(true);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStoreName = (storeId: string) => {
    const store = stores.find(s => s.id === storeId);
    return store ? store.name : 'Unknown Store';
  };

  const categories = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Beauty', 'Food'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500">Manage your product inventory</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-white rounded-lg shadow px-4 py-2">
            <div className="flex items-center text-sm text-gray-600">
              <PackageIcon className="h-4 w-4 mr-2" />
              {products.length} products
            </div>
          </div>
          {(user?.role === 'admin' || user?.role === 'store_owner') && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
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
                placeholder="Search products..."
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

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
                <span className="text-lg font-bold text-green-600">${product.price}</span>
              </div>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                  {product.category}
                </span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  product.stock > 0 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>
              <div className="text-xs text-gray-500 mb-3">
                Store: {getStoreName(product.storeId)}
              </div>
              {(user?.role === 'admin' || user?.role === 'store_owner') && (
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => handleEditProduct(product)}
                    className="text-blue-600 hover:text-blue-900 p-2 rounded-md hover:bg-blue-50"
                    title="Edit product"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="text-red-600 hover:text-red-900 p-2 rounded-md hover:bg-red-50"
                    title="Delete product"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {filteredProducts.length === 0 && (
          <div className="col-span-full text-center py-12">
            <PackageIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedCategory ? 'Try adjusting your filters' : 'Get started by adding your first product'}
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name
                  </label>
                  <input
                    {...register('name', { required: 'Product name is required' })}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter product name"
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
                    placeholder="Enter product description"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price ($)
                    </label>
                    <input
                      {...register('price', { 
                        required: 'Price is required',
                        min: { value: 0.01, message: 'Price must be greater than 0' }
                      })}
                      type="number"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                    {errors.price && (
                      <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock
                    </label>
                    <input
                      {...register('stock', { 
                        required: 'Stock is required',
                        min: { value: 0, message: 'Stock cannot be negative' }
                      })}
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                    />
                    {errors.stock && (
                      <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>
                    )}
                  </div>
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
                    Store
                  </label>
                  <select
                    {...register('storeId', { required: 'Store is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a store</option>
                    {stores.map(store => (
                      <option key={store.id} value={store.id}>{store.name}</option>
                    ))}
                  </select>
                  {errors.storeId && (
                    <p className="mt-1 text-sm text-red-600">{errors.storeId.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
                  </label>
                  <input
                    {...register('image')}
                    type="url"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Leave empty to use default image
                  </p>
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
                  {loading ? 'Saving...' : (editingProduct ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;