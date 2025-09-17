'use server';

import { auth } from '@/auth';
import prisma from '@/db/prisma';
import { ORDER_STATUS } from '@/lib/validators';
import { revalidatePath } from 'next/cache';
import { formatNumberWithDecimal, convertToPlainObject } from '@/lib/utils';
import { UserRole } from '@prisma/client';
import { z } from 'zod';

// Configuration for status transitions and their side effects
const ORDER_STATUS_TRANSITIONS = {
  [ORDER_STATUS.PENDING]: {
    // No automatic side effects for pending status
    isPaid: undefined,
    paidAt: undefined,
    isDelivered: undefined,
    deliveredAt: undefined,
  },
  [ORDER_STATUS.PROCESSING]: {
    // When order moves to processing, mark as paid
    isPaid: true,
    paidAt: new Date(),
    isDelivered: undefined,
    deliveredAt: undefined,
  },
  [ORDER_STATUS.SHIPPED]: {
    // Shipped orders should be paid but not yet delivered
    isPaid: true,
    paidAt: undefined, // Don't override existing payment date
    isDelivered: false,
    deliveredAt: undefined,
  },
  [ORDER_STATUS.DELIVERED]: {
    // Delivered orders are paid and delivered
    isPaid: true,
    paidAt: undefined, // Don't override existing payment date
    isDelivered: true,
    deliveredAt: new Date(),
  },
  [ORDER_STATUS.CANCELLED]: {
    // Cancelled orders retain their payment status
    isPaid: undefined,
    paidAt: undefined,
    isDelivered: false,
    deliveredAt: undefined,
  },
} as const;

// Helper function to get status transition data
function getStatusTransitionData(status: string) {
  const normalizedStatus = status.toLowerCase();
  const transition = ORDER_STATUS_TRANSITIONS[normalizedStatus as keyof typeof ORDER_STATUS_TRANSITIONS];

  if (!transition) {
    // If status is not recognized, only update the status field
    return { status: normalizedStatus };
  }

  // Filter out undefined values to avoid overwriting existing data unnecessarily
  const data: Record<string, unknown> = { status: normalizedStatus };

  if (transition.isPaid !== undefined) {
    data['isPaid'] = transition.isPaid;
  }
  if (transition.paidAt !== undefined) {
    data['paidAt'] = transition.paidAt;
  }
  if (transition.isDelivered !== undefined) {
    data['isDelivered'] = transition.isDelivered;
  }
  if (transition.deliveredAt !== undefined) {
    data['deliveredAt'] = transition.deliveredAt;
  }

  return data;
}

export type OrderFilterStatus = 'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type OrderFilterPayment = 'all' | 'paid' | 'unpaid';
export type OrderSortBy = 'newest' | 'oldest' | 'highest' | 'lowest';

export interface AdminOrdersResult {
  orders: Array<{
    id: string;
    userId: string;
    shippingAddress: Record<string, unknown> | null;
    paymentMethod: string;
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
    user: {
      id: string;
      name: string | null;
      email: string;
    } | null;
    totalItems: number;
  }>;
  totalOrders: number;
  totalPages: number;
  currentPage: number;
}

export interface OrderSummary {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  todaysOrders: number;
  todaysRevenue: number;
  averageOrderValue: number;
  paidOrders: number;
  unpaidOrders: number;
}

export async function getOrdersForAdmin(
  page: number = 1,
  search: string = '',
  statusFilter: OrderFilterStatus = 'all',
  paymentFilter: OrderFilterPayment = 'all',
  sortBy: OrderSortBy = 'newest'
): Promise<AdminOrdersResult> {
  try {
    const session = await auth();

    if (!session?.user?.role || session.user.role !== UserRole.admin) {
      return { orders: [], totalOrders: 0, totalPages: 0, currentPage: page };
    }

    // Validate and sanitize search input to prevent ReDoS attacks
    const searchSchema = z
      .string()
      .max(64, { message: 'Search term too long' })
      .trim();

    let sanitizedSearch = '';
    if (search) {
      const parseResult = searchSchema.safeParse(search);
      if (parseResult.success) {
        sanitizedSearch = parseResult.data;
        // Escape special characters for SQL LIKE queries
        sanitizedSearch = sanitizedSearch.replace(/[%_\\]/g, '\\$&');
      }
    }

    const itemsPerPage = 10;
    const skip = (page - 1) * itemsPerPage;

    const where: Record<string, unknown> = {};

    if (sanitizedSearch) {
      where['OR'] = [
        { id: { contains: sanitizedSearch, mode: 'insensitive' } },
        { user: { email: { contains: sanitizedSearch, mode: 'insensitive' } } },
        { user: { name: { contains: sanitizedSearch, mode: 'insensitive' } } },
      ];
    }

    if (statusFilter !== 'all') {
      where['status'] = statusFilter.toLowerCase();
    }

    if (paymentFilter === 'paid') {
      where['isPaid'] = true;
    } else if (paymentFilter === 'unpaid') {
      where['isPaid'] = false;
    }

    let orderBy: Record<string, 'asc' | 'desc'> = {};
    switch (sortBy) {
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'highest':
        orderBy = { totalPrice: 'desc' };
        break;
      case 'lowest':
        orderBy = { totalPrice: 'asc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    const [orders, totalOrders] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          orderitems: {
            select: {
              qty: true,
            },
          },
        },
        orderBy,
        skip,
        take: itemsPerPage,
      }),
      prisma.order.count({ where }),
    ]);

    const formattedOrders = orders.map(order => ({
      ...order,
      shippingAddress: order.shippingAddress as Record<string, unknown> | null,
      itemsPrice: formatNumberWithDecimal(Number(order.itemsPrice)),
      shippingPrice: formatNumberWithDecimal(Number(order.shippingPrice)),
      taxPrice: formatNumberWithDecimal(Number(order.taxPrice)),
      discountPrice: formatNumberWithDecimal(Number(order.discountPrice)),
      totalPrice: formatNumberWithDecimal(Number(order.totalPrice)),
      totalItems: order.orderitems.reduce((sum, item) => sum + item.qty, 0),
    }));

    return convertToPlainObject({
      orders: formattedOrders,
      totalOrders,
      totalPages: Math.ceil(totalOrders / itemsPerPage),
      currentPage: page,
    });
  } catch (error) {
    console.error('Error fetching orders for admin:', error);
    return { orders: [], totalOrders: 0, totalPages: 0, currentPage: page };
  }
}

export async function getOrderSummary(): Promise<OrderSummary> {
  try {
    const session = await auth();

    if (!session?.user?.role || session.user.role !== UserRole.admin) {
      return {
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        processingOrders: 0,
        shippedOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0,
        todaysOrders: 0,
        todaysRevenue: 0,
        averageOrderValue: 0,
        paidOrders: 0,
        unpaidOrders: 0,
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalOrders,
      totalRevenueResult,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      todaysOrders,
      todaysRevenueResult,
      paidOrders,
      unpaidOrders,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { totalPrice: true },
        where: { isPaid: true },
      }),
      prisma.order.count({ where: { status: ORDER_STATUS.PENDING } }),
      prisma.order.count({ where: { status: ORDER_STATUS.PROCESSING } }),
      prisma.order.count({ where: { status: ORDER_STATUS.SHIPPED } }),
      prisma.order.count({ where: { status: ORDER_STATUS.DELIVERED } }),
      prisma.order.count({ where: { status: ORDER_STATUS.CANCELLED } }),
      prisma.order.count({
        where: {
          createdAt: { gte: today, lt: tomorrow },
        },
      }),
      prisma.order.aggregate({
        _sum: { totalPrice: true },
        where: {
          createdAt: { gte: today, lt: tomorrow },
          isPaid: true,
        },
      }),
      prisma.order.count({ where: { isPaid: true } }),
      prisma.order.count({ where: { isPaid: false } }),
    ]);

    const totalRevenue = Number(totalRevenueResult._sum.totalPrice || 0);
    const todaysRevenue = Number(todaysRevenueResult._sum.totalPrice || 0);
    const averageOrderValue = paidOrders > 0 ? totalRevenue / paidOrders : 0;

    return convertToPlainObject({
      totalOrders,
      totalRevenue,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      todaysOrders,
      todaysRevenue,
      averageOrderValue,
      paidOrders,
      unpaidOrders,
    });
  } catch (error) {
    console.error('Error getting order summary:', error);
    return {
      totalOrders: 0,
      totalRevenue: 0,
      pendingOrders: 0,
      processingOrders: 0,
      shippedOrders: 0,
      deliveredOrders: 0,
      cancelledOrders: 0,
      todaysOrders: 0,
      todaysRevenue: 0,
      averageOrderValue: 0,
      paidOrders: 0,
      unpaidOrders: 0,
    };
  }
}

export async function updateAdminOrderStatus(orderId: string, status: string) {
  try {
    const session = await auth();

    if (!session?.user?.role || session.user.role !== UserRole.admin) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get the appropriate data updates based on the status transition
    const updateData = getStatusTransitionData(status);

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });

    revalidatePath('/admin/orders');
    revalidatePath(`/orders/${orderId}`);

    return { success: true, data: convertToPlainObject(updatedOrder) };
  } catch (error) {
    console.error('Error updating order status:', error);
    return { success: false, error: 'Failed to update order status' };
  }
}

export async function getAdminOrderById(orderId: string) {
  try {
    const session = await auth();

    if (!session?.user?.role || session.user.role !== UserRole.admin) {
      return null;
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderitems: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });

    if (!order) {
      return null;
    }

    return convertToPlainObject({
      ...order,
      itemsPrice: formatNumberWithDecimal(Number(order.itemsPrice)),
      shippingPrice: formatNumberWithDecimal(Number(order.shippingPrice)),
      taxPrice: formatNumberWithDecimal(Number(order.taxPrice)),
      discountPrice: formatNumberWithDecimal(Number(order.discountPrice)),
      totalPrice: formatNumberWithDecimal(Number(order.totalPrice)),
      orderitems: order.orderitems.map(item => ({
        ...item,
        price: formatNumberWithDecimal(Number(item.price)),
        product: item.product ? {
          ...item.product,
          price: formatNumberWithDecimal(Number(item.product.price)),
          rating: formatNumberWithDecimal(Number(item.product.rating)),
        } : null,
      })),
    });
  } catch (error) {
    console.error('Error fetching order for admin:', error);
    return null;
  }
}

export async function deleteOrder(orderId: string) {
  try {
    const session = await auth();

    if (!session?.user?.role || session.user.role !== UserRole.admin) {
      return { success: false, error: 'Unauthorized' };
    }

    await prisma.$transaction(async (tx) => {
      await tx.orderItem.deleteMany({
        where: { orderId },
      });

      await tx.order.delete({
        where: { id: orderId },
      });
    });

    revalidatePath('/admin/orders');

    return { success: true, data: undefined };
  } catch (error) {
    console.error('Error deleting order:', error);
    return { success: false, error: 'Failed to delete order' };
  }
}