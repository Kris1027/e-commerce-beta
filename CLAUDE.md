# E-Commerce Template - Development Guide

## Project Overview

Production e-commerce template with Next.js 15.5.2, TypeScript (strict), Prisma/PostgreSQL (Neon), NextAuth v5. Poland-only shipping.

## Critical Rules

### Code Standards

- **TypeScript**: Strict mode, explicit types, no `any`
- **Components**: Server by default, client only when needed, <200 lines
- **UI**: ALWAYS use shadcn/ui components, Lucide icons
- **Responsive Design**: Mobile-first approach with Tailwind classes (base styles for mobile, sm:, md:, lg:, xl: for larger screens)
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

// Admin Analytics (admin-analytics-actions.ts)
getAnalyticsOverview() // Dashboard metrics with comparisons
getTopProducts(limit?) // Best-selling products analysis
getCustomerInsights() // Customer growth and segmentation
getInventoryStatus() // Stock levels and inventory value
getOrderStatusBreakdown() // Orders grouped by status
getProductCategoryDistribution() // Category performance metrics
getCustomerOrderFrequency() // Customer purchase behavior segmentation

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

- **useNavigationGuard** - Prevents navigation with unsaved changes (Updated 2025-09-18)
  - Options: `shouldBlock`, `onBlock`, `message`
  - Returns: `confirmNavigation`, `navigateWithoutBlocking`, `isPending`, `currentPath`
  - Features:
    - Intercepts browser navigation (back button, refresh) and Next.js router navigation
    - Uses `replaceState` instead of `pushState` to avoid history stack corruption
    - Integrates with React 18+ `useTransition` for smooth navigation
    - Provides methods for controlled navigation after user confirmation
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
- Admin Analytics Dashboard with Recharts
  - Revenue and order trends visualization
  - Customer insights and growth tracking
  - Inventory status monitoring
  - Top products analysis


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

## Recent Updates (2025-09-21)

- **Fixed Admin Analytics Production Error** - Resolved authentication check issue
  - Fixed inconsistent authentication pattern in `admin-analytics-actions.ts`
  - Changed from using `getCurrentUser()` with string role constants to `auth()` with Prisma UserRole enum
  - Now uses `UserRole.admin` and `UserRole.user` from `@prisma/client` for consistency with other admin actions
  - Resolved production build error that was preventing admin/analytics page from loading
  - All admin actions now follow the same authentication pattern using `auth()` and `UserRole` enum

## Recent Updates (2025-09-20)

- **Enhanced Product Image Gallery UX** - Improved loading experience and performance
  - Implemented skeleton loading states for images to prevent layout shifts
  - Added intelligent image preloading for adjacent images (current, next, previous)
  - Implemented smooth fade transitions between image changes
  - Added blur-up effect during image loading for better perceived performance
  - Added keyboard navigation support (arrow keys to navigate images)
  - Improved navigation controls with better visibility on hover
  - Added image counter indicator showing current position
  - Enhanced thumbnails with loading skeletons and selection indicators
  - Added mobile-optimized dot navigation for smaller screens
  - Implemented zoom indicator on hover for better user feedback
  - Disabled controls during transitions to prevent race conditions
  - All images now preload in background for instant switching
- **Implemented shadcn/ui Breadcrumb Component** - Replaced custom breadcrumb implementations with shadcn/ui component
  - Replaced custom breadcrumb in product detail page (`/products/[slug]`)
  - Added breadcrumb navigation to products listing page (`/products`)
  - Added breadcrumb navigation to categories listing page (`/categories`)
  - All breadcrumbs now use consistent shadcn/ui component with proper semantic HTML and ARIA attributes
  - Improved accessibility with proper navigation landmarks
- **Fixed Next.js 16 Image Quality Warnings** - Configured image quality settings
  - Added `qualities: [85, 75, 60, 45]` to Next.js config
  - Resolved warnings about unconfigured image qualities for Next.js 16 compatibility
  - Maintains existing image quality (85) used in product banners

## Recent Updates (2025-09-19)

- **Fixed Responsive Design Issues** - Improved mobile responsiveness across components
  - Fixed TopProductsTable component text overlap issues on mobile devices
  - Implemented mobile-first responsive layout with proper breakpoints
  - Added line-clamp for long product names to prevent text overflow
  - Separated mobile and desktop layouts for better readability
  - Stock badges now display appropriately on both mobile and desktop views
  - Added mobile-first styling as a core development rule in project standards
- **Enhanced Admin Analytics Dashboard** - Comprehensive analytics page with Recharts visualization
  - Created `admin-analytics-actions.ts` with multiple data aggregation functions:
    - `getAnalyticsOverview()` - Overview metrics with month-over-month comparisons
    - `getTopProducts()` - Best-selling products with revenue metrics
    - `getCustomerInsights()` - Customer growth and top spenders analysis
    - `getInventoryStatus()` - Stock level monitoring and inventory value
    - `getOrderStatusBreakdown()` - Order distribution by status
    - `getProductCategoryDistribution()` - Category performance metrics
    - `getCustomerOrderFrequency()` - Customer segmentation by purchase behavior
  - Implemented comprehensive chart components:
    - Order Status Chart (donut chart) - Visual breakdown of order statuses
    - Product Performance Chart (bar chart) - Category distribution with metrics
    - Customer Frequency Chart (bar chart) - Customer segmentation visualization
    - Customer Insights Chart (line chart) - Growth trends and top customers
    - Inventory Status Card - Stock level indicators with progress bars
    - Top Products Table - Detailed product performance metrics
  - **REMOVED** Revenue Overview and Orders Distribution charts (simplified dashboard)
  - All charts follow strict TypeScript rules with no `any` or `unknown` types
  - Polish localization (pl-PL) maintained throughout with `formatCurrency` utility
  - Empty data states handled gracefully with informative messages
  - Consistent UI/UX with existing admin pages (gradient headers, card layouts)

## Previous Updates (2025-09-18)

- **Improved useNavigationGuard Hook** - Refactored to follow Next.js 15 best practices
  - Replaced `history.pushState` with `replaceState` to avoid history stack corruption
  - Added React 18+ `useTransition` integration for smooth navigation transitions
  - Enhanced API with `confirmNavigation` and `navigateWithoutBlocking` methods
  - Better state management with `isAllowedNavigation` ref
  - Returns utility functions for programmatic navigation control
- **Fixed Product Form Issues** - Resolved multiple form-related problems
  - Removed duplicate `register('category')` in product-edit-form that broke validation
  - Removed unnecessary setTimeout race conditions in category dropdowns
  - Simplified UploadThing URL extraction by removing legacy `fileUrl` fallback
- **Enhanced Code Quality** - Multiple improvements for maintainability
  - Extracted duplicate `generateSlug` function to shared utils
  - Created product constants file for default values (rating, numReviews, stock thresholds)
  - Improved logging security by avoiding sensitive data exposure in production
  - Added database-level stock validation with Prisma schema defaults
  - Fixed various timeout-based race conditions throughout the codebase
- **Documentation Updates** - Improved code documentation
  - Removed outdated browser version numbers from comments
  - Added comprehensive JSDoc for navigation guard limitations and alternatives
  - Documented UploadThing response format handling

## Previous Updates (2025-09-17)

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
  - Escapes special SQL characters (%\_\) to prevent injection
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

## Previous Updates (2025-09-18)

- **Enhanced Banner System Performance**:
  - Optimized image loading with proper `priority` and `sizes` attributes
  - Added loading skeleton with Suspense for better perceived performance
  - Implemented progressive image loading (only first image has priority)
- **Improved Accessibility**:
  - Added WCAG 2.1 compliant pause/play button for carousel autoplay
  - Implemented live region announcements for screen readers
  - Enhanced keyboard navigation with proper ARIA attributes
  - Added `aria-current` states for dot navigation
- **Fixed Memory Leaks**:
  - Fixed carousel event listener cleanup (both 'reInit' and 'select' events)
  - Proper effect cleanup in ProductBannersClient component
- **Code Quality Improvements**:
  - Removed redundant banner filtering (already handled by database query)
  - Better TypeScript type safety
  - Consistent English UI text while maintaining Polish currency formatting

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
