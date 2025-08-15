import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  ShoppingBagIcon, 
  CalendarIcon, 
  CurrencyDollarIcon,
  UsersIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export default function Dashboard() {
  // Mock data for dashboard statistics
  const stats = [
    { name: 'Total Products', value: '24', icon: ShoppingBagIcon, change: '+3', trend: 'increase' },
    { name: 'Active Bookings', value: '12', icon: CalendarIcon, change: '+5', trend: 'increase' },
    { name: 'Monthly Revenue', value: '$2,450', icon: CurrencyDollarIcon, change: '+12%', trend: 'increase' },
    { name: 'New Customers', value: '18', icon: UsersIcon, change: '-2', trend: 'decrease' },
  ];

  // Mock data for recent bookings
  const recentBookings = [
    { id: 1, customer: 'John Doe', service: 'Veterinary Checkup', date: '2025-08-14', time: '10:00 AM', status: 'confirmed' },
    { id: 2, customer: 'Sarah Johnson', service: 'Pet Grooming', date: '2025-08-15', time: '2:30 PM', status: 'pending' },
    { id: 3, customer: 'Michael Chen', service: 'Vaccination', date: '2025-08-16', time: '11:15 AM', status: 'confirmed' },
    { id: 4, customer: 'Emily Rodriguez', service: 'Dental Cleaning', date: '2025-08-18', time: '9:00 AM', status: 'cancelled' },
  ];

  // Mock data for recent orders
  const recentOrders = [
    { id: 101, customer: 'Robert Wilson', product: 'Premium Dog Food', price: '$45.99', date: '2025-08-14', status: 'delivered' },
    { id: 102, customer: 'Lisa Taylor', product: 'Cat Toys Bundle', price: '$24.50', date: '2025-08-13', status: 'shipped' },
    { id: 103, customer: 'David Martinez', product: 'Pet Carrier', price: '$65.75', date: '2025-08-12', status: 'processing' },
    { id: 104, customer: 'Jennifer White', product: 'Flea Treatment', price: '$32.25', date: '2025-08-11', status: 'delivered' },
  ];

  return (
    <>
      <Head>
        <title>Dashboard | PetPro Vendor</title>
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Stats Cards */}
          <div className="mt-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <stat.icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                          <dd>
                            <div className="text-lg font-medium text-gray-900">{stat.value}</div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className={`bg-gray-50 px-5 py-3 flex items-center ${
                    stat.trend === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <span className="text-sm font-medium">
                      {stat.change}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">from last month</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Charts */}
          <div className="mt-8">
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                      <ChartBarIcon className="h-6 w-6 text-primary-600" aria-hidden="true" />
                    </div>
                    <div className="ml-5">
                      <h3 className="text-lg font-medium leading-6 text-gray-900">Revenue Overview</h3>
                      <p className="text-sm text-gray-500">Last 30 days</p>
                    </div>
                  </div>
                  <div className="mt-6 h-64 bg-gray-50 flex items-center justify-center">
                    <p className="text-gray-500">Chart placeholder - Revenue data visualization</p>
                    {/* In a real app, you would add a chart library component here */}
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                      <ClockIcon className="h-6 w-6 text-primary-600" aria-hidden="true" />
                    </div>
                    <div className="ml-5">
                      <h3 className="text-lg font-medium leading-6 text-gray-900">Booking Trends</h3>
                      <p className="text-sm text-gray-500">Last 30 days</p>
                    </div>
                  </div>
                  <div className="mt-6 h-64 bg-gray-50 flex items-center justify-center">
                    <p className="text-gray-500">Chart placeholder - Booking data visualization</p>
                    {/* In a real app, you would add a chart library component here */}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="mt-8">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Bookings</h3>
                  <Link href="/bookings" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                    View all
                  </Link>
                </div>
              </div>
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentBookings.map((booking) => (
                      <tr key={booking.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {booking.customer}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {booking.service}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {booking.date}, {booking.time}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="mt-8 mb-6">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Orders</h3>
                  <Link href="/orders" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                    View all
                  </Link>
                </div>
              </div>
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{order.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.customer}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.product}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.price}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
