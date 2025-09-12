'use server';

import { auth } from '@/auth';
import prisma from '@/db/prisma';
import { ORDER_STATUS, type CartResponse, type ShippingAddress } from '@/lib/validators';
import { clearCart } from './cart-actions';
import { clearCheckoutSession } from './checkout-actions';
import { revalidatePath } from 'next/cache';
import { formatNumberWithDecimal } from '@/lib/utils';

interface PlaceOrderParams {
  cart: CartResponse;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
}

export async function placeOrder({ cart, shippingAddress, paymentMethod }: PlaceOrderParams) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, message: 'Please sign in to place an order' };
    }
    
    // Validate cart
    if (!cart || cart.items.length === 0) {
      return { success: false, message: 'Your cart is empty' };
    }
    
    // Create the order
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        shippingAddress: shippingAddress,
        paymentMethod,
        itemsPrice: cart.itemsPrice,
        shippingPrice: cart.shippingPrice,
        taxPrice: cart.taxPrice,
        discountPrice: cart.discountPrice || '0.00',
        totalPrice: cart.totalPrice,
        couponCode: cart.couponCode || null,
        status: ORDER_STATUS.PENDING,
        isPaid: false,
        orderitems: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            qty: item.qty,
            price: item.price,
            name: item.name,
            slug: item.slug,
            image: item.image,
          })),
        },
      },
      include: {
        orderitems: true,
      },
    });
    
    // Update product stock
    for (const item of cart.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.qty,
          },
        },
      });
    }
    
    // Clear cart and checkout session
    await clearCart();
    await clearCheckoutSession();
    
    revalidatePath('/orders');
    
    return { 
      success: true, 
      orderId: order.id,
      message: 'Order placed successfully' 
    };
  } catch (error) {
    console.error('Error placing order:', error);
    return { success: false, message: 'Failed to place order' };
  }
}

export async function getOrders() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return [];
    }
    
    const orders = await prisma.order.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        orderitems: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    // Convert decimal fields to strings
    return orders.map(order => ({
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
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}

export async function getOrderById(orderId: string) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return null;
    }
    
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: session.user.id,
      },
      include: {
        orderitems: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    
    if (!order) {
      return null;
    }
    
    // Convert decimal fields to strings
    return {
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
    };
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
}

// Admin function to update order status (for future use)
export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const session = await auth();
    
    // Check if user is admin
    if (!session?.user?.role || session.user.role !== 'admin') {
      return { success: false, message: 'Unauthorized' };
    }
    
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        isPaid: status === ORDER_STATUS.PROCESSING ? true : undefined,
        paidAt: status === ORDER_STATUS.PROCESSING ? new Date() : undefined,
        isDelivered: status === ORDER_STATUS.DELIVERED ? true : undefined,
        deliveredAt: status === ORDER_STATUS.DELIVERED ? new Date() : undefined,
      },
    });
    
    revalidatePath('/admin/orders');
    revalidatePath(`/orders/${orderId}`);
    
    return { success: true, order: updatedOrder };
  } catch (error) {
    console.error('Error updating order status:', error);
    return { success: false, message: 'Failed to update order status' };
  }
}