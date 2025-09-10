import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { neonConfig } from '@neondatabase/serverless'
import ws from 'ws'

// Configure WebSocket for Node.js environment
neonConfig.webSocketConstructor = ws

const prismaClientSingleton = () => {
  const connectionString = process.env['DATABASE_URL']!

  // Create adapter with connection string directly
  const adapter = new PrismaNeon({ connectionString })

  // Type assertion needed due to preview feature types not being fully recognized
  const prismaOptions = { adapter } as ConstructorParameters<typeof PrismaClient>[0]
  return new PrismaClient(prismaOptions).$extends({
    result: {
      product: {
        price: {
          compute(product) {
            return product.price.toString()
          },
        },
        rating: {
          compute(product) {
            return product.rating.toString()
          },
        },
      },
      cart: {
        itemsPrice: {
          needs: { itemsPrice: true },
          compute(cart) {
            return cart.itemsPrice.toString()
          },
        },
        shippingPrice: {
          needs: { shippingPrice: true },
          compute(cart) {
            return cart.shippingPrice.toString()
          },
        },
        taxPrice: {
          needs: { taxPrice: true },
          compute(cart) {
            return cart.taxPrice.toString()
          },
        },
        totalPrice: {
          needs: { totalPrice: true },
          compute(cart) {
            return cart.totalPrice.toString()
          },
        },
      },
      order: {
        itemsPrice: {
          needs: { itemsPrice: true },
          compute(order) {
            return order.itemsPrice.toString()
          },
        },
        shippingPrice: {
          needs: { shippingPrice: true },
          compute(order) {
            return order.shippingPrice.toString()
          },
        },
        taxPrice: {
          needs: { taxPrice: true },
          compute(order) {
            return order.taxPrice.toString()
          },
        },
        totalPrice: {
          needs: { totalPrice: true },
          compute(order) {
            return order.totalPrice.toString()
          },
        },
      },
      orderItem: {
        price: {
          compute(orderItem) {
            return orderItem.price.toString()
          },
        },
      },
    },
  })
}

declare global {
  var prismaGlobal: ReturnType<typeof prismaClientSingleton> | undefined
}

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma
}

export default prisma
