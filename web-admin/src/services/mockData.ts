// Mock data service for frontend development without backend

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'clinic_admin' | 'vet' | 'pet_owner';
  phone?: string;
  avatar?: string;
  joinDate: string;
  status: 'active' | 'inactive' | 'pending';
}

// Clinic types
export interface Clinic {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
  registrationDate: string;
  status: 'active' | 'pending' | 'inactive';
  rating: number;
  doctorsCount: number;
  servicesOffered: string[];
}

// Booking types
export interface Booking {
  id: string;
  petId: string;
  petName: string;
  petType: string;
  ownerId: string;
  ownerName: string;
  clinicId: string;
  clinicName: string;
  serviceType: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  createdAt: string;
}

// Product types
export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  discountPrice?: number;
  stock: number;
  images: string[];
  rating: number;
  reviewCount: number;
  tags: string[];
  isActive: boolean;
  createdAt: string;
}

// Order types
export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  shippingAddress: string;
  createdAt: string;
  updatedAt: string;
  trackingNumber?: string;
}

// Dashboard stats
export interface DashboardStats {
  users: {
    total: number;
    active: number;
    new: number;
    growth: number;
  };
  clinics: {
    total: number;
    active: number;
    new: number;
    growth: number;
  };
  bookings: {
    total: number;
    today: number;
    completed: number;
    cancelled: number;
    growth: number;
  };
  products: {
    total: number;
    outOfStock: number;
    lowStock: number;
  };
  orders: {
    total: number;
    today: number;
    pending: number;
    revenue: number;
    growth: number;
  };
  pets: {
    total: number;
    dogs: number;
    cats: number;
    others: number;
    growth: number;
  };
}

// Activity types
export type ActivityType = 
  | 'user_registration'
  | 'clinic_registration'
  | 'booking_created'
  | 'booking_completed'
  | 'booking_cancelled'
  | 'order_placed'
  | 'order_delivered'
  | 'order_cancelled'
  | 'product_added'
  | 'product_updated'
  | 'review_submitted';

export interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  details: string;
  entityId?: string;
  entityType?: string;
  createdAt: string;
  userId?: string;
  userName?: string;
}

// Mock data for users
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'pet_owner',
    phone: '555-123-4567',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    joinDate: '2025-06-15',
    status: 'active',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'clinic_admin',
    phone: '555-987-6543',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    joinDate: '2025-05-20',
    status: 'active',
  },
  {
    id: '3',
    name: 'Robert Johnson',
    email: 'robert.j@example.com',
    role: 'vet',
    phone: '555-456-7890',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    joinDate: '2025-07-10',
    status: 'active',
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily.d@example.com',
    role: 'pet_owner',
    phone: '555-789-0123',
    avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
    joinDate: '2025-08-01',
    status: 'active',
  },
  {
    id: '5',
    name: 'Michael Wilson',
    email: 'michael.w@example.com',
    role: 'admin',
    phone: '555-321-6547',
    avatar: 'https://randomuser.me/api/portraits/men/5.jpg',
    joinDate: '2025-04-12',
    status: 'active',
  },
  {
    id: '6',
    name: 'Lisa Brown',
    email: 'lisa.b@example.com',
    role: 'pet_owner',
    phone: '555-654-9870',
    avatar: 'https://randomuser.me/api/portraits/women/6.jpg',
    joinDate: '2025-07-22',
    status: 'pending',
  },
  {
    id: '7',
    name: 'David Miller',
    email: 'david.m@example.com',
    role: 'vet',
    phone: '555-852-7413',
    avatar: 'https://randomuser.me/api/portraits/men/7.jpg',
    joinDate: '2025-06-30',
    status: 'active',
  },
  {
    id: '8',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    role: 'clinic_admin',
    phone: '555-369-8520',
    avatar: 'https://randomuser.me/api/portraits/women/8.jpg',
    joinDate: '2025-05-18',
    status: 'inactive',
  },
];

// Mock data for clinics
export const mockClinics: Clinic[] = [
  {
    id: '1',
    name: 'Happy Paws Veterinary',
    address: '123 Main Street',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    phone: '555-123-4567',
    email: 'info@happypaws.com',
    website: 'https://www.happypaws.com',
    logo: 'https://via.placeholder.com/150?text=Happy+Paws',
    registrationDate: '2025-03-15',
    status: 'active',
    rating: 4.8,
    doctorsCount: 5,
    servicesOffered: ['Checkup', 'Vaccination', 'Surgery', 'Dental Care', 'Grooming']
  },
  {
    id: '2',
    name: 'Healthy Pets Clinic',
    address: '456 Oak Avenue',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90001',
    phone: '555-987-6543',
    email: 'contact@healthypets.com',
    website: 'https://www.healthypets.com',
    logo: 'https://via.placeholder.com/150?text=Healthy+Pets',
    registrationDate: '2025-02-10',
    status: 'active',
    rating: 4.5,
    doctorsCount: 8,
    servicesOffered: ['Checkup', 'Vaccination', 'Emergency Care', 'Pet Nutrition', 'Behavioral Therapy']
  },
  {
    id: '3',
    name: 'Animal Wellness Center',
    address: '789 Pine Street',
    city: 'Chicago',
    state: 'IL',
    zipCode: '60007',
    phone: '555-456-7890',
    email: 'info@animalwellness.com',
    website: 'https://www.animalwellness.com',
    logo: 'https://via.placeholder.com/150?text=Animal+Wellness',
    registrationDate: '2025-04-20',
    status: 'pending',
    rating: 4.2,
    doctorsCount: 3,
    servicesOffered: ['Checkup', 'Laboratory Tests', 'Imaging', 'Emergency Care']
  },
  {
    id: '4',
    name: 'Pet Care Specialists',
    address: '321 Elm Road',
    city: 'Houston',
    state: 'TX',
    zipCode: '77001',
    phone: '555-789-0123',
    email: 'info@petcarespecialists.com',
    website: 'https://www.petcarespecialists.com',
    logo: 'https://via.placeholder.com/150?text=Pet+Care',
    registrationDate: '2025-01-05',
    status: 'active',
    rating: 4.7,
    doctorsCount: 6,
    servicesOffered: ['Checkup', 'Vaccination', 'Surgery', 'Rehabilitation', 'Pet Pharmacy']
  },
  {
    id: '5',
    name: 'VetPlus Medical Center',
    address: '555 Maple Drive',
    city: 'Miami',
    state: 'FL',
    zipCode: '33101',
    phone: '555-321-6547',
    email: 'contact@vetplus.com',
    website: 'https://www.vetplus.com',
    logo: 'https://via.placeholder.com/150?text=VetPlus',
    registrationDate: '2025-05-12',
    status: 'active',
    rating: 4.9,
    doctorsCount: 10,
    servicesOffered: ['Checkup', 'Vaccination', 'Surgery', 'Dental Care', 'Boarding', 'Grooming', 'Emergency Care']
  },
];

// Mock data for bookings
export const mockBookings: Booking[] = [
  {
    id: '1',
    petId: 'pet-001',
    petName: 'Max',
    petType: 'Dog',
    ownerId: '1',
    ownerName: 'John Doe',
    clinicId: '1',
    clinicName: 'Happy Paws Veterinary',
    serviceType: 'Checkup',
    doctorId: 'doc-001',
    doctorName: 'Dr. Emily Clark',
    date: '2025-08-15',
    time: '10:00 AM',
    status: 'scheduled',
    createdAt: '2025-08-10T14:30:00Z'
  },
  {
    id: '2',
    petId: 'pet-002',
    petName: 'Luna',
    petType: 'Cat',
    ownerId: '4',
    ownerName: 'Emily Davis',
    clinicId: '2',
    clinicName: 'Healthy Pets Clinic',
    serviceType: 'Vaccination',
    doctorId: 'doc-002',
    doctorName: 'Dr. Michael Brown',
    date: '2025-08-15',
    time: '11:30 AM',
    status: 'scheduled',
    createdAt: '2025-08-12T09:15:00Z'
  },
  {
    id: '3',
    petId: 'pet-003',
    petName: 'Charlie',
    petType: 'Dog',
    ownerId: '6',
    ownerName: 'Lisa Brown',
    clinicId: '3',
    clinicName: 'Animal Wellness Center',
    serviceType: 'Dental Cleaning',
    doctorId: 'doc-003',
    doctorName: 'Dr. Sarah Johnson',
    date: '2025-08-14',
    time: '2:00 PM',
    status: 'completed',
    notes: 'Teeth look good, follow-up in 6 months',
    createdAt: '2025-08-10T16:45:00Z'
  },
  {
    id: '4',
    petId: 'pet-004',
    petName: 'Bella',
    petType: 'Dog',
    ownerId: '1',
    ownerName: 'John Doe',
    clinicId: '1',
    clinicName: 'Happy Paws Veterinary',
    serviceType: 'Grooming',
    doctorId: 'doc-004',
    doctorName: 'Dr. Robert Wilson',
    date: '2025-08-13',
    time: '9:00 AM',
    status: 'cancelled',
    createdAt: '2025-08-08T11:20:00Z'
  },
  {
    id: '5',
    petId: 'pet-005',
    petName: 'Oliver',
    petType: 'Cat',
    ownerId: '4',
    ownerName: 'Emily Davis',
    clinicId: '4',
    clinicName: 'Pet Care Specialists',
    serviceType: 'Checkup',
    doctorId: 'doc-005',
    doctorName: 'Dr. Lisa Miller',
    date: '2025-08-16',
    time: '4:30 PM',
    status: 'scheduled',
    createdAt: '2025-08-13T10:10:00Z'
  },
  {
    id: '6',
    petId: 'pet-006',
    petName: 'Rocky',
    petType: 'Dog',
    ownerId: '6',
    ownerName: 'Lisa Brown',
    clinicId: '5',
    clinicName: 'VetPlus Medical Center',
    serviceType: 'Surgery',
    doctorId: 'doc-006',
    doctorName: 'Dr. David Johnson',
    date: '2025-08-18',
    time: '8:00 AM',
    status: 'scheduled',
    notes: 'Pre-surgery fasting required',
    createdAt: '2025-08-11T15:30:00Z'
  }
];

// Mock data for products
export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Premium Dog Food',
    description: 'High-quality dog food made with real chicken and vegetables.',
    category: 'Pet Food',
    price: 45.99,
    discountPrice: 39.99,
    stock: 120,
    images: ['https://via.placeholder.com/400?text=Dog+Food'],
    rating: 4.7,
    reviewCount: 52,
    tags: ['dog', 'food', 'premium', 'healthy'],
    isActive: true,
    createdAt: '2025-05-15T10:30:00Z'
  },
  {
    id: '2',
    name: 'Cat Scratching Post',
    description: 'Durable cat scratching post with soft perch on top.',
    category: 'Cat Supplies',
    price: 29.99,
    stock: 75,
    images: ['https://via.placeholder.com/400?text=Scratching+Post'],
    rating: 4.5,
    reviewCount: 38,
    tags: ['cat', 'scratching post', 'furniture'],
    isActive: true,
    createdAt: '2025-06-10T14:45:00Z'
  },
  {
    id: '3',
    name: 'Dog Leash and Collar Set',
    description: 'Comfortable nylon leash and collar set for dogs of all sizes.',
    category: 'Dog Supplies',
    price: 24.99,
    discountPrice: 19.99,
    stock: 95,
    images: ['https://via.placeholder.com/400?text=Leash+Set'],
    rating: 4.8,
    reviewCount: 64,
    tags: ['dog', 'leash', 'collar', 'outdoor'],
    isActive: true,
    createdAt: '2025-04-20T09:15:00Z'
  },
  {
    id: '4',
    name: 'Small Animal Cage',
    description: 'Spacious cage for small pets like hamsters, guinea pigs, or rabbits.',
    category: 'Small Pet Supplies',
    price: 75.99,
    stock: 30,
    images: ['https://via.placeholder.com/400?text=Pet+Cage'],
    rating: 4.6,
    reviewCount: 27,
    tags: ['small pets', 'cage', 'hamster', 'rabbit'],
    isActive: true,
    createdAt: '2025-07-05T11:20:00Z'
  },
  {
    id: '5',
    name: 'Cat Litter Box',
    description: 'Enclosed cat litter box with odor control and easy cleaning.',
    category: 'Cat Supplies',
    price: 35.99,
    discountPrice: 29.99,
    stock: 50,
    images: ['https://via.placeholder.com/400?text=Litter+Box'],
    rating: 4.3,
    reviewCount: 41,
    tags: ['cat', 'litter box', 'odor control'],
    isActive: true,
    createdAt: '2025-06-25T13:10:00Z'
  },
  {
    id: '6',
    name: 'Pet Grooming Kit',
    description: 'Complete grooming kit for cats and dogs, includes clippers, brushes, and scissors.',
    category: 'Grooming',
    price: 49.99,
    stock: 0,
    images: ['https://via.placeholder.com/400?text=Grooming+Kit'],
    rating: 4.9,
    reviewCount: 33,
    tags: ['grooming', 'dog', 'cat', 'clippers'],
    isActive: true,
    createdAt: '2025-05-30T16:40:00Z'
  }
];

// Mock data for orders
export const mockOrders: Order[] = [
  {
    id: '1',
    userId: '1',
    userName: 'John Doe',
    items: [
      {
        productId: '1',
        productName: 'Premium Dog Food',
        quantity: 2,
        unitPrice: 39.99,
        subtotal: 79.98
      },
      {
        productId: '3',
        productName: 'Dog Leash and Collar Set',
        quantity: 1,
        unitPrice: 19.99,
        subtotal: 19.99
      }
    ],
    total: 99.97,
    status: 'delivered',
    paymentStatus: 'completed',
    shippingAddress: '123 Main Street, New York, NY 10001',
    createdAt: '2025-08-10T15:30:00Z',
    updatedAt: '2025-08-12T14:20:00Z',
    trackingNumber: 'TRK789012345'
  },
  {
    id: '2',
    userId: '4',
    userName: 'Emily Davis',
    items: [
      {
        productId: '2',
        productName: 'Cat Scratching Post',
        quantity: 1,
        unitPrice: 29.99,
        subtotal: 29.99
      },
      {
        productId: '5',
        productName: 'Cat Litter Box',
        quantity: 1,
        unitPrice: 29.99,
        subtotal: 29.99
      }
    ],
    total: 59.98,
    status: 'shipped',
    paymentStatus: 'completed',
    shippingAddress: '456 Elm Street, Los Angeles, CA 90001',
    createdAt: '2025-08-12T10:15:00Z',
    updatedAt: '2025-08-13T09:45:00Z',
    trackingNumber: 'TRK123456789'
  },
  {
    id: '3',
    userId: '6',
    userName: 'Lisa Brown',
    items: [
      {
        productId: '4',
        productName: 'Small Animal Cage',
        quantity: 1,
        unitPrice: 75.99,
        subtotal: 75.99
      }
    ],
    total: 75.99,
    status: 'processing',
    paymentStatus: 'completed',
    shippingAddress: '789 Oak Drive, Chicago, IL 60007',
    createdAt: '2025-08-14T14:50:00Z',
    updatedAt: '2025-08-14T16:30:00Z'
  },
  {
    id: '4',
    userId: '1',
    userName: 'John Doe',
    items: [
      {
        productId: '6',
        productName: 'Pet Grooming Kit',
        quantity: 1,
        unitPrice: 49.99,
        subtotal: 49.99
      }
    ],
    total: 49.99,
    status: 'pending',
    paymentStatus: 'pending',
    shippingAddress: '123 Main Street, New York, NY 10001',
    createdAt: '2025-08-15T09:20:00Z',
    updatedAt: '2025-08-15T09:20:00Z'
  }
];

// Mock data for dashboard stats
export const mockDashboardStats: DashboardStats = {
  users: {
    total: 2845,
    active: 2541,
    new: 156,
    growth: 12
  },
  clinics: {
    total: 52,
    active: 48,
    new: 4,
    growth: 8
  },
  bookings: {
    total: 8742,
    today: 184,
    completed: 7523,
    cancelled: 421,
    growth: 24
  },
  products: {
    total: 312,
    outOfStock: 14,
    lowStock: 28
  },
  orders: {
    total: 5723,
    today: 65,
    pending: 42,
    revenue: 124850,
    growth: 10
  },
  pets: {
    total: 4219,
    dogs: 2341,
    cats: 1568,
    others: 310,
    growth: 18
  }
};

// Mock data for activities
export const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'user_registration',
    description: 'New user registered',
    details: 'Emily Johnson (emily.j@example.com)',
    entityId: 'user-125',
    entityType: 'user',
    createdAt: '2025-08-15T12:10:00Z',
    userId: 'user-125',
    userName: 'Emily Johnson'
  },
  {
    id: '2',
    type: 'booking_created',
    description: 'New booking created',
    details: 'Checkup for "Max" at Happy Paws Clinic',
    entityId: 'booking-456',
    entityType: 'booking',
    createdAt: '2025-08-15T11:45:00Z',
    userId: '1',
    userName: 'John Doe'
  },
  {
    id: '3',
    type: 'order_placed',
    description: 'New order placed',
    details: 'Order #38492: Premium Dog Food (3 items)',
    entityId: 'order-38492',
    entityType: 'order',
    createdAt: '2025-08-15T11:25:00Z',
    userId: '4',
    userName: 'Emily Davis'
  },
  {
    id: '4',
    type: 'clinic_registration',
    description: 'New clinic registered',
    details: 'PetCare Plus (Dr. Robert Wilson)',
    entityId: 'clinic-789',
    entityType: 'clinic',
    createdAt: '2025-08-15T10:50:00Z',
    userId: 'user-126',
    userName: 'Robert Wilson'
  },
  {
    id: '5',
    type: 'booking_cancelled',
    description: 'Booking cancelled',
    details: 'Grooming for "Luna" at Furry Friends Salon',
    entityId: 'booking-457',
    entityType: 'booking',
    createdAt: '2025-08-15T09:30:00Z',
    userId: '4',
    userName: 'Emily Davis'
  },
  {
    id: '6',
    type: 'product_added',
    description: 'New product added',
    details: 'Automatic Pet Feeder - $79.99',
    entityId: 'product-134',
    entityType: 'product',
    createdAt: '2025-08-15T09:15:00Z',
    userId: '5',
    userName: 'Michael Wilson'
  },
  {
    id: '7',
    type: 'review_submitted',
    description: 'New review submitted',
    details: '5-star review for Happy Paws Veterinary',
    entityId: 'review-321',
    entityType: 'review',
    createdAt: '2025-08-15T08:45:00Z',
    userId: '1',
    userName: 'John Doe'
  }
];

// Mock API functions
export const mockApiService = {
  // Authentication
  login: async (email: string, password: string) => {
    // Simulating API call
    await new Promise(resolve => setTimeout(resolve, 800));
    if (email === 'admin@petpro.com' && password === 'password') {
      return {
        token: 'mock-token-123',
        user: {
          id: '5',
          name: 'Michael Wilson',
          email: 'michael.w@example.com',
          role: 'admin'
        }
      };
    }
    throw new Error('Invalid credentials');
  },

  // Dashboard
  getDashboardStats: async () => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return mockDashboardStats;
  },
  
  getRecentActivities: async (limit: number = 5) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockActivities.slice(0, limit);
  },

  // Users
  getUsers: async () => {
    await new Promise(resolve => setTimeout(resolve, 700));
    return mockUsers;
  },
  
  getUserById: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockUsers.find(user => user.id === id);
  },

  // Clinics
  getClinics: async () => {
    await new Promise(resolve => setTimeout(resolve, 700));
    return mockClinics;
  },
  
  getClinicById: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockClinics.find(clinic => clinic.id === id);
  },

  // Bookings
  getBookings: async () => {
    await new Promise(resolve => setTimeout(resolve, 700));
    return mockBookings;
  },
  
  getBookingById: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockBookings.find(booking => booking.id === id);
  },

  // Products
  getProducts: async () => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return mockProducts;
  },
  
  getProductById: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockProducts.find(product => product.id === id);
  },

  // Orders
  getOrders: async () => {
    await new Promise(resolve => setTimeout(resolve, 700));
    return mockOrders;
  },
  
  getOrderById: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockOrders.find(order => order.id === id);
  }
};

export default mockApiService;
