export const APP_NAME = 'E-Commerce Store'
export const APP_DESCRIPTION = 'Modern e-commerce platform built with Next.js'

export const APP_CONFIG = {
  name: APP_NAME,
  description: APP_DESCRIPTION,
  company: 'E-Commerce Team',
  keywords: ['e-commerce', 'online store', 'shopping', 'retail'],
  url: process.env['NEXT_PUBLIC_APP_URL'] || 'http://localhost:3000',
  api: {
    baseUrl: process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3000/api',
  },
} as const

export const SEO_CONFIG = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: APP_CONFIG.keywords,
  authors: [{ name: APP_CONFIG.company }],
  creator: APP_NAME,
  publisher: APP_NAME,
  openGraph: {
    title: APP_NAME,
    description: APP_DESCRIPTION,
    siteName: APP_NAME,
    locale: 'en_US',
    type: 'website' as const,
  },
  twitter: {
    card: 'summary_large_image' as const,
    title: APP_NAME,
    description: APP_DESCRIPTION,
  },
} as const

// Payment Methods
export const PAYMENT_METHODS = {
  stripe: 'Stripe',
  paypal: 'PayPal',
  cashOnDelivery: 'Cash on Delivery',
} as const

// Order Status
export const ORDER_STATUS = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
} as const

// Shipping and Tax
export const FREE_SHIPPING_MIN_AMOUNT = 50
export const SHIPPING_RATE = 10
export const TAX_RATE = 0.1 // 10%

// Pagination
export const PAGE_SIZE = 12
export const LATEST_PRODUCTS_LIMIT = 8