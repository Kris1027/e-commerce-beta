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