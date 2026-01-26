# Fashion E-commerce Website

A modern, responsive e-commerce website built with Astro, React, and Tailwind CSS for selling fashion items. This project follows a JSON-first approach for data storage with a planned migration to PostgreSQL when scaling needs arise.

## 🚀 Features

### Customer Experience
- **Product Browsing**: Browse products with filtering by category, color, and price range
- **Product Details**: View detailed product information with variant selection
- **Shopping Cart**: Persistent cart with quantity management and slide-out drawer
- **Checkout**: Streamlined checkout with pincode-based delivery charges
- **UPI Payment**: Integrated UPI payment with QR code
- **Order Tracking**: View order status and details after purchase
- **Responsive Design**: Optimized for mobile, tablet, and desktop

### Admin Experience
- **Product Management**: Add, edit, and delete products (planned)
- **Order Management**: View and update order status (planned)
- **Settings**: Configure delivery regions and payment options (planned)

## 🛠️ Tech Stack

- **Frontend**: Astro v5 (Static Site Generator)
- **UI Framework**: React v19 (for interactive components)
- **Styling**: Tailwind CSS v4 with modern design system
- **Data Storage**: JSON (with planned PostgreSQL migration in Week 6)
- **TypeScript**: Full type safety throughout application
- **Deployment**: Vercel-ready static site

## 📁 Project Structure

```
customer-web/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── CartBadge.tsx
│   │   └── CartDrawer.tsx
│   ├── layouts/            # Page layouts
│   │   └── Layout.astro
│   ├── pages/              # Site pages
│   │   ├── index.astro    # Homepage
│   │   ├── products/      # Product listing and detail pages
│   │   ├── cart.astro     # Shopping cart page
│   │   ├── checkout.astro # Checkout flow
│   │   ├── order/        # Order confirmation pages
│   │   └── 404.astro      # Error page
│   ├── data/               # JSON data files
│   │   ├── products.json
│   │   ├── orders.json
│   │   ├── settings.json
│   │   └── delivery-settings.json
│   ├── scripts/            # External JavaScript files
│   │   └── checkout.js
│   ├── styles/             # Global styles
│   │   └── global.css
│   └── utils/              # Utility functions
│       └── dataStore.ts
├── public/                  # Static assets
│   ├── images/
│   └── favicon.svg
├── package.json
├── astro.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git for cloning the repository

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd website1/customer-web
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:4321` (or the port shown in terminal)

### Build for Production

```bash
npm run build
```

The static site will be generated in the `dist/` directory, ready for deployment.

### Preview Production Build

```bash
npm run preview
```

This will serve the production build locally for testing.

## 📊 Development Status

### Completed Phases
- ✅ **Week 1**: Setup + Homepage (Project initialization, layout, categories)
- ✅ **Week 2**: Product Pages (Listing, filtering, detail pages)
- ✅ **Week 3**: Cart & Checkout (Cart management, checkout flow, UPI payment)

### Next Phase
- 🔄 **Week 4**: Admin Panel (Product and order management interface)

### Future Phases
- 📅 **Week 5**: Polish & Testing (Performance optimization, SEO)
- 📅 **Week 6**: Database Migration (Move from JSON to PostgreSQL)

## 🛒 E-commerce Features

### Product Catalog
- Products with multiple variants (color, pattern)
- Stock tracking per variant
- Multiple product images
- Categorized into 5 fashion categories:
  - Crop Tops
  - Anarkali Suits
  - Maxi Dresses
  - Chudi Sets
  - Panel Tops

### Shopping Experience
- Add to cart with specific variant selection
- Persistent shopping cart using localStorage
- Slide-out cart drawer for quick cart access
- Real-time cart badge updates
- Quantity adjustment in cart

### Checkout Process
- Customer information collection
- Delivery address with pincode validation
- Dynamic delivery charge calculation based on region
- Free shipping on orders above ₹1500
- UPI payment integration with QR code display
- Order confirmation with tracking details

### Order Management
- Order number generation
- Order status tracking (Pending, Confirmed, Shipped, Delivered)
- Order history storage in localStorage

## 🔧 Configuration

### Data Files

The application uses JSON files for data storage:

- `products.json`: Product catalog with variants
- `orders.json`: Order history
- `settings.json`: Site configuration and UPI details
- `delivery-settings.json`: Pincode-based delivery regions and charges

### Customization

To customize the store:

1. Update products in `src/data/products.json`
2. Modify product variants (color, pattern, stock)
3. Adjust pricing and descriptions
4. Configure delivery regions in `delivery-settings.json`
5. Update UPI payment details in `settings.json`

### Design System

The project uses a modern design system with CSS custom properties:

- Colors based on OKLCH color space for better consistency
- Dark mode support prepared
- Responsive breakpoints for mobile-first design
- Component-specific spacing and typography scales

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Deploy automatically on push to main branch

### Manual Static Deployment

```bash
npm run build
# Deploy the contents of the dist/ folder to your hosting service
```

## 🔍 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Commit your changes: `git commit -m "Add feature"`
5. Push to the branch: `git push origin feature-name`
6. Open a pull request

## 📝 License

This project is licensed under the MIT License.

## 📞 Support

For support, please contact:
- Email: support@yourshop.in
- Phone: +91 9876543210
- WhatsApp: +91 9876543210

---

Built with ❤️ using [Astro](https://astro.build)