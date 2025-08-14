/**
 * Role Database Service
 * 
 * Manages user roles and role-based access control.
 */
import { Role, UserRole } from '@prisma/client';
import BaseService from './baseService';

export default class RoleService extends BaseService<Role> {
  constructor() {
    super('role');
    this.searchFields = ['name', 'description'];
    this.defaultInclude = {
      permissions: {
        include: {
          permission: true,
        },
      },
    };
  }

  /**
   * Get all roles with permissions
   */
  async getRolesWithPermissions(
    options?: {
      skip?: number;
      take?: number;
      search?: string;
    }
  ): Promise<Role[]> {
    const where: any = {};
    
    if (options?.search) {
      where.OR = this.searchFields.map(field => ({
        [field]: {
          contains: options.search,
          mode: 'insensitive',
        },
      }));
    }
    
    return this.prisma.role.findMany({
      where,
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: {
            users: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
      skip: options?.skip,
      take: options?.take,
    });
  }

  /**
   * Get role by ID with permissions
   */
  async getRoleWithPermissions(roleId: string): Promise<Role | null> {
    return this.prisma.role.findUnique({
      where: { id: roleId },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: {
            users: true,
          },
        },
      },
    });
  }

  /**
   * Create role with permissions
   */
  async createRoleWithPermissions(
    data: {
      name: string;
      description?: string;
      isSystem?: boolean;
      permissionIds?: string[];
    }
  ): Promise<Role> {
    return this.prisma.$transaction(async (tx) => {
      const role = await tx.role.create({
        data: {
          name: data.name,
          description: data.description,
          isSystem: data.isSystem || false,
        },
      });
      
      // Add permissions if provided
      if (data.permissionIds && data.permissionIds.length > 0) {
        await tx.rolePermission.createMany({
          data: data.permissionIds.map(permissionId => ({
            roleId: role.id,
            permissionId,
          })),
        });
      }
      
      // Return role with permissions
      return tx.role.findUnique({
        where: { id: role.id },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      }) as Promise<Role>;
    });
  }

  /**
   * Update role permissions
   */
  async updateRolePermissions(
    roleId: string,
    permissionIds: string[]
  ): Promise<Role> {
    return this.prisma.$transaction(async (tx) => {
      // First, delete all current permissions for this role
      await tx.rolePermission.deleteMany({
        where: { roleId },
      });
      
      // Then, add the new permissions
      if (permissionIds.length > 0) {
        await tx.rolePermission.createMany({
          data: permissionIds.map(permissionId => ({
            roleId,
            permissionId,
          })),
        });
      }
      
      // Return updated role
      return tx.role.findUnique({
        where: { id: roleId },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      }) as Promise<Role>;
    });
  }

  /**
   * Assign role to user
   */
  async assignRoleToUser(
    userId: string,
    roleId: string,
    options?: {
      expiresAt?: Date;
      assignedBy?: string;
    }
  ): Promise<UserRole> {
    // Check if user already has this role
    const existingRole = await this.prisma.userRole.findFirst({
      where: {
        userId,
        roleId,
      },
    });
    
    if (existingRole) {
      // Update existing role assignment
      return this.prisma.userRole.update({
        where: {
          id: existingRole.id,
        },
        data: {
          expiresAt: options?.expiresAt,
          assignedBy: options?.assignedBy,
          updatedAt: new Date(),
        },
      });
    }
    
    // Create new role assignment
    return this.prisma.userRole.create({
      data: {
        userId,
        roleId,
        expiresAt: options?.expiresAt,
        assignedBy: options?.assignedBy,
      },
    });
  }

  /**
   * Remove role from user
   */
  async removeRoleFromUser(
    userId: string,
    roleId: string
  ): Promise<boolean> {
    const result = await this.prisma.userRole.deleteMany({
      where: {
        userId,
        roleId,
      },
    });
    
    return result.count > 0;
  }

  /**
   * Get all users with a specific role
   */
  async getUsersWithRole(
    roleId: string,
    options?: {
      skip?: number;
      take?: number;
      search?: string;
    }
  ): Promise<Array<{
    userRole: UserRole;
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
    };
  }>> {
    const where: any = { roleId };
    
    if (options?.search) {
      where.user = {
        OR: [
          { email: { contains: options.search, mode: 'insensitive' } },
          { firstName: { contains: options.search, mode: 'insensitive' } },
          { lastName: { contains: options.search, mode: 'insensitive' } },
        ],
      };
    }
    
    const userRoles = await this.prisma.userRole.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        user: {
          lastName: 'asc',
        },
      },
      skip: options?.skip,
      take: options?.take,
    });
    
    return userRoles;
  }

  /**
   * Get all roles for a user
   */
  async getUserRoles(
    userId: string,
    options?: {
      includeExpired?: boolean;
    }
  ): Promise<Array<{
    userRole: UserRole;
    role: Role;
  }>> {
    const where: any = { userId };
    
    if (!options?.includeExpired) {
      where.OR = [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ];
    }
    
    const userRoles = await this.prisma.userRole.findMany({
      where,
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
      orderBy: {
        role: {
          name: 'asc',
        },
      },
    });
    
    return userRoles;
  }

  /**
   * Check if user has specific role
   */
  async userHasRole(
    userId: string,
    roleNameOrId: string
  ): Promise<boolean> {
    const isId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(roleNameOrId);
    
    let where: any;
    
    if (isId) {
      where = {
        userId,
        roleId: roleNameOrId,
      };
    } else {
      where = {
        userId,
        role: {
          name: roleNameOrId,
        },
      };
    }
    
    // Only consider non-expired roles
    where.OR = [
      { expiresAt: null },
      { expiresAt: { gt: new Date() } },
    ];
    
    const roleCount = await this.prisma.userRole.count({
      where,
    });
    
    return roleCount > 0;
  }

  /**
   * Check if role is in use
   */
  async isRoleInUse(roleId: string): Promise<boolean> {
    const usageCount = await this.prisma.userRole.count({
      where: { roleId },
    });
    
    return usageCount > 0;
  }

  /**
   * Safely delete role if not in use
   */
  async safeDeleteRole(roleId: string): Promise<{ success: boolean; message: string }> {
    const inUse = await this.isRoleInUse(roleId);
    
    if (inUse) {
      return {
        success: false,
        message: 'Role is currently assigned to users and cannot be deleted.',
      };
    }
    
    // Check if it's a system role
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });
    
    if (role?.isSystem) {
      return {
        success: false,
        message: 'System roles cannot be deleted.',
      };
    }
    
    // Safe to delete
    await this.prisma.$transaction([
      // Delete associated role permissions
      this.prisma.rolePermission.deleteMany({ where: { roleId } }),
      
      // Delete the role itself
      this.prisma.role.delete({ where: { id: roleId } }),
    ]);
    
    return {
      success: true,
      message: 'Role successfully deleted.',
    };
  }
}
