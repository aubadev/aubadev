import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🔒 Anonymous Crypto Shop
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Privacy-focused shopping with cryptocurrency payments only
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">
            🛡️ Privacy Features
          </h2>
          <ul className="text-blue-800 space-y-2">
            <li>• Minimal user data - only username and password required</li>
            <li>• All order data automatically deleted after shipping</li>
            <li>• Cryptocurrency payments only - no personal payment info stored</li>
            <li>• No tracking or analytics - complete anonymity</li>
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-4xl mb-4">🛒</div>
          <h3 className="text-xl font-semibold mb-3">Browse Products</h3>
          <p className="text-gray-600 mb-4">
            Discover privacy-focused digital products and services
          </p>
          <Link
            to="/products"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Shop Now
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-4xl mb-4">₿</div>
          <h3 className="text-xl font-semibold mb-3">Crypto Payments</h3>
          <p className="text-gray-600 mb-4">
            Pay with Bitcoin, Ethereum, Litecoin, Dogecoin, or Monero
          </p>
          <div className="text-sm text-gray-500">
            Secure • Anonymous • Fast
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-4xl mb-4">🗑️</div>
          <h3 className="text-xl font-semibold mb-3">Auto Data Deletion</h3>
          <p className="text-gray-600 mb-4">
            All personal data automatically deleted after order completion
          </p>
          <div className="text-sm text-gray-500">
            Maximum Privacy Guaranteed
          </div>
        </div>
      </div>

      <div className="mt-12 bg-gray-100 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Supported Cryptocurrencies</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
          <div className="bg-white rounded-lg p-4">
            <div className="text-2xl mb-2">₿</div>
            <div className="font-semibold">Bitcoin</div>
            <div className="text-sm text-gray-600">BTC</div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-2xl mb-2">Ξ</div>
            <div className="font-semibold">Ethereum</div>
            <div className="text-sm text-gray-600">ETH</div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-2xl mb-2">Ł</div>
            <div className="font-semibold">Litecoin</div>
            <div className="text-sm text-gray-600">LTC</div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-2xl mb-2">Ð</div>
            <div className="font-semibold">Dogecoin</div>
            <div className="text-sm text-gray-600">DOGE</div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-2xl mb-2">ɱ</div>
            <div className="font-semibold">Monero</div>
            <div className="text-sm text-gray-600">XMR</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;