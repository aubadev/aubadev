import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const CartPage: React.FC = () => {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCart();
  const { user } = useAuth();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="text-gray-400 text-8xl mb-6">🛒</div>
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Start shopping to add items to your cart</p>
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
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <button
          onClick={clearCart}
          className="text-red-600 hover:text-red-800 text-sm font-medium"
        >
          Clear Cart
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="divide-y divide-gray-200">
          {items.map((item) => (
            <div key={item.productId} className="p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  {item.product?.image_url ? (
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <span className="text-gray-400 text-2xl">📦</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {item.product?.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {item.product?.category}
                  </p>
                  <p className="text-lg font-semibold text-green-600 mt-2">
                    ${item.product?.price.toFixed(2)} each
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <label htmlFor={`quantity-${item.productId}`} className="text-sm font-medium text-gray-700">
                      Quantity:
                    </label>
                    <select
                      id={`quantity-${item.productId}`}
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value))}
                      className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Array.from({ length: Math.min(item.product?.stock || 10, 10) }, (_, i) => i + 1).map((num) => (
                        <option key={num} value={num}>
                          {num}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                    </p>
                  </div>

                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-red-600 hover:text-red-800 p-2"
                    title="Remove item"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="text-lg font-semibold text-gray-700">
              Total: ${totalPrice.toFixed(2)}
            </div>
            <div className="space-x-4">
              <Link
                to="/products"
                className="bg-gray-200 text-gray-800 px-6 py-2 rounded hover:bg-gray-300 transition-colors"
              >
                Continue Shopping
              </Link>
              {user ? (
                <Link
                  to="/checkout"
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Proceed to Checkout
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Login to Checkout
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">🔒 Privacy Notice</h3>
        <ul className="text-blue-800 text-sm space-y-1">
          <li>• Your cart data is stored locally in your browser</li>
          <li>• Order information will be automatically deleted after shipping</li>
          <li>• Payment will be processed anonymously via cryptocurrency</li>
          <li>• No personal information is required or stored</li>
        </ul>
      </div>
    </div>
  );
};

export default CartPage;