'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import '../styles/product-card.css';
import { API_BASE_URL } from '@/utils/api';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  stock: number;
  rating: number;
}

export default function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const [showQty, setShowQty] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const addToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1
        })
      });

      if (response.ok) {
        alert('Added to cart!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart');
    }
  };

  const handleBuyNowClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowQty(true);
  };

  const confirmBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      // First clear then add? No, standard logic is just add and go to checkout
      const response = await fetch('http://localhost:5000/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: quantity
        })
      });

      if (response.ok) {
        router.push('/checkout');
      }
    } catch (error) {
      console.error('Error during buy now:', error);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="product-rating">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={i < Math.floor(rating) ? 'star filled' : 'star'}>
            ★
          </span>
        ))}
        <span className="rating-value">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="product-card" onClick={() => !showQty && router.push(`/products/${product.id}`)}>
      <div className="product-image">
        <img
          src={product.image}
          alt={product.name}
          className="product-img"
          loading="lazy"
        />
      </div>
      <div className="product-info">
        <div className="product-meta">
          <span className="product-category">{product.category}</span>
          {renderStars(product.rating || 4.5)}
        </div>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.description}</p>
        <div className="product-footer">
          <span className="product-price">₹{product.price.toLocaleString('en-IN')}</span>
          <div className="product-actions">
            {!showQty ? (
              <>
                <button className="btn-add-cart" onClick={addToCart}>
                  Add to Cart
                </button>
                <button className="btn-buy-now" onClick={handleBuyNowClick}>
                  Buy Now
                </button>
              </>
            ) : (
              <div className="quantity-selection-wrapper" onClick={(e) => e.stopPropagation()}>
                <div className="qty-controls">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                  <span>{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)}>+</button>
                </div>
                <button className="btn-confirm-buy" onClick={confirmBuyNow}>
                  Checkout Now
                </button>
                <button className="btn-cancel-qty" onClick={() => setShowQty(false)}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
