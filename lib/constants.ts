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