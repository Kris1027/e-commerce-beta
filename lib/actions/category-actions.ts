'use server';

import prisma from '@/db/prisma';
import { unstable_cache } from 'next/cache';
import { convertToPlainObject } from '@/lib/utils';
import type { Category } from '@/lib/validators';

// Get all unique categories from products with count
export const getCategories = unstable_cache(
  async (): Promise<Category[]> => {
    try {
      // Get all unique categories with their product counts
      const categoriesData = await prisma.product.groupBy({
        by: ['category'],
        _count: {
          category: true,
        },
        orderBy: {
          _count: {
            category: 'desc',
          },
        },
      });

      // Get a sample product image for each category
      const categoriesWithImages = await Promise.all(
        categoriesData.map(async (cat) => {
          // Get the first product in this category that has images
          const product = await prisma.product.findFirst({
            where: {
              category: cat.category,
              images: {
                isEmpty: false,
              },
            },
            select: {
              images: true,
            },
          });

          return {
            name: cat.category,
            slug: cat.category.toLowerCase().replace(/\s+/g, '-'),
            productCount: cat._count.category,
            image: product?.images[0],
          };
        })
      );

      return categoriesWithImages;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },
  ['categories'],
  {
    revalidate: 3600, // Cache for 1 hour
  }
);

// Get products by category
export async function getProductsByCategory(
  category: string,
  page: number = 1,
  limit: number = 12
) {
  try {
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: {
          category: {
            equals: category,
            mode: 'insensitive',
          },
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.product.count({
        where: {
          category: {
            equals: category,
            mode: 'insensitive',
          },
        },
      }),
    ]);

    return {
      products: convertToPlainObject(products),
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return {
      products: [],
      total: 0,
      totalPages: 0,
      currentPage: page,
    };
  }
}

// Get category details with top products
export async function getCategoryDetails(categorySlug: string) {
  try {
    // Convert slug back to category name
    const categoryName = categorySlug.replace(/-/g, ' ');
    
    // Get category product count
    const productCount = await prisma.product.count({
      where: {
        category: {
          equals: categoryName,
          mode: 'insensitive',
        },
      },
    });

    if (productCount === 0) {
      return null;
    }

    // Get top 4 products for preview
    const topProducts = await prisma.product.findMany({
      where: {
        category: {
          equals: categoryName,
          mode: 'insensitive',
        },
      },
      take: 4,
      orderBy: [
        {
          rating: 'desc',
        },
        {
          numReviews: 'desc',
        },
      ],
    });

    return {
      name: categoryName,
      slug: categorySlug,
      productCount,
      topProducts: convertToPlainObject(topProducts),
    };
  } catch (error) {
    console.error('Error fetching category details:', error);
    return null;
  }
}