'use server';

import { auth } from '@/auth';
import prisma from '@/db/prisma';
import { formatNumberWithDecimal } from '@/lib/utils';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const ORDERS_PER_PAGE = 10;

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
}

export interface PaginatedOrders {
  orders: OrderWithItems[];
  currentPage: number;
  totalPages: number;
  totalOrders: number;
  hasMore: boolean;
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
    .refine(
      (val) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(val),
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
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
    
    // Convert decimal fields to strings
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

export async function getCurrentUser() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return null;
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
    
    return user;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
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
    
    interface UpdateData {
      email?: string;
      name?: string;
      address?: Record<string, unknown>;
      password?: string;
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
      
      updateData['email'] = validatedData.data.email.toLowerCase();
    }
    
    // Update name if provided
    if (validatedData.data.name) {
      updateData['name'] = validatedData.data.name;
    }
    
    // Update phone if provided (stored in address JSON)
    if (validatedData.data.phone || validatedData.data.address) {
      const currentUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { address: true },
      });
      
      const currentAddress = currentUser?.address ? (currentUser.address as Record<string, unknown>) : {};
      
      if (validatedData.data.address) {
        updateData['address'] = {
          ...currentAddress,
          ...validatedData.data.address,
        };
      }
      
      if (validatedData.data.phone) {
        updateData['address'] = {
          ...currentAddress,
          ...(updateData['address'] || {}),
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
      updateData['password'] = hashedPassword;
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