import { z } from 'zod';
import { PAYMENT_METHODS } from './constants';

// Currency type - for decimal values stored as strings
// Accepts number or string and transforms to string with 2 decimal places
const currency = z
  .union([z.string(), z.number()])
  .transform((val) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    if (typeof num !== 'number' || isNaN(num)) {
      throw new Error('Currency value must be a valid number (e.g., "12.34", "100", or 99.99)');
    }
    return num.toFixed(2);
  })

// Product Schemas
export const insertProductSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(255),
  slug: z.string().min(3, 'Slug must be at least 3 characters').max(255),
  category: z.string().min(1, 'Category is required'),
  images: z.array(z.string().min(1, 'Image path is required')).min(1, 'At least one image is required'),
  brand: z.string().min(1, 'Brand is required'),
  description: z.string().min(1, 'Description is required'),
  stock: z.coerce.number().int().nonnegative('Stock cannot be negative'),
  price: currency,
  rating: currency,
  numReviews: z.coerce.number().int().nonnegative('Number of reviews cannot be negative'),
  isFeatured: z.boolean().default(false),
  banner: z.string().nullable().optional(),
});

export const updateProductSchema = insertProductSchema.partial();

export const productSchema = insertProductSchema.extend({
  id: z.string().uuid(),
  createdAt: z.date().or(z.string().transform((val) => new Date(val))),
});

// User Schemas
export const signInFormSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
});

export const signUpFormSchema = z
  .object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const signInSchema = signInFormSchema;
export const signUpSchema = signUpFormSchema;

export const insertUserSchema = signUpFormSchema
  .omit({ confirmPassword: true })
  .extend({
    id: z.string().uuid().optional(),
    emailVerified: z.date().nullable().optional(),
    image: z.string().nullable().optional(),
    role: z.enum(['user', 'admin']).default('user'),
    address: z.object({
      street: z.string(),
      city: z.string(),
      state: z.string(),
      zipCode: z.string(),
      country: z.string(),
    }).nullable().optional(),
    paymentMethod: z.string().nullable().optional(),
  });

export const updateUserSchema = insertUserSchema.partial();

export const userSchema = insertUserSchema.extend({
  id: z.string().uuid(),
  createdAt: z.date().or(z.string().transform((val) => new Date(val))),
  updatedAt: z.date().or(z.string().transform((val) => new Date(val))),
});

// Cart Schemas
export const cartItemSchema = z.object({
  productId: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  image: z.string().min(1, 'Image is required'), // Allow relative paths for local images
  price: currency,
  qty: z.coerce.number().int().positive('Quantity must be positive'),
});

export const insertCartSchema = z.object({
  userId: z.string().uuid().nullable().optional(),
  sessionCartId: z.string().min(1),
  items: z.array(cartItemSchema).default([]),
  itemsPrice: currency.optional().default('0'),
  shippingPrice: currency.optional().default('0'),
  taxPrice: currency.optional().default('0'),
  totalPrice: currency.optional().default('0'),
  discountPrice: currency.optional().default('0'),
  couponCode: z.string().nullable().optional(),
});

export const cartSchema = insertCartSchema.extend({
  id: z.string().uuid(),
  createdAt: z.date().or(z.string().transform((val) => new Date(val))),
});

// Shipping Address Schema
export const shippingAddressSchema = z.object({
  fullName: z.string().min(3, 'Name must be at least 3 characters'),
  street: z.string().min(3, 'Street is required'),
  city: z.string().min(3, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(3, 'Zip code is required'),
  country: z.string().min(3, 'Country is required'),
  phone: z.string().min(6, 'Phone number must be at least 6 characters').optional(),
});

// Payment Method Schema  
export const paymentMethodSchema = z.object({
  type: z.enum([
    PAYMENT_METHODS.stripe,
    PAYMENT_METHODS.paypal,
    PAYMENT_METHODS.cashOnDelivery,
  ]),
});

// Payment Result Schema
export const paymentResultSchema = z.object({
  id: z.string(),
  status: z.string(),
  email: z.string().email(),
  paidAt: z.string(),
});

// Order Status Constants
export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export const orderStatusSchema = z.enum([
  ORDER_STATUS.PENDING,
  ORDER_STATUS.PROCESSING,
  ORDER_STATUS.SHIPPED,
  ORDER_STATUS.DELIVERED,
  ORDER_STATUS.CANCELLED,
]);

// Order Schemas
export const insertOrderSchema = z.object({
  userId: z.string().uuid(),
  shippingAddress: shippingAddressSchema,
  paymentMethod: z.string().min(1, 'Payment method is required'),
  paymentResult: paymentResultSchema.nullable().optional(),
  itemsPrice: currency,
  shippingPrice: currency,
  taxPrice: currency,
  discountPrice: currency.default('0.00'),
  totalPrice: currency,
  couponCode: z.string().nullable().optional(),
  status: orderStatusSchema.default(ORDER_STATUS.PENDING),
  isPaid: z.boolean().default(false),
  paidAt: z.date().nullable().optional(),
  isDelivered: z.boolean().default(false),
  deliveredAt: z.date().nullable().optional(),
});

export const orderSchema = insertOrderSchema.extend({
  id: z.string().uuid(),
  createdAt: z.date().or(z.string().transform((val) => new Date(val))),
  updatedAt: z.date().or(z.string().transform((val) => new Date(val))),
});

// Order Item Schemas
export const insertOrderItemSchema = z.object({
  orderId: z.string().uuid(),
  productId: z.string().uuid(),
  qty: z.coerce.number().int().positive('Quantity must be positive'),
  price: currency,
  name: z.string().min(1),
  slug: z.string().min(1),
  image: z.string().min(1),
});

// Review Schemas
export const insertReviewSchema = z.object({
  userId: z.string().uuid(),
  productId: z.string().uuid(),
  rating: z.coerce.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  title: z.string().min(3, 'Title must be at least 3 characters').max(255),
  comment: z.string().min(3, 'Comment must be at least 3 characters'),
  isVerifiedPurchase: z.boolean().default(true),
});

export const reviewSchema = insertReviewSchema.extend({
  id: z.string().uuid(),
  createdAt: z.date().or(z.string().transform((val) => new Date(val))),
});

// Type exports using Zod inference
export type Product = z.infer<typeof productSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type UpdateProduct = z.infer<typeof updateProductSchema>;

export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type SignInForm = z.infer<typeof signInFormSchema>;
export type SignUpForm = z.infer<typeof signUpFormSchema>;

// Simplified cart response type for API
export const cartResponseSchema = z.object({
  id: z.string().nullable(),
  items: z.array(cartItemSchema),
  itemsPrice: currency,
  shippingPrice: currency,
  taxPrice: currency,
  totalPrice: currency,
  discountPrice: currency.optional(),
  couponCode: z.string().nullable().optional(),
});

export type Cart = z.infer<typeof cartSchema>;
export type CartResponse = z.infer<typeof cartResponseSchema>;
export type InsertCart = z.infer<typeof insertCartSchema>;
export type CartItem = z.infer<typeof cartItemSchema>;

export type Order = z.infer<typeof orderSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderStatus = z.infer<typeof orderStatusSchema>;
export type ShippingAddress = z.infer<typeof shippingAddressSchema>;
export type PaymentResult = z.infer<typeof paymentResultSchema>;
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;

export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type Review = z.infer<typeof reviewSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;