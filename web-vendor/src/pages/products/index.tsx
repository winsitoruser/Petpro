import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

export default function Products() {
  // Mock data for products
  const initialProducts = [
    { 
      id: 1, 
      name: 'Premium Dog Food', 
      category: 'Food', 
      price: 45.99, 
      stock: 32, 
      status: 'active',
      image: 'https://images.unsplash.com/photo-1585846888147-3fe14c130048?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80'
    },
    { 
      id: 2, 
      name: 'Cat Toys Bundle', 
      category: 'Toys', 
      price: 24.50, 
      stock: 15, 
      status: 'active',
      image: 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80'
    },
    { 
      id: 3, 
      name: 'Pet Carrier', 
      category: 'Accessories', 
      price: 65.75, 
      stock: 8, 
      status: 'active',
      image: 'https://images.unsplash.com/photo-1581134063242-e521690e2b0c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80'
    },
    { 
      id: 4, 
      name: 'Flea Treatment', 
      category: 'Health', 
      price: 32.25, 
      stock: 24, 
      status: 'active',
      image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80'
    },
    { 
      id: 5, 
      name: 'Dog Collar', 
      category: 'Accessories', 
      price: 18.99, 
      stock: 42, 
      status: 'active',
      image: 'https://images.unsplash.com/photo-1599443015574-be5fe8a05783?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80'
    },
    { 
      id: 6, 
      name: 'Pet Shampoo', 
      category: 'Grooming', 
      price: 12.49, 
      stock: 38, 
      status: 'active',
      image: 'https://images.unsplash.com/photo-1584305574647-0cc949a2bb9f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80'
    },
    { 
      id: 7, 
      name: 'Pet Bed - Medium', 
      category: 'Bedding', 
      price: 49.99, 
      stock: 6, 
      status: 'low_stock',
      image: 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80'
    },
    { 
      id: 8, 
      name: 'Aquarium Filter', 
      category: 'Aquatic', 
      price: 38.50, 
      stock: 0, 
      status: 'out_of_stock',
      image: 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80'
    }
  ];

  const [products, setProducts] = useState(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const productsPerPage = 6;
  const categories = ['Food', 'Toys', 'Accessories', 'Health', 'Grooming', 'Bedding', 'Aquatic'];

  // Handle search and filtering
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortField === 'price') {
      comparison = a.price - b.price;
    } else if (sortField === 'stock') {
      comparison = a.stock - b.stock;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
  
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Sorting handler
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Product actions
  const deleteProduct = (id) => {
    setProducts(products.filter(product => product.id !== id));
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleStockStatus = (stock) => {
    if (stock === 0) return { status: 'out_of_stock', text: 'Out of Stock', class: 'bg-red-100 text-red-800' };
    if (stock <= 10) return { status: 'low_stock', text: 'Low Stock', class: 'bg-yellow-100 text-yellow-800' };
    return { status: 'active', text: 'In Stock', class: 'bg-green-100 text-green-800' };
  };

  return (
    <>
      <Head>
        <title>Products | PetPro Vendor</title>
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
            <Link 
              href="/products/new" 
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-1" />
              Add Product
            </Link>
          </div>

          {/* Filters & Search */}
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="sm:w-1/3">
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Search products..."
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <FunnelIcon className="h-5 w-5 text-gray-400 mr-2" />
                <label htmlFor="category-filter" className="sr-only">Filter by category</label>
                <select
                  id="category-filter"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="focus:ring-primary-500 focus:border-primary-500 sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center">
                <label htmlFor="status-filter" className="sr-only">Filter by status</label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="focus:ring-primary-500 focus:border-primary-500 sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">In Stock</option>
                  <option value="low_stock">Low Stock</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentProducts.length > 0 ? (
                currentProducts.map((product) => {
                  const stockStatus = handleStockStatus(product.stock);
                  return (
                    <div key={product.id} className="bg-white rounded-lg shadow overflow-hidden">
                      <div className="relative h-48 bg-gray-200 flex items-center justify-center">
                        {product.image ? (
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="text-gray-400">No image</div>
                        )}
                        {product.stock === 0 && (
                          <div className="absolute inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">OUT OF STOCK</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 truncate" title={product.name}>
                              {product.name}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">{product.category}</p>
                          </div>
                          <span className="text-lg font-semibold text-gray-900">${product.price.toFixed(2)}</span>
                        </div>
                        <div className="mt-4 flex justify-between items-center">
                          <div>
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${stockStatus.class}`}>
                              {stockStatus.text}
                            </span>
                            <span className="ml-2 text-sm text-gray-500">
                              {product.stock} in stock
                            </span>
                          </div>
                          <div className="flex space-x-1">
                            <button 
                              onClick={() => handleViewProduct(product)}
                              className="p-1 rounded-full hover:bg-gray-100"
                              title="View details"
                            >
                              <span className="text-xs font-medium text-primary-600">View</span>
                            </button>
                            <Link 
                              href={`/products/edit/${product.id}`}
                              className="p-1 rounded-full hover:bg-gray-100"
                              title="Edit product"
                            >
                              <PencilIcon className="h-4 w-4 text-gray-400" />
                            </Link>
                            <button 
                              onClick={() => deleteProduct(product.id)}
                              className="p-1 rounded-full hover:bg-gray-100"
                              title="Delete product"
                            >
                              <TrashIcon className="h-4 w-4 text-red-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-3 py-10">
                  <div className="text-center text-gray-500">
                    <ExclamationCircleIcon className="h-12 w-12 mx-auto text-gray-400" />
                    <p className="mt-2 text-sm">No products found matching your criteria</p>
                    <button 
                      onClick={() => {
                        setSearchTerm('');
                        setCategoryFilter('all');
                        setStatusFilter('all');
                      }}
                      className="mt-4 text-sm text-primary-600 hover:text-primary-500"
                    >
                      Clear filters
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Pagination */}
          {sortedProducts.length > 0 && (
            <div className="mt-6 bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstProduct + 1}</span> to <span className="font-medium">
                      {Math.min(indexOfLastProduct, sortedProducts.length)}
                    </span> of{' '}
                    <span className="font-medium">{sortedProducts.length}</span> products
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border ${
                          currentPage === i + 1
                            ? 'bg-primary-50 border-primary-500 text-primary-600 z-10'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        } text-sm font-medium`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product Details Modal */}
      {isModalOpen && selectedProduct && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Product Details
                    </h3>
                    <div className="mt-4 border-t border-gray-200 pt-4">
                      <div className="flex justify-center mb-4">
                        {selectedProduct.image ? (
                          <img 
                            src={selectedProduct.image} 
                            alt={selectedProduct.name}
                            className="h-32 w-32 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="h-32 w-32 bg-gray-200 flex items-center justify-center rounded-lg">
                            <span className="text-gray-400">No image</span>
                          </div>
                        )}
                      </div>
                      <dl className="divide-y divide-gray-200">
                        <div className="py-3 grid grid-cols-3">
                          <dt className="text-sm font-medium text-gray-500">Name</dt>
                          <dd className="text-sm text-gray-900 col-span-2">{selectedProduct.name}</dd>
                        </div>
                        <div className="py-3 grid grid-cols-3">
                          <dt className="text-sm font-medium text-gray-500">Category</dt>
                          <dd className="text-sm text-gray-900 col-span-2">{selectedProduct.category}</dd>
                        </div>
                        <div className="py-3 grid grid-cols-3">
                          <dt className="text-sm font-medium text-gray-500">Price</dt>
                          <dd className="text-sm text-gray-900 col-span-2">${selectedProduct.price.toFixed(2)}</dd>
                        </div>
                        <div className="py-3 grid grid-cols-3">
                          <dt className="text-sm font-medium text-gray-500">Stock</dt>
                          <dd className="text-sm text-gray-900 col-span-2">{selectedProduct.stock} units</dd>
                        </div>
                        <div className="py-3 grid grid-cols-3">
                          <dt className="text-sm font-medium text-gray-500">Status</dt>
                          <dd className="text-sm col-span-2">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${handleStockStatus(selectedProduct.stock).class}`}>
                              {handleStockStatus(selectedProduct.stock).text}
                            </span>
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Close
                </button>
                <Link
                  href={`/products/edit/${selectedProduct.id}`}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Edit
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
