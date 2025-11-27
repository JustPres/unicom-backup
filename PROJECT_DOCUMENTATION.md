# Unicom Technologies - Project Documentation

## Project Overview
Unicom Technologies is a modern e-commerce platform for computer hardware and technology products, built with Next.js, TypeScript, and MongoDB. The platform offers product catalog, user authentication, quote generation, and support ticket management.

## Tech Stack
- **Frontend**: Next.js 13+ with App Router
- **Styling**: Tailwind CSS with custom components
- **UI Components**: Radix UI primitives with Shadcn/UI
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: Custom JWT-based auth
- **Deployment**: Vercel

## Project Structure

### Frontend

#### Pages
- `/` - Homepage with featured products and categories
- `/catalog` - Product catalog with filtering and search
- `/catalog/[id]` - Individual product details
- `/compare` - Product comparison tool
- `/login` - User authentication
- `/register` - New user registration
- `/customer/dashboard` - Customer dashboard
- `/customer/quotes` - Customer quote history
- `/customer/support` - Support ticket management
- `/admin/dashboard` - Admin dashboard
- `/admin/products` - Product management
- `/admin/tickets` - Support ticket management
- `/about` - Company information
- `/contact` - Contact form

#### Components
- `navigation.tsx` - Main navigation component
- `product-card.tsx` - Reusable product card component
- `product-grid.tsx` - Grid layout for product listings
- `cart.tsx` - Shopping cart component
- `footer.tsx` - Site footer
- `header.tsx` - Site header with navigation
- `search.tsx` - Global search functionality
- `filters.tsx` - Product filtering component
- `pagination.tsx` - Pagination controls
- `toast.tsx` - Notification system
- `theme-provider.tsx` - Theme management

### Backend

#### API Routes
- `/api/auth/*` - Authentication endpoints
  - `login` - User login
  - `register` - New user registration
  - `logout` - Clear authentication cookies

- `/api/products/*` - Product management
  - `GET /` - List all products
  - `GET /[id]` - Get product details
  - `POST /` - Create new product (admin)
  - `PUT /[id]` - Update product (admin)
  - `DELETE /[id]` - Delete product (admin)

- `/api/quotes/*` - Quote management
  - `GET /` - List user's quotes
  - `POST /` - Create new quote
  - `GET /[id]` - Get quote details
  - `PUT /[id]` - Update quote status

- `/api/tickets/*` - Support tickets
  - `GET /` - List tickets
  - `POST /` - Create new ticket
  - `GET /[id]` - Get ticket details
  - `PUT /[id]` - Update ticket status
  - `POST /[id]/messages` - Add message to ticket

#### Database Models
- **User**
  - email (string, unique, required)
  - password (string, hashed, required)
  - name (string, required)
  - role (enum: 'customer', 'admin')
  - createdAt (date)
  - updatedAt (date)

- **Product**
  - name (string, required)
  - description (string)
  - price (number, required)
  - category (string, required)
  - stock (number, required)
  - images (array of strings)
  - specs (object)
  - isFeatured (boolean)
  - createdAt (date)
  - updatedAt (date)

- **Quote**
  - user (ref: User)
  - items (array of products with quantities)
  - status (enum: 'pending', 'accepted', 'rejected')
  - total (number)
  - notes (string)
  - createdAt (date)
  - updatedAt (date)

- **Ticket**
  - user (ref: User)
  - subject (string, required)
  - messages (array of {user: User, message: string, createdAt: date})
  - status (enum: 'open', 'in-progress', 'resolved')
  - priority (enum: 'low', 'medium', 'high')
  - createdAt (date)
  - updatedAt (date)

## Features

### User Authentication
- Email/password registration and login
- Role-based access control (customer/admin)
- Protected routes
- Password reset flow

### Product Catalog
- Browse products by category
- Advanced search and filtering
- Product details with specifications
- Related products
- Featured products carousel
- Product comparison tool

### Shopping Experience
- Add/remove items to/from cart
- Save cart for later
- Request quote for products
- View quote history
- Track order status

### Admin Dashboard
- Product management (CRUD)
- User management
- Order processing
- Sales analytics
- Inventory management

### Customer Support
- Create and track support tickets
- Real-time chat with support
- FAQ section
- Knowledge base

### Responsive Design
- Mobile-first approach
- Responsive layouts
- Touch-friendly interfaces
- Optimized for all device sizes

## Environment Variables
```env
MONGODB_URI=mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development
```
 