'use server';

import { auth } from '@/auth';
import { prisma } from '@/db/prisma';
import { safeParsePrice } from '@/lib/utils';
import { UserRole } from '@prisma/client';

async function checkAdminAccess() {
  const session = await auth();

  if (!session?.user?.role || session.user.role !== UserRole.admin) {
    throw new Error('Unauthorized - Admin access required');
  }
  return session.user;
}

function getStartOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function subMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() - months);
  return result;
}

export async function getAnalyticsOverview() {
  await checkAdminAccess();

  try {
    const now = new Date();
    const startOfCurrentMonth = getStartOfMonth(now);
    const startOfLastMonth = getStartOfMonth(subMonths(now, 1));

    const [
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts,
      currentMonthRevenue,
      currentMonthOrders,
      lastMonthRevenue,
      lastMonthOrders,
      averageOrderValue,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
    ] = await Promise.all([
      prisma.order.aggregate({
        _sum: { totalPrice: true },
        where: { status: { not: 'pending' } },
      }),
      prisma.order.count({
        where: { status: { not: 'pending' } },
      }),
      prisma.user.count({
        where: { role: UserRole.user },
      }),
      prisma.product.count(),
      prisma.order.aggregate({
        _sum: { totalPrice: true },
        where: {
          createdAt: { gte: startOfCurrentMonth },
          status: { not: 'pending' },
        },
      }),
      prisma.order.count({
        where: {
          createdAt: { gte: startOfCurrentMonth },
          status: { not: 'pending' },
        },
      }),
      prisma.order.aggregate({
        _sum: { totalPrice: true },
        where: {
          createdAt: { gte: startOfLastMonth, lt: startOfCurrentMonth },
          status: { not: 'pending' },
        },
      }),
      prisma.order.count({
        where: {
          createdAt: { gte: startOfLastMonth, lt: startOfCurrentMonth },
          status: { not: 'pending' },
        },
      }),
      prisma.order.aggregate({
        _avg: { totalPrice: true },
        where: { status: { not: 'pending' } },
      }),
      prisma.order.count({ where: { status: 'pending' } }),
      prisma.order.count({ where: { status: 'processing' } }),
      prisma.order.count({ where: { status: 'shipped' } }),
      prisma.order.count({ where: { status: 'delivered' } }),
    ]);

    const lastMonthRev = safeParsePrice(lastMonthRevenue._sum.totalPrice);
    const currentMonthRev = safeParsePrice(currentMonthRevenue._sum.totalPrice);

    const revenueChange = lastMonthRev > 0
      ? ((currentMonthRev - lastMonthRev) / lastMonthRev) * 100
      : 0;

    const ordersChange = lastMonthOrders > 0
      ? ((currentMonthOrders - lastMonthOrders) / lastMonthOrders) * 100
      : 0;

    return {
      totalRevenue: safeParsePrice(totalRevenue._sum.totalPrice),
      totalOrders,
      totalCustomers,
      totalProducts,
      currentMonthRevenue: currentMonthRev,
      currentMonthOrders,
      averageOrderValue: safeParsePrice(averageOrderValue._avg.totalPrice),
      revenueChange,
      ordersChange,
      ordersByStatus: {
        pending: pendingOrders,
        processing: processingOrders,
        shipped: shippedOrders,
        delivered: deliveredOrders,
      },
    };
  } catch (error) {
    console.error('Error fetching analytics overview:', error);
    throw new Error('Failed to fetch analytics overview');
  }
}


export async function getTopProducts(limit = 5) {
  await checkAdminAccess();

  try {
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        qty: true,
        price: true,
      },
      _count: {
        productId: true,
      },
      orderBy: {
        _sum: {
          qty: 'desc',
        },
      },
      take: limit,
    });

    const productIds = topProducts.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        images: true,
        category: true,
        stock: true,
      },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    const productsWithDetails = topProducts
      .map((item) => {
        const product = productMap.get(item.productId);
        if (!product) return null;

        const qty = item._sum.qty || 0;
        const totalRevenue = safeParsePrice(item._sum.price);

        return {
          id: product.id,
          name: product.name,
          slug: product.slug,
          category: product.category,
          price: safeParsePrice(product.price),
          image: product.images[0] || '',
          totalQuantity: qty,
          totalRevenue: totalRevenue,
          orderCount: item._count.productId,
          stock: product.stock,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    return productsWithDetails;
  } catch (error) {
    console.error('Error fetching top products:', error);
    throw new Error('Failed to fetch top products');
  }
}


export async function getCustomerInsights() {
  await checkAdminAccess();

  try {
    const now = new Date();
    const sixMonthsAgo = subMonths(now, 6);

    const [
      newCustomersThisMonth,
      newCustomersLastMonth,
      topCustomers,
      customersByMonth,
    ] = await Promise.all([
      prisma.user.count({
        where: {
          role: UserRole.user,
          createdAt: { gte: getStartOfMonth(now) },
        },
      }),
      prisma.user.count({
        where: {
          role: UserRole.user,
          createdAt: {
            gte: getStartOfMonth(subMonths(now, 1)),
            lt: getStartOfMonth(now),
          },
        },
      }),
      prisma.order.groupBy({
        by: ['userId'],
        _sum: { totalPrice: true },
        _count: { userId: true },
        orderBy: { _sum: { totalPrice: 'desc' } },
        take: 5,
      }),
      prisma.user.findMany({
        where: {
          role: UserRole.user,
          createdAt: { gte: sixMonthsAgo },
        },
        select: { createdAt: true },
      }),
    ]);

    const userIds = topCustomers
      .map((c) => c.userId)
      .filter((id): id is string => id !== null);

    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    const topCustomersWithDetails = topCustomers
      .map((customer) => {
        if (!customer.userId) return null;
        const user = userMap.get(customer.userId);
        if (!user) return null;

        return {
          id: user.id,
          name: user.name || 'Anonymous',
          email: user.email,
          totalSpent: safeParsePrice(customer._sum.totalPrice),
          orderCount: customer._count.userId,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    interface CustomerGrowthItem {
      month: string;
      count: number;
    }

    const customerGrowth = customersByMonth.reduce((acc: CustomerGrowthItem[], user) => {
      const month = user.createdAt.toLocaleDateString('pl-PL', {
        month: 'short',
        year: 'numeric',
      });
      const existing = acc.find((item) => item.month === month);
      if (existing) {
        existing.count += 1;
      } else {
        acc.push({ month, count: 1 });
      }
      return acc;
    }, []);

    const growthRate = newCustomersLastMonth > 0
      ? ((newCustomersThisMonth - newCustomersLastMonth) / newCustomersLastMonth) * 100
      : 0;

    return {
      newCustomersThisMonth,
      growthRate,
      topCustomers: topCustomersWithDetails,
      customerGrowth,
    };
  } catch (error) {
    console.error('Error fetching customer insights:', error);
    throw new Error('Failed to fetch customer insights');
  }
}

export async function getInventoryStatus() {
  await checkAdminAccess();

  try {
    const [outOfStock, lowStock, inStock, totalValue] = await Promise.all([
      prisma.product.count({ where: { stock: 0 } }),
      prisma.product.count({ where: { stock: { gt: 0, lte: 10 } } }),
      prisma.product.count({ where: { stock: { gt: 10 } } }),
      prisma.product.aggregate({
        _sum: {
          stock: true,
        },
      }),
    ]);

    const products = await prisma.product.findMany({
      select: { price: true, stock: true },
    });

    const inventoryValue = products.reduce(
      (sum, product) => sum + safeParsePrice(product.price) * product.stock,
      0
    );

    return {
      outOfStock,
      lowStock,
      inStock,
      totalProducts: outOfStock + lowStock + inStock,
      inventoryValue,
      totalStock: totalValue._sum.stock || 0,
    };
  } catch (error) {
    console.error('Error fetching inventory status:', error);
    throw new Error('Failed to fetch inventory status');
  }
}

export async function getOrderStatusBreakdown() {
  await checkAdminAccess();

  try {
    const orderStatuses = await prisma.order.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    const statusData = orderStatuses.map((item) => ({
      status: item.status,
      count: item._count.status,
      displayName: item.status.charAt(0).toUpperCase() + item.status.slice(1),
    }));

    return statusData;
  } catch (error) {
    console.error('Error fetching order status breakdown:', error);
    throw new Error('Failed to fetch order status breakdown');
  }
}

export async function getProductCategoryDistribution() {
  await checkAdminAccess();

  try {
    const categories = await prisma.product.groupBy({
      by: ['category'],
      _count: {
        category: true,
      },
      _avg: {
        price: true,
      },
      _sum: {
        stock: true,
      },
    });

    const categoryData = categories.map((cat) => ({
      category: cat.category,
      productCount: cat._count.category,
      averagePrice: safeParsePrice(cat._avg.price),
      totalStock: cat._sum.stock || 0,
    }));

    return categoryData.sort((a, b) => b.productCount - a.productCount);
  } catch (error) {
    console.error('Error fetching product category distribution:', error);
    throw new Error('Failed to fetch product category distribution');
  }
}

export async function getCustomerOrderFrequency() {
  await checkAdminAccess();

  try {
    const orderCounts = await prisma.order.groupBy({
      by: ['userId'],
      _count: {
        userId: true,
      },
    });

    const frequencyMap: Record<string, number> = {
      '1 order': 0,
      '2-5 orders': 0,
      '6-10 orders': 0,
      '10+ orders': 0,
    };

    orderCounts.forEach((item) => {
      const count = item._count.userId;
      if (count === 1) frequencyMap['1 order'] = (frequencyMap['1 order'] || 0) + 1;
      else if (count <= 5) frequencyMap['2-5 orders'] = (frequencyMap['2-5 orders'] || 0) + 1;
      else if (count <= 10) frequencyMap['6-10 orders'] = (frequencyMap['6-10 orders'] || 0) + 1;
      else frequencyMap['10+ orders'] = (frequencyMap['10+ orders'] || 0) + 1;
    });

    return Object.entries(frequencyMap).map(([range, count]) => ({
      range,
      count,
    }));
  } catch (error) {
    console.error('Error fetching customer order frequency:', error);
    throw new Error('Failed to fetch customer order frequency');
  }
}