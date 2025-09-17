# E-Commerce Template - Development Guide

## Project Overview
Production e-commerce template with Next.js 15.5.2, TypeScript (strict), Prisma/PostgreSQL (Neon), NextAuth v5. Poland-only shipping.

## Critical Rules

### Code Standards
- **TypeScript**: Strict mode, explicit types, no `any`
- **Components**: Server by default, client only when needed, <200 lines
- **UI**: ALWAYS use shadcn/ui components, Lucide icons
- **Security**: Zod validation on client+server, httpOnly cookies
- **Errors**: Always `catch (error)`, log with console.error
- **Performance**: No `router.refresh()`, use state updates

### Key Patterns
```typescript
// Prices: formatCurrency() for all prices
formatCurrency(100) // "100,00 zł"

// Server Actions: Always use for data ops
import { getProducts } from '@/lib/actions/product-actions'

// Forms: React Hook Form + Zod
const form = useForm<T>({ resolver: zodResolver(schema) })

// Toast: Semantic variants
toast.success('Product added')
toast.error('Failed to save')
```

## Tech Stack
- **Core**: Next.js 15.5.2, React 19.1.0, TypeScript 5.9.2
- **DB**: Prisma 6.15.0, PostgreSQL (Neon)
- **Auth**: NextAuth v5 (5.0.0-beta.29)
- **UI**: Tailwind, shadcn/ui, Lucide icons, Sonner toasts
- **State**: Zustand 5.0.8
- **Forms**: React Hook Form 7.62.0, Zod 4.1.5

## Project Structure
```
/app                # App Router pages
/components/ui      # shadcn components + custom (SearchInput, PaginationWrapper)
/lib/actions        # Server actions (REQUIRED for data ops)
/lib/constants      # Business logic constants
/lib/validators     # Zod schemas (REQUIRED for validation)
/lib/utils          # Utility functions
/prisma             # Database schema
```

## Key Components & Utilities

### Custom UI Components
- **SearchInput** - Real-time search with debouncing, no flickering
- **PaginationWrapper** - Unified pagination with shadcn/ui
  - Props: `preserveParams`, `showFirstLast`, `showPageInfo`

### Business Constants (`/lib/constants/cart.ts`)
- `FREE_SHIPPING_THRESHOLD = 100` PLN
- `SHIPPING_PRICE = 10` PLN
- `TAX_RATE = 0.23` (Polish VAT)
- `MAX_QUANTITY_PER_ITEM = 99`
- `HIGH_VALUE_THRESHOLD = 1000` PLN

### Essential Server Actions
```typescript
// User/Admin
getCurrentUser()
getUsersForAdmin(page, search?, filters?)
updateUserAsAdmin(userId, data)
getCustomerStatistics()

// Orders/Cart
getMyOrders(page)
getCart()
addToCart(item)

// Admin Orders Management
getOrdersForAdmin(page, search?, statusFilter?, paymentFilter?, sortBy?)
getOrderSummary()
updateAdminOrderStatus(orderId, status)
getAdminOrderById(orderId)
deleteOrder(orderId)

// Wishlist
getWishlist()
toggleWishlist(productId)

// Categories
getCategories()
getProductsByCategory(category, page)
```

### Polish Localization
- Currency: PLN (formatCurrency handles zł/gr)
- Phone: +48 XXX-XXX-XXX format
- Address: Voivodeship field, XX-XXX postal codes
- Date/Time: pl-PL locale, 24-hour format

## Current Implementation Status

### ✅ Completed
- Full auth system with role-based access
- Product catalog with categories, pagination
- Shopping cart with drawer UI
- Complete checkout flow (shipping → payment → review)
- User profiles with multiple addresses
- Wishlist functionality
- Admin dashboard with customer management
- Advanced search/filtering (SearchInput component)
- Unified pagination (PaginationWrapper)
- Polish localization throughout

### 🚧 Pending
- Stripe/PayPal integration
- Product management CRUD
- Email notifications
- Product reviews
- Social login

## Database Models
- **User**: Auth, roles (admin/user)
- **Product**: Stock, price, images, featured
- **Cart**: Session-based, user-linked
- **Order**: Status flow: pending → processing → shipped → delivered
- **Address**: Multiple per user with default
- **Wishlist**: User saved products

## Testing Checklist
- [ ] Run `pnpm lint` after changes
- [ ] Run `pnpm build` before deploy
- [ ] TypeScript strict mode passes
- [ ] Zod validation in place
- [ ] Error handling with try-catch
- [ ] Polish formatting applied

## Commands
```bash
pnpm dev        # Development
pnpm build      # Production build
pnpm lint       # Check code quality
pnpm db:push    # Update database
pnpm db:seed    # Seed sample data
```

## Sample Users
- **Admin**: admin@example.com / Zaq12wsx
- **User**: user@example.com / Zaq12wsx
- Plus 31 additional test users

## Recent Updates (2025-09-17)
- **Fixed SQL injection vulnerability** in getUsersForAdmin using Prisma.sql safe queries
- **Fixed nested anchor tags** in pagination components
- **Unified pagination** across app with enhanced PaginationWrapper
- **Added query param preservation** for filters during pagination
- **Cleaned up dependencies** and removed unused code
- **Added Admin Orders Management** with full CRUD operations, filtering, and statistics
- **Created Orders Dashboard** with order summary cards and order table
- **Implemented Order Details Page** for admin with complete order information
- **Replaced Static Banner System** with dynamic product-based carousel
- **Created ProductBanners Carousel** using shadcn/ui carousel with embla-carousel
- **Added getProductsWithBanners Action** to fetch products that have banner images
- **Implemented Auto-play Carousel** with pause on hover, navigation controls, and dot indicators
- **Removed HeroBanner** component in favor of product-based banners