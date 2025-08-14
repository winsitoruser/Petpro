/**
 * User Types
 * 
 * Defines the various user types and roles in the PetPro system.
 */

/**
 * Enum defining the different user types in the system
 */
export enum UserType {
  ADMIN = 'ADMIN',
  VET = 'VET',
  STAFF = 'STAFF',
  PET_OWNER = 'PET_OWNER',
  GUEST = 'GUEST'
}

/**
 * Permission levels for user actions
 */
export enum PermissionLevel {
  READ = 'READ',
  WRITE = 'WRITE',
  ADMIN = 'ADMIN',
  NONE = 'NONE'
}

/**
 * Interface for role-based access control
 */
export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: RolePermission[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface for permissions attached to a role
 */
export interface RolePermission {
  id: string;
  roleId: string;
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

/**
 * Interface for user-role associations
 */
export interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  assignedAt: Date;
  assignedBy?: string;
}

/**
 * Map of user types to default roles
 */
export const DEFAULT_ROLES: Record<UserType, string[]> = {
  [UserType.ADMIN]: ['system_admin'],
  [UserType.VET]: ['vet_practitioner', 'content_contributor'],
  [UserType.STAFF]: ['clinic_staff', 'appointment_manager'],
  [UserType.PET_OWNER]: ['pet_owner'],
  [UserType.GUEST]: ['guest']
};

/**
 * Standard role-based security checks
 */
export function canAccessResource(userRoles: string[], requiredRoles: string[]): boolean {
  return userRoles.some(role => requiredRoles.includes(role));
}
