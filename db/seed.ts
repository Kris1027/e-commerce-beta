import { PrismaClient } from '@prisma/client';
import sampleData from './sample-data';
import bcrypt from 'bcryptjs';

async function hash(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function main() {
  const prisma = new PrismaClient();

  // Clean existing data
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();

  // Seed products
  await prisma.product.createMany({ data: sampleData.products });

  // Seed users with hashed passwords
  const users = [];
  for (const user of sampleData.users) {
    users.push({
      ...user,
      password: await hash(user.password),
    });
    console.log(
      `User: ${user.email} - Password: ${user.password}`
    );
  }
  await prisma.user.createMany({ data: users });

  // Seed orders if they exist in sample data
  if (sampleData.orders && sampleData.orders.length > 0) {
    // Fetch all users and products
    const allUsers = await prisma.user.findMany();
    const allProducts = await prisma.product.findMany();

    // Create a map for quick lookup
    const userMap = new Map(allUsers.map(u => [u.email, u.id]));
    const productMap = new Map(allProducts.map(p => [p.slug, p]));

    // Create orders
    for (const orderData of sampleData.orders) {
      const userId = userMap.get(orderData.userEmail);
      if (!userId) {
        console.warn(`⚠️ User with email ${orderData.userEmail} not found, skipping order`);
        continue;
      }

      // Calculate order prices
      let itemsPrice = 0;
      const orderItems = [];

      for (const item of orderData.items) {
        const product = productMap.get(item.slug);
        if (!product) {
          console.warn(`⚠️ Product with slug ${item.slug} not found, skipping item`);
          continue;
        }

        const itemTotal = Number(product.price) * item.qty;
        itemsPrice += itemTotal;

        orderItems.push({
          productId: product.id,
          name: product.name,
          slug: product.slug,
          image: product.images[0] || '',
          price: product.price,
          qty: item.qty,
        });
      }

      // Apply business logic constants
      const shippingPrice = itemsPrice >= 100 ? 0 : 10; // FREE_SHIPPING_THRESHOLD
      const taxPrice = itemsPrice * 0.23; // TAX_RATE
      const discountPrice = 0; // No discounts for sample data
      const totalPrice = itemsPrice + shippingPrice + taxPrice - discountPrice;

      // Create order with items
      await prisma.order.create({
        data: {
          userId,
          paymentMethod: orderData.paymentMethod,
          shippingAddress: orderData.shippingAddress,
          itemsPrice,
          shippingPrice,
          taxPrice,
          discountPrice,
          totalPrice,
          status: orderData.status,
          isPaid: orderData.isPaid,
          paidAt: orderData.paidAt || null,
          isDelivered: orderData.isDelivered,
          deliveredAt: orderData.deliveredAt || null,
          createdAt: orderData.createdAt,
          orderitems: {
            createMany: {
              data: orderItems,
            },
          },
        },
      });
    }

    console.log(`- ${sampleData.orders.length} orders created`);
  }

  console.log('✅ Database seeded successfully!');
  console.log(`- ${sampleData.products.length} products created`);
  console.log(`- ${sampleData.users.length} users created`);

  await prisma.$disconnect();
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  });