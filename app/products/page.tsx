'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import { API_BASE_URL } from '@/utils/api';
import '../../styles/home.css';

interface Product {
  id: number;
  name: string;
  price: number;
  rating: number;
  description: string;
  image: string;
  category: string;
  stock: number;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      let url = 'http://localhost:5000/api/products';
      const params = new URLSearchParams();

      if (selectedCategory !== 'All') {
        params.append('category', selectedCategory);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }

      if (params.toString()) {
        url += '?' + params.toString();
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(`Unable to connect to server. Please make sure the backend server is running on ${API_BASE_URL}`);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', 'Electronics', 'Fashion', 'Home & Kitchen', 'Accessories'];

  return (
    <div className="home-page">
      <Header />
      <main className="main-content">
        <div className="hero-section">
          <h1>ShopZilla Products</h1>
          <p>Browse our complete collection</p>
        </div>

        <div className="filters-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="category-filters">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
              >
                <span>{category}</span>
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading products...</div>
        ) : error ? (
          <div className="error-message" style={{
            padding: '40px',
            textAlign: 'center',
            background: '#fee2e2',
            color: '#991b1b',
            borderRadius: '12px',
            margin: '20px 0'
          }}>
            <h3 style={{ marginBottom: '12px' }}>Connection Error</h3>
            <p>{error}</p>
            <p style={{ marginTop: '12px', fontSize: '14px' }}>
              Run <code style={{ background: '#fff', padding: '4px 8px', borderRadius: '4px' }}>npm run server</code> in a separate terminal to start the backend.
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="no-products">No products found. Try a different category or search term.</div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
