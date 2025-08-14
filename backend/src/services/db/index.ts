/**
 * PetPro Database Services
 * 
 * This file exports all database service classes organized by domain.
 */

// Base Service
export { default as BaseService } from './baseService';

// User Management Services
export { default as UserService } from './userService';
export { default as AddressService } from './addressService';
export { default as AuthService } from './authService';
export { default as RoleService } from './roleService';
export { default as PermissionService } from './permissionService';

// Pet Management Services
export { default as PetService } from './petService';
export { default as PetHealthService } from './petHealthService';

// Clinic Management Services
export { default as ClinicService } from './clinicService';
export { default as AppointmentService } from './appointmentService';

// Product Management Services
export { default as ProductService } from './productService';
export { default as InventoryService } from './inventoryService';
export { default as OrderService } from './orderService';

// Review System Services
export { default as ReviewService } from './reviewService';

// Notification Services
export { default as NotificationService } from './notificationService';

// Payment Services
export { default as PaymentService } from './paymentService';

// Import for service instances
import BaseService from './baseService';
import UserService from './userService';
import AddressService from './addressService';
import AuthService from './authService';
import RoleService from './roleService';
import PermissionService from './permissionService';
import PetService from './petService';
import PetHealthService from './petHealthService';
import ClinicService from './clinicService';
import AppointmentService from './appointmentService';
import ProductService from './productService';
import InventoryService from './inventoryService';
import OrderService from './orderService';
import PaymentService from './paymentService';
import ReviewService from './reviewService';
import NotificationService from './notificationService';

// Default export with service instances
export default {
  // User domain
  user: new UserService(),
  address: new AddressService(),
  auth: new AuthService(),
  role: new RoleService(),
  permission: new PermissionService(),
  
  // Pet domain
  pet: new PetService(),
  petHealth: new PetHealthService(),
  
  // Clinic domain
  clinic: new ClinicService(),
  appointment: new AppointmentService(),
  
  // Product domain
  product: new ProductService(),
  inventory: new InventoryService(),
  order: new OrderService(),
  
  // Payment domain
  payment: new PaymentService(),
  
  // Review domain
  review: new ReviewService(),
  
  // Notification domain
  notification: new NotificationService(),
};
