# Wareon - Backend

A robust e-commerce backend API built with NestJS and MongoDB.

## Tech Stack

- **Framework:** NestJS
- **Database:** MongoDB with Mongoose
- **Package Manager:** pnpm
- **Authentication:** JWT
- **Validation:** Zod + Class Validator
- **Caching:** Next.js Cache Revalidation

## Features

### Product Management
- Create, read, update, delete products
- Product images (URL-based)
- Stock management
- Product status (active/inactive)
- Category assignment

### Category Management
- CRUD operations
- Auto-generated slugs
- Category status

### Order Management
- Create orders
- Update order status (pending → confirmed → shipped → delivered)
- Update order items
- Cancel orders
- Stock deduction/restoration
- Order history

### User Management
- JWT authentication
- Role-based access (User/Manager)
- User profiles

## API Endpoints

### Products
```
GET    /api/v1/products          - Get all products
GET    /api/v1/products/:id      - Get product by ID
POST   /api/v1/products          - Create product
PATCH  /api/v1/products/:id      - Update product
DELETE /api/v1/products/:id      - Delete product
```

### Categories
```
GET    /api/v1/categories        - Get all categories
GET    /api/v1/categories/:id    - Get category by ID
POST   /api/v1/categories        - Create category
PATCH  /api/v1/categories/:id    - Update category
DELETE /api/v1/categories/:id    - Delete category
```

### Orders
```
GET    /api/v1/orders            - Get all orders
GET    /api/v1/orders/user       - Get user orders
GET    /api/v1/orders/:id        - Get order by ID
POST   /api/v1/orders            - Create order
PATCH  /api/v1/orders/:id/status - Update order status
PATCH  /api/v1/orders/:id/items  - Update order items
PATCH  /api/v1/orders/:id/cancel - Cancel order
```

### Auth
```
POST   /api/v1/auth/login        - User login
POST   /api/v1/auth/register     - User registration
GET    /api/v1/auth/me      - Get user profile
PUT    /api/v1/auth/profile      - Get user profile
```

## Project Structure

```
src/
├── modules/              # Feature modules
│   ├── auth/            # Authentication
│   ├── product/         # Product management
│   ├── category/        # Category management
│   ├── order/           # Order management
│   └── user/            # User management
├── common/              # Shared utilities
├── config/              # Configuration
└── main.ts             # Application entry
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB
- pnpm

### Installation

```bash
# Clone repository
git clone <your-repo-url>
cd wareon-backend

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env

# Run development server
pnpm run start:dev

# Build for production
pnpm run build

# Start production server
pnpm run start:prod
```

### Environment Variables

Create a `.env` file:

```env
MONGODB_URI=mongodb://localhost:27017/wareon
SECRET_ACCESS_TOKEN=your_secret_access_token
ACCESS_TOKEN_EXPIRY=900
SECRET_REFRESH_TOKEN=your_secret_refresh_token
REFRESH_TOKEN_EXPIRY=604800
SALT_ROUNDS=12

```

## Database Schema

### Product Schema
```typescript
{
  name: string;
  price: number;
  stock: number;
  productUrl: string[];
  category: ObjectId;
  status: 'ACTIVE' | 'INACTIVE';
  sku: string;
  minStockThreshold: number;
}
```

### Order Schema
```typescript
{
  customerName: string;
  items: Array<{
    productId: ObjectId;
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  notes?: string;
  createdBy: ObjectId;
}
```

## Key Features Implementation

### Stock Management
- Automatic stock deduction on order creation
- Stock restoration on order cancellation
- Stock validation before order placement

### Order Status Flow
```
pending → confirmed → shipped → delivered
    ↓
cancelled (from pending/confirmed only)
```

### Authentication
- JWT tokens for API authentication
- Role-based middleware for protected routes
- Password hashing with bcrypt

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm run start:dev` | Start development server with hot reload |
| `pnpm run build` | Build for production |
| `pnpm run start:prod` | Start production server |
| `pnpm run test` | Run tests |
| `pnpm run lint` | Run ESLint |

## Error Handling

- Global exception filter
- Validation pipes
- Structured error responses
- HTTP exception handling

## Security

- JWT authentication
- Password hashing
- Input validation
- XSS protection
- Rate limiting (optional)

