const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// In-memory database (replace with real database in production)
let users = [];
let orders = [];
let carts = {}; // userId -> cart items

// Create demo user with properly hashed password
const createDemoUser = async () => {
  try {
    const hashedPassword = await bcrypt.hash('demo123', 10);
    const demoUser = {
      id: 1,
      email: 'demo@example.com',
      password: hashedPassword,
      name: 'Demo User'
    };
    users.push(demoUser);
    carts[demoUser.id] = []; // Initialize empty cart for demo user
    console.log('Demo user created: demo@example.com / demo123');
  } catch (error) {
    console.error('Error creating demo user:', error);
  }
};

// Initialize demo user
createDemoUser();
let products = [
  // Electronics (20 items)
  { id: 1, name: 'Precision Wireless Headphones', price: 32999, rating: 4.8, description: 'Professional-grade noise cancellation with silver-trimmed finish.', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1470&auto=format&fit=crop', category: 'Electronics', stock: 15 },
  { id: 2, name: 'Onyx Smart Watch', price: 45000, rating: 4.7, description: 'Sleek black sapphire glass with premium leather strap.', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1399&auto=format&fit=crop', category: 'Electronics', stock: 8 },
  { id: 3, name: 'Acoustic Master Speaker', price: 74999, rating: 4.9, description: 'High-fidelity audio housed in a minimalist matte black shell.', image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=1536&auto=format&fit=crop', category: 'Electronics', stock: 5 },
  { id: 4, name: 'Pro Gaming Mouse', price: 5499, rating: 4.6, description: 'Precision sensor with customizable RGB lighting and ergonomic feel.', image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=1470&auto=format&fit=crop', category: 'Electronics', stock: 25 },
  { id: 5, name: 'Mechanical Silver Keyboard', price: 12999, rating: 4.8, description: 'Ultra-responsive switches with brushed aluminum frame.', image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?q=80&w=1470&auto=format&fit=crop', category: 'Electronics', stock: 12 },
  { id: 6, name: 'Vision Pro Monitor', price: 89999, rating: 4.9, description: '4K OLED display with perfect blacks and silver stand.', image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=1470&auto=format&fit=crop', category: 'Electronics', stock: 10 },
  { id: 7, name: 'Compact DSLR Camera', price: 125000, rating: 4.7, description: 'Professional imaging in a sleek, compact dark body.', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1470&auto=format&fit=crop', category: 'Electronics', stock: 7 },
  { id: 8, name: 'Noise-Canceling Earbuds', price: 18999, rating: 4.5, description: 'Crystal clear sound with a glossy charging case.', image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=1470&auto=format&fit=crop', category: 'Electronics', stock: 30 },
  { id: 9, name: 'Premium Tablet X', price: 79999, rating: 4.8, description: 'Thin, powerful, and elegantly finished in obsidian black.', image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=1470&auto=format&fit=crop', category: 'Electronics', stock: 14 },
  { id: 10, name: 'High-Speed Router', price: 14999, rating: 4.4, description: 'Next-gen connectivity with a minimalist aesthetic.', image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1470&auto=format&fit=crop', category: 'Electronics', stock: 20 },
  { id: 11, name: 'Studio Microphone', price: 24999, rating: 4.9, description: 'Professional audio capture for creators, finished in matte black.', image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=1470&auto=format&fit=crop', category: 'Electronics', stock: 18 },
  { id: 12, name: 'Drone Explorer 5', price: 145000, rating: 4.7, description: 'Cinematic 5K video capture with advanced stabilization.', image: 'https://images.unsplash.com/photo-1473960104312-d2e37706a3bf?q=80&w=1470&auto=format&fit=crop', category: 'Electronics', stock: 6 },
  { id: 13, name: 'VR Reality Headset', price: 54999, rating: 4.6, description: 'Immersive gaming experience with sleek ergonomic design.', image: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?q=80&w=1470&auto=format&fit=crop', category: 'Electronics', stock: 12 },
  { id: 14, name: 'Silver Hub Station', price: 8999, rating: 4.5, description: 'All-in-one connectivity for your premium workstation.', image: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?q=80&w=1470&auto=format&fit=crop', category: 'Electronics', stock: 40 },
  { id: 15, name: 'Portable SSD 2TB', price: 19999, rating: 4.8, description: 'Fast, secure, and finished in a diamond-cut metal body.', image: 'https://images.unsplash.com/photo-1597740985671-2a8a306ae41f?q=80&w=1470&auto=format&fit=crop', category: 'Electronics', stock: 22 },
  { id: 16, name: 'Curved Gaming Monitor', price: 64999, rating: 4.9, description: '144Hz refresh rate with immersive wrap-around display.', image: 'https://images.unsplash.com/photo-1547119957-637f8679db1e?q=80&w=1470&auto=format&fit=crop', category: 'Electronics', stock: 9 },
  { id: 17, name: 'Smart Home Hub', price: 12999, rating: 4.3, description: 'Control your entire home with a touch of elegance.', image: 'https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=1470&auto=format&fit=crop', category: 'Electronics', stock: 15 },
  { id: 18, name: 'Titanium Phone Case', price: 3499, rating: 4.7, description: 'Military-grade protection with a premium metallic finish.', image: 'https://images.unsplash.com/photo-1601593346740-925612772716?q=80&w=1470&auto=format&fit=crop', category: 'Electronics', stock: 100 },
  { id: 19, name: 'Wireless Desktop Set', price: 14999, rating: 4.6, description: 'Minimalist keyboard and mouse combo in silver/white.', image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?q=80&w=1470&auto=format&fit=crop', category: 'Electronics', stock: 20 },
  { id: 20, name: 'Hi-Fi Audio Cable', price: 2999, rating: 4.8, description: 'Gold-plated connectors for loss-less audio transmission.', image: 'https://images.unsplash.com/photo-1558618047-e8c4c56f9b85?q=80&w=1470&auto=format&fit=crop', category: 'Electronics', stock: 60 },

  // Fashion (20 items)
  { id: 21, name: 'Midnight Leather Jacket', price: 95000, rating: 4.9, description: 'Handcrafted Italian leather with polished silver hardware.', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1335&auto=format&fit=crop', category: 'Fashion', stock: 3 },
  { id: 22, name: 'Obsidian Sunglasses', price: 24999, rating: 4.7, description: 'Polarized lenses with a timeless glossy black frame.', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=1480&auto=format&fit=crop', category: 'Fashion', stock: 12 },
  { id: 23, name: 'Silk Dark Tie', price: 8999, rating: 4.6, description: 'Pure mulberry silk with a subtle geometric pattern.', image: 'https://images.unsplash.com/photo-1598033129183-c4f50c7176c8?q=80&w=1470&auto=format&fit=crop', category: 'Fashion', stock: 45 },
  { id: 24, name: 'Velvet Evening Blaze', price: 145000, rating: 4.9, description: 'Exquisite velvet tailoring for the ultimate premium look.', image: 'https://images.unsplash.com/photo-1594932224010-75f27c7a5272?q=80&w=1470&auto=format&fit=crop', category: 'Fashion', stock: 6 },
  { id: 25, name: 'Silver Chrono Watch', price: 345000, rating: 4.9, description: 'Masterpiece of engineering with a brushed metal strap.', image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=1470&auto=format&fit=crop', category: 'Fashion', stock: 2 },
  { id: 26, name: 'Leather Travel Bag', price: 42000, rating: 4.8, description: 'Premium top-grain leather with ample space and durability.', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1470&auto=format&fit=crop', category: 'Fashion', stock: 10 },
  { id: 27, name: 'Cashmere Black Scarf', price: 12999, rating: 4.7, description: 'Soft, warm, and elegantly finished in deepest black.', image: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?q=80&w=1470&auto=format&fit=crop', category: 'Fashion', stock: 25 },
  { id: 28, name: 'Designer Black Heels', price: 74999, rating: 4.8, description: 'Stiletto heels with a high-gloss finish and leather sole.', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=1470&auto=format&fit=crop', category: 'Fashion', stock: 8 },
  { id: 29, name: 'Wool Tailored Overcoat', price: 85000, rating: 4.9, description: 'Classic silhouette with premium wool-blend fabric.', image: 'https://images.unsplash.com/photo-1539533397308-a61448aa7483?q=80&w=1470&auto=format&fit=crop', category: 'Fashion', stock: 5 },
  { id: 30, name: 'Minimalist White T-Shirt', price: 4999, rating: 4.5, description: 'Heavyweight cotton with a perfect, tailored fit.', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1470&auto=format&fit=crop', category: 'Fashion', stock: 150 },
  { id: 31, name: 'Designer Leather Belt', price: 14999, rating: 4.7, description: 'Polished silver buckle with full-grain calfskin.', image: 'https://images.unsplash.com/photo-1624222247344-550fbadfd98e?q=80&w=1470&auto=format&fit=crop', category: 'Fashion', stock: 40 },
  { id: 32, name: 'Suede Ankle Boots', price: 28000, rating: 4.6, description: 'Elegant suede finish with a comfortable blocked heel.', image: 'https://images.unsplash.com/photo-1542288960-f6ad3c764e52?q=80&w=1470&auto=format&fit=crop', category: 'Fashion', stock: 15 },
  { id: 33, name: 'Professional Briefcase', price: 54999, rating: 4.8, description: 'Slim design with multiple organizers in genuine leather.', image: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?q=80&w=1470&auto=format&fit=crop', category: 'Fashion', stock: 12 },
  { id: 34, name: 'Gold Pendant Necklace', price: 125000, rating: 4.9, description: '18K solid gold with a minimalist geometric design.', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1470&auto=format&fit=crop', category: 'Fashion', stock: 4 },
  { id: 35, name: 'Linen Summer Shirt', price: 9999, rating: 4.4, description: 'Breathable European linen in a crisp white shade.', image: 'https://images.unsplash.com/photo-1598033129183-c4f50c7176c8?q=80&w=1470&auto=format&fit=crop', category: 'Fashion', stock: 60 },
  { id: 36, name: 'Luxe Tracksuit Set', price: 18999, rating: 4.5, description: 'Premium loungewear with a modern, sleek profile.', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1470&auto=format&fit=crop', category: 'Fashion', stock: 30 },
  { id: 37, name: 'Featherweight Fedora', price: 12999, rating: 4.3, description: 'Hand-felted wool with a silk band accent.', image: 'https://images.unsplash.com/photo-1514332130164-27c170320138?q=80&w=1470&auto=format&fit=crop', category: 'Fashion', stock: 10 },
  { id: 38, name: 'Premium Denim Jeans', price: 16999, rating: 4.7, description: 'Raw Japanese denim with a tailored slim-straight cut.', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=1470&auto=format&fit=crop', category: 'Fashion', stock: 40 },
  { id: 39, name: 'Active Performance Leggings', price: 7999, rating: 4.6, description: 'Four-way stretch fabric with moisture-wicking tech.', image: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?q=80&w=1470&auto=format&fit=crop', category: 'Fashion', stock: 80 },
  { id: 40, name: 'Silver Hoop Earrings', price: 9999, rating: 4.8, description: 'Solid sterling silver with a high-polished finish.', image: 'https://images.unsplash.com/photo-1535639818669-c059d2f038e6?q=80&w=1470&auto=format&fit=crop', category: 'Fashion', stock: 50 },

  // Home Decor (20 items)
  { id: 41, name: 'Minimalist Table Lamp', price: 12999, rating: 4.7, description: 'Sculpted base with a soft linen shade for warm light.', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 15 },
  { id: 42, name: 'Ceramic Vase Set', price: 8499, rating: 4.6, description: 'Hand-glazed matte finish in earthy tonal shades.', image: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 40 },
  { id: 43, name: 'Velvet Throw Pillow', price: 3499, rating: 4.8, description: 'Luxurious plush texture with a hidden zipper closure.', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 100 },
  { id: 44, name: 'Abstract Wall Art', price: 24999, rating: 4.9, description: 'Original textured painting in a minimal silver frame.', image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1490&auto=format&fit=crop', category: 'Home & Kitchen', stock: 5 },
  { id: 45, name: 'Scented Soy Candle', price: 2999, rating: 4.5, description: 'Infused with essential oils in a dark frosted glass jar.', image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 120 },
  { id: 46, name: 'Mirror Horizon 60', price: 18999, rating: 4.7, description: 'Beveled edge circular mirror with a thin metal frame.', image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 12 },
  { id: 47, name: 'Woven Area Rug', price: 54999, rating: 4.8, description: 'Natural fibers woven into a modern geometric pattern.', image: 'https://images.unsplash.com/photo-1575414003591-ece8d0416c7a?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 10 },
  { id: 48, name: 'Floating Bookshelves', price: 6499, rating: 4.4, description: 'Sleek black shelves for a truly minimalist storage solution.', image: 'https://images.unsplash.com/photo-1594620302200-9a7621.jpg?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 35 },
  { id: 49, name: 'Decorative Hourglass', price: 4299, rating: 4.3, description: 'Hand-blown glass with fine black sand and silver accents.', image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 20 },
  { id: 50, name: 'Marble Drink Coasters', price: 2499, rating: 4.8, description: 'Set of 4 white marble coasters with gold-leaf edges.', image: 'https://images.unsplash.com/photo-1605436247078-f0ef43ee8d5c?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 150 },
  { id: 51, name: 'Velvet Armchair', price: 89999, rating: 4.9, description: 'Signature piece with deep seat and elegant metal legs.', image: 'https://images.unsplash.com/photo-1567016432779-094069958ad5?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 4 },
  { id: 52, name: 'Glass Coffee Table', price: 45000, rating: 4.7, description: 'Tempered glass top with a sculptural black base.', image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 8 },
  { id: 53, name: 'Blackout Curtains', price: 8999, rating: 4.5, description: 'Thermal insulated fabric for perfect sleep and privacy.', image: 'https://images.unsplash.com/photo-1510074377623-8cf13fb86c08?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 50 },
  { id: 54, name: 'Photo Frame Gallery', price: 12999, rating: 4.6, description: 'Set of 10 modern black frames for a curated wall.', image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 25 },
  { id: 55, name: 'Indoor Planter Set', price: 7499, rating: 4.4, description: 'Three varying sizes of matte finished ceramic pots.', image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 30 },
  { id: 56, name: 'Silk Bedding Set', price: 25000, rating: 4.9, description: 'Highest grade silk for the ultimate night\'s rest.', image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 15 },
  { id: 57, name: 'Modern Wall Clock', price: 5499, rating: 4.2, description: 'Silent movement with a minimalist faceless design.', image: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 40 },
  { id: 58, name: 'Luxe Shag Carpet', price: 68000, rating: 4.7, description: 'Ultra-soft deep pile carpet in a charcoal grey tone.', image: 'https://images.unsplash.com/photo-1595113316349-9fa4eb24f884?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 6 },
  { id: 59, name: 'Floating Hearth Shell', price: 120000, rating: 4.9, description: 'A futuristic bio-ethanol fireplace for your modern living room.', image: 'https://images.unsplash.com/photo-1581452656976-18967406a14a?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 2 },
  { id: 60, name: 'Pendant Light Orb', price: 34999, rating: 4.8, description: 'Smoked glass orb that creates a dramatic mood lighting.', image: 'https://images.unsplash.com/photo-1513506494265-1d68366919bc?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 12 },

  // Kitchen (20 items)
  { id: 61, name: 'Titanium Coffee Craft', price: 38000, rating: 4.9, description: 'Modernist design with advanced thermal control.', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 10 },
  { id: 62, name: 'Chef Knife Elite', price: 14999, rating: 4.8, description: 'Damascus steel blade with a premium ergonomic handle.', image: 'https://images.unsplash.com/photo-1593618998160-e34014e67541?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 25 },
  { id: 63, name: 'Digital Air Fryer', price: 12999, rating: 4.7, description: 'High-speed air circulation for healthier cooking.', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 20 },
  { id: 64, name: 'Precision Toaster', price: 5499, rating: 4.4, description: 'Evenly toasts every time with multiple shade settings.', image: 'https://images.unsplash.com/photo-1584622781564-1d987f7333de?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 30 },
  { id: 65, name: 'Glass Kettle Pro', price: 4299, rating: 4.5, description: 'Heat-resistant borosilicate glass with rapid boil tech.', image: 'https://images.unsplash.com/photo-1594212699903-ec8a3ecc50f1?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 45 },
  { id: 66, name: 'Cast Iron Dutch Oven', price: 18999, rating: 4.9, description: 'Heavy-duty enameled cast iron for perfect braising.', image: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 15 },
  { id: 67, name: 'Spice Grinder Set', price: 3499, rating: 4.6, description: 'Adjustable ceramic burr for the perfect grind every time.', image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 60 },
  { id: 68, name: 'Matte Cookware Set', price: 54999, rating: 4.8, description: 'Nontoxic nonstick coating with a sleek charcoal finish.', image: 'https://images.unsplash.com/photo-1584990333921-f77aba227f71?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 10 },
  { id: 69, name: 'Silicone Utensil Kit', price: 2999, rating: 4.7, description: 'Heat-resistant, BPA-free tools for every culinary task.', image: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 100 },
  { id: 70, name: 'Kitchen Balance Scale', price: 2499, rating: 4.5, description: 'High-precision sensors in a slim, reflective black design.', image: 'https://images.unsplash.com/photo-1591114940429-ca0041f6e09e?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 80 },
  { id: 71, name: 'Wine Aero Decanter', price: 7999, rating: 4.8, description: 'Optimizes flavor in seconds with its unique aeration flow.', image: 'https://images.unsplash.com/photo-1510850438488-2d2dabb24659?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 20 },
  { id: 72, name: 'Automatic Pasta Maker', price: 24999, rating: 4.6, description: 'Fresh, homemade pasta at the touch of a button.', image: 'https://images.unsplash.com/photo-1585144860131-245d551c77f6?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 12 },
  { id: 73, name: 'Bamboo Cutting Board', price: 3999, rating: 4.4, description: 'Sustainable, durable, and naturally antibacterial.', image: 'https://images.unsplash.com/photo-1533777857419-37ea9fc91240?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 50 },
  { id: 74, name: 'Insulated Tumbler 40oz', price: 4999, rating: 4.7, description: 'Keeps drinks icy for 24 hours in a glossy silver body.', image: 'https://images.unsplash.com/photo-1517254456976-ee8682099819?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 150 },
  { id: 75, name: 'Luxe Espresso Machine', price: 185000, rating: 4.9, description: 'Professional pressure for café-quality shots at home.', image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 5 },
  { id: 76, name: 'Crystal Glass Set', price: 12999, rating: 4.8, description: 'Set of 6 ultra-thin glasses for tasting fine wines.', image: 'https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 40 },
  { id: 77, name: 'Electric Herb Grinder', price: 6499, rating: 4.3, description: 'Fast, efficient, and discreetly finished in matte grey.', image: 'https://images.unsplash.com/photo-1591114940526-7f4159f8073b?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 35 },
  { id: 78, name: 'Smart Sous Vide', price: 15999, rating: 4.9, description: 'Maintains perfect temperature for restaurant results.', image: 'https://images.unsplash.com/photo-1585932231551-36ba908d1f88?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 15 },
  { id: 79, name: 'Magnetic Knife Rack', price: 4499, rating: 4.6, description: 'Strong magnet encased in minimalist walnut wood.', image: 'https://images.unsplash.com/photo-1586208958839-06c17cacdf08?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 40 },
  { id: 80, name: 'Tabletop Nut Cracker', price: 2999, rating: 4.2, description: 'Classic lever design updated in polished metal.', image: 'https://images.unsplash.com/photo-1594212699903-ec8a3ecc50f1?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 60 },

  // Accessories (20 items)
  { id: 81, name: 'Titanium Wallet Meta', price: 8999, rating: 4.7, description: 'Slim, RFID-blocking, and virtually indestructible.', image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=1470&auto=format&fit=crop', category: 'Accessories', stock: 80 },
  { id: 82, name: 'Obsidian Key Organizer', price: 3499, rating: 4.5, description: 'Eliminate key rattle with this sleek leather holder.', image: 'https://images.unsplash.com/photo-1524234107056-1c1f48f64ab8?q=80&w=1470&auto=format&fit=crop', category: 'Accessories', stock: 100 },
  { id: 83, name: 'Silk Pocket Square', price: 2499, rating: 4.8, description: 'The final touch for a premium evening blazer.', image: 'https://images.unsplash.com/photo-1598033129183-c4f50c7176c8?q=80&w=1470&auto=format&fit=crop', category: 'Accessories', stock: 150 },
  { id: 84, name: 'Premium Umbrella Pro', price: 7999, rating: 4.6, description: 'Windproof frame with an automatic open/close mechanism.', image: 'https://images.unsplash.com/photo-1520038410233-7141be7e6f97?q=80&w=1470&auto=format&fit=crop', category: 'Accessories', stock: 40 },
  { id: 85, name: 'Minimalist Card Holder', price: 4999, rating: 4.7, description: 'Holds 6 cards in a slim, front-pocket profile.', image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=1470&auto=format&fit=crop', category: 'Accessories', stock: 200 },
  { id: 86, name: 'Silver Cufflink Set', price: 12999, rating: 4.9, description: 'Solid sterling silver with a engraved minimalist motif.', image: 'https://images.unsplash.com/photo-1617137934033-9092.jpg?q=80&w=1470&auto=format&fit=crop', category: 'Accessories', stock: 25 },
  { id: 87, name: 'Leather Passport Cover', price: 6499, rating: 4.8, description: 'Travel in style with this top-grain leather accessory.', image: 'https://images.unsplash.com/photo-1544923246-77307dd654ca?q=80&w=1470&auto=format&fit=crop', category: 'Accessories', stock: 60 },
  { id: 88, name: 'Designer Lighter Case', price: 3499, rating: 4.5, description: 'Elevate your Zippo with a polished chrome case.', image: 'https://images.unsplash.com/photo-1523413555809-0fb868e238d0?q=80&w=1470&auto=format&fit=crop', category: 'Accessories', stock: 100 },
  { id: 89, name: 'Bespoke Shoe Horn', price: 5499, rating: 4.7, description: 'Ergonomic curves in a polished silver-tone finish.', image: 'https://images.unsplash.com/photo-1591114940526-7f4159f8073b?q=80&w=1470&auto=format&fit=crop', category: 'Accessories', stock: 30 },
  { id: 90, name: 'Luxury Pen Obsidian', price: 18999, rating: 4.9, description: 'Weighted for perfect balance with a ultra-smooth tip.', image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?q=80&w=1470&auto=format&fit=crop', category: 'Accessories', stock: 20 },
  { id: 91, name: 'Silk Eye Mask', price: 4299, rating: 4.6, description: 'Total blackout for a luxurious rest during travel.', image: 'https://images.unsplash.com/photo-1517423568366-8b83523034fd?q=80&w=1470&auto=format&fit=crop', category: 'Accessories', stock: 80 },
  { id: 92, name: 'Leather Desk Mat', price: 12999, rating: 4.7, description: 'Protects your surface while providing a premium feel.', image: 'https://images.unsplash.com/photo-1505751171710-1f6d0f5a849a?q=80&w=1470&auto=format&fit=crop', category: 'Accessories', stock: 45 },
  { id: 93, name: 'Silver Money Clip', price: 7499, rating: 4.8, description: 'Minimalist alternative to a wallet, solid metal body.', image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=1470&auto=format&fit=crop', category: 'Accessories', stock: 50 },
  { id: 94, name: 'Obsidian Tie Clip', price: 5499, rating: 4.6, description: 'Keeps your tie in place with a sharp, matching style.', image: 'https://images.unsplash.com/photo-1624454002302-3.jpg?q=80&w=1470&auto=format&fit=crop', category: 'Accessories', stock: 100 },
  { id: 95, name: 'Tech Organizer Pouch', price: 8999, rating: 4.7, description: 'Holds your cables, drives, and chargers in one place.', image: 'https://images.unsplash.com/photo-1588263177303-125032824e86?q=80&w=1470&auto=format&fit=crop', category: 'Accessories', stock: 35 },
  { id: 96, name: 'Scented Sachet Set', price: 1999, rating: 4.4, description: 'Infused with lavender and sandalwood for your wardrobe.', image: 'https://images.unsplash.com/photo-1588600030303-32475824e86?q=80&w=1470&auto=format&fit=crop', category: 'Accessories', stock: 120 },
  { id: 97, name: 'Leather Valet Tray', price: 7999, rating: 4.8, description: 'The perfect place for your daily pocket contents.', image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=1470&auto=format&fit=crop', category: 'Accessories', stock: 25 },
  { id: 98, name: 'Silver Collar Stays', price: 2499, rating: 4.9, description: 'Keep your collar sharp with solid sterling silver.', image: 'https://images.unsplash.com/photo-1621252179027-94459d278660?q=80&w=1470&auto=format&fit=crop', category: 'Accessories', stock: 150 },
  { id: 99, name: 'Compact Lint Roller', price: 1499, rating: 4.5, description: 'Travel-sized essential for maintaining a clean look.', image: 'https://images.unsplash.com/photo-1590086782957-93c06ef217.jpg?q=80&w=1470&auto=format&fit=crop', category: 'Accessories', stock: 300 },
  { id: 100, name: 'Obsidian Watch Box', price: 28000, rating: 4.9, description: 'Holds 10 watches in a glossy black wooden frame.', image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=1480&auto=format&fit=crop', category: 'Accessories', stock: 10 },

  // Budget Premium Items (₹1000 - ₹1500 range)
  { id: 101, name: 'Matte Black Coffee Mug', price: 1299, rating: 4.5, description: 'Double-walled insulation with a sleek matte finish.', image: 'https://images.unsplash.com/photo-1517254456976-ee8682099819?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 150 },
  { id: 102, name: 'Minimalist Card Wallet', price: 1450, rating: 4.6, description: 'Slim design, handcrafted from genuine leather.', image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=1470&auto=format&fit=crop', category: 'Accessories', stock: 80 },
  { id: 103, name: 'Organic Cotton Socks Set', price: 1100, rating: 4.7, description: 'Super soft, breathable cotton in monochrome tones.', image: 'https://images.unsplash.com/photo-1582967788606-a171c1080cb0?q=80&w=1470&auto=format&fit=crop', category: 'Fashion', stock: 200 },
  { id: 104, name: 'Desktop Wire Organizer', price: 1350, rating: 4.4, description: 'Keep your workspace clean with this heavy-duty clip.', image: 'https://images.unsplash.com/photo-1558618047-e8c4c56f9b85?q=80&w=1470&auto=format&fit=crop', category: 'Accessories', stock: 100 },
  { id: 105, name: 'Ceramic Sauce Bowl Set', price: 1200, rating: 4.8, description: 'Hand-finished bowls for elegant dining prep.', image: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 60 },
  { id: 106, name: 'Nylon Charging Cable Pro', price: 1499, rating: 4.5, description: 'Tangle-free, extra long cable with metal tips.', image: 'https://images.unsplash.com/photo-1558618047-e8c4c56f9b85?q=80&w=1470&auto=format&fit=crop', category: 'Electronics', stock: 300 },
  { id: 107, name: 'Velvet Soft Headband', price: 1050, rating: 4.6, description: 'Premium velvet fabric for a touch of class.', image: 'https://images.unsplash.com/photo-1598033129183-c4f50c7176c8?q=80&w=1470&auto=format&fit=crop', category: 'Fashion', stock: 120 },
  { id: 108, name: 'Glass Tea Infuser', price: 1399, rating: 4.7, description: 'Heat-resistant glass for a perfect brew view.', image: 'https://images.unsplash.com/photo-1594212699903-ec8a3ecc50f1?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 45 },
  { id: 109, name: 'Metallic Keyring Alpha', price: 1150, rating: 4.3, description: 'Polished zinc alloy with a quick-release mechanism.', image: 'https://images.unsplash.com/photo-1601593346740-925612772716?q=80&w=1470&auto=format&fit=crop', category: 'Accessories', stock: 250 },
  { id: 110, name: 'Travel Lint Brush', price: 1290, rating: 4.4, description: 'Eco-friendly bristles in a reusable dark case.', image: 'https://images.unsplash.com/photo-1590086782957-93c06ef217?q=80&w=1470&auto=format&fit=crop', category: 'Accessories', stock: 180 },
  { id: 111, name: 'Silicone Trivet Set', price: 1400, rating: 4.8, description: 'Hexagonal non-slip mats in deep charcoal grey.', image: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 90 },
  { id: 112, name: 'Essential Oil Blend', price: 1350, rating: 4.9, description: 'Relaxing lavender and cedarwood extraction.', image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 75 },
  { id: 113, name: 'Satin Sleep Mask', price: 1100, rating: 4.7, description: 'Ultra-smooth satin for a luxurious night sleep.', image: 'https://images.unsplash.com/photo-1517423568366-8b83523034fd?q=80&w=1470&auto=format&fit=crop', category: 'Accessories', stock: 50 },
  { id: 114, name: 'Designer Screen Cloth', price: 1199, rating: 4.6, description: 'Microfiber tech for pristine glass surfaces.', image: 'https://images.unsplash.com/photo-1597740985671-2a8a306ae41f?q=80&w=1470&auto=format&fit=crop', category: 'Electronics', stock: 150 },
  { id: 115, name: 'Aromatic Wardrobe Sachet', price: 1000, rating: 4.5, description: 'Long-lasting natural scent for premium garments.', image: 'https://images.unsplash.com/photo-1588600030303-32475824e86?q=80&w=1470&auto=format&fit=crop', category: 'Accessories', stock: 300 },
  { id: 116, name: 'Bamboo Serving Tong', price: 1250, rating: 4.4, description: 'Eco-conscious design with a carbonized finish.', image: 'https://images.unsplash.com/photo-1533777857419-37ea9fc91240?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 80 },
  { id: 117, name: 'Agate Drink Stone', price: 1450, rating: 4.8, description: 'Natural cut stone to cool drinks without dilution.', image: 'https://images.unsplash.com/photo-1605436247078-f0ef43ee8d5c?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 40 },
  { id: 118, name: 'Leather Binder Clip (Large)', price: 1399, rating: 4.7, description: 'Wrapped in pebble-grain leather for desk style.', image: 'https://images.unsplash.com/photo-1505751171710-1f6d0f5a849a?q=80&w=1470&auto=format&fit=crop', category: 'Accessories', stock: 65 },
  { id: 119, name: 'Chrome Salt Shaker', price: 1499, rating: 4.6, description: 'Professional series with a high-mirror finish.', image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 110 },
  { id: 120, name: 'Mini Ceramic Planter', price: 1150, rating: 4.5, description: 'Sculptural pot for succulents, finished in grey jade.', image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 200 },
  { id: 121, name: 'Obsidian Tie Pin', price: 1300, rating: 4.7, description: 'Timeless pin with a polished black stone inlay.', image: 'https://images.unsplash.com/photo-1624454002302-3.jpg?q=80&w=1470&auto=format&fit=crop', category: 'Fashion', stock: 95 },
  { id: 122, name: 'Canvas Tote Luxe', price: 1450, rating: 4.8, description: 'Heavyweight organic canvas with leather handles.', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1470&auto=format&fit=crop', category: 'Fashion', stock: 150 },
  { id: 123, name: 'Brushed Metal Cap', price: 1499, rating: 4.4, description: 'Laser-etched logo on a high-density tech fabric.', image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=1470&auto=format&fit=crop', category: 'Fashion', stock: 75 },
  { id: 124, name: 'Desktop Sand Timer', price: 1200, rating: 4.6, description: 'Black sand in a hand-blown glass frame (5-min).', image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 100 },
  { id: 125, name: 'Luxe Fabric Roller', price: 1350, rating: 4.5, description: 'Ergonomic handle with specialized sticky surface.', image: 'https://images.unsplash.com/photo-1590086782957-93c06ef217?q=80&w=1470&auto=format&fit=crop', category: 'Accessories', stock: 220 },

  // Batch 1: Affordable Premium (25 items)
  { id: 126, name: 'Minimalist Incense Holder', price: 1100, rating: 4.4, description: 'Brushed metal tray for clean ash collection.', image: 'https://images.unsplash.com/photo-1602872030219-5fbacc37ba19?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 150 },
  { id: 127, name: 'Woven Cotton Napkins', price: 1250, rating: 4.6, description: 'Set of 4 artisan napkins in charcoal grey.', image: 'https://images.unsplash.com/photo-1574621100236-d25b64cfd647?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 80 },
  { id: 128, name: 'Obsidian Paperweight', price: 1499, rating: 4.8, description: 'Solid polished stone for the ultimate desk aesthetic.', image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?q=80&w=1470&auto=format&fit=crop', category: 'Accessories', stock: 40 },
  { id: 129, name: 'Silver Plated Coaster', price: 1350, rating: 4.5, description: 'Elegant mirror finish to protect your surfaces.', image: 'https://images.unsplash.com/photo-1605436247078-f0ef43ee8d5c?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 100 },
  { id: 130, name: 'Ceramic Salt Box', price: 1200, rating: 4.7, description: 'Matte black storage with a bamboo lid.', image: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 65 },
  { id: 131, name: 'Premium Leather Tag', price: 1050, rating: 4.3, description: 'Personalize your luggage with handcrafted leather.', image: 'https://images.unsplash.com/photo-1544923246-77307dd654ca?q=80&w=1470&auto=format&fit=crop', category: 'Accessories', stock: 200 },
  { id: 132, name: 'USB LED Desk Ring', price: 1450, rating: 4.6, description: 'Adjustable brightness for your workstation.', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=1470&auto=format&fit=crop', category: 'Electronics', stock: 120 },
  { id: 133, name: 'Matte Grey Spoon Rest', price: 1100, rating: 4.4, description: 'Minimalist kitchen essential in heat-safe silicone.', image: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 300 },
  { id: 134, name: 'Agate Bookends (Single)', price: 1399, rating: 4.9, description: 'Unique natural crystal to support your collection.', image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 45 },
  { id: 135, name: 'Brushed Metal Stylus', price: 1250, rating: 4.5, description: 'Precise control for tablets and touchscreens.', image: 'https://images.unsplash.com/photo-1597740985671-2a8a306ae41f?q=80&w=1470&auto=format&fit=crop', category: 'Electronics', stock: 150 },
  { id: 136, name: 'Satin Necktie Silver', price: 1450, rating: 4.7, description: 'High-shine finish for formal evening events.', image: 'https://images.unsplash.com/photo-1598033129183-c4f50c7176c8?q=80&w=1470&auto=format&fit=crop', category: 'Fashion', stock: 90 },
  { id: 137, name: 'Marble Tea Light Holder', price: 1150, rating: 4.6, description: 'Soft diffusion of light through white marble.', image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 200 },
  { id: 138, name: 'Copper Shot Measure', price: 1290, rating: 4.8, description: 'Double-sided jigger with a professional finish.', image: 'https://images.unsplash.com/photo-1517254456976-ee8682099819?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 75 },
  { id: 139, name: 'Tech Screen Cleaning Kit', price: 1400, rating: 4.5, description: 'Streak-free solution with premium microfiber.', image: 'https://images.unsplash.com/photo-1597740985671-2a8a306ae41f?q=80&w=1470&auto=format&fit=crop', category: 'Electronics', stock: 100 },
  { id: 140, name: 'Leather Earbud Case', price: 1350, rating: 4.7, description: 'Snap-closure protection for wireless buds.', image: 'https://images.unsplash.com/photo-1601593346740-925612772716?q=80&w=1470&auto=format&fit=crop', category: 'Accessories', stock: 180 },
  { id: 141, name: 'Ceramic Spice Jar', price: 1100, rating: 4.4, description: 'Airtight seal to keep flavors fresh.', image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 250 },
  { id: 142, name: 'Geometric Desk Mirror', price: 1499, rating: 4.6, description: 'Thin silver frame with a sculptural base.', image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 50 },
  { id: 143, name: 'Scented Drawer Liner', price: 1250, rating: 4.3, description: 'Subtle cedarwood scent for your wardrobe.', image: 'https://images.unsplash.com/photo-1588600030303-32475824e86?q=80&w=1470&auto=format&fit=crop', category: 'Accessories', stock: 300 },
  { id: 144, name: 'Bamboo Toaster Tongs', price: 1000, rating: 4.5, description: 'Heat-resistant and safe for all surfaces.', image: 'https://images.unsplash.com/photo-1533777857419-37ea9fc91240?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 150 },
  { id: 145, name: 'Matte Black Straw Set', price: 1199, rating: 4.7, description: 'Eco-friendly stainless steel with a cleaning brush.', image: 'https://images.unsplash.com/photo-1517254456976-ee8682099819?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 400 },
  { id: 146, name: 'Felt Tablet Sleeve', price: 1450, rating: 4.6, description: 'Soft charcoal felt for scratch-free transport.', image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=1470&auto=format&fit=crop', category: 'Electronics', stock: 85 },
  { id: 147, name: 'Silver Nut Bowl', price: 1399, rating: 4.8, description: 'Hammered metal finish for sophisticated serving.', image: 'https://images.unsplash.com/photo-1594212699903-ec8a3ecc50f1?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 65 },
  { id: 148, name: 'Pebble Leather Card Case', price: 1200, rating: 4.5, description: 'Ultra-slim profile for front-pocket carry.', image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=1470&auto=format&fit=crop', category: 'Accessories', stock: 110 },
  { id: 149, name: 'Desktop Phone Cradle', price: 1150, rating: 4.4, description: 'Brushed aluminum with charging cable routing.', image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=1470&auto=format&fit=crop', category: 'Electronics', stock: 120 },
  { id: 150, name: 'Velvet Pillow Wrap', price: 1300, rating: 4.7, description: 'Decorative band for an extra layer of texture.', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 95 },

  // Batch 2: Performance & Utility (25 items)
  { id: 151, name: 'Magnetic Cable Clip', price: 1050, rating: 4.5, description: 'Keep your desktop cables organized and accessible.', image: 'https://images.unsplash.com/photo-1558618047-e8c4c56f9b85?q=80&w=1470&auto=format&fit=crop', category: 'Electronics', stock: 200 },
  { id: 152, name: 'Travel Power Cube', price: 1450, rating: 4.6, description: 'Multi-socket adapter in a compact minimalist design.', image: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?q=80&w=1470&auto=format&fit=crop', category: 'Electronics', stock: 110 },
  { id: 153, name: 'Silicone Keyboard Skin', price: 1100, rating: 4.3, description: 'Ultra-thin protection for your laptop keys.', image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?q=80&w=1470&auto=format&fit=crop', category: 'Electronics', stock: 300 },
  { id: 154, name: 'Metal Monitor Riser', price: 1399, rating: 4.7, description: 'Elevate your view while keeping your desk tidy.', image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=1470&auto=format&fit=crop', category: 'Electronics', stock: 60 },
  { id: 155, name: 'High-Density Mouse Mat', price: 1250, rating: 4.8, description: 'Stitched edges for long-lasting smoothness.', image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=1470&auto=format&fit=crop', category: 'Electronics', stock: 150 },
  { id: 156, name: 'Woven Fabric Belt', price: 1499, rating: 4.5, description: 'Stretchable utility belt with a sleek metal buckle.', image: 'https://images.unsplash.com/photo-1624222247344-550fbadfd98e?q=80&w=1470&auto=format&fit=crop', category: 'Fashion', stock: 90 },
  { id: 157, name: 'Organic Cotton Beanie', price: 1200, rating: 4.4, description: 'Comfortable fit for every season in dark navy.', image: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?q=80&w=1470&auto=format&fit=crop', category: 'Fashion', stock: 130 },
  { id: 158, name: 'Bespoke Cufflinks Box', price: 1150, rating: 4.7, description: 'Single item storage for your most precious pairs.', image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=1470&auto=format&fit=crop', category: 'Accessories', stock: 200 },
  { id: 159, name: 'Scented Linen Spray', price: 1050, rating: 4.6, description: 'Refresh your bedding with natural extracts.', image: 'https://images.unsplash.com/photo-1588600030303-32475824e86?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 250 },
  { id: 160, name: 'Brushed Brass Spoon', price: 1350, rating: 4.8, description: 'Set of 2 elegant stirring spoons for coffee.', image: 'https://images.unsplash.com/photo-1517254456976-ee8682099819?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 100 },
  { id: 161, name: 'Glass Tumbler Sleeve', price: 1100, rating: 4.4, description: 'Leather wrap to protect hands from heat.', image: 'https://images.unsplash.com/photo-1510850438488-2d2dabb24659?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 180 },
  { id: 162, name: 'Miniature Succulent Pot', price: 1299, rating: 4.5, description: 'Concrete finish for a modern desktop look.', image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 150 },
  { id: 163, name: 'Tech Tool Kit Pro', price: 1450, rating: 4.9, description: 'Precision bits for all your device repairs.', image: 'https://images.unsplash.com/photo-1597740985671-2a8a306ae41f?q=80&w=1470&auto=format&fit=crop', category: 'Electronics', stock: 50 },
  { id: 164, name: 'Silicone Wine Stopper', price: 1150, rating: 4.3, description: 'Airtight seal for preserving open bottles.', image: 'https://images.unsplash.com/photo-1510850438488-2d2dabb24659?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 300 },
  { id: 165, name: 'Metal Laptop Stand (Foldable)', price: 1399, rating: 4.6, description: 'Portable elevation for ergonomic working.', image: 'https://images.unsplash.com/photo-1544731612-de7f96afe55f?q=80&w=1470&auto=format&fit=crop', category: 'Electronics', stock: 75 },
  { id: 166, name: 'Velvet Soft Pouch', price: 1200, rating: 4.4, description: 'Organize your accessories with plush convenience.', image: 'https://images.unsplash.com/photo-1598033129183-c4f50c7176c8?q=80&w=1470&auto=format&fit=crop', category: 'Fashion', stock: 120 },
  { id: 167, name: 'Ceramic Dipping Tray', price: 1450, rating: 4.7, description: 'Divided sections for multiple sauce choices.', image: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 85 },
  { id: 168, name: 'Handcrafted Wooden Comb', price: 1100, rating: 4.8, description: 'Sandalwood scent with fine-tooth precision.', image: 'https://images.unsplash.com/photo-1590086782957-93c06ef217?q=80&w=1470&auto=format&fit=crop', category: 'Accessories', stock: 140 },
  { id: 169, name: 'Desktop Ambient Light', price: 1350, rating: 4.5, description: 'Soft LED glow for a relaxed working environment.', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 95 },
  { id: 170, name: 'Leather Key Fob Meta', price: 1250, rating: 4.6, description: 'Robust metal ring with premium leather loop.', image: 'https://images.unsplash.com/photo-1524234107056-1c1f48f64ab8?q=80&w=1470&auto=format&fit=crop', category: 'Accessories', stock: 220 },
  { id: 171, name: 'Matte Charcoal Plate', price: 1499, rating: 4.7, description: 'Signature dinnerware for modern kitchens.', image: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 65 },
  { id: 172, name: 'USB-C to HDMI Lead', price: 1300, rating: 4.4, description: 'High-speed data transfer in a braided jacket.', image: 'https://images.unsplash.com/photo-1558618047-e8c4c56f9b85?q=80&w=1470&auto=format&fit=crop', category: 'Electronics', stock: 180 },
  { id: 173, name: 'Designer Silk Scrunchie', price: 1150, rating: 4.8, description: 'Gentle on hair with a luxury sheen.', image: 'https://images.unsplash.com/photo-1598033129183-c4f50c7176c8?q=80&w=1470&auto=format&fit=crop', category: 'Fashion', stock: 300 },
  { id: 174, name: 'Glass Oil Dispenser', price: 1399, rating: 4.5, description: 'Precise pour spout for fine culinary work.', image: 'https://images.unsplash.com/photo-1594212699903-ec8a3ecc50f1?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 110 },
  { id: 175, name: 'Silver Card Holder Pro', price: 1450, rating: 4.7, description: 'RFID-secure metal case for up to 5 cards.', image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=1470&auto=format&fit=crop', category: 'Accessories', stock: 80 },

  // Batch 3: Lifestyle & Decor (25 items)
  { id: 176, name: 'Scented Soy Tealights', price: 1100, rating: 4.5, description: 'Set of 10 vanilla bean candles for a soft glow.', image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 200 },
  { id: 177, name: 'Obsidian Book Clip', price: 1050, rating: 4.4, description: 'Sleek metal holder to keep your place in style.', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1470&auto=format&fit=crop', category: 'Accessories', stock: 150 },
  { id: 178, name: 'Ceramic Milk Jug', price: 1250, rating: 4.7, description: 'Hand-thrown pitcher with a minimalist spout.', image: 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 90 },
  { id: 179, name: 'Brushed Silver Cuff', price: 1499, rating: 4.8, description: 'Minimalist wrist accessory for modern evening wear.', image: 'https://images.unsplash.com/photo-1535639818669-c059d2f038e6?q=80&w=1470&auto=format&fit=crop', category: 'Accessories', stock: 65 },
  { id: 180, name: 'Microfiber Tech Wrap', price: 1199, rating: 4.4, description: 'Protective cloth for expensive electronics lenses.', image: 'https://images.unsplash.com/photo-1597740985671-2a8a306ae41f?q=80&w=1470&auto=format&fit=crop', category: 'Electronics', stock: 250 },
  { id: 181, name: 'Leather Keychain Loop', price: 1200, rating: 4.6, description: 'Tough pebble leather with a matte black ring.', image: 'https://images.unsplash.com/photo-1601593346740-925612772716?q=80&w=1470&auto=format&fit=crop', category: 'Accessories', stock: 300 },
  { id: 182, name: 'Matte Grey Mug Set', price: 1450, rating: 4.7, description: 'Two oversized ceramic mugs for cozy mornings.', image: 'https://images.unsplash.com/photo-1517254456976-ee8682099819?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 100 },
  { id: 183, name: 'USB-C Cable (Braided)', price: 1100, rating: 4.5, description: 'Extra durable charging lead with metal heads.', image: 'https://images.unsplash.com/photo-1558618047-e8c4c56f9b85?q=80&w=1470&auto=format&fit=crop', category: 'Electronics', stock: 400 },
  { id: 184, name: 'Satin Eyemask Pro', price: 1350, rating: 4.9, description: 'Luxury blackout mask with adjustable strap.', image: 'https://images.unsplash.com/photo-1517423568366-8b83523034fd?q=80&w=1470&auto=format&fit=crop', category: 'Accessories', stock: 80 },
  { id: 185, name: 'Crystal Incense Bowl', price: 1499, rating: 4.6, description: 'Solid heavy glass for a dramatic sensory display.', image: 'https://images.unsplash.com/photo-1602872030219-5fbacc37ba19?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 55 },
  { id: 186, name: 'Minimalist Tie Clip', price: 1250, rating: 4.7, description: 'Short matte black clip for slim modern ties.', image: 'https://images.unsplash.com/photo-1624454002302-3.jpg?q=80&w=1470&auto=format&fit=crop', category: 'Fashion', stock: 120 },
  { id: 187, name: 'Agate Tea Coaster', price: 1150, rating: 4.4, description: 'Single slice of natural stone with gold trim.', image: 'https://images.unsplash.com/photo-1605436247078-f0ef43ee8d5c?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 180 },
  { id: 188, name: 'Velvet Soft Headwrap', price: 1100, rating: 4.3, description: 'Wide band for keeping hair tidy with a lush feel.', image: 'https://images.unsplash.com/photo-1598033129183-c4f50c7176c8?q=80&w=1470&auto=format&fit=crop', category: 'Fashion', stock: 110 },
  { id: 189, name: 'Chrome Desk Tray', price: 1400, rating: 4.6, description: 'Organize your daily carry with high-shine style.', image: 'https://images.unsplash.com/photo-1505751171710-1f6d0f5a849a?q=80&w=1470&auto=format&fit=crop', category: 'Accessories', stock: 70 },
  { id: 190, name: 'Canvas Pouch Small', price: 1050, rating: 4.5, description: 'Carry your essentials in sustainable thick cotton.', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1470&auto=format&fit=crop', category: 'Fashion', stock: 220 },
  { id: 191, name: 'Silicone Trivet Duo', price: 1290, rating: 4.8, description: 'Set of 2 heat-safe pads for your premium cookware.', image: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 140 },
  { id: 192, name: 'Metallic Ink Pen', price: 1450, rating: 4.7, description: 'Weighted body for a superior writing experience.', image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?q=80&w=1470&auto=format&fit=crop', category: 'Accessories', stock: 95 },
  { id: 193, name: 'Designer Screen Puff', price: 1150, rating: 4.4, description: 'Plush cleaner for monitors and TV screens.', image: 'https://images.unsplash.com/photo-1597740985671-2a8a306ae41f?q=80&w=1470&auto=format&fit=crop', category: 'Electronics', stock: 160 },
  { id: 194, name: 'Scented Wardrobe Disc', price: 1200, rating: 4.5, description: 'Ceramic disc infused with sandalwood oil.', image: 'https://images.unsplash.com/photo-1588600030303-32475824e86?q=80&w=1470&auto=format&fit=crop', category: 'Accessories', stock: 300 },
  { id: 195, name: 'Bamboo Drawer Organizers', price: 1399, rating: 4.8, description: 'Adjustable dividers for a custom kitchen fit.', image: 'https://images.unsplash.com/photo-1533777857419-37ea9fc91240?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 50 },
  { id: 196, name: 'Felt Charging Mat', price: 1450, rating: 4.6, description: 'Protective surface for all your bedside tech.', image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=1470&auto=format&fit=crop', category: 'Electronics', stock: 85 },
  { id: 197, name: 'Glass Tea Strainer', price: 1100, rating: 4.7, description: 'Brew individual cups with this clear glass tool.', image: 'https://images.unsplash.com/photo-1594212699903-ec8a3ecc50f1?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 150 },
  { id: 198, name: 'Obsidian Phone Stand', price: 1350, rating: 4.4, description: 'Solid heavy base for stable viewing.', image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=1470&auto=format&fit=crop', category: 'Electronics', stock: 120 },
  { id: 199, name: 'Velvet Tray Insert', price: 1200, rating: 4.5, description: 'Additional dividers for your accessory box.', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1470&auto=format&fit=crop', category: 'Accessories', stock: 200 },
  { id: 200, name: 'Silver Key Ring Alpha', price: 1450, rating: 4.8, description: 'Double-loop safety for critical home security.', image: 'https://images.unsplash.com/photo-1601593346740-925612772716?q=80&w=1470&auto=format&fit=crop', category: 'Accessories', stock: 110 },

  // Batch 4: Final Expansion (25 items)
  { id: 201, name: 'Matte Black Coaster Set', price: 1250, rating: 4.5, description: 'Minimalist protection for your premium desk.', image: 'https://images.unsplash.com/photo-1605436247078-f0ef43ee8d5c?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 150 },
  { id: 202, name: 'Premium Lint Roller Pro', price: 1499, rating: 4.7, description: 'Heavy-duty fabric care in a sleek dark casing.', image: 'https://images.unsplash.com/photo-1590086782957-93c06ef217?q=80&w=1470&auto=format&fit=crop', category: 'Accessories', stock: 100 },
  { id: 203, name: 'Ceramic Dipping Bowls', price: 1100, rating: 4.4, description: 'Set of 3 matte finished bowls for gourmet sauces.', image: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 120 },
  { id: 204, name: 'USB-C Cable (Silver)', price: 1350, rating: 4.6, description: 'High-speed syncing with a polished metal housing.', image: 'https://images.unsplash.com/photo-1558618047-e8c4c56f9b85?q=80&w=1470&auto=format&fit=crop', category: 'Electronics', stock: 200 },
  { id: 205, name: 'Leather Binder Clip (Small)', price: 1050, rating: 4.3, description: 'Hand-wrapped organizer for your important papers.', image: 'https://images.unsplash.com/photo-1505751171710-1f6d0f5a849a?q=80&w=1470&auto=format&fit=crop', category: 'Accessories', stock: 180 },
  { id: 206, name: 'Agate Tea Infuser Plate', price: 1450, rating: 4.8, description: 'Natural cut stone to rest your tea tools.', image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 60 },
  { id: 207, name: 'Satin Sleep Mask (Deep Red)', price: 1200, rating: 4.5, description: 'Plush blackout comfort for high-quality rest.', image: 'https://images.unsplash.com/photo-1517423568366-8b83523034fd?q=80&w=1470&auto=format&fit=crop', category: 'Accessories', stock: 140 },
  { id: 208, name: 'Minimalist Candle Snuffer', price: 1150, rating: 4.7, description: 'Polished silver tool for clean scent preservation.', image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 110 },
  { id: 209, name: 'Metallic Tablet Stylus Pro', price: 1399, rating: 4.9, description: 'Ultra-thin nib for precision creative work.', image: 'https://images.unsplash.com/photo-1597740985671-2a8a306ae41f?q=80&w=1470&auto=format&fit=crop', category: 'Electronics', stock: 85 },
  { id: 210, name: 'Pebble Leather Luggage Tag', price: 1250, rating: 4.4, description: 'Durable construction with privacy flap design.', image: 'https://images.unsplash.com/photo-1544923246-77307dd654ca?q=80&w=1470&auto=format&fit=crop', category: 'Accessories', stock: 250 },
  { id: 211, name: 'Glass Tea Scoop', price: 1100, rating: 4.6, description: 'Hand-blown tool for measure fine loose leaf.', image: 'https://images.unsplash.com/photo-1594212699903-ec8a3ecc50f1?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 130 },
  { id: 212, name: 'Obsidian Paper Weight XL', price: 1499, rating: 4.8, description: 'Large scale polished stone for executive desks.', image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?q=80&w=1470&auto=format&fit=crop', category: 'Accessories', stock: 40 },
  { id: 213, name: 'Ceramic Spice Mill (Grey)', price: 1350, rating: 4.5, description: 'Adjustable grind in a sculptural matte body.', image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 95 },
  { id: 214, name: 'Silver Key Ring Loop', price: 1150, rating: 4.3, description: 'Simple, elegant security for your premium home.', image: 'https://images.unsplash.com/photo-1601593346740-925612772716?q=80&w=1470&auto=format&fit=crop', category: 'Accessories', stock: 300 },
  { id: 215, name: 'Scented Soy Wax Tart', price: 1000, rating: 4.7, description: 'Long-lasting lavender fragrance for melt warmers.', image: 'https://images.unsplash.com/photo-1588600030303-32475824e86?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 400 },
  { id: 216, name: 'Bamboo Serving Fork', price: 1200, rating: 4.4, description: 'Sustainable design with a deep carbonized finish.', image: 'https://images.unsplash.com/photo-1533777857419-37ea9fc91240?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 150 },
  { id: 217, name: 'Canvas Tool Roll', price: 1450, rating: 4.6, description: 'Carry your precision kit in structured thick cotton.', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1470&auto=format&fit=crop', category: 'Accessories', stock: 80 },
  { id: 218, name: 'Matte Black Desk Organizer', price: 1399, rating: 4.8, description: 'Metal mesh construction for a modern tidy look.', image: 'https://images.unsplash.com/photo-1505751171710-1f6d0f5a849a?q=80&w=1470&auto=format&fit=crop', category: 'Accessories', stock: 75 },
  { id: 219, name: 'Silicone Trivet Ring', price: 1100, rating: 4.5, description: 'Circular non-slip mat for hot tea pots.', image: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 220 },
  { id: 220, name: 'USB LED Ring Light Mini', price: 1450, rating: 4.7, description: 'Compact lighting for on-the-go creative calls.', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=1470&auto=format&fit=crop', category: 'Electronics', stock: 110 },
  { id: 221, name: 'Leather Key Clasp Pro', price: 1290, rating: 4.4, description: 'Secure attachment for your daily car keys.', image: 'https://images.unsplash.com/photo-1524234107056-1c1f48f64ab8?q=80&w=1470&auto=format&fit=crop', category: 'Accessories', stock: 180 },
  { id: 222, name: 'Ceramic Tealight Cup', price: 1150, rating: 4.8, description: 'Sculptural holder for standard tea light candles.', image: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 200 },
  { id: 223, name: 'Silver Cufflinks (Engraved)', price: 1499, rating: 4.6, description: 'Classic circular design with a subtle texture.', image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=1470&auto=format&fit=crop', category: 'Accessories', stock: 65 },
  { id: 224, name: 'Glass Coffee Measure', price: 1300, rating: 4.7, description: 'Precise dosing tool for serious coffee drinkers.', image: 'https://images.unsplash.com/photo-1517254456976-ee8682099819?q=80&w=1470&auto=format&fit=crop', category: 'Home & Kitchen', stock: 120 },
  { id: 225, name: 'Felt Phone Sleeve', price: 1150, rating: 4.5, description: 'Lightweight protection for your premium device.', image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=1470&auto=format&fit=crop', category: 'Electronics', stock: 160 }
];



// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Auth Routes
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user exists
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with proper ID assignment
    const user = {
      id: Math.max(...users.map(u => u.id), 0) + 1,
      email,
      password: hashedPassword,
      name
    };

    users.push(user);
    carts[user.id] = [];

    // Generate token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = users.find(u => u.email === email);

    if (!user) {
      return res.status(401).json({
        error: 'No account found with this email. Please register first or use demo@example.com'
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({
        error: 'Incorrect password. For demo account, use: demo123'
      });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'ShopZilla API Server is running',
    totalProducts: products.length,
    endpoints: {
      products: '/api/products',
      register: '/api/register',
      login: '/api/login'
    }
  });
});

// Product Routes
app.get('/api/products', (req, res) => {
  const { category, search } = req.query;
  let filteredProducts = [...products];

  if (category) {
    filteredProducts = filteredProducts.filter(p => p.category === category);
  }

  if (search) {
    const searchLower = search.toLowerCase();
    filteredProducts = filteredProducts.filter(p =>
      p.name.toLowerCase().includes(searchLower) ||
      p.description.toLowerCase().includes(searchLower)
    );
  }

  res.json(filteredProducts);
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

// Cart Routes
app.get('/api/cart', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const cart = carts[userId] || [];
  res.json(cart);
});

app.post('/api/cart', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { productId, quantity } = req.body;

  if (!productId || !quantity) {
    return res.status(400).json({ error: 'Product ID and quantity are required' });
  }

  const product = products.find(p => p.id === productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  if (product.stock < quantity) {
    return res.status(400).json({ error: 'Insufficient stock' });
  }

  if (!carts[userId]) {
    carts[userId] = [];
  }

  const existingItem = carts[userId].find(item => item.productId === productId);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    carts[userId].push({
      productId,
      quantity,
      product: {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image
      }
    });
  }

  res.json({ message: 'Item added to cart', cart: carts[userId] });
});

app.delete('/api/cart/:productId', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const productId = parseInt(req.params.productId);

  if (!carts[userId]) {
    return res.status(404).json({ error: 'Cart not found' });
  }

  carts[userId] = carts[userId].filter(item => item.productId !== productId);
  res.json({ message: 'Item removed from cart', cart: carts[userId] });
});

app.put('/api/cart/:productId', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const productId = parseInt(req.params.productId);
  const { quantity } = req.body;

  if (!carts[userId]) {
    return res.status(404).json({ error: 'Cart not found' });
  }

  const item = carts[userId].find(item => item.productId === productId);
  if (!item) {
    return res.status(404).json({ error: 'Item not found in cart' });
  }

  item.quantity = quantity;
  res.json({ message: 'Cart updated', cart: carts[userId] });
});

// Order Routes
app.post('/api/orders', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { shippingAddress, paymentMethod, phone } = req.body;

  if (!carts[userId] || carts[userId].length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  if (!shippingAddress) {
    return res.status(400).json({ error: 'Shipping address is required' });
  }

  const order = {
    id: orders.length + 1,
    userId,
    items: [...carts[userId]],
    shippingAddress,
    phone: phone || 'Not provided',
    paymentMethod: paymentMethod || 'Credit Card',
    total: carts[userId].reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
    status: 'Pending',
    createdAt: new Date().toISOString()
  };

  orders.push(order);
  carts[userId] = []; // Clear cart

  res.status(201).json({ message: 'Order placed successfully', order });
});

app.get('/api/orders', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const userOrders = orders.filter(o => o.userId === userId);
  res.json(userOrders);
});

app.get('/api/orders/:id', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const order = orders.find(o => o.id === parseInt(req.params.id) && o.userId === userId);

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  res.json(order);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
