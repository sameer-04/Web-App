# ShopZilla - E-Commerce Website

A modern, full-stack e-commerce website built with Next.js, Node.js, and CSS.

## Features

- 🛍️ Product browsing and search
- 🛒 Shopping cart functionality
- 💳 Checkout process
- 👤 User authentication (login/register)
- 📦 Order management
- 🎨 Modern, responsive UI

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, CSS
- **Backend**: Node.js, Express.js
- **Authentication**: JWT (JSON Web Tokens)
- **Storage**: In-memory (replace with database in production)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the backend server:
```bash
npm run server
```

The backend will run on `http://localhost:5000`

3. In a new terminal, start the Next.js development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── page.tsx           # Home page
│   ├── products/          # Product pages
│   ├── cart/              # Shopping cart
│   ├── checkout/          # Checkout page
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   └── orders/            # Order history
├── components/            # React components
│   ├── Header.tsx
│   └── ProductCard.tsx
├── server/                # Backend server
│   └── index.js          # Express server
├── styles/                # CSS files
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login user

### Products
- `GET /api/products` - Get all products (supports ?category= & ?search=)
- `GET /api/products/:id` - Get product by ID

### Cart
- `GET /api/cart` - Get user's cart (requires auth)
- `POST /api/cart` - Add item to cart (requires auth)
- `PUT /api/cart/:productId` - Update cart item quantity (requires auth)
- `DELETE /api/cart/:productId` - Remove item from cart (requires auth)

### Orders
- `GET /api/orders` - Get user's orders (requires auth)
- `GET /api/orders/:id` - Get order by ID (requires auth)
- `POST /api/orders` - Create new order (requires auth)

## Default Products

The server comes with 6 sample products:
- Wireless Headphones
- Smart Watch
- Laptop Backpack
- Coffee Maker
- Running Shoes
- Bluetooth Speaker

## Notes

- The current implementation uses in-memory storage. For production, replace with a proper database (MongoDB, PostgreSQL, etc.)
- JWT secret should be changed to a secure random string in production
- Add proper error handling and validation
- Implement payment gateway integration for real transactions
- Add product images (currently using placeholder divs)

## License

MIT
