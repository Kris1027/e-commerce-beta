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
formatCurrency(value: string | number)     // $99.99
formatOrderStatus(status: string)          // "Pending"
getOrderStatusColor(status: string)        // "bg-yellow-100..."
isActiveOrder(status: string)              // true/false
validateQuantity(value: number)            // 1-99
formatNumberWithDecimal(num: number)       // "10.00"
formatPhoneNumber(phone: string)           // "+48 XXX-XXX-XXX" (Polish format, safe handling)
generatePaginationNumbers(current, total)  // [1, '...', 5, 6, 7, '...', 10]
calculateCartPrices(itemsPrice: number)    // {shipping, tax, total}
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
- `ORDER_STATUS` constant - Order states
- `CartResponse` type - API responses
- `wishlistItemSchema` - Wishlist item validation
- `insertWishlistSchema` - Add to wishlist validation
- `categorySchema` - Category with product count
- `categoryDetailsSchema` - Category with top products
- `PASSWORD_REQUIREMENTS` - Configurable password validation settings (min length, character requirements)

## Database Models

### Core Models
- **User**: Authentication, roles (admin/customer)
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

### 🚧 Pending
- Stripe/PayPal payment integration
- Admin dashboard (product/order management)
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
- Admin: admin@example.com / 123456
- User: user@example.com / 123456

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
- **Mobile Menu Navigation Fix** (Latest):
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