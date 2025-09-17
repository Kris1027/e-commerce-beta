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
- **File Upload**: UploadThing 7.7.4

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
- **ProductImageUpload** - Drag-and-drop image upload with preview, reordering, and progress tracking
  - Props: `value`, `onChange`, `maxImages`, `disabled`
  - Features: Multi-file upload, drag to reorder, image preview, delete individual images

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

// Admin Products Management (admin-product-actions.ts)
getProductsForAdmin(page, search?, categoryFilter?, stockFilter?, featuredFilter?, sortBy?)
getProductStatistics()
getProductById(id) // Admin-only, fetches product for editing
getAllCategoryNames() // Returns all unique category names
deleteProduct(id) // Admin-only with auth check, auto-deletes images from storage
createProduct(data) // Admin-only with auth check
updateProduct(data) // Admin-only with auth check, auto-cleans removed images

// Wishlist
getWishlist()
toggleWishlist(productId)

// Categories
getCategories()
getProductsByCategory(category, page)

// UploadThing File Management (uploadthing-actions.ts)
deleteUploadThingFiles(fileKeys) // Admin-only, deletes files from storage
deleteUploadThingFilesByUrls(urls) // Admin-only, extracts keys and deletes
```

### Custom Hooks
- **useNavigationGuard** - Prevents navigation with unsaved changes
  - Options: `shouldBlock`, `onBlock`, `message`
  - Intercepts both browser navigation (back button, refresh) and Next.js router navigation
  - Usage: Product form protection, preventing loss of uploaded images

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
- Complete product CRUD with image upload (UploadThing)
  - Create products with drag-and-drop image upload
  - Edit products with automatic image cleanup for removed images
  - Delete products with full image storage cleanup
- Navigation guards for preventing data loss
- Category management with auto-complete

### 🚧 Pending
- Stripe/PayPal integration
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
- **Added Robust Price Validation** - Improved number conversion safety across the application
  - Added safeParsePrice function with NaN and negative value checks
  - Fixed potential calculation failures in getProductStatistics
  - Added price validation to cart-actions for all reduce operations
  - Ensured averagePrice only includes valid positive prices
  - Graceful handling of invalid data with error logging
- **Improved Production Logging Security** - Enhanced logging to prevent sensitive data exposure
  - Added environment-based logging (detailed in development, minimal in production)
  - Removed sensitive file information from production logs
  - Kept error tracking while avoiding internal detail exposure
  - Applied to all UploadThing file operations in admin actions
- **Enhanced useNavigationGuard Hook Documentation** - Improved browser compatibility documentation
  - Added comprehensive JSDoc with usage examples
  - Documented browser-specific behavior for beforeunload
  - Listed supported browsers and their message handling
  - Clarified limitations with modern browser security features
- **Fixed TypeScript Issues in Product Forms** - Resolved type compatibility between Zod schemas and React Hook Form
  - Removed explicit type parameters from useForm to let TypeScript infer
  - Used z.infer<typeof schema> for onSubmit handlers
  - Eliminated need for type assertions or `any` types
- **Upgraded ProductImageUpload with @dnd-kit** - Replaced custom drag-and-drop with @dnd-kit library
  - Full keyboard accessibility (Tab to focus, arrow keys to reorder)
  - Touch gesture support for mobile devices
  - Visual feedback during drag operations with DragOverlay
  - Smooth animations and transitions
  - WCAG-compliant with proper ARIA labels
- **Enhanced Search Security** - Added Zod validation and sanitization for all search inputs to prevent ReDoS attacks
  - Validates search term length (max 64 chars)
  - Escapes special SQL characters (%_\) to prevent injection
  - Applied to admin products, orders, and customers search functions
- **Integrated UploadThing File Upload** - Replaced URL-based image inputs with drag-and-drop image upload component
- **Created ProductImageUpload Component** - Custom upload component with multi-image support, drag-to-reorder, progress tracking, and validation
- **Configured UploadThing File Router** - Set up secure file upload endpoints with admin-only authentication for product images
- **Added Multiple Upload Endpoints** - Support for product images (5 files, 4MB each), avatars, category images, and banners
- **Implemented Image Cleanup on Cancel** - Automatically deletes uploaded images from UploadThing storage when user cancels product creation
- **Added Navigation Guards** - Prevents accidental data loss by showing confirmation dialog when navigating away with unsaved uploads
- **Enhanced Product Deletion** - Now automatically removes associated images from UploadThing storage when deleting products
- **Created useNavigationGuard Hook** - Reusable hook for intercepting navigation and preventing data loss across the application
- **Implemented Product Edit Functionality** - Complete edit form with smart image management that only deletes removed/replaced images
- **Added Category Auto-Complete** - Dynamic category field that shows existing categories and allows creating new ones
- **Smart Image Management in Edit Mode** - Tracks original vs newly uploaded images, only cleans up new uploads on cancel
- **Updated Product Form** - Now uses UploadThing for both product images and banner uploads with visual preview
- **Added Admin Products Page** with complete display functionality, filtering, and statistics
- **Created Products Table Component** with search, category/stock/featured filters, and sorting options
- **Implemented Product Statistics Dashboard** showing total products, stock status, and inventory value
- **Added Delete Product Functionality** with confirmation dialog and optimistic UI updates
- **Created Product Creation Form** with React Hook Form, Zod validation, auto-slug generation, multiple image support (rating and reviews auto-set to 0)
- **Duplicate Product Prevention** - Products cannot be created with duplicate names (case-insensitive) or slugs, similar to email uniqueness for users
- **Enhanced Security** - Moved admin-only product operations (create, update, delete) to admin-product-actions.ts with proper authentication checks
- **Consistent Admin Actions** - All admin operations now follow same security pattern with UserRole.admin checks
- **UI/UX Consistency** across all admin pages (Orders, Customers, Products) with gradient headers and cards

## Previous Updates (2025-09-16)
- **Fixed SQL injection vulnerability** in getUsersForAdmin using Prisma.sql safe queries
- **Fixed nested anchor tags** in pagination components
- **Unified pagination** across app with enhanced PaginationWrapper
- **Added query param preservation** for filters during pagination
- **Cleaned up dependencies** and removed unused code
- **Added Admin Orders Management** with full CRUD operations, filtering, and statistics
- **Created Orders Dashboard** with order summary cards and order table
- **Implemented Order Details Page** for admin with complete order information