/**
 * PetPro TypeScript Models
 *
 * Core interfaces that map to database schema and API responses.
 */

// Enum Types
export enum UserType {
  CUSTOMER = 'customer',
  VENDOR = 'vendor',
  ADMIN = 'admin',
}

export enum PetSpecies {
  DOG = 'dog',
  CAT = 'cat',
  BIRD = 'bird',
  FISH = 'fish',
  REPTILE = 'reptile',
  SMALL_MAMMAL = 'small_mammal',
  OTHER = 'other',
}

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum PaymentStatus {
  PENDING = 'pending',
  AUTHORIZED = 'authorized',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum ReviewTargetType {
  PRODUCT = 'product',
  CLINIC = 'clinic',
  SERVICE = 'service',
}

// Base model with common fields
export interface BaseModel {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// User Management Models
export interface Role extends BaseModel {
  name: string;
  description?: string;
}

export interface Permission extends BaseModel {
  name: string;
  description?: string;
  resource: string;
  action: string;
}

export interface RolePermission {
  roleId: string;
  permissionId: string;
  createdAt: Date;
}

export interface User extends BaseModel {
  email: string;
  passwordHash?: string;
  userType: UserType;
  emailVerified: boolean;
  phone?: string;
  phoneVerified: boolean;
  active: boolean;
  lastLogin?: Date;
  deletedAt?: Date;
  
  // Virtual relations
  profile?: UserProfile;
  roles?: Role[];
  permissions?: Permission[];
}

export interface UserProfile extends BaseModel {
  userId: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  profilePictureUrl?: string;
  bio?: string;
  preferences: Record<string, any>;
  
  // Virtual relations
  user?: User;
}

export interface UserRole {
  userId: string;
  roleId: string;
  createdAt: Date;
  updatedBy?: string;
}

export interface RefreshToken extends BaseModel {
  userId: string;
  token: string;
  expiresAt: Date;
  revoked: boolean;
  revokedAt?: Date;
}

export interface OAuthAccount extends BaseModel {
  userId: string;
  provider: string;
  providerUserId: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
}

export interface Address extends BaseModel {
  userId?: string;
  addressType: string;
  streetAddress: string;
  aptSuite?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  latitude?: number;
  longitude?: number;
}

// Pet Management Models
export interface Pet extends BaseModel {
  userId: string;
  name: string;
  species: PetSpecies;
  breed?: string;
  birthdate?: Date;
  weight?: number;
  gender?: string;
  microchipId?: string;
  pictureUrl?: string;
  attributes: Record<string, any>;
  active: boolean;
  deletedAt?: Date;
  
  // Virtual relations
  owner?: User;
  healthRecords?: PetHealthRecord[];
  vaccinations?: PetVaccination[];
  allergies?: PetAllergy[];
  medications?: PetMedication[];
}

export interface PetHealthRecord extends BaseModel {
  petId: string;
  recordDate: Date;
  recordType: string;
  description: string;
  vetName?: string;
  documents: string[];
  
  // Virtual relations
  pet?: Pet;
}

export interface PetVaccination extends BaseModel {
  petId: string;
  name: string;
  administeredDate: Date;
  expirationDate?: Date;
  lotNumber?: string;
  administeredBy?: string;
  documentUrl?: string;
  
  // Virtual relations
  pet?: Pet;
}

export interface PetAllergy extends BaseModel {
  petId: string;
  allergen: string;
  severity?: string;
  diagnosisDate?: Date;
  symptoms?: string;
  treatment?: string;
  
  // Virtual relations
  pet?: Pet;
}

export interface PetMedication extends BaseModel {
  petId: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: Date;
  endDate?: Date;
  instructions?: string;
  prescribedBy?: string;
  active: boolean;
  
  // Virtual relations
  pet?: Pet;
}

// Clinic Management Models
export interface Clinic extends BaseModel {
  userId: string;
  name: string;
  description?: string;
  phoneNumber: string;
  email: string;
  website?: string;
  logoUrl?: string;
  addressId: string;
  businessHours: Record<string, any>;
  active: boolean;
  verified: boolean;
  deletedAt?: Date;
  
  // Virtual relations
  owner?: User;
  address?: Address;
  services?: ClinicService[];
  staff?: ClinicStaff[];
}

export interface ClinicService extends BaseModel {
  clinicId: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  active: boolean;
  
  // Virtual relations
  clinic?: Clinic;
}

export interface ClinicStaff extends BaseModel {
  clinicId: string;
  firstName: string;
  lastName: string;
  title: string;
  bio?: string;
  specialties: string[];
  pictureUrl?: string;
  email?: string;
  phoneNumber?: string;
  active: boolean;
  
  // Virtual relations
  clinic?: Clinic;
  availability?: StaffAvailability[];
}

export interface StaffAvailability extends BaseModel {
  clinicId: string;
  staffId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  
  // Virtual relations
  clinic?: Clinic;
  staff?: ClinicStaff;
}

export interface Appointment extends BaseModel {
  clinicId: string;
  serviceId: string;
  staffId?: string;
  userId: string;
  petId: string;
  startTime: Date;
  endTime: Date;
  status: AppointmentStatus;
  notes?: string;
  cancelledBy?: string;
  cancelReason?: string;
  
  // Virtual relations
  clinic?: Clinic;
  service?: ClinicService;
  staff?: ClinicStaff;
  client?: User;
  pet?: Pet;
  appointmentNotes?: AppointmentNote[];
}

export interface AppointmentNote extends BaseModel {
  appointmentId: string;
  note: string;
  addedBy: string;
  
  // Virtual relations
  appointment?: Appointment;
}

// Product Management Models
export interface ProductCategory extends BaseModel {
  parentId?: string;
  name: string;
  description?: string;
  displayOrder: number;
  active: boolean;
  
  // Virtual relations
  parent?: ProductCategory;
  subcategories?: ProductCategory[];
  products?: Product[];
}

export interface Product extends BaseModel {
  categoryId: string;
  name: string;
  description: string;
  sku?: string;
  featured: boolean;
  publishedAt?: Date;
  metadata: Record<string, any>;
  attributes: Record<string, any>;
  deletedAt?: Date;
  
  // Virtual relations
  category?: ProductCategory;
  variants?: ProductVariant[];
}

export interface ProductVariant extends BaseModel {
  productId: string;
  name: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  options: Record<string, any>;
  imageUrls: string[];
  weight?: number;
  weightUnit?: string;
  dimensions?: Record<string, any>;
  active: boolean;
  
  // Virtual relations
  product?: Product;
  inventoryItems?: InventoryItem[];
}

export interface InventoryItem extends BaseModel {
  variantId: string;
  quantity: number;
  reservedQuantity: number;
  locationCode?: string;
  reorderThreshold?: number;
  
  // Virtual relations
  variant?: ProductVariant;
  transactions?: InventoryTransaction[];
}

export interface InventoryTransaction extends BaseModel {
  inventoryItemId: string;
  quantity: number;
  type: string;
  reference?: string;
  notes?: string;
  createdBy?: string;
  
  // Virtual relations
  inventoryItem?: InventoryItem;
}

export interface ShoppingCart extends BaseModel {
  userId?: string;
  guestId?: string;
  
  // Virtual relations
  user?: User;
  items?: ShoppingCartItem[];
}

export interface ShoppingCartItem extends BaseModel {
  cartId: string;
  variantId: string;
  quantity: number;
  addedAt: Date;
  
  // Virtual relations
  cart?: ShoppingCart;
  variant?: ProductVariant;
}

export interface Order extends BaseModel {
  userId?: string;
  guestEmail?: string;
  orderNumber: string;
  status: OrderStatus;
  currencyCode: string;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  notes?: string;
  billingAddressId?: string;
  shippingAddressId?: string;
  shippingMethod?: string;
  trackingNumber?: string;
  promoCode?: string;
  metadata: Record<string, any>;
  
  // Virtual relations
  user?: User;
  billingAddress?: Address;
  shippingAddress?: Address;
  items?: OrderItem[];
  transactions?: PaymentTransaction[];
}

export interface OrderItem extends BaseModel {
  orderId: string;
  variantId: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  discount: number;
  tax: number;
  total: number;
  metadata: Record<string, any>;
  
  // Virtual relations
  order?: Order;
  variant?: ProductVariant;
}

export interface Promotion extends BaseModel {
  code: string;
  name: string;
  description?: string;
  discountType: string;
  discountValue: number;
  minimumOrderAmount?: number;
  startDate: Date;
  endDate?: Date;
  usageLimit?: number;
  usageCount: number;
  active: boolean;
}

// Review System Models
export interface Review extends BaseModel {
  userId: string;
  targetType: ReviewTargetType;
  targetId: string;
  rating: number;
  title?: string;
  content: string;
  approved: boolean;
  
  // Virtual relations
  user?: User;
  replies?: ReviewReply[];
  votes?: ReviewVote[];
}

export interface ReviewReply extends BaseModel {
  reviewId: string;
  userId: string;
  content: string;
  
  // Virtual relations
  review?: Review;
  user?: User;
}

export interface ReviewVote extends BaseModel {
  reviewId: string;
  userId: string;
  isUpvote: boolean;
  
  // Virtual relations
  review?: Review;
  user?: User;
}

// Notification Models
export interface Notification extends BaseModel {
  userId: string;
  type: string;
  title: string;
  content: string;
  metadata: Record<string, any>;
  readAt?: Date;
  expiresAt?: Date;
  
  // Virtual relations
  user?: User;
}

export interface NotificationPreference extends BaseModel {
  userId: string;
  type: string;
  channel: string;
  enabled: boolean;
  
  // Virtual relations
  user?: User;
}

export interface NotificationTemplate extends BaseModel {
  type: string;
  name: string;
  description?: string;
  emailSubject?: string;
  emailBody?: string;
  pushTitle?: string;
  pushBody?: string;
  smsBody?: string;
  parameters: Record<string, any>;
  active: boolean;
}

// Payment Models
export interface PaymentMethod extends BaseModel {
  userId: string;
  type: string;
  providerToken?: string;
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  cardholderName?: string;
  isDefault: boolean;
  billingAddressId?: string;
  metadata: Record<string, any>;
  
  // Virtual relations
  user?: User;
  transactions?: PaymentTransaction[];
}

export interface PaymentTransaction extends BaseModel {
  userId: string;
  paymentMethodId?: string;
  orderId?: string;
  amount: number;
  currencyCode: string;
  status: PaymentStatus;
  provider: string;
  providerTransactionId?: string;
  providerResponse?: Record<string, any>;
  metadata: Record<string, any>;
  
  // Virtual relations
  user?: User;
  paymentMethod?: PaymentMethod;
  order?: Order;
  refunds?: PaymentRefund[];
}

export interface PaymentRefund extends BaseModel {
  transactionId: string;
  amount: number;
  reason?: string;
  notes?: string;
  status: string;
  providerRefundId?: string;
  requestedBy: string;
  processedAt?: Date;
  
  // Virtual relations
  transaction?: PaymentTransaction;
  requestor?: User;
}
