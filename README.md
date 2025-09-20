# Unicom Technologies Catalog

A modern e-commerce platform for electronics and IT solutions built with Next.js 14, TypeScript, and MongoDB.

## 🚀 Features

- **Multi-role Authentication**: Customer and Admin dashboards with secure login
- **Product Management**: Full CRUD operations with search, filtering, and comparison
- **Quote System**: Request and manage custom quotes with real-time status tracking
- **AI Assistant**: Local intent-based chatbot for navigation and product search
- **Responsive Design**: Mobile-first approach with Tailwind CSS and shadcn/ui
- **Real-time Data**: MongoDB integration with connection pooling

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **Database**: MongoDB
- **Authentication**: Custom auth with bcrypt
- **Deployment**: Vercel
- **Package Manager**: pnpm

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [pnpm](https://pnpm.io/) package manager
- [MongoDB](https://www.mongodb.com/) database (local or cloud)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd unicom-catalog
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Configuration**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   MONGODB_URI=your_mongodb_connection_string
   MONGODB_DB=unicom
   
   # Demo Admin (Optional - for testing)
   DEMO_ADMIN_EMAIL=admin@demo.local
   DEMO_ADMIN_PASSWORD=admin123
   ```

4. **Start the development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
unicom-catalog/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── products/      # Product management
│   │   └── quotes/        # Quote system
│   ├── admin/             # Admin-only pages
│   ├── catalog/           # Product catalog
│   ├── dashboard/         # User dashboard
│   └── [other-pages]/
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── auth/             # Authentication forms
│   ├── navigation.tsx    # Main navigation
│   └── chatbot.tsx       # AI assistant
├── lib/                  # Utilities and business logic
│   ├── auth.tsx          # Authentication context
│   ├── db.ts             # Database connection
│   ├── products.ts       # Product utilities
│   └── quotes.ts         # Quote management
└── public/               # Static assets
```

## 🧭 Navigation Guide

### For Visitors (Non-authenticated)
- **Home** (`/`) - Landing page with company information
- **Catalog** (`/catalog`) - Browse products and services
- **Services** (`/services`) - Service offerings
- **Support** (`/support`) - Help and contact information
- **About** (`/about`) - Company details
- **Login** (`/login`) - Customer authentication
- **Register** (`/register`) - New customer registration

### For Customers (Authenticated)
- **Dashboard** (`/dashboard`) - Personal dashboard with recent quotes
- **Catalog** (`/catalog`) - Product browsing with comparison tools
- **Get Quote** (`/quote`) - Request custom quotes
- **My Quotes** (`/quotes`) - View and track quote requests
- **Support** (`/support`) - Customer support
- **Profile** (`/profile`) - Account management

### For Admins (Authenticated)
- **Dashboard** (`/dashboard`) - Admin overview and management
- **Catalog** (`/catalog`) - Product catalog management
- **Quotes** (`/quotes`) - Quote approval and management
- **Analytics** (`/analytics`) - Business analytics
- **Inventory** (`/inventory`) - Stock management

## 🤖 AI Assistant Features

The integrated chatbot supports:
- **Navigation**: "Go to catalog", "Open dashboard"
- **Product Search**: "Search router", "Find SSD"
- **Quick Actions**: "I want a quote", "Contact support"
- **FAQ Responses**: Common questions about shipping, quotes, etc.

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Products
- `GET /api/products` - List products (with search/filter)
- `POST /api/products` - Create product (admin)
- `GET /api/products/[id]` - Get product details
- `PUT /api/products/[id]` - Update product (admin)
- `DELETE /api/products/[id]` - Delete product (admin)

### Quotes
- `GET /api/quotes` - List quotes (filtered by user)
- `POST /api/quotes` - Create quote request
- `GET /api/quotes/[id]` - Get quote details
- `PATCH /api/quotes/[id]` - Update quote status (admin)
- `DELETE /api/quotes/[id]` - Delete quote

## 🎨 Data Models

### Product
```typescript
{
  id: string
  name: string
  description: string
  price: number
  category: string
  image: string
  inStock: boolean
  specifications: Record<string, string>
  brand: string
  rating: number
  reviews: number
}
```

### User
```typescript
{
  id: string
  email: string
  name: string
  role: "admin" | "customer"
}
```

### Quote
```typescript
{
  id: string
  customerName: string
  customerEmail: string
  company?: string
  phone?: string
  items: QuoteItem[]
  totalAmount: number
  status: "pending" | "approved" | "rejected" | "expired"
  notes?: string
  createdAt: Date
  expiresAt: Date
  adminNotes?: string
}
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Manual Build
```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

## 🔒 Security Features

- Password hashing with bcrypt
- Input validation with Zod
- Role-based access control
- Secure MongoDB queries
- Environment variable protection

## 📝 Development Phases

The project follows a structured development approach documented in `PHASING.txt`:
- Phase 0-6: Core functionality (Complete)
- Future phases: Enhanced features and optimizations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software owned by Unicom Technologies.

## 📞 Support

For technical support or questions:
- Create an issue in the repository
- Contact the development team
- Check the built-in chatbot for quick help

---

**Built with ❤️ by the Unicom Technologies team**