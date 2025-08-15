import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  CurrencyDollarIcon,
  TagIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

export default function Services() {
  // Mock data for services
  const initialServices = [
    {
      id: 1,
      name: 'Veterinary Checkup',
      category: 'Medical',
      price: 55.00,
      duration: 30,
      description: 'General health assessment for your pet including vital signs and physical examination.',
      status: 'active',
      image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'
    },
    {
      id: 2,
      name: 'Pet Grooming',
      category: 'Grooming',
      price: 45.00,
      duration: 60,
      description: 'Complete grooming service including bath, haircut, nail trimming, and ear cleaning.',
      status: 'active',
      image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'
    },
    {
      id: 3,
      name: 'Vaccination',
      category: 'Medical',
      price: 35.00,
      duration: 15,
      description: 'Essential vaccinations to protect your pet against common diseases.',
      status: 'active',
      image: 'https://images.unsplash.com/photo-1612776572997-76cc42e058c3?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'
    },
    {
      id: 4,
      name: 'Dental Cleaning',
      category: 'Dental',
      price: 75.00,
      duration: 45,
      description: 'Professional dental cleaning to prevent periodontal disease and maintain oral health.',
      status: 'active',
      image: 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'
    },
    {
      id: 5,
      name: 'Microchipping',
      category: 'Medical',
      price: 40.00,
      duration: 10,
      description: 'Permanent ID for your pet that increases the chances of reunification if lost.',
      status: 'active',
      image: 'https://images.unsplash.com/photo-1612776572997-76cc42e058c3?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'
    },
    {
      id: 6,
      name: 'Nail Trimming',
      category: 'Grooming',
      price: 15.00,
      duration: 15,
      description: 'Proper nail care to prevent discomfort and mobility issues.',
      status: 'active',
      image: 'https://images.unsplash.com/photo-1559569226-5fc249511f40?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'
    },
    {
      id: 7,
      name: 'Pet Boarding',
      category: 'Boarding',
      price: 35.00,
      duration: 1440, // per day in minutes
      description: 'Safe and comfortable overnight stay for your pet with care and feeding.',
      status: 'inactive',
      image: 'https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'
    },
    {
      id: 8,
      name: 'Behavior Training',
      category: 'Training',
      price: 65.00,
      duration: 60,
      description: 'Professional training to address behavior issues and teach obedience commands.',
      status: 'active',
      image: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'
    },
  ];

  const [services, setServices] = useState(initialServices);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  
  const servicesPerPage = 6;
  const categories = ['Medical', 'Grooming', 'Dental', 'Boarding', 'Training'];

  // Handle search and filtering
  const filteredServices = services.filter(service => {
    const matchesSearch = 
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || service.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination
  const indexOfLastService = currentPage * servicesPerPage;
  const indexOfFirstService = indexOfLastService - servicesPerPage;
  const currentServices = filteredServices.slice(indexOfFirstService, indexOfLastService);
  const totalPages = Math.ceil(filteredServices.length / servicesPerPage);
  
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

  // Service actions
  const deleteService = (id) => {
    setServices(services.filter(service => service.id !== id));
  };

  const handleViewService = (service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const toggleServiceStatus = (id) => {
    setServices(services.map(service => 
      service.id === id ? {...service, status: service.status === 'active' ? 'inactive' : 'active'} : service
    ));
  };

  // Format duration helper
  const formatDuration = (minutes) => {
    if (minutes >= 1440) {
      const days = Math.floor(minutes / 1440);
      return `${days} day${days > 1 ? 's' : ''}`;
    }
    
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours} hr${hours > 1 ? 's' : ''}${remainingMinutes > 0 ? ` ${remainingMinutes} min` : ''}`;
    }
    
    return `${minutes} min`;
  };

  return (
    <>
      <Head>
        <title>Services Management | PetPro Vendor</title>
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Services Management</h1>
            <Link 
              href="/services/new" 
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-1" />
              Add Service
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
                  placeholder="Search services..."
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <TagIcon className="h-5 w-5 text-gray-400 mr-2" />
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
                <CheckCircleIcon className="h-5 w-5 text-gray-400 mr-2" />
                <label htmlFor="status-filter" className="sr-only">Filter by status</label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="focus:ring-primary-500 focus:border-primary-500 sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Services Grid */}
          <div className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentServices.length > 0 ? (
                currentServices.map((service) => (
                  <div key={service.id} className={`bg-white rounded-lg shadow overflow-hidden ${service.status === 'inactive' ? 'opacity-70' : ''}`}>
                    <div className="relative h-36 bg-gray-200">
                      {service.image ? (
                        <img 
                          src={service.image} 
                          alt={service.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-400">No image</div>
                      )}
                      <div className="absolute top-2 right-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          service.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {service.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-medium text-gray-900 truncate" title={service.name}>
                        {service.name}
                      </h3>
                      <div className="mt-1 flex items-center">
                        <TagIcon className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-500">{service.category}</span>
                      </div>
                      <div className="mt-2 flex justify-between">
                        <div className="flex items-center">
                          <CurrencyDollarIcon className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm font-medium text-gray-900">${service.price.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-500">{formatDuration(service.duration)}</span>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-500 line-clamp-2" title={service.description}>
                        {service.description}
                      </p>
                      <div className="mt-4 flex justify-between items-center">
                        <button 
                          onClick={() => handleViewService(service)}
                          className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                        >
                          View details
                        </button>
                        <div className="flex space-x-1">
                          <button 
                            onClick={() => toggleServiceStatus(service.id)}
                            className={`p-1 rounded-full hover:bg-gray-100 ${
                              service.status === 'active' ? 'text-green-500' : 'text-gray-400'
                            }`}
                            title={service.status === 'active' ? 'Deactivate service' : 'Activate service'}
                          >
                            <CheckCircleIcon className="h-5 w-5" />
                          </button>
                          <Link 
                            href={`/services/edit/${service.id}`}
                            className="p-1 rounded-full hover:bg-gray-100"
                            title="Edit service"
                          >
                            <PencilIcon className="h-5 w-5 text-gray-400" />
                          </Link>
                          <button 
                            onClick={() => deleteService(service.id)}
                            className="p-1 rounded-full hover:bg-gray-100"
                            title="Delete service"
                          >
                            <TrashIcon className="h-5 w-5 text-red-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 py-10">
                  <div className="text-center text-gray-500">
                    <ExclamationCircleIcon className="h-12 w-12 mx-auto text-gray-400" />
                    <p className="mt-2 text-sm">No services found matching your criteria</p>
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
          {filteredServices.length > 0 && (
            <div className="mt-6 bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstService + 1}</span> to <span className="font-medium">
                      {Math.min(indexOfLastService, filteredServices.length)}
                    </span> of{' '}
                    <span className="font-medium">{filteredServices.length}</span> services
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

      {/* Service Details Modal */}
      {isModalOpen && selectedService && (
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
                      Service Details
                    </h3>
                    <div className="mt-4 border-t border-gray-200 pt-4">
                      <div className="flex justify-center mb-4">
                        {selectedService.image ? (
                          <img 
                            src={selectedService.image} 
                            alt={selectedService.name}
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
                          <dd className="text-sm text-gray-900 col-span-2">{selectedService.name}</dd>
                        </div>
                        <div className="py-3 grid grid-cols-3">
                          <dt className="text-sm font-medium text-gray-500">Category</dt>
                          <dd className="text-sm text-gray-900 col-span-2">{selectedService.category}</dd>
                        </div>
                        <div className="py-3 grid grid-cols-3">
                          <dt className="text-sm font-medium text-gray-500">Price</dt>
                          <dd className="text-sm text-gray-900 col-span-2">${selectedService.price.toFixed(2)}</dd>
                        </div>
                        <div className="py-3 grid grid-cols-3">
                          <dt className="text-sm font-medium text-gray-500">Duration</dt>
                          <dd className="text-sm text-gray-900 col-span-2">{formatDuration(selectedService.duration)}</dd>
                        </div>
                        <div className="py-3 grid grid-cols-3">
                          <dt className="text-sm font-medium text-gray-500">Status</dt>
                          <dd className="text-sm col-span-2">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              selectedService.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {selectedService.status === 'active' ? 'Active' : 'Inactive'}
                            </span>
                          </dd>
                        </div>
                        <div className="py-3 grid grid-cols-3">
                          <dt className="text-sm font-medium text-gray-500">Description</dt>
                          <dd className="text-sm text-gray-900 col-span-2">{selectedService.description}</dd>
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
                  href={`/services/edit/${selectedService.id}`}
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
