// Store Configuration - Customize these settings for your specific store type
// This configuration makes the template adaptable to any industry

export const storeConfig = {
  // Basic Store Information
  name: process.env['NEXT_PUBLIC_STORE_NAME'] || 'E-Commerce Store',
  tagline: process.env['NEXT_PUBLIC_STORE_TAGLINE'] || 'Your one-stop shop',
  description: process.env['NEXT_PUBLIC_STORE_DESCRIPTION'] || 'Browse our wide selection of products',
  
  // Product Configuration
  product: {
    // What you call your items (products, services, courses, tickets, etc.)
    itemName: {
      singular: 'product',
      plural: 'products',
    },
    // Enable/disable features based on your store type
    features: {
      physicalProducts: true,
      digitalProducts: false,
      services: false,
      variants: true, // sizes, colors, etc.
      reviews: true,
      ratings: true,
      wishlist: true,
      comparison: false,
      quickView: true,
    },
  },

  // Category Configuration
  categories: {
    enabled: true,
    displayStyle: 'card', // 'card' | 'list' | 'grid'
    showProductCount: true,
    showDescription: true,
  },

  // Shopping Experience
  shopping: {
    cart: {
      persistCart: true,
      showSaveForLater: true,
      showRecentlyViewed: true,
    },
    checkout: {
      guestCheckout: true,
      expressCheckout: true,
      multiStep: true,
    },
  },

  // Trust Badges - Generic for any store type
  trustBadges: [
    {
      icon: 'Truck',
      title: 'Fast Delivery',
      description: 'Quick and reliable shipping',
    },
    {
      icon: 'Shield',
      title: 'Secure Shopping',
      description: '100% secure transactions',
    },
    {
      icon: 'RefreshCw',
      title: 'Easy Returns',
      description: 'Hassle-free return policy',
    },
    {
      icon: 'Headphones',
      title: 'Customer Support',
      description: 'Dedicated customer service',
    },
  ],

  // Homepage Sections - Enable/disable as needed
  homepage: {
    sections: {
      heroBanner: true,
      featuredProducts: true,
      categories: true,
      newArrivals: true,
      trustBadges: true,
      newsletter: true,
      testimonials: false,
      brands: false,
      blog: false,
    },
    // Customizable section titles
    sectionTitles: {
      featured: 'Featured Items',
      newArrivals: 'New Arrivals',
      categories: 'Browse Categories',
      newsletter: 'Stay Updated',
    },
  },

  // SEO Configuration
  seo: {
    titleTemplate: '%s | ' + (process.env['NEXT_PUBLIC_STORE_NAME'] || 'Store'),
    defaultTitle: process.env['NEXT_PUBLIC_STORE_NAME'] || 'E-Commerce Store',
    keywords: process.env['NEXT_PUBLIC_SEO_KEYWORDS']?.split(',') || [],
  },

  // Currency and Locale
  locale: {
    currency: process.env['NEXT_PUBLIC_CURRENCY'] || 'USD',
    currencySymbol: process.env['NEXT_PUBLIC_CURRENCY_SYMBOL'] || 'zł',
    language: process.env['NEXT_PUBLIC_LANGUAGE'] || 'en',
    country: process.env['NEXT_PUBLIC_COUNTRY'] || 'US',
  },

  // Social Media Links
  social: {
    facebook: process.env['NEXT_PUBLIC_FACEBOOK_URL'] || '',
    twitter: process.env['NEXT_PUBLIC_TWITTER_URL'] || '',
    instagram: process.env['NEXT_PUBLIC_INSTAGRAM_URL'] || '',
    youtube: process.env['NEXT_PUBLIC_YOUTUBE_URL'] || '',
    linkedin: process.env['NEXT_PUBLIC_LINKEDIN_URL'] || '',
  },

  // Analytics and Tracking
  analytics: {
    googleAnalyticsId: process.env['NEXT_PUBLIC_GA_ID'] || '',
    facebookPixelId: process.env['NEXT_PUBLIC_FB_PIXEL_ID'] || '',
  },
};