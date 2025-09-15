'use server';

import { auth } from '@/auth';
import prisma from '@/db/prisma';
import { formatNumberWithDecimal, formatDateTime, formatOrderStatus, getOrderStatusColor } from '@/lib/utils';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { shippingAddressSchema, PASSWORD_REGEX, PASSWORD_ERROR_MESSAGE, adminUpdateUserSchema, AdminUpdateUserInput } from '@/lib/validators';
import { UserRole, User } from '@prisma/client';
import { ORDERS_PER_PAGE } from '@/lib/constants/cart';
import { ActionResult, ListResult, createListErrorResult, createErrorResult } from '@/lib/types/action-results';
import type { Address } from '@prisma/client';

export interface OrderItemPreview {
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: string;
  qty: number;
}

export interface OrderWithItems {
  id: string;
  userId: string;
  shippingAddress: unknown;
  paymentMethod: string;
  paymentResult: unknown;
  itemsPrice: string;
  shippingPrice: string;
  taxPrice: string;
  discountPrice: string;
  totalPrice: string;
  couponCode: string | null;
  status: string;
  isPaid: boolean;
  paidAt: Date | null;
  isDelivered: boolean;
  deliveredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  orderitems: OrderItemPreview[];
  // Pre-processed fields for performance
  formattedDate: ReturnType<typeof formatDateTime>;
  statusColor: string;
  formattedStatus: string;
}

export interface PaginatedOrders {
  orders: OrderWithItems[];
  currentPage: number;
  totalPages: number;
  totalOrders: number;
  hasMore: boolean;
}

// Type for user address data stored in JSON field
interface UserAddressData {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

// Type guard to validate if an unknown value is UserAddressData
function isUserAddressData(value: unknown): value is UserAddressData {
  if (!value || typeof value !== 'object') return false;
  
  const obj = value as Record<string, unknown>;
  return (
    typeof obj['street'] === 'string' &&
    typeof obj['city'] === 'string' &&
    typeof obj['state'] === 'string' &&
    typeof obj['zipCode'] === 'string' &&
    typeof obj['country'] === 'string' &&
    (obj['phone'] === undefined || typeof obj['phone'] === 'string')
  );
}

// Safe parser for user address JSON data
function parseUserAddress(value: unknown): UserAddressData | null {
  if (isUserAddressData(value)) {
    return value;
  }
  return null;
}

// Interface for updateProfile function
interface UpdateData {
  email?: string;
  name?: string;
  address?: UserAddressData;
  password?: string;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(PASSWORD_REGEX, PASSWORD_ERROR_MESSAGE)
    .optional(),
  confirmPassword: z.string().optional(),
  phone: z.string().min(6, 'Phone number must be at least 6 characters').optional(),
  address: z.object({
    street: z.string().min(3, 'Street is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    zipCode: z.string().min(3, 'Zip code is required'),
    country: z.string().min(2, 'Country is required'),
  }).optional(),
}).refine((data) => {
  if (data.newPassword && data.newPassword !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
}).refine((data) => {
  if (data.newPassword && !data.currentPassword) {
    return false;
  }
  return true;
}, {
  message: 'Current password is required to change password',
  path: ['currentPassword'],
});

export async function getMyOrders(page: number = 1): Promise<PaginatedOrders> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return {
        orders: [],
        currentPage: 1,
        totalPages: 0,
        totalOrders: 0,
        hasMore: false,
      };
    }
    
    const skip = (page - 1) * ORDERS_PER_PAGE;
    
    // Get total count for pagination
    const totalOrders = await prisma.order.count({
      where: {
        userId: session.user.id,
      },
    });
    
    const totalPages = Math.ceil(totalOrders / ORDERS_PER_PAGE);
    
    // Get paginated orders
    const orders = await prisma.order.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        orderitems: {
          take: 3, // Only fetch first 3 items for preview
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: ORDERS_PER_PAGE,
    });
    
    // Convert decimal fields to strings and pre-process for performance
    const formattedOrders = orders.map(order => ({
      ...order,
      itemsPrice: formatNumberWithDecimal(Number(order.itemsPrice)),
      shippingPrice: formatNumberWithDecimal(Number(order.shippingPrice)),
      taxPrice: formatNumberWithDecimal(Number(order.taxPrice)),
      discountPrice: formatNumberWithDecimal(Number(order.discountPrice)),
      totalPrice: formatNumberWithDecimal(Number(order.totalPrice)),
      orderitems: order.orderitems.map(item => ({
        ...item,
        price: formatNumberWithDecimal(Number(item.price)),
      })),
      // Pre-processed fields for better client-side performance
      formattedDate: formatDateTime(order.createdAt),
      statusColor: getOrderStatusColor(order.status),
      formattedStatus: formatOrderStatus(order.status),
    }));
    
    return {
      orders: formattedOrders,
      currentPage: page,
      totalPages,
      totalOrders,
      hasMore: page < totalPages,
    };
  } catch (error) {
    console.error('Error fetching orders:', error);
    return {
      orders: [],
      currentPage: 1,
      totalPages: 0,
      totalOrders: 0,
      hasMore: false,
    };
  }
}

export async function getCurrentUser(): Promise<ActionResult<{
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
  address: unknown;
  paymentMethod: string | null;
  createdAt: Date;
} | null>> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: true, data: null };
    }
    
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        address: true,
        paymentMethod: true,
        createdAt: true,
      },
    });
    
    return { success: true, data: user };
  } catch (error) {
    console.error('Error fetching current user:', error);
    return createErrorResult('Failed to load user profile. Please try again.');
  }
}

// Address-related actions
export async function getUserAddresses(): Promise<ListResult<Address>> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: true, data: [] };
    }
    
    const addresses = await prisma.address.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });
    
    return { success: true, data: addresses };
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return createListErrorResult('Failed to load addresses. Please try again.');
  }
}

export async function addAddress(data: Omit<z.infer<typeof shippingAddressSchema>, 'fullName'> & { fullName: string; label?: string }) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, message: 'Please sign in to add an address' };
    }
    
    // If this is the first address or it's marked as default, update other addresses
    const existingAddresses = await prisma.address.findMany({
      where: { userId: session.user.id },
    });
    
    const isFirstAddress = existingAddresses.length === 0;
    
    const newAddress = await prisma.address.create({
      data: {
        userId: session.user.id,
        fullName: data.fullName,
        street: data.street,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country,
        phone: data.phone || '',
        label: data.label,
        isDefault: isFirstAddress,
      },
    });
    
    revalidatePath('/profile');
    
    return { 
      success: true, 
      message: 'Address added successfully',
      address: newAddress,
    };
  } catch (error) {
    console.error('Error adding address:', error);
    return { success: false, message: 'Failed to add address' };
  }
}

export async function updateAddress(addressId: string, data: Partial<z.infer<typeof shippingAddressSchema>> & { label?: string }) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, message: 'Please sign in to update address' };
    }
    
    // Verify the address belongs to the user
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId: session.user.id,
      },
    });
    
    if (!existingAddress) {
      return { success: false, message: 'Address not found' };
    }
    
    const updatedAddress = await prisma.address.update({
      where: { id: addressId },
      data: {
        fullName: data.fullName,
        street: data.street,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country,
        phone: data.phone,
        label: data.label,
      },
    });
    
    revalidatePath('/profile');
    
    return { 
      success: true, 
      message: 'Address updated successfully',
      address: updatedAddress,
    };
  } catch (error) {
    console.error('Error updating address:', error);
    return { success: false, message: 'Failed to update address' };
  }
}

export async function deleteAddress(addressId: string) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, message: 'Please sign in to delete address' };
    }
    
    // Verify the address belongs to the user
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId: session.user.id,
      },
    });
    
    if (!existingAddress) {
      return { success: false, message: 'Address not found' };
    }
    
    await prisma.address.delete({
      where: { id: addressId },
    });
    
    // If this was the default address, make another one default
    if (existingAddress.isDefault) {
      const firstAddress = await prisma.address.findFirst({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'asc' },
      });
      
      if (firstAddress) {
        await prisma.address.update({
          where: { id: firstAddress.id },
          data: { isDefault: true },
        });
      }
    }
    
    revalidatePath('/profile');
    
    return { 
      success: true, 
      message: 'Address deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting address:', error);
    return { success: false, message: 'Failed to delete address' };
  }
}

export async function setDefaultAddress(addressId: string) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, message: 'Please sign in to set default address' };
    }
    
    // Verify the address belongs to the user
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId: session.user.id,
      },
    });
    
    if (!existingAddress) {
      return { success: false, message: 'Address not found' };
    }
    
    // Update all addresses to not default
    await prisma.address.updateMany({
      where: { userId: session.user.id },
      data: { isDefault: false },
    });
    
    // Set the selected address as default
    await prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    });
    
    revalidatePath('/profile');
    
    return { 
      success: true, 
      message: 'Default address updated successfully',
    };
  } catch (error) {
    console.error('Error setting default address:', error);
    return { success: false, message: 'Failed to set default address' };
  }
}

export async function updateProfile(data: UpdateProfileData) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, message: 'Please sign in to update your profile' };
    }
    
    // Validate input data
    const validatedData = updateProfileSchema.safeParse(data);
    
    if (!validatedData.success) {
      return { 
        success: false, 
        message: validatedData.error.issues[0]?.message || 'Invalid data provided' 
      };
    }
    
    const updateData: UpdateData = {};
    
    // Check if email is being changed and is not already taken
    if (validatedData.data.email && validatedData.data.email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.data.email.toLowerCase() },
      });
      
      if (existingUser) {
        return { success: false, message: 'Email already in use' };
      }
      
      updateData.email = validatedData.data.email.toLowerCase();
    }
    
    // Update name if provided
    if (validatedData.data.name) {
      updateData.name = validatedData.data.name;
    }
    
    // Update phone if provided (stored in address JSON)
    if (validatedData.data.phone || validatedData.data.address) {
      const currentUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { address: true },
      });
      
      // Safely parse the current address data
      const currentAddress = parseUserAddress(currentUser?.address);
      
      // Build the new address object with type safety
      const baseAddress: UserAddressData = currentAddress || {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'Poland', // Default to Poland as per localization
      };
      
      if (validatedData.data.address) {
        updateData.address = {
          ...baseAddress,
          ...validatedData.data.address,
        };
      }
      
      if (validatedData.data.phone) {
        updateData.address = {
          ...baseAddress,
          ...(updateData.address || {}),
          phone: validatedData.data.phone,
        };
      }
    }
    
    // Handle password update if provided
    if (validatedData.data.newPassword && validatedData.data.currentPassword) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { password: true },
      });
      
      if (!user?.password) {
        return { success: false, message: 'No password set for this account' };
      }
      
      const isPasswordValid = await bcrypt.compare(
        validatedData.data.currentPassword,
        user.password
      );
      
      if (!isPasswordValid) {
        return { success: false, message: 'Current password is incorrect' };
      }
      
      const hashedPassword = await bcrypt.hash(validatedData.data.newPassword, 12);
      updateData.password = hashedPassword;
    }
    
    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
      },
    });
    
    // Revalidate relevant paths
    revalidatePath('/profile');
    revalidatePath('/dashboard');
    
    return { 
      success: true, 
      message: 'Profile updated successfully',
      user: updatedUser,
    };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { success: false, message: 'Failed to update profile' };
  }
}

export async function getOrderStats() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        totalOrders: 0,
        pendingOrders: 0,
        processingOrders: 0,
        shippedOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0,
        totalSpent: '0.00',
      };
    }

    const [orders, totalSpent] = await Promise.all([
      prisma.order.groupBy({
        by: ['status'],
        where: {
          userId: session.user.id,
        },
        _count: {
          status: true,
        },
      }),
      prisma.order.aggregate({
        where: {
          userId: session.user.id,
          status: {
            not: 'cancelled',
          },
        },
        _sum: {
          totalPrice: true,
        },
      }),
    ]);

    const stats = {
      totalOrders: 0,
      pendingOrders: 0,
      processingOrders: 0,
      shippedOrders: 0,
      deliveredOrders: 0,
      cancelledOrders: 0,
      totalSpent: formatNumberWithDecimal(Number(totalSpent._sum.totalPrice || 0)),
    };

    orders.forEach((order) => {
      stats.totalOrders += order._count.status;
      switch (order.status) {
        case 'pending':
          stats.pendingOrders = order._count.status;
          break;
        case 'processing':
          stats.processingOrders = order._count.status;
          break;
        case 'shipped':
          stats.shippedOrders = order._count.status;
          break;
        case 'delivered':
          stats.deliveredOrders = order._count.status;
          break;
        case 'cancelled':
          stats.cancelledOrders = order._count.status;
          break;
      }
    });

    return stats;
  } catch (error) {
    console.error('Error fetching order stats:', error);
    return {
      totalOrders: 0,
      pendingOrders: 0,
      processingOrders: 0,
      shippedOrders: 0,
      deliveredOrders: 0,
      cancelledOrders: 0,
      totalSpent: '0.00',
    };
  }
}

// Admin functions for user management
export interface AdminUser {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  formattedCreatedAt: ReturnType<typeof formatDateTime>;
  formattedUpdatedAt: ReturnType<typeof formatDateTime>;
  ordersCount: number;
  totalSpent: string;
  wishlistCount: number;
  lastOrderDate: Date | null;
  formattedLastOrderDate: ReturnType<typeof formatDateTime> | null;
}

export interface AdminUsersResult {
  users: AdminUser[];
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  hasMore: boolean;
}

const USERS_PER_PAGE = 10;

export async function updateUserAsAdmin(
  userId: string,
  data: AdminUpdateUserInput
): Promise<ActionResult<User>> {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== UserRole.admin) {
      return {
        success: false,
        error: 'Unauthorized access',
      };
    }

    // Validate input data
    const validatedData = adminUpdateUserSchema.parse(data);

    // Check if the user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    // Prevent admin from removing their own admin role
    if (userId === session.user.id && validatedData.role !== UserRole.admin) {
      return {
        success: false,
        error: 'You cannot remove your own admin role',
      };
    }

    // Check if email is being changed and if it's already taken
    if (validatedData.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });

      if (emailExists) {
        return {
          success: false,
          error: 'Email is already in use',
        };
      }
    }

    // Update the user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: validatedData.name,
        email: validatedData.email,
        role: validatedData.role,
      },
    });

    revalidatePath('/admin/customers');

    return {
      success: true,
      data: updatedUser,
    };
  } catch (error) {
    console.error('Error updating user:', error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || 'Validation error',
      };
    }
    return {
      success: false,
      error: 'Failed to update user',
    };
  }
}

export async function deleteUser(userId: string) {
  try {
    const session = await auth();

    // Check if user is admin
    if (!session?.user?.id || session.user.role !== 'admin') {
      return { success: false, message: 'Unauthorized' };
    }

    // Prevent admin from deleting themselves
    if (userId === session.user.id) {
      return { success: false, message: 'Cannot delete your own account' };
    }

    // Check if user exists
    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        _count: {
          select: {
            Order: {
              where: {
                status: {
                  notIn: ['delivered', 'cancelled'],
                },
              },
            },
          },
        },
      },
    });

    if (!userToDelete) {
      return { success: false, message: 'User not found' };
    }

    // Check if user has active orders
    if (userToDelete._count.Order > 0) {
      return {
        success: false,
        message: `Cannot delete user with ${userToDelete._count.Order} active orders. Please cancel or complete their orders first.`,
      };
    }

    // Delete user and related data (cascade delete will handle related records)
    await prisma.user.delete({
      where: { id: userId },
    });

    revalidatePath('/admin/customers');

    return {
      success: true,
      message: `User ${userToDelete.email} has been deleted successfully`,
    };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, message: 'Failed to delete user' };
  }
}

export async function getUsersForAdmin(
  page: number = 1,
  search?: string
): Promise<AdminUsersResult> {
  try {
    const session = await auth();

    // Check if user is admin
    if (!session?.user?.id || session.user.role !== 'admin') {
      return {
        users: [],
        currentPage: 1,
        totalPages: 0,
        totalUsers: 0,
        hasMore: false,
      };
    }

    const skip = (page - 1) * USERS_PER_PAGE;

    // Build search condition
    const searchCondition = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' as const } },
            { name: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    // Get total count for pagination
    const totalUsers = await prisma.user.count({
      where: searchCondition,
    });

    const totalPages = Math.ceil(totalUsers / USERS_PER_PAGE);

    // Get paginated users with related data
    const users = await prisma.user.findMany({
      where: searchCondition,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            Order: true,
            Wishlist: true,
          },
        },
        Order: {
          select: {
            totalPrice: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: USERS_PER_PAGE,
    });

    // Calculate total spent for each user
    const userIds = users.map(u => u.id);
    const orderTotals = await prisma.order.groupBy({
      by: ['userId'],
      where: {
        userId: { in: userIds },
        status: { not: 'cancelled' },
      },
      _sum: {
        totalPrice: true,
      },
    });

    const totalsMap = new Map(
      orderTotals.map(total => [
        total.userId,
        formatNumberWithDecimal(Number(total._sum.totalPrice || 0)),
      ])
    );

    // Format users with additional data
    const formattedUsers: AdminUser[] = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      formattedCreatedAt: formatDateTime(user.createdAt),
      formattedUpdatedAt: formatDateTime(user.updatedAt),
      ordersCount: user._count.Order,
      totalSpent: totalsMap.get(user.id) || '0.00',
      wishlistCount: user._count.Wishlist,
      lastOrderDate: user.Order[0]?.createdAt || null,
      formattedLastOrderDate: user.Order[0]?.createdAt
        ? formatDateTime(user.Order[0].createdAt)
        : null,
    }));

    return {
      users: formattedUsers,
      currentPage: page,
      totalPages,
      totalUsers,
      hasMore: page < totalPages,
    };
  } catch (error) {
    console.error('Error fetching users for admin:', error);
    return {
      users: [],
      currentPage: 1,
      totalPages: 0,
      totalUsers: 0,
      hasMore: false,
    };
  }
}