/**
 * Permission Database Service
 * 
 * Manages system permissions for fine-grained access control.
 */
import { Permission } from '@prisma/client';
import BaseService from './baseService';

export default class PermissionService extends BaseService<Permission> {
  constructor() {
    super('permission');
    this.searchFields = ['name', 'description', 'resource', 'action'];
  }

  /**
   * Get all permissions grouped by resource
   */
  async getPermissionsGroupedByResource(
    options?: {
      skip?: number;
      take?: number;
      search?: string;
    }
  ): Promise<Record<string, Permission[]>> {
    const where: any = {};
    
    if (options?.search) {
      where.OR = this.searchFields.map(field => ({
        [field]: {
          contains: options.search,
          mode: 'insensitive',
        },
      }));
    }
    
    const permissions = await this.prisma.permission.findMany({
      where,
      orderBy: [
        { resource: 'asc' },
        { action: 'asc' },
      ],
      skip: options?.skip,
      take: options?.take,
    });
    
    // Group by resource
    return permissions.reduce((grouped, permission) => {
      const resource = permission.resource || 'Other';
      
      if (!grouped[resource]) {
        grouped[resource] = [];
      }
      
      grouped[resource].push(permission);
      return grouped;
    }, {} as Record<string, Permission[]>);
  }

  /**
   * Create multiple permissions at once
   */
  async createPermissionBatch(
    permissions: Array<{
      name: string;
      description?: string;
      resource: string;
      action: string;
      isSystem?: boolean;
    }>
  ): Promise<{ created: number; duplicates: number }> {
    let created = 0;
    let duplicates = 0;
    
    for (const permission of permissions) {
      // Check if permission already exists
      const existing = await this.prisma.permission.findFirst({
        where: {
          resource: permission.resource,
          action: permission.action,
        },
      });
      
      if (existing) {
        duplicates++;
        continue;
      }
      
      // Create new permission
      await this.prisma.permission.create({
        data: {
          name: permission.name,
          description: permission.description,
          resource: permission.resource,
          action: permission.action,
          isSystem: permission.isSystem ?? false,
        },
      });
      
      created++;
    }
    
    return { created, duplicates };
  }

  /**
   * Get user's effective permissions
   */
  async getUserEffectivePermissions(
    userId: string
  ): Promise<Permission[]> {
    // Get all active roles for the user
    const userRoles = await this.prisma.userRole.findMany({
      where: {
        userId,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      select: {
        roleId: true,
      },
    });
    
    if (userRoles.length === 0) {
      return [];
    }
    
    const roleIds = userRoles.map(ur => ur.roleId);
    
    // Get unique permissions from all roles
    const rolePermissions = await this.prisma.rolePermission.findMany({
      where: {
        roleId: {
          in: roleIds,
        },
      },
      distinct: ['permissionId'],
      select: {
        permission: true,
      },
    });
    
    return rolePermissions.map(rp => rp.permission);
  }

  /**
   * Check if user has specific permission
   */
  async userHasPermission(
    userId: string,
    resourceAction: string
  ): Promise<boolean> {
    // Parse resource:action format
    const [resource, action] = resourceAction.split(':');
    
    if (!resource || !action) {
      return false;
    }
    
    // Get all active roles for the user
    const userRoles = await this.prisma.userRole.findMany({
      where: {
        userId,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      select: {
        roleId: true,
      },
    });
    
    if (userRoles.length === 0) {
      return false;
    }
    
    const roleIds = userRoles.map(ur => ur.roleId);
    
    // Count matching permissions
    const permissionCount = await this.prisma.permission.count({
      where: {
        resource,
        action,
        rolePermissions: {
          some: {
            roleId: {
              in: roleIds,
            },
          },
        },
      },
    });
    
    return permissionCount > 0;
  }

  /**
   * Check if permission is in use by any role
   */
  async isPermissionInUse(permissionId: string): Promise<boolean> {
    const usageCount = await this.prisma.rolePermission.count({
      where: { permissionId },
    });
    
    return usageCount > 0;
  }

  /**
   * Safely delete permission if not in use
   */
  async safeDeletePermission(permissionId: string): Promise<{ success: boolean; message: string }> {
    const inUse = await this.isPermissionInUse(permissionId);
    
    if (inUse) {
      return {
        success: false,
        message: 'Permission is currently assigned to roles and cannot be deleted.',
      };
    }
    
    // Check if it's a system permission
    const permission = await this.prisma.permission.findUnique({
      where: { id: permissionId },
    });
    
    if (permission?.isSystem) {
      return {
        success: false,
        message: 'System permissions cannot be deleted.',
      };
    }
    
    // Safe to delete
    await this.delete(permissionId);
    
    return {
      success: true,
      message: 'Permission successfully deleted.',
    };
  }

  /**
   * Get default permission set (for system initialization)
   */
  getDefaultSystemPermissions(): Array<{
    name: string;
    description: string;
    resource: string;
    action: string;
    isSystem: boolean;
  }> {
    return [
      // User management
      {
        name: 'View Users',
        description: 'Can view user list and profiles',
        resource: 'users',
        action: 'read',
        isSystem: true,
      },
      {
        name: 'Create Users',
        description: 'Can create new users',
        resource: 'users',
        action: 'create',
        isSystem: true,
      },
      {
        name: 'Update Users',
        description: 'Can update user profiles',
        resource: 'users',
        action: 'update',
        isSystem: true,
      },
      {
        name: 'Delete Users',
        description: 'Can delete users',
        resource: 'users',
        action: 'delete',
        isSystem: true,
      },
      
      // Role management
      {
        name: 'View Roles',
        description: 'Can view roles and permissions',
        resource: 'roles',
        action: 'read',
        isSystem: true,
      },
      {
        name: 'Manage Roles',
        description: 'Can create, update, and delete roles',
        resource: 'roles',
        action: 'manage',
        isSystem: true,
      },
      {
        name: 'Assign Roles',
        description: 'Can assign roles to users',
        resource: 'roles',
        action: 'assign',
        isSystem: true,
      },
      
      // Pet management
      {
        name: 'View Pets',
        description: 'Can view pet profiles',
        resource: 'pets',
        action: 'read',
        isSystem: true,
      },
      {
        name: 'Manage Pets',
        description: 'Can create, update, and delete pets',
        resource: 'pets',
        action: 'manage',
        isSystem: true,
      },
      
      // Clinic management
      {
        name: 'View Clinics',
        description: 'Can view clinic information',
        resource: 'clinics',
        action: 'read',
        isSystem: true,
      },
      {
        name: 'Manage Clinics',
        description: 'Can create, update, and delete clinics',
        resource: 'clinics',
        action: 'manage',
        isSystem: true,
      },
      
      // Appointment management
      {
        name: 'View Appointments',
        description: 'Can view appointments',
        resource: 'appointments',
        action: 'read',
        isSystem: true,
      },
      {
        name: 'Schedule Appointments',
        description: 'Can create and update appointments',
        resource: 'appointments',
        action: 'schedule',
        isSystem: true,
      },
      {
        name: 'Cancel Appointments',
        description: 'Can cancel appointments',
        resource: 'appointments',
        action: 'cancel',
        isSystem: true,
      },
      
      // Product management
      {
        name: 'View Products',
        description: 'Can view product catalog',
        resource: 'products',
        action: 'read',
        isSystem: true,
      },
      {
        name: 'Manage Products',
        description: 'Can create, update, and delete products',
        resource: 'products',
        action: 'manage',
        isSystem: true,
      },
      
      // Inventory management
      {
        name: 'View Inventory',
        description: 'Can view inventory levels',
        resource: 'inventory',
        action: 'read',
        isSystem: true,
      },
      {
        name: 'Manage Inventory',
        description: 'Can update inventory levels',
        resource: 'inventory',
        action: 'manage',
        isSystem: true,
      },
      
      // Order management
      {
        name: 'View Orders',
        description: 'Can view customer orders',
        resource: 'orders',
        action: 'read',
        isSystem: true,
      },
      {
        name: 'Manage Orders',
        description: 'Can create and update orders',
        resource: 'orders',
        action: 'manage',
        isSystem: true,
      },
      {
        name: 'Process Refunds',
        description: 'Can process order refunds',
        resource: 'orders',
        action: 'refund',
        isSystem: true,
      },
      
      // Payment management
      {
        name: 'View Payments',
        description: 'Can view payment records',
        resource: 'payments',
        action: 'read',
        isSystem: true,
      },
      {
        name: 'Process Payments',
        description: 'Can process payments',
        resource: 'payments',
        action: 'process',
        isSystem: true,
      },
      
      // Review management
      {
        name: 'View Reviews',
        description: 'Can view customer reviews',
        resource: 'reviews',
        action: 'read',
        isSystem: true,
      },
      {
        name: 'Manage Reviews',
        description: 'Can approve, edit, or delete reviews',
        resource: 'reviews',
        action: 'manage',
        isSystem: true,
      },
      
      // Report access
      {
        name: 'View Reports',
        description: 'Can view business reports',
        resource: 'reports',
        action: 'read',
        isSystem: true,
      },
      {
        name: 'Export Reports',
        description: 'Can export business reports',
        resource: 'reports',
        action: 'export',
        isSystem: true,
      },
    ];
  }
}
