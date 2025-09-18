'use server';

import { prisma } from '@/db/prisma';
import { convertToPlainObject } from '../utils';
import { LATEST_PRODUCTS_LIMIT, PAGE_SIZE } from '../constants';
import { Prisma } from '@prisma/client';

// Get latest products
export async function getLatestProducts() {
  const data = await prisma.product.findMany({
    take: LATEST_PRODUCTS_LIMIT,
    orderBy: { createdAt: 'desc' },
  });

  return convertToPlainObject(data);
}

// Get single product by it's slug
export async function getProductBySlug(slug: string) {
  const data = await prisma.product.findFirst({
    where: { slug: slug },
  });

  return convertToPlainObject(data);
}

// Get single product by it's ID
export async function getProductById(productId: string) {
  const data = await prisma.product.findFirst({
    where: { id: productId },
  });

  return convertToPlainObject(data);
}

// Get all products
export async function getAllProducts({
  query,
  limit = PAGE_SIZE,
  page,
  category,
  price,
  rating,
  sort,
}: {
  query?: string;
  limit?: number;
  page: number;
  category?: string;
  price?: string;
  rating?: string;
  sort?: string;
}) {
  // Query filter
  const queryFilter: Prisma.ProductWhereInput =
    query && query !== 'all'
      ? {
          name: {
            contains: query,
            mode: 'insensitive',
          } as Prisma.StringFilter,
        }
      : {};

  // Category filter
  const categoryFilter = category && category !== 'all' ? { category } : {};

  // Price filter
  const priceFilter: Prisma.ProductWhereInput =
    price && price !== 'all'
      ? {
          price: {
            gte: Number(price.split('-')[0]),
            lte: Number(price.split('-')[1]),
          },
        }
      : {};

  // Rating filter
  const ratingFilter =
    rating && rating !== 'all'
      ? {
          rating: {
            gte: Number(rating),
          },
        }
      : {};

  const data = await prisma.product.findMany({
    where: {
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    },
    orderBy:
      sort === 'lowest'
        ? { price: 'asc' }
        : sort === 'highest'
        ? { price: 'desc' }
        : sort === 'rating'
        ? { rating: 'desc' }
        : { createdAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
  });

  const dataCount = await prisma.product.count({
    where: {
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    },
  });

  return {
    data: convertToPlainObject(data),
    totalPages: Math.ceil(dataCount / limit),
  };
}


// Get all categories with product count
export async function getAllCategories() {
  try {
    const data = await prisma.product.groupBy({
      by: ['category'],
      _count: true,
    });

    // Don't use convertToPlainObject here as groupBy doesn't return product objects
    return { success: true, data, error: null };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return { 
      success: false, 
      data: [], 
      error: 'Failed to load categories. Please try refreshing the page.' 
    };
  }
}

// Get featured products
export async function getFeaturedProducts() {
  const data = await prisma.product.findMany({
    where: { isFeatured: true },
    orderBy: { createdAt: 'desc' },
    take: 4,
  });

  return convertToPlainObject(data);
}

// Get new arrivals
export async function getNewArrivals() {
  const data = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    take: 4,
  });

  return convertToPlainObject(data);
}

// Get products with banners for homepage
export async function getProductsWithBanners() {
  try {
    const data = await prisma.product.findMany({
      where: {
        banner: {
          not: null,
        },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        banner: true,
        price: true,
        category: true,
      },
    });

    // Type assertion is safe here because we filtered for non-null banners
    // The WHERE clause ensures banner is never null
    return convertToPlainObject(data) as Array<{
      id: string;
      name: string;
      slug: string;
      banner: string;
      price: string;
      category: string;
    }>;
  } catch (error) {
    console.error('Error fetching banner products:', error);
    return [];
  }
}