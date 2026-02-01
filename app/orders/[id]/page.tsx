'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { API_BASE_URL } from '@/utils/api';
import './order-detail.css';

interface Order {
  id: number;
  items: Array<{
    productId: number;
    quantity: number;
    product: {
      id: number;
      name: string;
      price: number;
    };
  }>;
  total: number;
  status: string;
  shippingAddress: string;
  paymentMethod: string;
  createdAt: string;
}

export default function OrderDetail() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    fetchOrder();
  }, [params.id]);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  };

  const fetchOrder = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/orders/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setOrder(data);
      } else {
        router.push('/orders');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      router.push('/orders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div className="container" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <p>Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div>
        <Header />
        <div className="container" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <p>Order not found</p>
          <Link href="/orders" className="btn btn-primary" style={{ marginTop: '20px' }}>
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="order-detail-page">
        <div className="container">
          <Link href="/orders" className="back-link">← Back to Orders</Link>

          <div className="order-detail-card">
            <div className="order-detail-header">
              <div>
                <h1>Order #{order.id}</h1>
                <p className="order-date">
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <span className={`status-badge status-${order.status.toLowerCase()}`}>
                {order.status}
              </span>
            </div>

            <div className="order-detail-section">
              <h2>Order Items</h2>
              <div className="order-items-table">
                {order.items.map((item, index) => (
                  <div key={index} className="order-item-row">
                    <div className="item-info">
                      <h4 style={{ color: 'white' }}>{item.product.name}</h4>
                      <p style={{ color: '#a1a1aa' }}>Quantity: {item.quantity}</p>
                    </div>
                    <p className="item-price" style={{ color: 'white' }}>
                      ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-detail-grid">
              <div className="order-detail-section">
                <h2>Shipping Address</h2>
                <p style={{ color: '#a1a1aa' }}>{order.shippingAddress}</p>
              </div>

              <div className="order-detail-section">
                <h2>Payment Method</h2>
                <p style={{ color: '#a1a1aa' }}>{order.paymentMethod}</p>
              </div>
            </div>

            <div className="order-total-section">
              <div className="total-row">
                <span style={{ color: 'white' }}>Total:</span>
                <span className="total-amount">₹{order.total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
