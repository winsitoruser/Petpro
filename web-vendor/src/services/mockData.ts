// Mock data service for e-commerce frontend (web-vendor)

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'pet_owner' | 'guest';
  phone?: string;
  avatar?: string;
  joinDate: string;
}

// Pet types
export interface Pet {
  id: string;
  name: string;
  type: 'dog' | 'cat' | 'bird' | 'small_mammal' | 'reptile' | 'other';
  breed: string;
  age: number;
  gender: 'male' | 'female';
  weight: number;
  ownerId: string;
  ownerName: string;
  image?: string;
  medicalRecords?: {
    condition: string;
    date: string;
    notes: string;
  }[];
}

// Product types
export interface Product {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  category: string;
  price: number;
  discountPrice?: number;
  stock: number;
  images: string[];
  rating: number;
  reviewCount: number;
  tags: string[];
  featured: boolean;
  isNew: boolean;
}

export interface ProductCategory {
  id: string;
  name: string;
  description: string;
  image: string;
  productsCount: number;
}

// Booking types
export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
  category: string;
  image?: string;
}

export interface Clinic {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  rating: number;
  reviewCount: number;
  image: string;
  services: string[];
  openingHours: {
    day: string;
    open: string;
    close: string;
  }[];
  doctors: {
    id: string;
    name: string;
    specialty: string;
    image: string;
  }[];
}

export interface Booking {
  id: string;
  petId: string;
  petName: string;
  serviceId: string;
  serviceName: string;
  clinicId: string;
  clinicName: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: string;
}

// Order types
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: string;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt: string;
  trackingNumber?: string;
}

// Mock data - Featured Products
export const mockFeaturedProducts: Product[] = [
  {
    id: '1',
    name: 'Premium Dog Food',
    description: 'Our premium dog food is made with real chicken as the first ingredient. It contains a blend of protein and wholesome grains to support strong muscles and provide energy. This recipe is enriched with vitamins and minerals for a complete and balanced diet that supports overall health and wellbeing.',
    shortDescription: 'High-quality dog food with real chicken',
    category: 'Dog Food',
    price: 45.99,
    discountPrice: 39.99,
    stock: 120,
    images: [
      'https://via.placeholder.com/600x600?text=Premium+Dog+Food',
      'https://via.placeholder.com/600x600?text=Dog+Food+Nutrition',
      'https://via.placeholder.com/600x600?text=Dog+Food+Package',
    ],
    rating: 4.7,
    reviewCount: 52,
    tags: ['dog', 'food', 'premium', 'nutrition'],
    featured: true,
    isNew: false
  },
  {
    id: '2',
    name: 'Cat Scratching Post',
    description: 'This durable cat scratching post is designed to satisfy your cat's natural scratching instincts and help save your furniture. The post is wrapped in natural sisal rope that cats love to scratch, and the platform on top is covered with soft plush material perfect for napping. The sturdy base keeps the post from tipping during vigorous scratching sessions.',
    shortDescription: 'Durable scratching post with perch',
    category: 'Cat Supplies',
    price: 29.99,
    stock: 75,
    images: [
      'https://via.placeholder.com/600x600?text=Cat+Scratching+Post',
      'https://via.placeholder.com/600x600?text=Post+Details',
      'https://via.placeholder.com/600x600?text=Cat+Using+Post',
    ],
    rating: 4.5,
    reviewCount: 38,
    tags: ['cat', 'scratching', 'furniture'],
    featured: true,
    isNew: false
  },
  {
    id: '3',
    name: 'Dog Leash and Collar Set',
    description: 'Our matching leash and collar set is made from high-quality nylon that's both durable and comfortable. The collar features a secure buckle closure and a D-ring for attaching the leash and ID tags. The leash has a comfortable padded handle and reflective stitching for visibility during evening walks. Available in multiple sizes to fit dogs from small to large breeds.',
    shortDescription: 'Comfortable nylon leash and collar set',
    category: 'Dog Supplies',
    price: 24.99,
    discountPrice: 19.99,
    stock: 95,
    images: [
      'https://via.placeholder.com/600x600?text=Leash+and+Collar+Set',
      'https://via.placeholder.com/600x600?text=Leash+Details',
      'https://via.placeholder.com/600x600?text=Collar+Details',
    ],
    rating: 4.8,
    reviewCount: 64,
    tags: ['dog', 'leash', 'collar', 'walking'],
    featured: true,
    isNew: true
  },
  {
    id: '4',
    name: 'Pet Grooming Kit',
    description: 'This comprehensive grooming kit contains everything you need to keep your pet looking their best. Includes professional-grade clippers with multiple guard attachments, grooming scissors, nail clippers, a slicker brush, and a comb. The clippers feature a quiet motor that won't startle nervous pets, and the precision blades ensure a smooth, even cut every time.',
    shortDescription: 'Complete grooming kit for cats and dogs',
    category: 'Grooming',
    price: 49.99,
    stock: 45,
    images: [
      'https://via.placeholder.com/600x600?text=Pet+Grooming+Kit',
      'https://via.placeholder.com/600x600?text=Grooming+Tools',
      'https://via.placeholder.com/600x600?text=Kit+Contents',
    ],
    rating: 4.9,
    reviewCount: 33,
    tags: ['grooming', 'dog', 'cat', 'clippers'],
    featured: true,
    isNew: true
  }
];

// Mock data - Product Categories
export const mockProductCategories: ProductCategory[] = [
  {
    id: '1',
    name: 'Dog Supplies',
    description: 'Everything you need for your canine companion',
    image: 'https://via.placeholder.com/400x300?text=Dog+Supplies',
    productsCount: 128
  },
  {
    id: '2',
    name: 'Cat Supplies',
    description: 'Products for your feline friends',
    image: 'https://via.placeholder.com/400x300?text=Cat+Supplies',
    productsCount: 96
  },
  {
    id: '3',
    name: 'Bird Supplies',
    description: 'Items for your feathered pets',
    image: 'https://via.placeholder.com/400x300?text=Bird+Supplies',
    productsCount: 45
  },
  {
    id: '4',
    name: 'Small Pet Supplies',
    description: 'Products for hamsters, guinea pigs, and more',
    image: 'https://via.placeholder.com/400x300?text=Small+Pet+Supplies',
    productsCount: 62
  },
  {
    id: '5',
    name: 'Pet Food',
    description: 'Nutritious food for all types of pets',
    image: 'https://via.placeholder.com/400x300?text=Pet+Food',
    productsCount: 87
  },
  {
    id: '6',
    name: 'Pet Health',
    description: 'Health and wellness products for pets',
    image: 'https://via.placeholder.com/400x300?text=Pet+Health',
    productsCount: 54
  }
];

// Mock data - Services
export const mockServices: Service[] = [
  {
    id: '1',
    name: 'Basic Check-up',
    description: 'A comprehensive health examination for your pet',
    duration: 30,
    price: 50.00,
    category: 'Health',
    image: 'https://via.placeholder.com/400x300?text=Pet+Checkup'
  },
  {
    id: '2',
    name: 'Vaccination',
    description: 'Essential vaccines to keep your pet healthy',
    duration: 15,
    price: 35.00,
    category: 'Health',
    image: 'https://via.placeholder.com/400x300?text=Pet+Vaccination'
  },
  {
    id: '3',
    name: 'Grooming - Basic',
    description: 'Bathing, brushing, and nail trimming',
    duration: 60,
    price: 45.00,
    category: 'Grooming',
    image: 'https://via.placeholder.com/400x300?text=Basic+Grooming'
  },
  {
    id: '4',
    name: 'Grooming - Full Service',
    description: 'Complete grooming including haircut and styling',
    duration: 90,
    price: 75.00,
    category: 'Grooming',
    image: 'https://via.placeholder.com/400x300?text=Full+Grooming'
  },
  {
    id: '5',
    name: 'Dental Cleaning',
    description: 'Thorough dental cleaning to maintain oral health',
    duration: 45,
    price: 85.00,
    category: 'Dental',
    image: 'https://via.placeholder.com/400x300?text=Dental+Cleaning'
  },
  {
    id: '6',
    name: 'Pet Training Session',
    description: 'Professional training for behavioral issues',
    duration: 60,
    price: 60.00,
    category: 'Training',
    image: 'https://via.placeholder.com/400x300?text=Pet+Training'
  }
];

// Mock data - Clinics
export const mockClinics: Clinic[] = [
  {
    id: '1',
    name: 'Happy Paws Veterinary',
    address: '123 Main Street',
    city: 'New York',
    state: 'NY',
    phone: '(555) 123-4567',
    email: 'info@happypaws.com',
    rating: 4.8,
    reviewCount: 124,
    image: 'https://via.placeholder.com/600x400?text=Happy+Paws+Clinic',
    services: ['Basic Check-up', 'Vaccination', 'Dental Cleaning', 'Pet Training Session'],
    openingHours: [
      { day: 'Monday', open: '8:00 AM', close: '6:00 PM' },
      { day: 'Tuesday', open: '8:00 AM', close: '6:00 PM' },
      { day: 'Wednesday', open: '8:00 AM', close: '6:00 PM' },
      { day: 'Thursday', open: '8:00 AM', close: '6:00 PM' },
      { day: 'Friday', open: '8:00 AM', close: '6:00 PM' },
      { day: 'Saturday', open: '9:00 AM', close: '4:00 PM' },
      { day: 'Sunday', open: 'Closed', close: 'Closed' }
    ],
    doctors: [
      { id: 'd1', name: 'Dr. Emily Clark', specialty: 'General Veterinarian', image: 'https://via.placeholder.com/150?text=Dr.+Clark' },
      { id: 'd2', name: 'Dr. Robert Wilson', specialty: 'Surgery', image: 'https://via.placeholder.com/150?text=Dr.+Wilson' },
      { id: 'd3', name: 'Dr. Sarah Johnson', specialty: 'Dentistry', image: 'https://via.placeholder.com/150?text=Dr.+Johnson' }
    ]
  },
  {
    id: '2',
    name: 'Healthy Pets Clinic',
    address: '456 Oak Avenue',
    city: 'Los Angeles',
    state: 'CA',
    phone: '(555) 987-6543',
    email: 'contact@healthypets.com',
    rating: 4.5,
    reviewCount: 98,
    image: 'https://via.placeholder.com/600x400?text=Healthy+Pets+Clinic',
    services: ['Basic Check-up', 'Vaccination', 'Grooming - Basic', 'Grooming - Full Service'],
    openingHours: [
      { day: 'Monday', open: '9:00 AM', close: '7:00 PM' },
      { day: 'Tuesday', open: '9:00 AM', close: '7:00 PM' },
      { day: 'Wednesday', open: '9:00 AM', close: '7:00 PM' },
      { day: 'Thursday', open: '9:00 AM', close: '7:00 PM' },
      { day: 'Friday', open: '9:00 AM', close: '7:00 PM' },
      { day: 'Saturday', open: '10:00 AM', close: '5:00 PM' },
      { day: 'Sunday', open: '10:00 AM', close: '3:00 PM' }
    ],
    doctors: [
      { id: 'd4', name: 'Dr. Michael Brown', specialty: 'General Veterinarian', image: 'https://via.placeholder.com/150?text=Dr.+Brown' },
      { id: 'd5', name: 'Dr. Amanda White', specialty: 'Dermatology', image: 'https://via.placeholder.com/150?text=Dr.+White' }
    ]
  }
];

// Mock user bookings
export const mockUserBookings: Booking[] = [
  {
    id: 'b1',
    petId: 'p1',
    petName: 'Max',
    serviceId: '1',
    serviceName: 'Basic Check-up',
    clinicId: '1',
    clinicName: 'Happy Paws Veterinary',
    date: '2025-08-20',
    time: '10:00 AM',
    status: 'scheduled',
    createdAt: '2025-08-15T09:30:00Z'
  },
  {
    id: 'b2',
    petId: 'p2',
    petName: 'Bella',
    serviceId: '2',
    serviceName: 'Vaccination',
    clinicId: '1',
    clinicName: 'Happy Paws Veterinary',
    date: '2025-08-12',
    time: '2:30 PM',
    status: 'completed',
    createdAt: '2025-08-05T14:15:00Z'
  },
  {
    id: 'b3',
    petId: 'p1',
    petName: 'Max',
    serviceId: '4',
    serviceName: 'Grooming - Full Service',
    clinicId: '2',
    clinicName: 'Healthy Pets Clinic',
    date: '2025-08-25',
    time: '11:00 AM',
    status: 'scheduled',
    createdAt: '2025-08-14T16:40:00Z'
  }
];

// Mock user orders
export const mockUserOrders: Order[] = [
  {
    id: 'o1',
    items: [
      {
        productId: '1',
        name: 'Premium Dog Food',
        price: 39.99,
        quantity: 2
      },
      {
        productId: '3',
        name: 'Dog Leash and Collar Set',
        price: 19.99,
        quantity: 1
      }
    ],
    total: 99.97,
    status: 'delivered',
    paymentMethod: 'Credit Card',
    shippingAddress: {
      name: 'John Doe',
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    createdAt: '2025-07-20T15:30:00Z',
    trackingNumber: 'TRK123456789'
  },
  {
    id: 'o2',
    items: [
      {
        productId: '4',
        name: 'Pet Grooming Kit',
        price: 49.99,
        quantity: 1
      }
    ],
    total: 49.99,
    status: 'shipped',
    paymentMethod: 'PayPal',
    shippingAddress: {
      name: 'John Doe',
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    createdAt: '2025-08-10T11:20:00Z',
    trackingNumber: 'TRK987654321'
  },
  {
    id: 'o3',
    items: [
      {
        productId: '2',
        name: 'Cat Scratching Post',
        price: 29.99,
        quantity: 1
      }
    ],
    total: 29.99,
    status: 'processing',
    paymentMethod: 'Credit Card',
    shippingAddress: {
      name: 'John Doe',
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    createdAt: '2025-08-14T09:45:00Z'
  }
];

// Mock user pets
export const mockUserPets: Pet[] = [
  {
    id: 'p1',
    name: 'Max',
    type: 'dog',
    breed: 'Golden Retriever',
    age: 3,
    gender: 'male',
    weight: 65,
    ownerId: 'user1',
    ownerName: 'John Doe',
    image: 'https://via.placeholder.com/300x300?text=Golden+Retriever',
    medicalRecords: [
      {
        condition: 'Annual checkup',
        date: '2025-05-15',
        notes: 'Healthy, vaccinations updated'
      },
      {
        condition: 'Minor ear infection',
        date: '2025-03-10',
        notes: 'Prescribed ear drops, follow up in 2 weeks'
      }
    ]
  },
  {
    id: 'p2',
    name: 'Bella',
    type: 'dog',
    breed: 'Beagle',
    age: 2,
    gender: 'female',
    weight: 22,
    ownerId: 'user1',
    ownerName: 'John Doe',
    image: 'https://via.placeholder.com/300x300?text=Beagle',
    medicalRecords: [
      {
        condition: 'Vaccination',
        date: '2025-06-20',
        notes: 'DHPP booster'
      }
    ]
  },
  {
    id: 'p3',
    name: 'Oliver',
    type: 'cat',
    breed: 'Domestic Shorthair',
    age: 4,
    gender: 'male',
    weight: 12,
    ownerId: 'user1',
    ownerName: 'John Doe',
    image: 'https://via.placeholder.com/300x300?text=Domestic+Shorthair',
    medicalRecords: [
      {
        condition: 'Dental cleaning',
        date: '2025-07-05',
        notes: 'Minor tartar buildup, otherwise good'
      }
    ]
  }
];

// Mock testimonials
export const mockTestimonials = [
  {
    id: '1',
    name: 'Sarah Johnson',
    avatar: 'https://via.placeholder.com/100?text=Sarah+J',
    rating: 5,
    text: 'PetPro has completely transformed how I care for my pets. The booking system is so convenient, and the products are always high-quality. My dog Max loves his new toys from their store!',
    date: '2025-07-15'
  },
  {
    id: '2',
    name: 'Michael Chang',
    avatar: 'https://via.placeholder.com/100?text=Michael+C',
    rating: 5,
    text: 'I used to struggle finding reliable vets for my cat Luna, but thanks to PetPro, I found an amazing clinic just 10 minutes from home. The health tracking feature is also incredibly useful.',
    date: '2025-07-22'
  },
  {
    id: '3',
    name: 'Emily Davis',
    avatar: 'https://via.placeholder.com/100?text=Emily+D',
    rating: 4,
    text: 'The PetPro platform makes managing appointments for my three dogs so much easier. The reminders and health records all in one place have been a game changer for our busy household.',
    date: '2025-08-03'
  },
  {
    id: '4',
    name: 'Robert Wilson',
    avatar: 'https://via.placeholder.com/100?text=Robert+W',
    rating: 5,
    text: 'As a first-time pet owner, PetPro has been invaluable. Their educational resources helped me understand what my puppy needs, and their product recommendations have all been spot-on.',
    date: '2025-08-10'
  }
];

// Mock cart
export const mockCart: CartItem[] = [
  {
    productId: '1',
    name: 'Premium Dog Food',
    price: 45.99,
    discountPrice: 39.99,
    quantity: 2,
    image: 'https://via.placeholder.com/100?text=Dog+Food'
  },
  {
    productId: '3',
    name: 'Dog Leash and Collar Set',
    price: 24.99,
    discountPrice: 19.99,
    quantity: 1,
    image: 'https://via.placeholder.com/100?text=Leash+Set'
  }
];

// Mock API service for frontend
export const mockApiService = {
  // Auth
  login: async (email: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    if (email === 'user@example.com' && password === 'password') {
      return {
        token: 'mock-user-token',
        user: {
          id: 'user1',
          name: 'John Doe',
          email: 'user@example.com',
          role: 'pet_owner'
        }
      };
    }
    throw new Error('Invalid credentials');
  },
  
  register: async (data: any) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      success: true,
      message: 'Registration successful',
      user: {
        id: 'new-user',
        name: data.name,
        email: data.email,
        role: 'pet_owner'
      }
    };
  },

  // Products
  getFeaturedProducts: async () => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return mockFeaturedProducts;
  },
  
  getProductCategories: async () => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockProductCategories;
  },
  
  getProductById: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockFeaturedProducts.find(product => product.id === id);
  },
  
  // Services & Clinics
  getServices: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockServices;
  },
  
  getClinics: async () => {
    await new Promise(resolve => setTimeout(resolve, 700));
    return mockClinics;
  },
  
  getClinicById: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockClinics.find(clinic => clinic.id === id);
  },
  
  // User Data
  getUserBookings: async () => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return mockUserBookings;
  },
  
  getUserOrders: async () => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return mockUserOrders;
  },
  
  getUserPets: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockUserPets;
  },
  
  // Cart
  getCart: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockCart;
  },
  
  addToCart: async (productId: string, quantity: number) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return {
      success: true,
      message: 'Item added to cart',
      cartCount: mockCart.length + 1
    };
  },
  
  // Bookings
  createBooking: async (bookingData: any) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      success: true,
      message: 'Booking created successfully',
      booking: {
        id: `b${Math.floor(Math.random() * 1000)}`,
        ...bookingData,
        status: 'scheduled',
        createdAt: new Date().toISOString()
      }
    };
  }
};

export default mockApiService;
