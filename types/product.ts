// Re-export Product type from validators
export type { Product, InsertProduct, UpdateProduct } from '@/lib/validators';

// For backward compatibility, you can also import the Product type directly from validators
import { productSchema } from '@/lib/validators';
import { z } from 'zod';

// This ensures the Product type is available from this file
// while actually using the Zod-inferred type from validators
export type ProductType = z.infer<typeof productSchema>;