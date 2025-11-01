// Database Schema for Unicom Technologies Catalog System
// MongoDB Collections and Relationships

// =============================================
// USER MANAGEMENT
// =============================================

Table users {
  _id ObjectId [primary key]
  id string [unique, note: 'UUID for external references']
  name string [not null]
  email string [unique, not null]
  password string [not null, note: 'Hashed with bcrypt']
  role string [note: 'customer | admin']
  created_at timestamp [default: now()]
  updated_at timestamp [default: now()]
}

// =============================================
// PRODUCT CATALOG
// =============================================

Table products {
  _id ObjectId [primary key]
  id string [unique, note: 'UUID for external references']
  name string [not null]
  description text [note: 'Product description']
  brand string
  category string [note: 'Product category']
  price number [note: 'Price in USD']
  stock_quantity integer [default: 0]
  specifications json [note: 'Product specifications object']
  images array<string> [note: 'Array of image URLs']
  features array<string> [note: 'Product features list']
  status string [default: 'active', note: 'active | inactive | discontinued']
  created_at timestamp [default: now()]
  updated_at timestamp [default: now()]
}

// =============================================
// QUOTE SYSTEM
// =============================================

Table quotes {
  _id ObjectId [primary key]
  id string [unique, note: 'UUID for external references']
  customer_name string [not null]
  customer_email string [not null]
  company string [note: 'Optional company name']
  phone string [note: 'Optional phone number']
  items array<json> [note: 'Array of quote items with product details']
  total_amount number [not null]
  status string [default: 'pending', note: 'pending | approved | rejected | expired']
  notes string [note: 'Customer notes']
  admin_notes string [note: 'Admin response/notes']
  expires_at timestamp [note: 'Quote expiration date']
  created_at timestamp [default: now()]
  updated_at timestamp [default: now()]
}

// =============================================
// SUPPORT TICKET SYSTEM
// =============================================

Table tickets {
  _id ObjectId [primary key]
  id string [unique, note: 'UUID for external references']
  customer_name string [not null]
  customer_email string [not null]
  subject string [not null]
  issue_type string [not null, note: 'technical | billing | general | product | other']
  description text [not null, note: 'Minimum 5 characters']
  priority string [default: 'medium', note: 'low | medium | high | urgent']
  status string [default: 'open', note: 'open | in_progress | resolved | closed']
  attachments array<string> [note: 'Array of attachment URLs']
  admin_notes string [note: 'Admin response/notes']
  assigned_to string [note: 'Assigned admin/team member']
  resolved_at timestamp [note: 'When ticket was resolved']
  closed_at timestamp [note: 'When ticket was closed']
  created_at timestamp [default: now()]
  updated_at timestamp [default: now()]
}

// =============================================
// RELATIONSHIPS
// =============================================

// User-Quote Relationship (One-to-Many)
Ref: quotes.customer_email > users.email

// User-Ticket Relationship (One-to-Many)
Ref: tickets.customer_email > users.email

// Quote-Product Relationship (Many-to-Many through items array)
// Note: Products are referenced by ID in quote items, not direct foreign key

// =============================================
// INDEXES (MongoDB)
// =============================================

// Users Collection Indexes
Index users_email_idx on users.email [unique]
Index users_role_idx on users.role

// Products Collection Indexes
Index products_category_idx on products.category
Index products_brand_idx on products.brand
Index products_status_idx on products.status
Index products_name_text on products.name [text]

// Quotes Collection Indexes
Index quotes_customer_email_idx on quotes.customer_email
Index quotes_status_idx on quotes.status
Index quotes_created_at_idx on quotes.created_at [desc]

// Tickets Collection Indexes
Index tickets_customer_email_idx on tickets.customer_email
Index tickets_status_idx on tickets.status
Index tickets_priority_idx on tickets.priority
Index tickets_issue_type_idx on tickets.issue_type
Index tickets_created_at_idx on tickets.created_at [desc]

// =============================================
// DATA VALIDATION RULES
// =============================================

// Users Validation
// - email: Must be valid email format
// - password: Must be hashed with bcrypt
// - role: Must be 'customer' or 'admin'

// Products Validation
// - price: Must be positive number
// - stock_quantity: Must be non-negative integer
// - status: Must be 'active', 'inactive', or 'discontinued'

// Quotes Validation
// - total_amount: Must be positive number
// - status: Must be 'pending', 'approved', 'rejected', or 'expired'
// - items: Must be non-empty array

// Tickets Validation
// - description: Must be at least 5 characters
// - issue_type: Must be valid enum value
// - priority: Must be valid enum value
// - status: Must be valid enum value

// =============================================
// COLLECTION STATISTICS
// =============================================

// Expected Collection Sizes (Production)
// - users: ~1,000-10,000 records
// - products: ~500-5,000 records
// - quotes: ~2,000-20,000 records
// - tickets: ~500-5,000 records

// =============================================
// API ENDPOINTS MAPPING
// =============================================

// Authentication API
// POST /api/auth/login -> users collection
// POST /api/auth/register -> users collection

// Products API
// GET /api/products -> products collection
// GET /api/products/[id] -> products collection
// POST /api/products -> products collection (admin only)
// PUT /api/products/[id] -> products collection (admin only)
// DELETE /api/products/[id] -> products collection (admin only)

// Quotes API
// POST /api/quotes -> quotes collection
// GET /api/quotes -> quotes collection
// GET /api/quotes/[id] -> quotes collection
// PUT /api/quotes/[id] -> quotes collection (admin only)

// Tickets API
// POST /api/tickets -> tickets collection
// GET /api/tickets -> tickets collection
// GET /api/tickets/[id] -> tickets collection
// PUT /api/tickets/[id] -> tickets collection (admin only)
