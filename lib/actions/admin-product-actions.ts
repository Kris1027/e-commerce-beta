'use server';

import { prisma } from '@/db/prisma';
import { convertToPlainObject, formatError } from '../utils';
import { PAGE_SIZE } from '../constants';
import { Prisma, UserRole } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { insertProductSchema, updateProductSchema } from '../validators';
import { z } from 'zod';
import { auth } from '@/auth';
import { UTApi } from 'uploadthing/server';
import { extractFileKeys } from '@/lib/utils/uploadthing';

const utapi = new UTApi();

export type ProductFilterCategory = 'all' | string;
export type ProductFilterStock = 'all' | 'in_stock' | 'out_of_stock' | 'low_stock';
export type ProductFilterFeatured = 'all' | 'featured' | 'not_featured';
export type ProductSortBy = 'newest' | 'oldest' | 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc' | 'stock_asc' | 'stock_desc';

export interface AdminProductsResult {
  products: Array<{
    id: string;
    name: string;
    slug: string;
    brand: string;
    category: string;
    price: string;
    stock: number;
    rating: string;
    isFeatured: boolean;
    images: string[];
    description: string;
    numReviews: number;
    banner: string | null;
    createdAt: Date;
  }>;
  totalPages: number;
  currentPage: number;
  totalProducts: number;
}

export interface ProductStatistics {
  totalProducts: number;
  inStock: number;
  outOfStock: number;
  lowStock: number;
  featuredProducts: number;
  totalValue: number;
  averagePrice: number;
  categoriesCount: number;
}

export async function getProductsForAdmin(
  page = 1,
  search = '',
  categoryFilter: ProductFilterCategory = 'all',
  stockFilter: ProductFilterStock = 'all',
  featuredFilter: ProductFilterFeatured = 'all',
  sortBy: ProductSortBy = 'newest'
): Promise<AdminProductsResult> {
  try {
    const limit = PAGE_SIZE;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Category filter
    if (categoryFilter !== 'all') {
      where.category = categoryFilter;
    }

    // Stock filter
    if (stockFilter === 'in_stock') {
      where.stock = { gt: 10 };
    } else if (stockFilter === 'out_of_stock') {
      where.stock = 0;
    } else if (stockFilter === 'low_stock') {
      where.stock = { gt: 0, lte: 10 };
    }

    // Featured filter
    if (featuredFilter === 'featured') {
      where.isFeatured = true;
    } else if (featuredFilter === 'not_featured') {
      where.isFeatured = false;
    }

    // Sort order
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    switch (sortBy) {
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'name_asc':
        orderBy = { name: 'asc' };
        break;
      case 'name_desc':
        orderBy = { name: 'desc' };
        break;
      case 'price_asc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' };
        break;
      case 'stock_asc':
        orderBy = { stock: 'asc' };
        break;
      case 'stock_desc':
        orderBy = { stock: 'desc' };
        break;
    }

    const [products, totalProducts] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products: convertToPlainObject(products),
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: page,
      totalProducts,
    };
  } catch (error) {
    console.error('Failed to fetch products for admin:', error);
    return {
      products: [],
      totalPages: 0,
      currentPage: 1,
      totalProducts: 0,
    };
  }
}

// Get all unique category names for product form
export async function getAllCategoryNames(): Promise<string[]> {
  try {
    const categories = await prisma.product.groupBy({
      by: ['category'],
      orderBy: {
        category: 'asc',
      },
    });

    return categories.map(cat => cat.category);
  } catch (error) {
    console.error('Failed to fetch category names:', error);
    return [];
  }
}

export async function getProductStatistics(): Promise<ProductStatistics> {
  try {
    const [
      totalProducts,
      inStock,
      outOfStock,
      lowStock,
      featuredProducts,
      products,
      categories,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { stock: { gt: 10 } } }),
      prisma.product.count({ where: { stock: 0 } }),
      prisma.product.count({ where: { stock: { gt: 0, lte: 10 } } }),
      prisma.product.count({ where: { isFeatured: true } }),
      prisma.product.findMany({ select: { price: true, stock: true } }),
      prisma.product.groupBy({ by: ['category'] }),
    ]);

    const totalValue = products.reduce((sum, p) => sum + (Number(p.price) * p.stock), 0);
    const averagePrice = products.length > 0
      ? products.reduce((sum, p) => sum + Number(p.price), 0) / products.length
      : 0;

    return {
      totalProducts,
      inStock,
      outOfStock,
      lowStock,
      featuredProducts,
      totalValue,
      averagePrice,
      categoriesCount: categories.length,
    };
  } catch (error) {
    console.error('Failed to fetch product statistics:', error);
    return {
      totalProducts: 0,
      inStock: 0,
      outOfStock: 0,
      lowStock: 0,
      featuredProducts: 0,
      totalValue: 0,
      averagePrice: 0,
      categoriesCount: 0,
    };
  }
}

// Delete a product and its images from UploadThing (Admin only)
export async function deleteProduct(id: string) {
  try {
    // Check if user is admin
    const session = await auth();

    if (!session?.user?.role || session.user.role !== UserRole.admin) {
      return { success: false, message: 'Unauthorized. Admin access required.' };
    }

    const productExists = await prisma.product.findFirst({
      where: { id },
      select: {
        id: true,
        name: true,
        images: true,
        banner: true,
      },
    });

    if (!productExists) {
      return { success: false, message: 'Product not found' };
    }

    // Collect all image URLs to delete from UploadThing
    const imagesToDelete: string[] = [...productExists.images];
    if (productExists.banner) {
      imagesToDelete.push(productExists.banner);
    }

    // Delete product from database first
    await prisma.product.delete({ where: { id } });

    // Then clean up images from UploadThing
    if (imagesToDelete.length > 0) {
      try {
        const fileKeys = extractFileKeys(imagesToDelete);
        if (fileKeys.length > 0) {
          const result = await utapi.deleteFiles(fileKeys);
          console.log(`Deleted ${fileKeys.length} images for product "${productExists.name}":`, result);
        }
      } catch (uploadError) {
        // Log error but don't fail the product deletion
        console.error('Failed to delete images from UploadThing:', uploadError);
        // Product is already deleted, so we continue
      }
    }

    revalidatePath('/admin/products');
    revalidatePath('/products');

    return {
      success: true,
      message: 'Product and associated images deleted successfully',
    };
  } catch (error) {
    console.error('Failed to delete product:', error);
    return { success: false, message: formatError(error) };
  }
}

// Create a product (Admin only)
export async function createProduct(data: z.infer<typeof insertProductSchema>) {
  try {
    // Check if user is admin
    const session = await auth();

    if (!session?.user?.role || session.user.role !== UserRole.admin) {
      return { success: false, message: 'Unauthorized. Admin access required.' };
    }

    const product = insertProductSchema.parse(data);

    // Check if a product with the same name already exists
    const existingProduct = await prisma.product.findFirst({
      where: {
        name: {
          equals: product.name,
          mode: 'insensitive', // Case-insensitive comparison
        },
      },
    });

    if (existingProduct) {
      return {
        success: false,
        message: `A product with the name "${product.name}" already exists. Please use a different name.`,
      };
    }

    // Check if a product with the same slug already exists
    const existingSlug = await prisma.product.findFirst({
      where: { slug: product.slug },
    });

    if (existingSlug) {
      return {
        success: false,
        message: `The slug "${product.slug}" is already in use. Please use a different slug.`,
      };
    }

    await prisma.product.create({ data: product });

    revalidatePath('/admin/products');
    revalidatePath('/products');

    return {
      success: true,
      message: 'Product created successfully',
    };
  } catch (error) {
    console.error('Failed to create product:', error);
    return { success: false, message: formatError(error) };
  }
}

// Update a product (Admin only)
export async function updateProduct(data: z.infer<typeof updateProductSchema> & { id: string }) {
  try {
    // Check if user is admin
    const session = await auth();

    if (!session?.user?.role || session.user.role !== UserRole.admin) {
      return { success: false, message: 'Unauthorized. Admin access required.' };
    }

    const { id, ...updateData } = data;
    const product = updateProductSchema.parse(updateData);

    const productExists = await prisma.product.findFirst({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        images: true,
        banner: true,
      },
    });

    if (!productExists) {
      return { success: false, message: 'Product not found' };
    }

    // Check if updating name and if the new name already exists (excluding current product)
    if (product.name) {
      const existingProduct = await prisma.product.findFirst({
        where: {
          name: {
            equals: product.name,
            mode: 'insensitive',
          },
          NOT: { id },
        },
      });

      if (existingProduct) {
        return {
          success: false,
          message: `A product with the name "${product.name}" already exists. Please use a different name.`,
        };
      }
    }

    // Check if updating slug and if the new slug already exists (excluding current product)
    if (product.slug) {
      const existingSlug = await prisma.product.findFirst({
        where: {
          slug: product.slug,
          NOT: { id },
        },
      });

      if (existingSlug) {
        return {
          success: false,
          message: `The slug "${product.slug}" is already in use. Please use a different slug.`,
        };
      }
    }

    // Find images that were removed (old images not in new images)
    const imagesToDelete: string[] = [];

    if (product.images !== undefined) {
      const oldImages = productExists.images;
      const newImages = product.images;

      // Find images that were removed
      const removedImages = oldImages.filter(img => !newImages.includes(img));
      imagesToDelete.push(...removedImages);
    }

    if (product.banner !== undefined) {
      // If banner was removed or changed
      if (productExists.banner && product.banner !== productExists.banner) {
        imagesToDelete.push(productExists.banner);
      }
    }

    // Update product in database
    await prisma.product.update({
      where: { id },
      data: product,
    });

    // Clean up removed images from UploadThing
    if (imagesToDelete.length > 0) {
      try {
        const fileKeys = extractFileKeys(imagesToDelete);
        if (fileKeys.length > 0) {
          const result = await utapi.deleteFiles(fileKeys);
          console.log(`Cleaned up ${fileKeys.length} old images for product "${productExists.name}":`, result);
        }
      } catch (uploadError) {
        // Log error but don't fail the product update
        console.error('Failed to delete old images from UploadThing:', uploadError);
      }
    }

    revalidatePath('/admin/products');
    revalidatePath('/products');
    revalidatePath(`/products/${productExists.slug}`);

    return {
      success: true,
      message: 'Product updated successfully',
    };
  } catch (error) {
    console.error('Failed to update product:', error);
    return { success: false, message: formatError(error) };
  }
}