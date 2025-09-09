import { z } from 'zod';

// Product Schemas
export const insertProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(255),
  slug: z.string().min(1, 'Slug is required').max(255),
  category: z.string().min(1, 'Category is required').max(255),
  images: z.array(z.string().url('Invalid image URL')).min(1, 'At least one image is required'),
  brand: z.string().min(1, 'Brand is required').max(255),
  description: z.string().min(1, 'Description is required'),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  price: z.number().positive('Price must be positive').or(z.string().transform((val) => parseFloat(val))),
  rating: z.number().min(0).max(5).default(0),
  numReviews: z.number().int().min(0).default(0),
  isFeatured: z.boolean().default(false),
  banner: z.string().nullable().optional(),
});

export const updateProductSchema = insertProductSchema.partial();

export const productSchema = insertProductSchema.extend({
  id: z.string().uuid(),
  createdAt: z.date().or(z.string().transform((val) => new Date(val))),
});

// User Schemas
export const insertUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255).default('NO_NAME'),
  email: z.string().email('Invalid email address'),
  emailVerified: z.date().nullable().optional(),
  image: z.string().url('Invalid image URL').nullable().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').nullable().optional(),
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
  qty: z.number().int().positive('Quantity must be positive'),
  price: z.number().positive(),
  name: z.string(),
  slug: z.string(),
  image: z.string().url(),
});

export const insertCartSchema = z.object({
  userId: z.string().uuid().nullable().optional(),
  sessionCartId: z.string().min(1),
  items: z.array(cartItemSchema).default([]),
  itemsPrice: z.number().min(0),
  totalPrice: z.number().min(0),
  shippingPrice: z.number().min(0),
  taxPrice: z.number().min(0),
});

export const cartSchema = insertCartSchema.extend({
  id: z.string().uuid(),
  createdAt: z.date().or(z.string().transform((val) => new Date(val))),
});

// Order Schemas
export const shippingAddressSchema = z.object({
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'Zip code is required'),
  country: z.string().min(1, 'Country is required'),
});

export const paymentResultSchema = z.object({
  id: z.string(),
  status: z.string(),
  email: z.string().email(),
  paidAt: z.string(),
});

export const insertOrderSchema = z.object({
  userId: z.string().uuid(),
  shippingAddress: shippingAddressSchema,
  paymentMethod: z.string().min(1, 'Payment method is required'),
  paymentResult: paymentResultSchema.nullable().optional(),
  itemsPrice: z.number().min(0),
  shippingPrice: z.number().min(0),
  taxPrice: z.number().min(0),
  totalPrice: z.number().min(0),
  isPaid: z.boolean().default(false),
  paidAt: z.date().nullable().optional(),
  isDelivered: z.boolean().default(false),
  deliveredAt: z.date().nullable().optional(),
});

export const orderSchema = insertOrderSchema.extend({
  id: z.string().uuid(),
  createdAt: z.date().or(z.string().transform((val) => new Date(val))),
});

// Order Item Schemas
export const insertOrderItemSchema = z.object({
  orderId: z.string().uuid(),
  productId: z.string().uuid(),
  qty: z.number().int().positive('Quantity must be positive'),
  price: z.number().positive(),
  name: z.string().min(1),
  slug: z.string().min(1),
  image: z.string().url(),
});

// Review Schemas
export const insertReviewSchema = z.object({
  userId: z.string().uuid(),
  productId: z.string().uuid(),
  rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().min(1, 'Description is required'),
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

export type Cart = z.infer<typeof cartSchema>;
export type InsertCart = z.infer<typeof insertCartSchema>;
export type CartItem = z.infer<typeof cartItemSchema>;

export type Order = z.infer<typeof orderSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type ShippingAddress = z.infer<typeof shippingAddressSchema>;
export type PaymentResult = z.infer<typeof paymentResultSchema>;

export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type Review = z.infer<typeof reviewSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;