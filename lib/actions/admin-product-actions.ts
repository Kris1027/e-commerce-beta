'use server';

import { prisma } from '@/db/prisma';
import { convertToPlainObject } from '../utils';
import { PAGE_SIZE } from '../constants';
import { Prisma } from '@prisma/client';

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