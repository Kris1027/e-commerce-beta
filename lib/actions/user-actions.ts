'use server';

import { auth } from '@/auth';
import prisma from '@/db/prisma';
import { formatNumberWithDecimal, formatDateTime, formatOrderStatus, getOrderStatusColor } from '@/lib/utils';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { shippingAddressSchema, PASSWORD_REGEX, PASSWORD_ERROR_MESSAGE } from '@/lib/validators';
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
type UserAddressData = {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
};

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
      
      const currentAddress = currentUser?.address ? (currentUser.address as Record<string, unknown>) : {};
      
      if (validatedData.data.address) {
        updateData.address = {
          ...currentAddress,
          ...validatedData.data.address,
        };
      }
      
      if (validatedData.data.phone) {
        updateData.address = {
          ...currentAddress,
          ...(updateData.address || {}),
          phone: validatedData.data.phone,
        } as UserAddressData;
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