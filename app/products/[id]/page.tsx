'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { API_BASE_URL } from '@/utils/api';
import '../[id]/product-detail.css';

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

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchProduct();
  }, [params.id]);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/products/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: product?.id,
          quantity: quantity
        })
      });

      if (response.ok) {
        alert('Product added to cart!');
        router.push('/cart');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div className="container" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <p>Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div>
        <Header />
        <div className="container" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <p>Product not found</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="product-detail-page">
        <div className="container">
          <div className="product-detail-content">
            <div className="product-image-section">
              <div className="product-image-large">
                <img
                  src={product.image}
                  alt={product.name}
                  className="product-detail-img"
                  loading="lazy"
                />
              </div>
            </div>
            <div className="product-details-section">
              <span className="product-category-badge">{product.category}</span>
              <h1>{product.name}</h1>
              <p className="product-price-large">${product.price.toFixed(2)}</p>
              <p className="product-description-full">{product.description}</p>

              <div className="stock-info">
                <span className={product.stock > 10 ? 'in-stock' : 'low-stock'}>
                  {product.stock > 10 ? 'In Stock' : `Only ${product.stock} left`}
                </span>
              </div>

              <div className="quantity-selector">
                <label>Quantity:</label>
                <div className="quantity-controls">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="quantity-btn"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                    min="1"
                    max={product.stock}
                    className="quantity-input"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="quantity-btn"
                  >
                    +
                  </button>
                </div>
              </div>

              <button onClick={addToCart} className="btn btn-primary add-to-cart-btn">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
