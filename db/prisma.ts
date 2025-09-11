import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { neonConfig } from '@neondatabase/serverless'
import ws from 'ws'
import { formatNumberWithDecimal } from '@/lib/utils'

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
            return formatNumberWithDecimal(Number(product.price))
          },
        },
        rating: {
          compute(product) {
            return formatNumberWithDecimal(Number(product.rating))
          },
        },
      },
      cart: {
        itemsPrice: {
          needs: { itemsPrice: true },
          compute(cart) {
            return formatNumberWithDecimal(Number(cart.itemsPrice))
          },
        },
        shippingPrice: {
          needs: { shippingPrice: true },
          compute(cart) {
            return formatNumberWithDecimal(Number(cart.shippingPrice))
          },
        },
        taxPrice: {
          needs: { taxPrice: true },
          compute(cart) {
            return formatNumberWithDecimal(Number(cart.taxPrice))
          },
        },
        totalPrice: {
          needs: { totalPrice: true },
          compute(cart) {
            return formatNumberWithDecimal(Number(cart.totalPrice))
          },
        },
      },
      order: {
        itemsPrice: {
          needs: { itemsPrice: true },
          compute(order) {
            return formatNumberWithDecimal(Number(order.itemsPrice))
          },
        },
        shippingPrice: {
          needs: { shippingPrice: true },
          compute(order) {
            return formatNumberWithDecimal(Number(order.shippingPrice))
          },
        },
        taxPrice: {
          needs: { taxPrice: true },
          compute(order) {
            return formatNumberWithDecimal(Number(order.taxPrice))
          },
        },
        totalPrice: {
          needs: { totalPrice: true },
          compute(order) {
            return formatNumberWithDecimal(Number(order.totalPrice))
          },
        },
      },
      orderItem: {
        price: {
          compute(orderItem) {
            return formatNumberWithDecimal(Number(orderItem.price))
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
