import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useSocket } from '../../contexts/SocketContext';
import {
  CalendarIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

// Define interfaces for booking and events
interface Booking {
  id: number | string;
  customer: string;
  pet: string;
  service: string;
  date: string;
  time: string;
  status: string;
  notes: string;
}

interface BookingStatusUpdate {
  bookingId: string;
  status: string;
  updatedAt: string;
  message?: string;
}

interface NotificationEvent {
  type: string;
  title: string;
  message: string;
  bookingId?: string;
}

export default function Bookings() {
  // Mock data for bookings - in production this would come from an API
  const initialBookings = [
    { id: '1', customer: 'John Doe', pet: 'Max', service: 'Veterinary Checkup', date: '2025-08-20', time: '10:00 AM', status: 'confirmed', notes: 'Regular checkup' },
    { id: '2', customer: 'Sarah Johnson', pet: 'Bella', service: 'Pet Grooming', date: '2025-08-21', time: '2:30 PM', status: 'pending', notes: 'First time customer' },
    { id: '3', customer: 'Michael Chen', pet: 'Charlie', service: 'Vaccination', date: '2025-08-22', time: '11:15 AM', status: 'confirmed', notes: 'Annual booster' },
    { id: '4', customer: 'Emily Rodriguez', pet: 'Luna', service: 'Dental Cleaning', date: '2025-08-23', time: '9:00 AM', status: 'confirmed', notes: 'Sensitive teeth' },
    { id: '5', customer: 'David Wilson', pet: 'Cooper', service: 'Microchipping', date: '2025-08-24', time: '3:45 PM', status: 'pending', notes: 'New adoption' },
    { id: '6', customer: 'Jennifer Miller', pet: 'Bailey', service: 'Nail Trimming', date: '2025-08-25', time: '1:15 PM', status: 'cancelled', notes: 'Aggressive behavior' },
    { id: '7', customer: 'Robert Brown', pet: 'Daisy', service: 'Flea Treatment', date: '2025-08-26', time: '4:30 PM', status: 'confirmed', notes: 'Severe infestation' },
    { id: '8', customer: 'Lisa Taylor', pet: 'Rocky', service: 'Eye Examination', date: '2025-08-27', time: '10:45 AM', status: 'pending', notes: 'Watery eyes' }
  ];

  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const socket = useSocket();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCalendarView, setIsCalendarView] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const bookingsPerPage = 5;

  // Handle search and filtering
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.pet.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.notes.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking);
  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);
  
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

  // Actions
  const handleStatusChange = (id: number | string, newStatus: string) => {
    setBookings(bookings.map(booking => 
      booking.id === id ? {...booking, status: newStatus} : booking
    ));
    
    // In a real implementation, this would call an API to update the booking status
    // which would then trigger a WebSocket event from the server
    // Here we're just simulating the state change locally
  };

  const deleteBooking = (id: number | string) => {
    setBookings(bookings.filter(booking => booking.id !== id));
  };

  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
    
    // Join the booking-specific WebSocket room when viewing booking details
    socket.joinBookingRoom(booking.id.toString());
  };
  
  // Handle real-time booking status updates
  const handleBookingStatusUpdate = useCallback((update: BookingStatusUpdate) => {
    setBookings(prevBookings => {
      return prevBookings.map(booking => {
        if (booking.id.toString() === update.bookingId) {
          return { ...booking, status: update.status };
        }
        return booking;
      });
    });
    
    // If the booking we're viewing was updated, update the selected booking as well
    if (selectedBooking && selectedBooking.id.toString() === update.bookingId) {
      setSelectedBooking(prev => prev ? { ...prev, status: update.status } : prev);
    }
  }, [selectedBooking]);
  
  // Subscribe to notifications (could show these in a notifications panel)
  const handleNotification = useCallback((notification: NotificationEvent) => {
    console.log('Notification received in Bookings component:', notification);
    // Here you could update a notifications state or show a custom alert
  }, []);
  
  // Setup WebSocket subscriptions
  useEffect(() => {
    // Subscribe to notifications
    const unsubNotifications = socket.subscribeToNotifications(handleNotification);
    
    // When component unmounts, clean up subscriptions
    return () => {
      unsubNotifications();
      
      // If a booking was being viewed, leave its room
      if (selectedBooking) {
        socket.leaveBookingRoom(selectedBooking.id.toString());
      }
    };
  }, [socket, handleNotification]);
  
  // Subscribe to booking updates when a booking is selected
  useEffect(() => {
    if (selectedBooking) {
      // Subscribe to updates for the selected booking
      const unsubBooking = socket.subscribeToBookingUpdates(
        selectedBooking.id.toString(), 
        handleBookingStatusUpdate
      );
      
      return () => {
        unsubBooking();
      };
    }
  }, [selectedBooking, socket, handleBookingStatusUpdate]);
  
  // Close modal and leave booking room
  const closeBookingModal = () => {
    if (selectedBooking) {
      socket.leaveBookingRoom(selectedBooking.id.toString());
    }
    setIsModalOpen(false);
  };

  return (
    <>
      <Head>
        <title>Bookings Management | PetPro Vendor</title>
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Bookings Management</h1>
            <div className="flex items-center">
              <button 
                onClick={() => setIsCalendarView(!isCalendarView)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${isCalendarView ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
              >
                <CalendarIcon className="h-5 w-5 inline-block mr-2" />
                {isCalendarView ? 'List View' : 'Calendar View'}
              </button>
              <Link 
                href="/bookings/new" 
                className="ml-3 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <PlusIcon className="h-5 w-5 mr-1" />
                New Booking
              </Link>
            </div>
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
                  placeholder="Search bookings..."
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <FunnelIcon className="h-5 w-5 text-gray-400 mr-2" />
                <label htmlFor="status-filter" className="sr-only">Filter by status</label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="focus:ring-primary-500 focus:border-primary-500 sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="all">All Statuses</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {isCalendarView ? (
            /* Calendar View Placeholder */
            <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="p-8">
                <div className="text-center text-gray-600 py-20">
                  <CalendarIcon className="h-16 w-16 mx-auto text-gray-400" />
                  <p className="mt-4 text-lg font-medium">Calendar View</p>
                  <p className="mt-2">The calendar interface would be implemented here with a library like react-big-calendar or fullcalendar.</p>
                </div>
              </div>
            </div>
          ) : (
            /* List View */
            <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
              <ul role="list" className="divide-y divide-gray-200">
                {currentBookings.length > 0 ? (
                  currentBookings.map((booking) => (
                    <li key={booking.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                            booking.status === 'confirmed' ? 'bg-green-100' :
                            booking.status === 'pending' ? 'bg-yellow-100' : 'bg-red-100'
                          }`}>
                            <CalendarIcon className={`h-5 w-5 ${
                              booking.status === 'confirmed' ? 'text-green-600' :
                              booking.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                            }`} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {booking.customer}
                            </div>
                            <div className="text-sm text-gray-500">
                              {booking.pet} - {booking.service}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="text-sm text-gray-900">
                            {new Date(booking.date).toLocaleDateString()} at {booking.time}
                          </div>
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 ml-6">
                          <button 
                            onClick={() => handleViewBooking(booking)}
                            className="p-1 rounded-full hover:bg-gray-100"
                          >
                            <span className="text-sm font-medium text-primary-600">View</span>
                          </button>
                          <button 
                            onClick={() => {/* Edit action would go here */}}
                            className="p-1 rounded-full hover:bg-gray-100"
                          >
                            <PencilIcon className="h-5 w-5 text-gray-400" />
                          </button>
                          <button 
                            onClick={() => deleteBooking(booking.id)}
                            className="p-1 rounded-full hover:bg-gray-100"
                          >
                            <TrashIcon className="h-5 w-5 text-red-400" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="px-6 py-10">
                    <div className="text-center text-gray-500">
                      <p className="text-sm">No bookings found matching your criteria</p>
                    </div>
                  </li>
                )}
              </ul>
              
              {/* Pagination */}
              {filteredBookings.length > 0 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{indexOfFirstBooking + 1}</span> to <span className="font-medium">
                          {Math.min(indexOfLastBooking, filteredBookings.length)}
                        </span> of{' '}
                        <span className="font-medium">{filteredBookings.length}</span> bookings
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
          )}
        </div>
      </div>

      {/* Booking Details Modal */}
      {isModalOpen && selectedBooking && (
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
                      Booking Details
                    </h3>
                    <div className="mt-4 border-t border-gray-200 pt-4">
                      <dl className="divide-y divide-gray-200">
                        <div className="py-3 grid grid-cols-3">
                          <dt className="text-sm font-medium text-gray-500">Customer</dt>
                          <dd className="text-sm text-gray-900 col-span-2">{selectedBooking.customer}</dd>
                        </div>
                        <div className="py-3 grid grid-cols-3">
                          <dt className="text-sm font-medium text-gray-500">Pet</dt>
                          <dd className="text-sm text-gray-900 col-span-2">{selectedBooking?.pet}</dd>
                        </div>
                        <div className="py-3 grid grid-cols-3">
                          <dt className="text-sm font-medium text-gray-500">Service</dt>
                          <dd className="text-sm text-gray-900 col-span-2">{selectedBooking?.service}</dd>
                        </div>
                        <div className="py-3 grid grid-cols-3">
                          <dt className="text-sm font-medium text-gray-500">Date & Time</dt>
                          <dd className="text-sm text-gray-900 col-span-2">{selectedBooking?.date} at {selectedBooking?.time}</dd>
                        </div>
                        <div className="py-3 grid grid-cols-3">
                          <dt className="text-sm font-medium text-gray-500">Status</dt>
                          <dd className="text-sm col-span-2">
                            <select
                              value={selectedBooking?.status}
                              onChange={(e) => selectedBooking && handleStatusChange(selectedBooking.id, e.target.value)}
                              className="focus:ring-primary-500 focus:border-primary-500 sm:text-sm border-gray-300 rounded-md"
                            >
                              <option value="confirmed">Confirmed</option>
                              <option value="pending">Pending</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </dd>
                        </div>
                        <div className="py-3 grid grid-cols-3">
                          <dt className="text-sm font-medium text-gray-500">Notes</dt>
                          <dd className="text-sm text-gray-900 col-span-2">{selectedBooking?.notes}</dd>
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
                  onClick={closeBookingModal}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {/* Edit action would go here */}}
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
