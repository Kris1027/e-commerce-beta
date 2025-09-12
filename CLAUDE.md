# E-Commerce Template - Implementation Guide

## Project Context
Production-ready e-commerce template built with Next.js 15.5.2, TypeScript (strict mode), Prisma ORM with PostgreSQL (Neon), and NextAuth v5.

## Critical Development Rules (MUST FOLLOW)

### TypeScript Standards
- ✅ ALWAYS use strict TypeScript mode
- ✅ Define explicit types for all props, state, and functions
- ✅ Avoid `any` type - use `unknown` if type is truly unknown
- ✅ Use interfaces for objects, types for unions/primitives

### React/Next.js Patterns
- ✅ Use `'use client'` directive only when necessary
- ✅ Use server components by default
- ✅ Always use Next.js Image component for images
- ✅ Keep components under 200 lines
- ✅ Single responsibility principle

### Code Consistency
- ✅ Use Lucide React icons (not custom SVGs)
- ✅ Format prices with `formatCurrency()` utility
- ✅ Use `formatNumberWithDecimal()` for decimal precision
- ✅ Extract magic numbers to constants
- ✅ Always add `cursor-pointer` class to interactive elements
- ✅ Use onBlur instead of onChange for inputs that trigger API calls

### Security & Performance
- ✅ Validate all data with Zod schemas on client AND server
- ✅ Use httpOnly cookies for sessions
- ✅ Wrap database operations in transactions when needed
- ✅ Implement optimistic updates with rollback on error
- ✅ Avoid `router.refresh()` - use state updates instead
- ✅ No setTimeout for navigation delays
- ✅ Enforce MAX_QUANTITY_PER_ITEM (99) consistently

### Error Handling
- ✅ Use try-catch for all async operations
- ✅ Include error parameter in catch blocks
- ✅ Provide user-friendly error messages
- ✅ Never expose sensitive error details

## Tech Stack & Dependencies

```json
{
  "core": {
    "next": "15.5.2",
    "react": "19.1.0",
    "typescript": "5.9.2"
  },
  "database": {
    "prisma": "6.15.0",
    "@prisma/client": "6.15.0",
    "postgresql": "Neon cloud"
  },
  "auth": {
    "next-auth": "5.0.0-beta.29",
    "@auth/prisma-adapter": "2.10.0",
    "bcryptjs": "3.0.2"
  },
  "ui": {
    "tailwind": "4.1.13",
    "shadcn/ui": "latest",
    "sonner": "toast notifications",
    "lucide-react": "icons"
  },
  "state": {
    "zustand": "5.0.8"
  },
  "forms": {
    "react-hook-form": "7.62.0",
    "zod": "4.1.5"
  }
}
```

## Project Structure

```
/app                    # Pages (App Router)
/components            
  /ui                  # shadcn/ui components
  /layout              # Header, Footer
  /cart                # Cart drawer, components
  /checkout            # Checkout steps, forms
  /products            # Product cards, gallery
/lib
  /actions             # Server actions (ALWAYS use these for data ops)
  /constants           # Business logic constants
  /store               # Zustand stores
  /utils               # Utility functions
  /validators          # Zod schemas (ALWAYS validate with these)
/prisma/schema.prisma  # Database schema
/db/prisma.ts          # Prisma client singleton
```

## Key Utilities & Constants

### Business Constants (`/lib/constants/cart.ts`)
```typescript
FREE_SHIPPING_THRESHOLD = 100
SHIPPING_PRICE = 10
TAX_RATE = 0.1
MAX_QUANTITY_PER_ITEM = 99
CART_SESSION_DURATION = 30 days
```

### Essential Utilities (`/lib/utils.ts`)
```typescript
formatCurrency(value: string | number)     // $99.99
formatOrderStatus(status: string)          // "Pending"
getOrderStatusColor(status: string)        // "bg-yellow-100..."
isActiveOrder(status: string)              // true/false
validateQuantity(value: number)            // 1-99
formatNumberWithDecimal(num: number)       // "10.00"
calculateCartPrices(itemsPrice: number)    // {shipping, tax, total}
```

### Validation Schemas (`/lib/validators.ts`)
- `cartItemSchema` - Cart item validation
- `shippingAddressSchema` - Address validation
- `signInSchema` / `signUpSchema` - Auth validation
- `ORDER_STATUS` constant - Order states
- `CartResponse` type - API responses

## Database Models

### Core Models
- **User**: Authentication, roles (admin/customer)
- **Product**: Stock, price, images, featured flag
- **Cart**: Session-based, user-linked
- **Order**: Status tracking, payment info
- **OrderItem**: Order line items

### Order Status Flow
```
pending → processing → shipped → delivered
                    ↓
                 cancelled
```

## Authentication Setup

### Protected Routes (middleware.ts)
- `/checkout/*` - Requires authentication
- `/orders/*` - Requires authentication
- `/dashboard` - Requires authentication
- `/admin/*` - Requires admin role

### Session Management
- JWT strategy with 30-day expiration
- Credentials provider only (no social login yet)
- Password: 8+ chars, uppercase, lowercase, number

## Current Implementation Status

### ✅ Completed
- Full authentication system with NextAuth v5
- Product catalog with detail pages
- Shopping cart with drawer UI
- Discount/coupon system (WELCOME10, SAVE20, SHIP5)
- Complete checkout flow (shipping → payment → review)
- Order placement with Cash on Delivery
- Order management and tracking
- User dashboard with statistics
- Cart persistence and guest support

### 🚧 Pending
- Stripe/PayPal payment integration
- Admin dashboard (product/order management)
- User profile management
- Password reset
- Email notifications
- Product search and filters
- Wishlist
- Product reviews

## Common Patterns

### Server Actions Pattern
```typescript
// Always use server actions for data operations
import { getProducts } from '@/lib/actions/product-actions';

// In page component
const products = await getProducts();
```

### Form Handling Pattern
```typescript
// Use React Hook Form + Zod
const form = useForm<SignInInput>({
  resolver: zodResolver(signInSchema),
});
```

### Cart Operations Pattern
```typescript
// Use Zustand store + server actions
const { addItem } = useCartStore();
await addToCart(item); // Server action
addItem(item); // Optimistic update
```

### Transaction Pattern
```typescript
// Wrap related operations in transaction
const result = await prisma.$transaction(async (tx) => {
  const order = await tx.order.create({...});
  await Promise.all(stockUpdates);
  return order;
});
```

## Testing Checklist
- [ ] Run `pnpm lint` - must pass
- [ ] Run `pnpm build` - must succeed
- [ ] No console.log statements
- [ ] TypeScript types defined
- [ ] Zod validation in place
- [ ] Error handling implemented

## Environment Variables
```env
DATABASE_URL="postgresql://..."
DATABASE_URL_UNPOOLED="postgresql://..."
AUTH_URL="http://localhost:3000"
AUTH_SECRET="[generate with: openssl rand -base64 32]"
```

## Sample Users
- Admin: admin@example.com / 123456
- User: user@example.com / 123456

## Commands
```bash
pnpm dev          # Development
pnpm build        # Build for production
pnpm lint         # Check code quality
pnpm db:push      # Push schema changes
pnpm db:seed      # Seed sample data
pnpm db:studio    # Prisma Studio GUI
```

---
**Remember**: Always follow the rules above to maintain consistency. When in doubt, check existing implementations in the codebase.