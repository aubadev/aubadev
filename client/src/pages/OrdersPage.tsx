import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Order } from '../types';
import { apiService } from '../services/api';

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await apiService.getOrders();
      setOrders(data);
    } catch (err) {
      setError('Failed to load orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'confirmed':
      case 'processing':
        return 'text-blue-600 bg-blue-100';
      case 'shipped':
        return 'text-green-600 bg-green-100';
      case 'delivered':
        return 'text-green-800 bg-green-200';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Error loading orders</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          onClick={loadOrders}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-8xl mb-6">📦</div>
        <h2 className="text-2xl font-bold text-gray-700 mb-4">No orders yet</h2>
        <p className="text-gray-500 mb-8">Start shopping to create your first order</p>
        <Link
          to="/products"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Order #{order.id.slice(0, 8)}...
                  </h3>
                  <p className="text-sm text-gray-500">
                    Placed on {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    ${order.total_amount.toFixed(2)}
                  </div>
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.payment_status)}`}>
                      Payment: {order.payment_status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.shipping_status)}`}>
                      Shipping: {order.shipping_status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">Order Items</h4>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.product_name || `Product ${item.product_id}`} × {item.quantity}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">Payment Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Cryptocurrency:</span>
                      <span className="font-medium">{order.cryptocurrency}</span>
                    </div>
                    {order.payment_address && (
                      <div className="flex justify-between">
                        <span>Payment Address:</span>
                        <span className="font-mono text-xs">
                          {order.payment_address.slice(0, 16)}...
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Auto-delete:</span>
                      <span className="text-xs text-gray-500">
                        {new Date(order.auto_delete_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  {order.payment_status === 'pending' && (
                    <span className="text-yellow-600">⏳ Waiting for payment...</span>
                  )}
                  {order.payment_status === 'confirmed' && order.shipping_status === 'pending' && (
                    <span className="text-blue-600">📦 Payment confirmed, preparing shipment...</span>
                  )}
                  {order.shipping_status === 'shipped' && (
                    <span className="text-green-600">🚚 Order shipped! Data will be deleted in 24h</span>
                  )}
                </div>

                <div className="flex space-x-2">
                  {order.payment_status === 'pending' && (
                    <Link
                      to={`/payment/${order.id}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      Complete Payment
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-yellow-900 mb-3">🗑️ Automatic Data Deletion</h3>
        <p className="text-yellow-800 text-sm">
          All order data is automatically deleted 24 hours after shipping to protect your privacy. 
          Orders that remain unpaid for more than 24 hours are also automatically deleted.
        </p>
      </div>
    </div>
  );
};

export default OrdersPage;