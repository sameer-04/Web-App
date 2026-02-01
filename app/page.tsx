'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import { API_BASE_URL } from '@/utils/api';
import '../styles/home.css';

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

export default function Home() {
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
        <div className="hero-section animate-up">
          <div className="hero-badge">Exclusive Collection 2026</div>
          <h1>Define Your Signature <span className="text-gradient">Lifestyle</span></h1>
          <p>Explore a curated selection of premium essentials designed for modern elegance.</p>
        </div>

        <div className="filters-section animate-up" style={{ animationDelay: '0.2s' }}>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search premium products..."
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
          <div className="loading">Refining catalog...</div>
        ) : error ? (
          <div className="error-message card" style={{
            padding: '40px',
            textAlign: 'center',
            margin: '20px auto',
            maxWidth: '600px'
          }}>
            <h3 style={{ marginBottom: '12px', color: 'var(--danger-color)' }}>Connection Interrupted</h3>
            <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
            <p style={{ marginTop: '20px', fontSize: '14px' }}>
              <button onClick={() => window.location.reload()} className="btn btn-outline">Retry Connection</button>
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="no-products animate-fade-in">No items matched your criteria. Try adjusting your search.</div>
        ) : (
          <div className="products-grid animate-up" style={{ animationDelay: '0.4s' }}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
