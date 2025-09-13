'use server';

import { auth } from '@/auth';
import prisma from '@/db/prisma';
import { revalidatePath } from 'next/cache';
import { ListResult, createListErrorResult } from '@/lib/types/action-results';
import { WishlistItem } from '@/lib/validators';

export async function getWishlist(): Promise<ListResult<WishlistItem>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      // Return empty list for non-authenticated users (not an error)
      return { success: true, data: [] };
    }

    const wishlistItems = await prisma.wishlist.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        product: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedItems = wishlistItems.map(item => ({
      id: item.id,
      userId: item.userId,
      productId: item.productId,
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        price: item.product.price.toString(),
        rating: item.product.rating.toString(),
        numReviews: item.product.numReviews,
        images: item.product.images,
        brand: item.product.brand,
        category: item.product.category,
        stock: item.product.stock,
      },
      createdAt: item.createdAt,
    }));

    return { success: true, data: formattedItems };
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return createListErrorResult('Failed to load wishlist. Please try again later.');
  }
}

export async function addToWishlist(productId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: 'Please sign in to add items to wishlist' };
    }

    // Check if item already exists in wishlist
    const existingItem = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    });

    if (existingItem) {
      return { success: false, message: 'Item already in wishlist' };
    }

    // Add to wishlist
    await prisma.wishlist.create({
      data: {
        userId: session.user.id,
        productId,
      },
    });

    revalidatePath('/wishlist');
    revalidatePath('/products');
    
    return { success: true, message: 'Added to wishlist' };
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return { success: false, message: 'Failed to add to wishlist' };
  }
}

export async function removeFromWishlist(productId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: 'Please sign in to manage wishlist' };
    }

    await prisma.wishlist.delete({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    });

    revalidatePath('/wishlist');
    revalidatePath('/products');
    
    return { success: true, message: 'Removed from wishlist' };
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return { success: false, message: 'Failed to remove from wishlist' };
  }
}

export async function toggleWishlist(productId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: 'Please sign in to use wishlist', isInWishlist: false };
    }

    // Check if item exists in wishlist
    const existingItem = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    });

    if (existingItem) {
      // Remove from wishlist
      await prisma.wishlist.delete({
        where: {
          userId_productId: {
            userId: session.user.id,
            productId,
          },
        },
      });
      
      revalidatePath('/wishlist');
      revalidatePath('/products');
      
      return { success: true, message: 'Removed from wishlist', isInWishlist: false };
    } else {
      // Add to wishlist
      await prisma.wishlist.create({
        data: {
          userId: session.user.id,
          productId,
        },
      });
      
      revalidatePath('/wishlist');
      revalidatePath('/products');
      
      return { success: true, message: 'Added to wishlist', isInWishlist: true };
    }
  } catch (error) {
    console.error('Error toggling wishlist:', error);
    return { success: false, message: 'Failed to update wishlist', isInWishlist: false };
  }
}

export async function isInWishlist(productId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return false;
    }

    const item = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    });

    return !!item;
  } catch (error) {
    console.error('Error checking wishlist:', error);
    return false;
  }
}

export async function getWishlistProductIds() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return [];
    }

    const wishlistItems = await prisma.wishlist.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        productId: true,
      },
    });

    return wishlistItems.map(item => item.productId);
  } catch (error) {
    console.error('Error fetching wishlist product IDs:', error);
    return [];
  }
}

export async function getWishlistCount() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return 0;
    }

    const count = await prisma.wishlist.count({
      where: {
        userId: session.user.id,
      },
    });

    return count;
  } catch (error) {
    console.error('Error fetching wishlist count:', error);
    return 0;
  }
}