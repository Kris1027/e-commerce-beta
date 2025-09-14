# E-Commerce Template - Production-Ready Online Store

A modern, fully-featured e-commerce platform built with Next.js 15.5.2, TypeScript, and Prisma. This production-ready template provides everything you need to launch an online store with a focus on Polish market (PLN currency, Poland-only shipping).

## 🚀 Features

### 🛍️ Shopping Experience

- **Product Catalog**: Browse products with pagination and dynamic categories
- **Product Details**: Detailed product pages with image galleries
- **Shopping Cart**: Persistent cart with drawer UI and quantity management
- **Wishlist**: Save products for later (authentication required)
- **Categories**: Dynamic category system with product counts
- **Search & Filter**: Coming soon

### 👤 User Management

- **Authentication**: Secure login/signup with NextAuth v5
- **User Dashboard**: Order history, statistics, and quick access cards
- **Profile Management**:
  - Update email and password
  - Multiple shipping addresses with labels (Home, Work, Other)
  - Set default shipping address
- **Guest Checkout**: Available for convenience

### 🛒 Checkout Process

- **Multi-step Checkout**: Shipping → Payment → Review
- **Address Management**: Select from saved addresses or add new ones
- **Payment Methods**: Cash on Delivery (Stripe/PayPal coming soon)
- **Discount System**: Apply coupon codes (WELCOME10, SAVE20, SHIP5)
- **Order Confirmation**: Detailed order summary and tracking

### 📦 Order Management

- **Order Tracking**: Real-time status updates
- **Order History**: Paginated view with status badges
- **Order States**: Pending → Processing → Shipped → Delivered
- **Order Details**: Complete information for each order

### 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach
- **Dark Mode**: System-based theme switching
- **Toast Notifications**: Color-coded feedback (success/error/warning/info)
- **Hero Banner**: Mobile-optimized with carousel
- **Trust Badges**: Build customer confidence
- **Loading States**: Optimistic updates for better UX

### 🇵🇱 Polish Localization

- **Currency**: Polish Złoty (PLN)
- **Shipping**: Poland-only configuration
- **Address Format**: Polish standards (voivodeship, postal codes)
- **Phone Format**: +48 XXX-XXX-XXX
- **VAT**: 23% tax rate
- **Date/Time**: 24-hour format with Polish month names

## 🛠️ Tech Stack

### Core

- **Framework**: Next.js 15.5.2 (App Router)
- **Language**: TypeScript 5.9.2 (strict mode)
- **Database**: PostgreSQL (Neon cloud)
- **ORM**: Prisma 6.15.0

### Authentication & Security

- **Auth**: NextAuth v5 (credentials provider)
- **Password**: bcryptjs with configurable requirements
- **Sessions**: JWT with 30-day expiration

### UI & Styling

- **CSS**: Tailwind CSS 4.1.13
- **Components**: shadcn/ui (latest)
- **Icons**: Lucide React + React Icons
- **Notifications**: Sonner (toast notifications)
- **Forms**: React Hook Form + Zod validation

### State Management

- **Global State**: Zustand 5.0.8
- **Server State**: Server Actions pattern
- **Optimistic Updates**: For cart operations

## 📋 Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- PostgreSQL database (Neon recommended)

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Kris1027/e-commerce-beta.git
cd e-commerce-beta
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://..."
DATABASE_URL_UNPOOLED="postgresql://..."

# Authentication
AUTH_URL="http://localhost:3000"
AUTH_SECRET="[generate with: openssl rand -base64 32]"

# Optional: Store Configuration
NEXT_PUBLIC_STORE_NAME="Your Store Name"
NEXT_PUBLIC_STORE_TAGLINE="Your tagline"
NEXT_PUBLIC_CURRENCY="PLN"
NEXT_PUBLIC_CURRENCY_SYMBOL="zł"
```

### 4. Set up the database

```bash
# Push schema to database
pnpm db:push

# Seed with sample data
pnpm db:seed
```

### 5. Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see your store.

## 📚 Project Structure

```
/app                    # Next.js pages (App Router)
  /auth                 # Authentication pages
  /cart                 # Shopping cart page
  /categories           # Category pages
  /checkout             # Checkout flow
  /dashboard            # User dashboard
  /orders               # Order management
  /products             # Product pages
  /profile              # User profile
  /wishlist             # Wishlist page

/components
  /ui                   # shadcn/ui components
  /layout               # Header, Footer, Navigation
  /cart                 # Cart components
  /checkout             # Checkout components
  /products             # Product components
  /profile              # Profile components
  /wishlist             # Wishlist components

/lib
  /actions              # Server actions
  /constants            # Business constants
  /store                # Zustand stores
  /utils                # Utility functions
  /validators           # Zod schemas

/prisma
  schema.prisma         # Database schema

/public                 # Static assets
```

## 🔧 Available Commands

```bash
# Development
pnpm dev                # Start development server
pnpm build              # Build for production
pnpm start              # Start production server
pnpm lint               # Run ESLint

# Database
pnpm db:push            # Push schema changes
pnpm db:seed            # Seed sample data
pnpm db:studio          # Open Prisma Studio

# Code Quality
pnpm lint               # Check code quality
pnpm type-check         # Run TypeScript checks
```

## 🎯 Current Implementation Status

### ✅ Completed Features

- Full authentication system
- Product catalog with pagination
- Shopping cart with persistence
- Wishlist functionality
- Dynamic categories
- Complete checkout flow
- Order management
- User dashboard
- Profile management
- Multiple addresses support
- Discount/coupon system
- Mobile-responsive design
- Dark mode support
- Polish localization
- Toast notifications
- Hero banner carousel

### 🚧 Coming Soon

- Stripe/PayPal integration
- Admin dashboard
- Product search & filters
- Product reviews & ratings
- Email notifications
- Product recommendations
- Advanced analytics
- Inventory management
- Multi-language support

## 🔒 Security Features

- Secure authentication with bcrypt
- HTTP-only cookies for sessions
- CSRF protection
- Input validation with Zod
- SQL injection prevention (Prisma)
- XSS protection
- Rate limiting (planned)
- Environment variable protection

## 🎨 Customization

### Styling

- Modify Tailwind config for colors and themes
- Update shadcn components in `/components/ui`
- Change global styles in `/app/globals.css`

### Business Logic

- Update constants in `/lib/constants/cart.ts`
- Modify shipping rules and tax rates
- Configure password requirements in validators
- Adjust pagination limits

### Localization

- Currency settings in environment variables
- Date/time formats in `/lib/utils.ts`
- Polish-specific formatting throughout

## 📝 Development Guidelines

- **TypeScript**: Strict mode, no `any` types
- **Components**: Keep under 200 lines
- **Server Actions**: Use for all data operations
- **Validation**: Zod schemas on client AND server
- **Error Handling**: Always use try-catch with error parameter
- **Performance**: Optimistic updates, React cache
- **Testing**: Run `pnpm lint` after changes

## 🤝 Contributing

Contributions are welcome! Please follow the existing code style and conventions documented in CLAUDE.md.

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Database hosting by [Neon](https://neon.tech)
- Icons by [Lucide](https://lucide.dev)

## 📞 Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

Built with ❤️ for the Polish e-commerce market
