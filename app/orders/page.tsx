'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { API_BASE_URL } from '@/utils/api';
import './orders.css';

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

export default function Orders() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    fetchOrders();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  };

  const fetchOrders = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div className="container" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="orders-page">
        <div className="container">
          <h1 className="page-title">My Orders</h1>

          {orders.length === 0 ? (
            <div className="empty-orders">
              <p>You haven't placed any orders yet</p>
              <Link href="/" className="btn btn-primary">
                Explore Collection
              </Link>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((order) => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div>
                      <h3>Order #{order.id}</h3>
                      <p className="order-date">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <span className={`status-badge status-${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="order-items-list">
                    {order.items.map((item, index) => (
                      <div key={index} className="order-item-row">
                        <span>{item.product.name} x {item.quantity}</span>
                        <span>₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>

                  <div className="order-footer">
                    <div className="order-info">
                      <p><strong>Shipping:</strong> {order.shippingAddress}</p>
                      <p><strong>Payment:</strong> {order.paymentMethod}</p>
                    </div>
                    <div className="order-total">
                      <strong>Total: ₹{order.total.toLocaleString('en-IN')}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
