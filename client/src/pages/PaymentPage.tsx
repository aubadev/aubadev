import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PaymentInfo } from '../types';
import { apiService } from '../services/api';

const PaymentPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [checkingPayment, setCheckingPayment] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (orderId) {
      createPayment();
      // Check payment status every 30 seconds
      const interval = setInterval(() => checkPaymentStatus(), 30000);
      return () => clearInterval(interval);
    }
  }, [orderId]);

  const createPayment = async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      const data = await apiService.createPayment(orderId);
      setPaymentInfo(data);
    } catch (err: any) {
      setError(err.message || 'Failed to create payment');
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (!orderId || checkingPayment) return;

    try {
      setCheckingPayment(true);
      const status = await apiService.getPaymentStatus(orderId);
      setPaymentStatus(status.status);
      
      if (status.status === 'confirmed') {
        // Payment confirmed, redirect to orders after a delay
        setTimeout(() => {
          navigate('/orders');
        }, 3000);
      }
    } catch (err) {
      console.error('Error checking payment status:', err);
    } finally {
      setCheckingPayment(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !paymentInfo) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Payment Error</h3>
        <p className="text-gray-500 mb-4">{error || 'Failed to load payment information'}</p>
        <button
          onClick={() => navigate('/orders')}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          View Orders
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Complete Payment</h1>

      {paymentStatus === 'confirmed' ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <div className="text-green-400 text-8xl mb-6">✅</div>
          <h2 className="text-2xl font-bold text-green-800 mb-4">Payment Confirmed!</h2>
          <p className="text-green-700 mb-6">
            Your payment has been confirmed and your order is being processed.
          </p>
          <button
            onClick={() => navigate('/orders')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            View Order Status
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Instructions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Instructions</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Send exactly this amount:
                </label>
                <div className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
                  <span className="text-2xl font-bold text-blue-600">
                    {paymentInfo.amount} {paymentInfo.cryptocurrency}
                  </span>
                  <button
                    onClick={() => copyToClipboard(paymentInfo.amount.toString())}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  ≈ ${paymentInfo.usdAmount.toFixed(2)} USD
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To this address:
                </label>
                <div className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
                  <span className="font-mono text-sm break-all mr-4">
                    {paymentInfo.paymentAddress}
                  </span>
                  <button
                    onClick={() => copyToClipboard(paymentInfo.paymentAddress)}
                    className="text-sm text-blue-600 hover:text-blue-800 flex-shrink-0"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-yellow-800 mb-2">⚠️ Important</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Send the exact amount shown above</li>
                  <li>• Use only {paymentInfo.cryptocurrency} network</li>
                  <li>• Payment expires in {Math.floor(paymentInfo.expiresIn / 60)} minutes</li>
                  <li>• Do not send from an exchange wallet</li>
                </ul>
              </div>
            </div>
          </div>

          {/* QR Code and Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">QR Code</h2>
            
            <div className="text-center mb-6">
              <div className="bg-gray-100 rounded-lg p-8 mb-4">
                <div className="text-gray-400 text-6xl">📱</div>
                <p className="text-sm text-gray-500 mt-2">
                  Scan with your {paymentInfo.cryptocurrency} wallet
                </p>
              </div>
              <p className="text-xs text-gray-500 break-all">
                {paymentInfo.qrCode}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Payment Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  paymentStatus === 'pending' 
                    ? 'text-yellow-700 bg-yellow-100' 
                    : paymentStatus === 'confirmed'
                    ? 'text-green-700 bg-green-100'
                    : 'text-red-700 bg-red-100'
                }`}>
                  {paymentStatus === 'pending' && '⏳ Waiting for payment'}
                  {paymentStatus === 'confirmed' && '✅ Confirmed'}
                  {paymentStatus === 'failed' && '❌ Failed'}
                </span>
              </div>

              <button
                onClick={checkPaymentStatus}
                disabled={checkingPayment}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {checkingPayment ? 'Checking...' : 'Check Payment Status'}
              </button>
            </div>

            <div className="mt-6 text-xs text-gray-500 text-center">
              <p>Payment status updates automatically every 30 seconds</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">🔒 Anonymous Payment</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-800 text-sm">
          <ul className="space-y-1">
            <li>• No personal information required</li>
            <li>• Cryptocurrency ensures privacy</li>
            <li>• Order data deleted after shipping</li>
          </ul>
          <ul className="space-y-1">
            <li>• No tracking or analytics</li>
            <li>• Secure blockchain transactions</li>
            <li>• Complete transaction anonymity</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;