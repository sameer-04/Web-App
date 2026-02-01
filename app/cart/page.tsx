'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import './cart.css';

interface CartItem {
  productId: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
    image: string;
  };
}

export default function Cart() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkAuth();
    if (isLoggedIn) {
      fetchCart();
    }
  }, [isLoggedIn]);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    if (!token) {
      router.push('/login');
    }
  };

  const fetchCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCart(data);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    if (quantity < 1) {
      removeItem(productId);
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/cart/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity })
      });

      if (response.ok) {
        fetchCart();
      }
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  };

  const removeItem = async (productId: number) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/cart/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchCart();
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  if (loading) {
    return (
      <div>
        <Header />
        <div className="container" style={{ padding: '100px 20px', textAlign: 'center' }}>
          <p style={{ color: '#a1a1aa' }}>Loading cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="cart-page">
        <div className="container">
          <h1 className="page-title">Shopping Cart</h1>

          {cart.length === 0 ? (
            <div className="empty-cart">
              <p>Your cart is empty</p>
              <button onClick={() => router.push('/')} className="btn btn-primary">
                Explore Premium Collection
              </button>
            </div>
          ) : (
            <div className="cart-content">
              <div className="cart-items">
                {cart.map((item) => (
                  <div key={item.productId} className="cart-item">
                    <div className="cart-item-image">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="cart-img"
                        loading="lazy"
                      />
                    </div>
                    <div className="cart-item-details">
                      <h3>{item.product.name}</h3>
                      <p className="cart-item-price">₹{item.product.price.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="cart-item-quantity">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="quantity-btn-small"
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="quantity-btn-small"
                      >
                        +
                      </button>
                    </div>
                    <div className="cart-item-total">
                      <p>₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</p>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="remove-btn"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              <div className="cart-summary">
                <div className="summary-card">
                  <h2>Order Summary</h2>
                  <div className="summary-row">
                    <span>Subtotal:</span>
                    <span>₹{total.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="summary-row">
                    <span>Shipping:</span>
                    <span style={{ color: '#10b981' }}>Complimentary</span>
                  </div>
                  <div className="summary-row total-row">
                    <span>Total:</span>
                    <span>₹{total.toLocaleString('en-IN')}</span>
                  </div>
                  <button
                    onClick={() => router.push('/checkout')}
                    className="btn btn-primary checkout-btn"
                  >
                    Complete Purchase
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
