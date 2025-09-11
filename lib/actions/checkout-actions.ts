'use server';

import { cookies } from 'next/headers';
import { auth } from '@/auth';
import prisma from '@/db/prisma';
import { z } from 'zod';
import { shippingAddressSchema } from '@/lib/validators';
import { revalidatePath } from 'next/cache';

const CHECKOUT_COOKIE_NAME = 'checkout-session';

type ShippingAddress = z.infer<typeof shippingAddressSchema>;

// Save shipping address to session
export async function saveShippingAddress(address: ShippingAddress) {
  try {
    // Validate the address
    const validatedAddress = shippingAddressSchema.parse(address);
    
    // Get or create checkout session
    const cookieStore = await cookies();
    let checkoutSession = cookieStore.get(CHECKOUT_COOKIE_NAME)?.value;
    
    if (!checkoutSession) {
      checkoutSession = crypto.randomUUID();
      cookieStore.set(CHECKOUT_COOKIE_NAME, checkoutSession, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      });
    }
    
    // Store address in session (you might want to use a database or Redis for this)
    // For now, we'll store it in a cookie (be aware of size limitations)
    cookieStore.set(`${CHECKOUT_COOKIE_NAME}-address`, JSON.stringify(validatedAddress), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });
    
    // If user is logged in, optionally save to their profile
    const session = await auth();
    if (session?.user?.id) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          address: validatedAddress,
        },
      });
    }
    
    revalidatePath('/checkout');
    
    return { success: true, message: 'Shipping address saved' };
  } catch (error) {
    console.error('Error saving shipping address:', error);
    if (error instanceof z.ZodError) {
      return { success: false, message: error.issues[0]?.message || 'Invalid address' };
    }
    return { success: false, message: 'Failed to save shipping address' };
  }
}

// Get saved shipping address from session
export async function getShippingAddress(): Promise<ShippingAddress | null> {
  try {
    const cookieStore = await cookies();
    const addressCookie = cookieStore.get(`${CHECKOUT_COOKIE_NAME}-address`)?.value;
    
    if (addressCookie) {
      try {
        const parsed = JSON.parse(addressCookie);
        // Validate the parsed data against the schema
        const result = shippingAddressSchema.safeParse(parsed);
        if (result.success) {
          return result.data;
        } else {
          console.warn('Invalid shipping address in cookie:', result.error);
          // Clear invalid cookie
          cookieStore.delete(`${CHECKOUT_COOKIE_NAME}-address`);
          return null;
        }
      } catch (err) {
        console.warn('Malformed shipping address cookie:', err);
        // Clear malformed cookie
        cookieStore.delete(`${CHECKOUT_COOKIE_NAME}-address`);
        return null;
      }
    }
    
    // If no session address, check if user has a saved address
    const session = await auth();
    if (session?.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { address: true },
      });
      
      if (user?.address) {
        // Validate address from database
        const result = shippingAddressSchema.safeParse(user.address);
        if (result.success) {
          return result.data;
        } else {
          console.warn('Invalid address in user profile:', result.error);
          return null;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting shipping address:', error);
    return null;
  }
}

// Clear checkout session
export async function clearCheckoutSession() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(CHECKOUT_COOKIE_NAME);
    cookieStore.delete(`${CHECKOUT_COOKIE_NAME}-address`);
    
    return { success: true };
  } catch (error) {
    console.error('Error clearing checkout session:', error);
    return { success: false };
  }
}

// Save payment method to session
export async function savePaymentMethod(paymentMethod: string) {
  try {
    const cookieStore = await cookies();
    
    cookieStore.set(`${CHECKOUT_COOKIE_NAME}-payment`, paymentMethod, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });
    
    return { success: true, message: 'Payment method saved' };
  } catch (error) {
    console.error('Error saving payment method:', error);
    return { success: false, message: 'Failed to save payment method' };
  }
}

// Get saved payment method from session
export async function getPaymentMethod(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get(`${CHECKOUT_COOKIE_NAME}-payment`)?.value || null;
  } catch (error) {
    console.error('Error getting payment method:', error);
    return null;
  }
}