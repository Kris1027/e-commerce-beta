'use server';

import { cookies } from 'next/headers';
import { auth } from '@/auth';
import prisma from '@/db/prisma';
import { cartItemSchema } from '@/lib/validators';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

async function getSessionCartId() {
  const cookieStore = await cookies();
  let cartId = cookieStore.get('sessionCartId')?.value;
  
  if (!cartId) {
    cartId = crypto.randomUUID();
    cookieStore.set('sessionCartId', cartId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }
  
  return cartId;
}

export async function getCart() {
  try {
    const session = await auth();
    const sessionCartId = await getSessionCartId();
    
    const cart = await prisma.cart.findFirst({
      where: session?.user?.id
        ? { userId: session.user.id }
        : { sessionCartId },
    });

    if (!cart) {
      return {
        id: null,
        items: [],
        itemsPrice: '0',
        shippingPrice: '0',
        taxPrice: '0',
        totalPrice: '0',
      };
    }

    return {
      id: cart.id,
      items: cart.items as z.infer<typeof cartItemSchema>[],
      itemsPrice: cart.itemsPrice.toString(),
      shippingPrice: cart.shippingPrice.toString(),
      taxPrice: cart.taxPrice.toString(),
      totalPrice: cart.totalPrice.toString(),
    };
  } catch (error) {
    console.error('Error getting cart:', error);
    return {
      id: null,
      items: [],
      itemsPrice: '0',
      shippingPrice: '0',
      taxPrice: '0',
      totalPrice: '0',
    };
  }
}

export async function addToCart(item: z.infer<typeof cartItemSchema>) {
  try {
    const validatedItem = cartItemSchema.parse(item);
    const session = await auth();
    const sessionCartId = await getSessionCartId();
    
    const existingCart = await prisma.cart.findFirst({
      where: session?.user?.id
        ? { userId: session.user.id }
        : { sessionCartId },
    });

    let items: z.infer<typeof cartItemSchema>[] = [];
    
    if (existingCart) {
      items = existingCart.items as z.infer<typeof cartItemSchema>[];
      const existingItemIndex = items.findIndex(
        (cartItem) => cartItem.productId === validatedItem.productId
      );
      
      if (existingItemIndex > -1) {
        const existingItem = items[existingItemIndex];
        if (existingItem) {
          existingItem.qty += validatedItem.qty;
        }
      } else {
        items.push(validatedItem);
      }
    } else {
      items = [validatedItem];
    }

    const itemsPrice = items.reduce(
      (sum, item) => sum + parseFloat(item.price) * item.qty,
      0
    );
    const shippingPrice = itemsPrice > 100 ? 0 : 10;
    const taxPrice = itemsPrice * 0.1;
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    const cartData = {
      userId: session?.user?.id || null,
      sessionCartId,
      items,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
    };

    if (existingCart) {
      await prisma.cart.update({
        where: { id: existingCart.id },
        data: cartData,
      });
    } else {
      await prisma.cart.create({
        data: cartData,
      });
    }

    revalidatePath('/');
    
    return { success: true, message: 'Added to cart' };
  } catch (error) {
    console.error('Error adding to cart:', error);
    return { success: false, message: 'Failed to add to cart' };
  }
}

export async function updateCartItem(productId: string, qty: number) {
  try {
    const session = await auth();
    const sessionCartId = await getSessionCartId();
    
    const cart = await prisma.cart.findFirst({
      where: session?.user?.id
        ? { userId: session.user.id }
        : { sessionCartId },
    });

    if (!cart) {
      return { success: false, message: 'Cart not found' };
    }

    let items = cart.items as z.infer<typeof cartItemSchema>[];
    
    if (qty === 0) {
      items = items.filter((item) => item.productId !== productId);
    } else {
      const itemIndex = items.findIndex((item) => item.productId === productId);
      if (itemIndex > -1) {
        const item = items[itemIndex];
        if (item) {
          item.qty = qty;
        }
      }
    }

    const itemsPrice = items.reduce(
      (sum, item) => sum + parseFloat(item.price) * item.qty,
      0
    );
    const shippingPrice = itemsPrice > 100 ? 0 : 10;
    const taxPrice = itemsPrice * 0.1;
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        items,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
      },
    });

    revalidatePath('/');
    
    return { success: true, message: 'Cart updated' };
  } catch (error) {
    console.error('Error updating cart:', error);
    return { success: false, message: 'Failed to update cart' };
  }
}

export async function removeFromCart(productId: string) {
  return updateCartItem(productId, 0);
}

export async function clearCart() {
  try {
    const session = await auth();
    const sessionCartId = await getSessionCartId();
    
    await prisma.cart.deleteMany({
      where: session?.user?.id
        ? { userId: session.user.id }
        : { sessionCartId },
    });

    revalidatePath('/');
    
    return { success: true, message: 'Cart cleared' };
  } catch (error) {
    console.error('Error clearing cart:', error);
    return { success: false, message: 'Failed to clear cart' };
  }
}

export async function mergeAnonymousCart() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: 'Not authenticated' };
    }

    const sessionCartId = await getSessionCartId();
    
    const [anonymousCart, userCart] = await Promise.all([
      prisma.cart.findFirst({
        where: { sessionCartId, userId: null },
      }),
      prisma.cart.findFirst({
        where: { userId: session.user.id },
      }),
    ]);

    if (!anonymousCart) {
      return { success: true, message: 'No anonymous cart to merge' };
    }

    const anonymousItems = anonymousCart.items as z.infer<typeof cartItemSchema>[];
    
    if (userCart) {
      const userItems = userCart.items as z.infer<typeof cartItemSchema>[];
      const mergedItems = [...userItems];
      
      for (const anonItem of anonymousItems) {
        const existingIndex = mergedItems.findIndex(
          (item) => item.productId === anonItem.productId
        );
        
        if (existingIndex > -1) {
          const mergedItem = mergedItems[existingIndex];
          if (mergedItem) {
            mergedItem.qty += anonItem.qty;
          }
        } else {
          mergedItems.push(anonItem);
        }
      }

      const itemsPrice = mergedItems.reduce(
        (sum, item) => sum + parseFloat(item.price) * item.qty,
        0
      );
      const shippingPrice = itemsPrice > 100 ? 0 : 10;
      const taxPrice = itemsPrice * 0.1;
      const totalPrice = itemsPrice + shippingPrice + taxPrice;

      await prisma.cart.update({
        where: { id: userCart.id },
        data: {
          items: mergedItems,
          itemsPrice,
          shippingPrice,
          taxPrice,
          totalPrice,
        },
      });
      
      await prisma.cart.delete({
        where: { id: anonymousCart.id },
      });
    } else {
      await prisma.cart.update({
        where: { id: anonymousCart.id },
        data: { userId: session.user.id },
      });
    }

    revalidatePath('/');
    
    return { success: true, message: 'Cart merged successfully' };
  } catch (error) {
    console.error('Error merging cart:', error);
    return { success: false, message: 'Failed to merge cart' };
  }
}