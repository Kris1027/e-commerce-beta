/**
 * Product-related constants
 */

// Default values for new products
export const PRODUCT_DEFAULTS = {
  INITIAL_RATING: '0.00',
  INITIAL_NUM_REVIEWS: 0,
  INITIAL_STOCK: 0,
  MIN_NAME_LENGTH: 3,
  MAX_NAME_LENGTH: 255,
  MIN_SLUG_LENGTH: 3,
  MAX_SLUG_LENGTH: 255,
} as const;

// Stock status thresholds
export const STOCK_STATUS = {
  OUT_OF_STOCK: 0,
  LOW_STOCK_THRESHOLD: 10,
  IN_STOCK_THRESHOLD: 10,
} as const;

// Product display limits
export const PRODUCT_LIMITS = {
  MAX_IMAGES: 5,
  IMAGE_MAX_SIZE_MB: 4,
  ITEMS_PER_PAGE: 10,
} as const;

// Product categories (can be extended)
export const PRODUCT_SORT_OPTIONS = [
  { value: 'name_asc', label: 'Name: A to Z' },
  { value: 'name_desc', label: 'Name: Z to A' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'stock_asc', label: 'Stock: Low to High' },
  { value: 'stock_desc', label: 'Stock: High to Low' },
] as const;

// Stock filter options
export const STOCK_FILTER_OPTIONS = [
  { value: 'all', label: 'All Stock' },
  { value: 'in_stock', label: 'In Stock' },
  { value: 'low_stock', label: 'Low Stock' },
  { value: 'out_of_stock', label: 'Out of Stock' },
] as const;