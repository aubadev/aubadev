import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { apiService } from '../services/api';
import { Cryptocurrency } from '../types';

const CheckoutPage: React.FC = () => {
  const [cryptocurrencies, setCryptocurrencies] = useState<Record<string, Cryptocurrency>>({});
  const [selectedCrypto, setSelectedCrypto] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    loadCryptocurrencies();
  }, []);

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);

  const loadCryptocurrencies = async () => {
    try {
      const data = await apiService.getCryptocurrencies();
      setCryptocurrencies(data);
      // Set default selection to Bitcoin
      if (data.BTC) {
        setSelectedCrypto('BTC');
      }
    } catch (err) {
      setError('Failed to load payment options');
      console.error(err);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedCrypto) {
      setError('Please select a cryptocurrency');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const orderItems = items.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }));

      const result = await apiService.createOrder(orderItems, selectedCrypto);
      
      // Clear cart and navigate to payment
      clearCart();
      navigate(`/payment/${result.orderId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
          
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between items-center py-2 border-b border-gray-100">
                <div>
                  <h3 className="font-medium text-gray-900">{item.product?.name}</h3>
                  <p className="text-sm text-gray-500">
                    ${item.product?.price.toFixed(2)} × {item.quantity}
                  </p>
                </div>
                <div className="font-semibold text-gray-900">
                  ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
            
            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center text-lg font-bold text-gray-900">
                <span>Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Method</h2>
          
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-4">
              Select your preferred cryptocurrency for payment:
            </p>
            
            <div className="space-y-3">
              {Object.entries(cryptocurrencies).map(([symbol, crypto]) => (
                <label key={symbol} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="cryptocurrency"
                    value={symbol}
                    checked={selectedCrypto === symbol}
                    onChange={(e) => setSelectedCrypto(e.target.value)}
                    className="mr-3 text-blue-600"
                  />
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">
                      {symbol === 'BTC' && '₿'}
                      {symbol === 'ETH' && 'Ξ'}
                      {symbol === 'LTC' && 'Ł'}
                      {symbol === 'DOGE' && 'Ð'}
                      {symbol === 'XMR' && 'ɱ'}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{crypto.name}</div>
                      <div className="text-sm text-gray-500">{crypto.symbol}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
              {error}
            </div>
          )}

          <button
            onClick={handlePlaceOrder}
            disabled={loading || !selectedCrypto}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            {loading ? 'Creating Order...' : 'Place Order'}
          </button>

          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">🔒 Anonymous Checkout</h3>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• No personal information required</li>
              <li>• Cryptocurrency payment only</li>
              <li>• Order data deleted after shipping</li>
              <li>• Complete transaction privacy</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;