# E-Commerce Template - Implementation Guide

## Project Context
Production-ready e-commerce template built with Next.js 15.5.2, TypeScript (strict mode), Prisma ORM with PostgreSQL (Neon), and NextAuth v5.
**Currently configured for Poland-only shipping.**

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
- ✅ ALWAYS use shadcn/ui components (Button, Input, Select, Checkbox, etc.) instead of custom HTML elements
- ✅ All shadcn interactive components have cursor-pointer added by default

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
- ✅ ALWAYS include error parameter in catch blocks (use `catch (error)` not `catch`)
- ✅ Log errors with console.error for debugging
- ✅ Provide user-friendly error messages
- ✅ Never expose sensitive error details

### Toast Notifications (Best Practices)
- ✅ Position: Top-center for better visibility and UX
- ✅ Use semantic variants for clear communication:
  - `toast.success()` - Successful actions (green)
  - `toast.error()` - Errors and failures (red)
  - `toast.warning()` - Warnings and cautions (yellow)
  - `toast.info()` - Informational messages (blue)
- ✅ Keep messages concise and actionable
- ✅ Include item names in messages for context (e.g., "ProductName added to cart")
- ✅ Avoid generic messages like "Success" or "Error"

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
  /categories          # Category grid, category cards
  /checkout            # Checkout steps, forms
  /products            # Product cards, gallery
  /profile             # Profile management, address manager
  /wishlist            # Wishlist components
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
FREE_SHIPPING_THRESHOLD = 100  // PLN
SHIPPING_PRICE = 10            // PLN (Poland only)
TAX_RATE = 0.23                // Polish VAT rate
MAX_QUANTITY_PER_ITEM = 99
CART_SESSION_DURATION = 30 days
ORDERS_PER_PAGE = 10  // Pagination for order history
```

### Essential Utilities (`/lib/utils.ts`)
```typescript
formatCurrency(value: string | number | null, forceZloty?: boolean) // "1 100,00 zł" or "50 gr" (auto-detects groszy)
formatGroszy(amount: number | string)      // "50 gr" (force groszy format)
formatOrderStatus(status: string)          // "Pending"
getOrderStatusColor(status: string)        // "bg-yellow-100..."
isActiveOrder(status: string)              // true/false
validateQuantity(value: number)            // 1-99
formatNumberWithDecimal(num: number)       // "10.00"
formatPhoneNumber(phone: string)           // "+48 XXX-XXX-XXX" (Polish format, safe handling)
generatePaginationNumbers(current, total)  // [1, '...', 5, 6, 7, '...', 10]
calculateCartPrices(itemsPrice: number)    // {shipping, tax, total}
buildAuthUrl(path: string, callbackUrl: string) // Build auth URL with optional callback
copyToClipboard(text: string)              // Copy text to clipboard, returns Promise<boolean>
```

### User & Address Actions (`/lib/actions/user-actions.ts`)
```typescript
getMyOrders(page: number)                  // Paginated order history
getCurrentUser()                            // Get current user profile
updateProfile(data)                         // Update email/password
getUserAddresses()                          // Get all user addresses
addAddress(data)                            // Add new shipping address
updateAddress(id, data)                     // Update existing address
deleteAddress(id)                           // Remove address
setDefaultAddress(id)                       // Set default shipping address
getOrderStats()                             // User order statistics
getUsersForAdmin(page, search?, roleFilter?, activityFilter?, sortBy?) // Admin: Get paginated users with filters
updateUserAsAdmin(userId, data)            // Admin: Update user details (name, email, role)
deleteUser(userId)                         // Admin: Delete user account (with validation)
getCustomerStatistics()                    // Admin: Get customer stats (total, admins, buyers, revenue)
// Filter Types:
// UserFilterRole: 'all' | 'customers' | 'admins'
// UserFilterActivity: 'all' | 'with-orders' | 'without-orders' | 'high-value'
// UserSortBy: 'newest' | 'oldest' | 'name-asc' | 'name-desc' | 'most-orders' | 'highest-spent'
```

### Wishlist Actions (`/lib/actions/wishlist-actions.ts`)
```typescript
getWishlist()                               // Get user's wishlist items
addToWishlist(productId)                    // Add product to wishlist
removeFromWishlist(productId)               // Remove from wishlist
toggleWishlist(productId)                   // Toggle wishlist status
isInWishlist(productId)                     // Check if in wishlist
getWishlistProductIds()                     // Get list of product IDs
getWishlistCount()                          // Get total count
```

### Category Actions (`/lib/actions/category-actions.ts`)
```typescript
getCategories()                             // Get all unique categories with counts
getProductsByCategory(category, page)       // Get paginated products by category
getCategoryDetails(slug)                    // Get category details with top products
```

### Validation Schemas (`/lib/validators.ts`)
- `cartItemSchema` - Cart item validation
- `shippingAddressSchema` - Address validation
- `signInSchema` / `signUpSchema` - Auth validation
- `adminUpdateUserSchema` - Admin user update validation (name, email, role)
- `ORDER_STATUS` constant - Order states
- `CartResponse` type - API responses
- `wishlistItemSchema` - Wishlist item validation
- `insertWishlistSchema` - Add to wishlist validation
- `categorySchema` - Category with product count
- `categoryDetailsSchema` - Category with top products
- `PASSWORD_REQUIREMENTS` - Configurable password validation settings (min length, character requirements)

### Auth Constants (`/lib/constants/auth.ts`)
- `DEFAULT_AUTH_REDIRECT` - Default redirect path after authentication ('/dashboard')
- `AUTH_ROUTES` - Object containing auth route paths
- `PROTECTED_ROUTES` - Array of protected route patterns

### Role Management (`/hooks/use-role.ts`)
```typescript
useRole()                                   // Hook for client-side role checking
  .user                                     // Current user object
  .isAdmin                                  // Boolean: user has admin role
  .isUser                                   // Boolean: user has user role
  .isAuthenticated                          // Boolean: user is logged in
  .hasRole(role: string)                    // Check for specific role
```

## Database Models

### Core Models
- **User**: Authentication, roles (admin/user)
- **Product**: Stock, price, images, featured flag
- **Cart**: Session-based, user-linked
- **Order**: Status tracking, payment info
- **OrderItem**: Order line items
- **Address**: Multiple shipping addresses per user with default selection
- **Wishlist**: User's saved products with unique constraint
- **Review**: Product reviews (future implementation)

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
- `/profile` - Requires authentication
- `/wishlist` - Requires authentication
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
- Order history with pagination (10 orders per page)
- User profile management:
  - Read-only name field (contact support to change)
  - Email update functionality
  - Password change with validation
  - Multiple shipping addresses support
  - Address management (add/edit/delete/set default)
  - Address labels (Home, Work, Other)
- Wishlist functionality:
  - Add/remove products from wishlist
  - Wishlist page with grid view
  - Heart icon on all product cards
  - Integration with profile dashboard
  - Wishlist count display
  - Add to cart from wishlist (with configurable auto-removal via WISHLIST_CONFIG)
  - Authentication required
  - Optimized server actions (combined cart + wishlist operations)
- Dynamic categories system:
  - Categories extracted from product database
  - Category pages with product grid
  - shadcn pagination component integration
  - Breadcrumb navigation
  - Product count per category
  - No hardcoded category list
  - SEO-friendly slugs with proper title casing
- Pagination system:
  - Reusable PaginationWrapper component
  - Uses shadcn/ui pagination components
  - Consistent pagination across all pages (products, orders, categories)
  - Smart ellipsis with generatePaginationNumbers utility
- Admin dashboard (Complete Modern UI/UX Implementation):
  - **Layout & Navigation**:
    - Admin-only layout with glass morphism sidebar
    - Collapsible sidebar with smooth animations
    - Dark mode fully supported with proper color schemes
    - Rounded corners and modern shadows throughout
  - **Dashboard Features**:
    - Gradient header with grid pattern overlay
    - 4 main stats cards with gradients and trend indicators
    - Quick action stats with hover-reveal menus
    - Recent orders with status badges and empty states
    - Inventory alerts with progress bars and stock levels
    - All cards are clickable and link to relevant sections
  - **Modern UI Components**:
    - Shadcn Badge for status indicators
    - Shadcn Progress for visual stock levels
    - Micro-interactions on all interactive elements
    - Hover animations with scale and shadow effects
    - Empty states with helpful icons and messages
  - **Access & Security**:
    - Protected routes with role-based access control
    - Admin panel accessible from user dropdown, mobile menu, and dashboard
    - UserRole enum for type-safe role management
    - Admin users see special red-themed admin links
- Authentication components:
  - Reusable SignInButton, SignUpButton, and SignOutButton components
  - Consistent authentication UI/UX across the application
  - Automatic callback URL preservation
  - Loading states and error handling with toast notifications
  - Full TypeScript support with proper types
- Role-based access control:
  - useRole hook for client-side role checking
  - Type-safe role comparisons with UserRole enum
  - Consistent role-based UI rendering across components
- Admin customer management:
  - Customer list view at `/admin/customers`
  - **Search functionality** - Independent search by name or email
  - **Advanced filtering and sorting**:
    - Role filter: All Users, Customers Only, Admins Only
    - Activity filter: All Activity, With Orders, Without Orders, High Value (100+ PLN)
    - Sort options: Newest First, Oldest First, Name (A-Z), Name (Z-A), Most Orders, Highest Spent
    - Filters and sorting operate independently from search
    - Filters/sorting only affect table data (not statistics)
    - URL-based state management for shareable filtered views
  - **Real-time statistics dashboard**:
    - Total Customers count (unaffected by filters)
    - Admin Users count
    - Active Buyers (customers with orders)
    - Total Revenue from all customers
    - Statistics always show overall totals
  - **Loading states**:
    - Loading overlay with blur effect on table during transitions
    - Spinner indicators in Filter and Sort buttons when active
    - Loading spinners in statistics cards during data fetch
    - Skeleton loading screen for initial page load
  - Display user details with modern UI:
    - User avatars with initials
    - Click-to-copy user IDs with tooltips
    - Role badges with crown icon for admins
    - Visual indicators for orders, wishlist, and spending
    - Hover tooltips showing detailed information
  - User editing functionality:
    - Edit user modal with form validation
    - Update user name, email, and role
    - Real-time form validation with Zod
    - Protection against removing own admin role
    - Email uniqueness validation
    - Success/error toast notifications
    - Modern UI with shadcn/ui Form components
  - User deletion functionality:
    - Delete button with trash icon for each user
    - Confirmation dialog with user details
    - Protection against deleting own admin account
    - Validation for active orders before deletion
    - Warning messages for users with order history
    - Success/error toast notifications
  - **Pagination with shadcn/ui**:
    - 10 users per page
    - First and last page navigation buttons
    - Smart ellipsis for large page ranges
    - Page numbers with active state indication
  - Modern table UI with shadcn/ui components
  - Customer statistics cards with gradient designs
  - Responsive design with horizontal scrolling
  - Consistent admin layout width across all pages
  - Persistent sidebar state with localStorage

### 🚧 Pending
- Stripe/PayPal payment integration
- Admin dashboard features:
  - Product management (CRUD operations)
  - Order management and status updates
  - Customer management (edit users, role changes)
  - Category management
  - Review moderation
  - Analytics and reports
- Password reset via email
- Email notifications
- Product search and filters
- Product reviews
- Social login (Google, Facebook)
- Product recommendations
- Advanced analytics

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
await addToCart(item, removeFromWishlist); // Server action with optional wishlist removal
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

## Development Workflow
- **For Claude/AI**: Run `pnpm lint` after each update to verify code quality
- **For User**: Will run `pnpm build` manually when needed

## Testing Checklist
- [ ] Run `pnpm lint` - must pass (Claude runs this after each change)
- [ ] Run `pnpm build` - must succeed (User will verify)
- [ ] Run `pnpm prisma generate` after schema changes
- [ ] No console.log statements (use console.error for error logging)
- [ ] TypeScript types defined (avoid `any`, use `unknown` if needed)
- [ ] Use dot notation for object properties (not bracket notation)
- [ ] Use types from validators.ts for consistency
- [ ] Zod validation in place
- [ ] Error handling implemented (ALWAYS use `catch (error)`, never just `catch`)
- [ ] Polish formatting for addresses/phones
- [ ] All pages with lists have shadcn pagination
- [ ] No duplicate validation logic (use centralized constants)

## Environment Variables
```env
DATABASE_URL="postgresql://..."
DATABASE_URL_UNPOOLED="postgresql://..."
AUTH_URL="http://localhost:3000"
AUTH_SECRET="[generate with: openssl rand -base64 32]"
```

## Sample Users
- **Admin accounts (4 total):**
  - admin@example.com / Zaq12wsx (Primary admin)
  - jennifer.davis@example.com / Zaq12wsx
  - susan.martin@example.com / Zaq12wsx
  - kenneth.green@example.com / Zaq12wsx
- **Regular users (29 total):**
  - user@example.com / Zaq12wsx (Primary user)
  - Plus 28 additional test users with format: firstname.lastname@example.com / Zaq12wsx
- **Total: 33 sample users in database**

## Polish Localization
- All addresses configured for Poland only
- Voivodeship field instead of State
- Postal code format: XX-XXX
- Phone format: +48 XXX-XXX-XXX (with formatPhoneNumber utility)
- Currency: PLN (Polish Złoty)
- VAT rate: 23%
- Date/time locale: pl-PL (24-hour format, Polish month names)
- LOCALE constant available in `/lib/constants/cart.ts`

## Commands
```bash
pnpm dev          # Development
pnpm build        # Build for production
pnpm lint         # Check code quality
pnpm db:push      # Push schema changes (updates Address table)
pnpm db:seed      # Seed sample data
pnpm db:studio    # Prisma Studio GUI
```

## Recent Updates
- **Admin Customer Management Filters & Sorting (2025-09-15)**:
  - **Advanced Filtering System**:
    - Role-based filtering: All Users, Customers Only, Admins Only
    - Activity-based filtering: With Orders, Without Orders, High Value (>1000 zł)
    - Filters are independent from search functionality
    - URL parameter-based state management for persistence
    - Visual indicators with CheckCircle2 icons for active filters
    - Filter count badges on filter button
  - **Comprehensive Sorting Options**:
    - Newest/Oldest by creation date
    - Name alphabetically (A-Z, Z-A)
    - Most Orders (by order count)
    - Highest Spent (by total revenue)
    - Sort indicator badge shows current sort option
  - **Improved UI/UX**:
    - Clean interface with only X icon in search input for clearing
    - No unnecessary reset buttons - users can select defaults directly
    - Search functionality independent from filters/sorting
    - All filters preserve other parameters when changing
    - Automatic page reset to 1 when filters change
    - Active filters highlighted with primary border color
    - Defaults: "All Users", "All Activity", "Newest First"
  - **Server-Side Implementation**:
    - Updated `getUsersForAdmin()` with filter types: `UserFilterRole`, `UserFilterActivity`, `UserSortBy`
    - Efficient database-level filtering for role and activity
    - Post-fetch filtering for high-value customers
    - Optimized sorting with database queries where possible
- **Admin Dashboard Improvements (2025-09-15)**:
  - **Customer Statistics Integration**:
    - Added `getCustomerStatistics()` function for real-time database stats
    - Displays total customers, admin users, active buyers, and total revenue
    - Statistics fetched directly from database, not calculated from paginated data
  - **Enhanced Pagination with shadcn/ui**:
    - Replaced custom pagination with shadcn/ui Pagination components
    - Added first/last page navigation buttons with double chevron icons
    - Includes previous/next buttons for sequential navigation
    - Smart ellipsis for large page ranges using `generatePaginationNumbers`
    - Preserves search parameters during pagination
    - Proper accessibility with aria-labels and disabled states
  - **Fixed Layout Width Consistency**:
    - Standardized admin layout with `container mx-auto` for consistent width
    - Fixed table layout with `table-fixed` and explicit column widths
    - Added `overflow-x-hidden` to prevent horizontal scrolling
    - Sidebar state persists in localStorage across sessions
    - Added `flex-shrink-0` to sidebar to prevent layout shifts
  - **Added Loading States**:
    - Created `/app/admin/loading.tsx` for general admin loading skeleton
    - Created `/app/admin/customers/loading.tsx` for customer page loading
    - Uses shadcn/ui Skeleton components for consistent loading UI
    - Shows skeleton screens during page navigation
  - **Table Improvements**:
    - Fixed column widths to prevent content shifting
    - Added `truncate` classes for long text overflow handling
    - Improved customer cell layout with proper flex properties
    - Consistent 1200px minimum table width
- **Sample Data Enhancement (2025-09-15)**:
  - **Users**: Added 30 additional example users to sample-data.ts
    - Total of 33 users now available for testing (4 admins, 29 regular users)
    - All users have consistent password: Zaq12wsx
    - Diverse set of names for realistic testing scenarios
  - **Products**: Added 30 new diverse products to sample-data.ts
    - Total of 36 products now in database
    - Wide variety of categories: T-Shirts, Sportswear, Jackets, Formal Wear, Casual Wear, Sweatshirts, Sweaters, Workwear, Pants, Swimwear, Eco-Friendly, Thermals, Luxury, Outerwear, Golf Wear, Jeans, Vests, Underwear, Accessories, Blazers, Footwear
    - Reuses existing product images from public folder (p1-1.jpg through p6-2.jpg)
    - Various price ranges from $24.99 to $299.99
    - Mix of featured and regular products
    - Different brands for variety: EcoWear, SportMax, Executive, Heritage, Elegance, Coastal, TechWear, Nordic, WorkPro, ModernFit, Aviation, AquaFit, GreenLife, WarmTech, ArtWear, Tactical, Luxe, WeatherGuard, Lumberjack, ProGolf, DenimCo, Alpine, FreshTech, Essentials, PowerFit, Arctic, Walkman, Expedition, ComfortPlus
  - Database successfully seeded with all new data
- **Admin User Management Enhancement (2025-09-15)**:
  - **Added User Edit Functionality**:
    - Created `updateUserAsAdmin` server action in `/lib/actions/user-actions.ts`
    - Added `adminUpdateUserSchema` validation schema with Zod
    - Created `UpdateUserForm` component with React Hook Form
    - Created `UpdateUserModal` component with modern UI
    - Integrated edit functionality into customers table dropdown menu
  - **Security Features**:
    - Prevents admins from removing their own admin role
    - Email uniqueness validation on updates
    - Proper role-based access control
  - **UI/UX Improvements**:
    - Modern modal design with user avatar and current info display
    - Real-time form validation with helpful error messages
    - Loading states during form submission
    - Success/error toast notifications
    - Form component from shadcn/ui with proper field descriptions
  - **Technical Implementation**:
    - Uses React Hook Form with zodResolver for form management
    - TypeScript strict mode compliance
    - ActionResult type for consistent error handling
    - Proper error handling with optional chaining
- **Session Provider & Cart Persistence Fixes (2025-09-15)**:
  - **Fixed `useSession` Error**:
    - Created `SessionProvider` wrapper component at `/components/providers/session-provider.tsx`
    - Wrapped entire app with `SessionProvider` in root layout
    - Resolved "useSession must be wrapped in SessionProvider" error
  - **Fixed Cart Persistence After Login**:
    - Simplified cart operations in `/lib/actions/cart-actions.ts`
    - Added explicit cart merge on signin/signup pages
    - Cart now properly migrates from anonymous to user after authentication
    - Fixed redirect flow: user now goes directly to checkout after login (not cart page)
    - Removed `router.refresh()` that was interfering with navigation
    - Changed `router.push()` to `router.replace()` for cleaner history
  - **How Cart Migration Works**:
    - Anonymous cart saved with `sessionCartId` only
    - After login, `mergeAnonymousCart()` is called
    - Cart is either merged with existing user cart or converted to user cart
    - Updated cart is synced to Zustand store before redirect
- **Currency Formatting Enhancement (2025-09-15)**:
  - Updated `formatCurrency()` to use spaces as thousand separators (1 100,00 zł)
  - Added automatic groszy formatting for amounts below 1 zł (0,50 zł → 50 gr)
  - Created `formatGroszy()` utility for direct groszy formatting
  - Added `forceZloty` parameter to override automatic groszy conversion
  - Follows standard Polish currency formatting conventions
- **Sign Out Error Toast Fix (2025-09-15)**:
  - Fixed false error message "Failed to sign out" that appeared on successful sign out
  - Issue was caused by Next.js redirect throwing internal NEXT_REDIRECT error
  - Updated `/components/auth/sign-out-button.tsx` to properly handle redirect errors
  - Now shows "Signing out..." toast and filters out redirect-related errors
  - Only displays error toast for actual sign out failures
- **useRole Hook Implementation (2025-09-14)**:
  - Created `/hooks/use-role.ts` for consistent client-side role checking
  - Provides `isAdmin`, `isUser`, `isAuthenticated`, and `hasRole` utilities
  - Replaced all direct session role comparisons in client components
  - Updated components to use the hook:
    - `/components/layout/mobile-menu.tsx` - Admin section visibility
    - `/components/layout/user-nav.tsx` - Admin panel link in dropdown
    - `/components/dashboard/admin-section.tsx` - Created client wrapper for admin sections
  - Dashboard page now uses AdminSection component for cleaner separation
  - Maintains type safety with UserRole enum integration
  - Eliminates prop drilling of user/session data through component trees
- **Middleware Optimization for Vercel Edge (2025-09-14)**:
  - Fixed Edge Function size limit issue (was exceeding 1MB limit)
  - Removed Prisma Client import from middleware (not Edge-compatible)
  - Created lightweight role constants for Edge Runtime
  - Implemented best practice middleware patterns:
    - Clear route categorization (PUBLIC, AUTH, PROTECTED, ADMIN)
    - Optimized matcher configuration
    - String literal role comparison to avoid heavy imports
  - Created useRole hook for client-side role checking
  - Maintains security while keeping bundle size minimal
- **Reusable Authentication Components (2025-09-14)**:
  - Created `SignInButton`, `SignUpButton`, and `SignOutButton` components in `/components/auth/`
  - All authentication components now centralized and reusable
  - Support for custom styling, variants, sizes, and icon configurations
  - Automatic callback URL preservation for seamless auth flows
  - Consistent error handling with toast notifications
  - Replaced all inline auth implementations with reusable components
  - Updated header, mobile menu, user nav, and admin nav to use new components
  - Added proper TypeScript types and best practices (useTransition for async operations)
  - Fixed UserRole enum usage across all components for type safety
- **Admin Dashboard Complete Redesign (2025-09-14)**:
  - **Modern UI/UX Implementation**:
    - Gradient backgrounds with glass morphism effects
    - Enhanced stats cards with trend indicators and gradients
    - Progress bars for inventory management
    - Status badges using shadcn Badge component
    - Empty states with actionable CTAs and helpful icons
    - Micro-interactions and hover animations throughout
  - **Dark Mode Support**:
    - Fixed white background issue in dark mode
    - All components now use semantic colors (muted, foreground, etc.)
    - Proper contrast in both light and dark themes
  - **Navigation Improvements**:
    - Admin panel links in user dropdown with Shield icon
    - Mobile menu admin section for mobile users
    - Dashboard quick access button for admin users
    - All admin links use red theme for distinction
  - **Data Visualization**:
    - Stock levels shown with Progress component
    - Color-coded alerts (critical: red, low: orange)
    - Percentage indicators and trend arrows
    - Recent orders with time formatting in Polish locale
- **User Role Enum Implementation (2025-09-14)**:
  - Created database-level UserRole enum with values 'user' and 'admin'
  - Migrated from string-based roles to strongly-typed enum
  - Updated Prisma schema to enforce role values at database level
  - Updated validators to use Prisma's native enum type
  - All role comparisons now use UserRole enum (UserRole.user, UserRole.admin)
  - Provides type safety and prevents invalid role assignments
  - Updated seed data to use enum values
- **Session Updates (2025-09-14)**:
  - **Cart Drawer Spacing Fix**: Removed `pb-0` class from SheetHeader for consistent spacing with shadcn/ui defaults
  - **Auth URL Utility Function**: Created `buildAuthUrl()` utility to eliminate duplicate URL construction logic in signin/signup pages
  - **Price Formatting Standardization**:
    - Fixed floating-point precision issues (e.g., "14.099999999999994")
    - Replaced all dollar sign ($) formatting with `formatCurrency()` function
    - Updated cart-drawer.tsx, cart-client.tsx, product-price.tsx, and coupon-form.tsx
    - All prices now display in proper XX.XX PLN format with Polish locale
    - Added `useMemo` optimization in cart-drawer for numeric price calculations
  - **Hero Banner Simplification**:
    - Removed text overlays (titles, subtitles, CTAs) from banners
    - Made entire banner clickable with configurable `promoLink` URLs
    - Simplified configuration to just image path and promo URL
    - Fixed missing mobile banner image references (banner-1-mobile.jpg, banner-2-mobile.jpg)
    - Navigation arrows and dots remain functional with proper z-index
  - **Auth Constants Extraction**:
    - Created `/lib/constants/auth.ts` for authentication-related constants
    - Extracted `DEFAULT_AUTH_REDIRECT = '/dashboard'` to eliminate magic strings
    - Updated buildAuthUrl(), signin, and signup pages to use the constant
    - Added AUTH_ROUTES and PROTECTED_ROUTES constants for better maintainability
- **Mobile Menu Navigation Fix**:
  - Fixed Sign In/Sign Up links to point to correct auth routes (/auth/signin and /auth/signup)
  - Fixed My Account link to point to /dashboard instead of non-existent /account
  - Added Profile link to mobile menu for consistency
  - Removed non-existent support links (contact, shipping, returns, FAQ)
  - Replaced custom hamburger button with shadcn Button component
  - Added Lucide Menu icon for consistency
  - Added cursor-pointer to all interactive elements
  - Cleaned up navigation structure to only show existing pages
- **Dashboard UI Enhancement**:
  - Added Shopping Cart card to dashboard for quick access
  - Dashboard now has 4 balanced cards: My Orders, Wishlist, Shopping Cart, and Profile & Addresses
  - Removed duplicate Address Manager card from dashboard
  - Fixed incorrect link to non-existent /addresses route
  - Address management is now only accessible through Profile page (Address tab)
  - Improved dashboard layout for better UX with symmetrical 4-card grid
- **Cart UI/UX Improvements**:
  - Replaced all cart buttons with shadcn Button components for consistency
  - Fixed cursor-pointer on all interactive elements (remove, quantity, close buttons)
  - Added proper padding to cart drawer (px-6 for content sections)
  - Improved cart drawer layout with better spacing
  - Replaced custom buttons in cart-client page with shadcn Button
  - Replaced quantity input with shadcn Input component
  - Added cursor-pointer to Sheet close button
  - Improved free shipping notification with better styling
  - All cart actions now use proper shadcn components with consistent hover states
- **Navigation UI Improvements**:
  - Replaced cart button with shadcn Button component (variant="ghost")
  - Replaced user profile button with shadcn Button component and Lucide User icon
  - Added cursor-pointer to all navigation interactive elements
  - Added hover effects to cart and profile buttons
  - Replaced Twitter icon with X icon using react-icons (FaXTwitter)
  - Updated all social media icons to use react-icons for consistency
  - Added react-icons package for brand icons (social media)
  - Fixed deprecated Facebook and Instagram icons from Lucide
- **UI Component Standardization**:
  - Added cursor-pointer to all interactive shadcn components (Button, Select, Input, Radio, Tabs, Checkbox)
  - Replaced custom button implementations with shadcn Button component in auth pages and error page
  - Replaced custom input fields with shadcn Input component in auth pages
  - Replaced custom checkboxes with shadcn Checkbox component
  - Added shadcn Checkbox component to the project
  - Improved consistency across the application by using shadcn components
  - All interactive elements now have proper cursor styles and disabled states
- **Authentication Redirect Fix**:
  - Fixed checkout flow to properly redirect back to checkout after login instead of profile page
  - Sign-in and sign-up pages now read and respect `callbackUrl` from URL search params
  - Maintains callback URL when switching between sign-in and sign-up pages
  - Defaults to `/dashboard` when no callback URL is specified
  - Middleware already correctly sets `callbackUrl` for protected routes
- **Code Quality Improvements**:
  - Fixed all catch blocks to include error parameter for proper error handling
  - Added comprehensive error logging with console.error throughout the codebase
  - Removed password validation duplication in profile-form.tsx (now uses centralized constants)
  - Simplified empty check in formatPhoneNumber using optional chaining
  - Added try-catch blocks to async functions that were missing error handling
- **Password Validation**: Made password requirements configurable through `PASSWORD_REQUIREMENTS` constant
  - Easily adjustable minimum length, uppercase, lowercase, number, and special character requirements
  - Dynamic regex and error message generation based on configuration
  - Maintains backward compatibility with existing 8-character minimum and current requirements
  - All password validations now use centralized constants (no duplication)
- **Profile Management**: Full name is now read-only in profile (contact support for changes)
- **Multiple Addresses**: Users can manage multiple shipping addresses with labels
- **Address Features**: Add, edit, delete, and set default shipping addresses
- **Order Pagination**: Order history now supports pagination (10 per page)
- **Database**: Added Address model for multiple shipping addresses per user
- **Poland-Only Shipping**: 
  - Country field hardcoded to "Poland" in all address forms
  - Voivodeship field instead of State/Province
  - Polish address formatting (ul., postal codes XX-XXX)
  - Polish phone format display: +48 XXX-XXX-XXX
- **Checkout Address Selection**:
  - Reuses the same AddressManager component from profile
  - Users can select from saved addresses during checkout
  - Option to add new address during checkout flow
  - "Use This Address" button for quick selection
  - Automatic navigation to payment after selection

## Code Quality Standards & Recent Improvements

### Localization
- **Polish Locale Consistency**: Use `LOCALE` constant from `/lib/constants/cart.ts` for all date/time/number formatting
  - Set to `'pl-PL'` for Polish localization
  - Currency formatters use PLN (Polish Złoty)
  - Date/time formatting uses 24-hour format (hour12: false)
  - Never hardcode 'en-US' or other locales

### Navigation Best Practices
- **Avoid `router.back()`**: Use explicit routing (e.g., `router.push('/cart')`) for predictable navigation
- **Breadcrumb Navigation**: Implement proper breadcrumb trails for category and product pages

### TypeScript & Type Safety
- **Type Guards**: Use proper type guards with safe property access
  ```typescript
  // Good: Safe property access in type guards
  const obj = value as UserAddressDataCandidate;
  typeof obj.street === 'string'
  
  // Avoid: Direct assertions without safety
  const obj = value as Record<string, unknown>;
  ```
- **Avoid Type Assertions**: Define proper interfaces instead of using `Record<string, unknown>`
- **Explicit Types**: Always define types for props, state, and function parameters

### React Best Practices
- **React Keys**: Never use array index as key in dynamic lists
  ```typescript
  // Good: Use stable, unique identifiers
  key={item.productId}
  key={slide.id}
  key={image}
  
  // Bad: Array index can cause rendering issues
  key={index}
  key={`${item.productId}-${index}`}
  ```
- **Component Prop Types**: Avoid complex type intersections that can cause conflicts
  ```typescript
  // Good: Explicit, simple type definitions
  type PaginationLinkProps = {
    isActive?: boolean
    size?: "default" | "sm" | "lg" | "icon"
  } & React.ComponentProps<"a">
  
  // Avoid: Complex intersections
  & Pick<React.ComponentProps<typeof Button>, "size">
  ```

### Code Organization
- **Extract Complex Logic**: Move nested ternaries and complex conditionals to helper functions
  ```typescript
  // Good: Helper function for clarity
  function getButtonText(isOutOfStock: boolean, isPending: boolean): string {
    if (isOutOfStock) return 'Out of Stock';
    if (isPending) return 'Adding...';
    return 'Add to Cart';
  }
  
  // Avoid: Nested ternaries
  isOutOfStock ? 'Out of Stock' : isPending ? 'Adding...' : 'Add to Cart'
  ```
- **Helper Functions**: Extract repeated logic into reusable functions (e.g., `saveAddress`, `resetFormWithAddress`)

### Performance Optimization
- **Request Memoization**: Use React's `cache` function to prevent duplicate database queries
  ```typescript
  import { cache } from 'react';
  const getCachedCategoryDetails = cache(getCategoryDetails);
  ```
- **Database Query Optimization**: Cache frequently accessed data with `unstable_cache`
- **Avoid Duplicate Queries**: Share cached results between `generateMetadata` and page components

### Error Handling Patterns
- **Structured Error Responses**: Always return consistent error structures from server actions
- **User-Friendly Messages**: Provide clear, actionable error messages
- **Type-Safe JSON Parsing**: Implement safe parsers with validation for JSON fields

### Testing & Validation
- **Always Run Linting**: Execute `pnpm lint` after changes
- **Type Checking**: Ensure no TypeScript errors with strict mode
- **Zod Validation**: Validate all data on both client and server

---
**Remember**: Always follow the rules above to maintain consistency. When in doubt, check existing implementations in the codebase.