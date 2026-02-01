'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { API_BASE_URL } from '@/utils/api';
import './checkout.css';

interface CartItem {
  productId: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
  };
}

export default function Checkout() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    country: '',
    paymentMethod: 'Credit Card'
  });

  useEffect(() => {
    checkAuth();
    fetchCart();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
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
        if (data.length === 0) {
          router.push('/cart');
        }
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/cart/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity: newQuantity })
      });

      if (response.ok) {
        setCart(cart.map(item =>
          item.productId === productId ? { ...item, quantity: newQuantity } : item
        ));
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const removeItem = async (productId: number) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/cart/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const newCart = cart.filter(item => item.productId !== productId);
        setCart(newCart);
        if (newCart.length === 0) {
          router.push('/cart');
        }
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const token = localStorage.getItem('token');
    const shippingAddress = `${formData.address}, ${formData.city}, ${formData.zipCode}, ${formData.country}`;

    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          shippingAddress,
          paymentMethod: formData.paymentMethod,
          phone: formData.phone
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Order confirmed! A confirmation message has been sent to ${formData.phone}`);
        router.push(`/orders/${data.order.id}`);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  if (loading) {
    return (
      <div>
        <Header />
        <div className="container" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="checkout-page">
        <div className="container">
          <h1 className="page-title">Checkout</h1>

          <div className="checkout-content">
            <form onSubmit={handleSubmit} className="checkout-form">
              <h2>Shipping Information</h2>

              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Zip Code</label>
                  <input
                    type="text"
                    required
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  required
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                />
              </div>

              <h2 style={{ marginTop: '40px' }}>Payment Method</h2>
              <div className="form-group">
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                >
                  <option value="Credit Card">Credit Card</option>
                  <option value="UPI / QR Code">UPI / QR Code</option>
                  <option value="Net Banking">Net Banking</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary submit-order-btn"
              >
                {submitting ? 'Processing Transaction...' : 'Confirm Order'}
              </button>
            </form>

            <div className="order-summary">
              <h2>Order Summary</h2>
              <div className="order-items">
                {cart.map((item) => (
                  <div key={item.productId} className="order-item">
                    <div className="item-details">
                      <div className="item-header">
                        <h4 style={{ color: '#fff' }}>{item.product.name}</h4>
                        <button
                          type="button"
                          className="item-remove-btn"
                          onClick={() => removeItem(item.productId)}
                          title="Remove item"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
                          </svg>
                        </button>
                      </div>
                      <div className="summary-qty-controls">
                        <span>Quantity: </span>
                        <button type="button" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>-</button>
                        <span className="qty-val">{item.quantity}</span>
                        <button type="button" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</button>
                      </div>
                    </div>
                    <p className="order-item-price">
                      ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                    </p>
                  </div>
                ))}
              </div>
              <div className="order-total">
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
                  <span style={{ fontSize: '24px' }}>₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
