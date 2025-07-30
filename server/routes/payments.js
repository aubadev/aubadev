const express = require('express');
const crypto = require('crypto');
const { db } = require('../database/init');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Supported cryptocurrencies (mock data for demo)
const SUPPORTED_CRYPTOS = {
  'BTC': { name: 'Bitcoin', symbol: 'BTC', decimals: 8 },
  'ETH': { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
  'LTC': { name: 'Litecoin', symbol: 'LTC', decimals: 8 },
  'DOGE': { name: 'Dogecoin', symbol: 'DOGE', decimals: 8 },
  'XMR': { name: 'Monero', symbol: 'XMR', decimals: 12 }
};

// Mock exchange rates (in a real implementation, fetch from API)
const EXCHANGE_RATES = {
  'BTC': 45000,
  'ETH': 2800,
  'LTC': 90,
  'DOGE': 0.08,
  'XMR': 150
};

// Get supported cryptocurrencies
router.get('/cryptocurrencies', (req, res) => {
  res.json(SUPPORTED_CRYPTOS);
});

// Create payment address for order
router.post('/create-payment', authenticateToken, (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user.userId;

    if (!orderId) {
      return res.status(400).json({ error: 'Order ID required' });
    }

    // Get order details
    db.get(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [orderId, userId],
      (err, order) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        if (!order) {
          return res.status(404).json({ error: 'Order not found' });
        }

        if (order.payment_status !== 'pending') {
          return res.status(400).json({ error: 'Order payment already processed' });
        }

        // Generate mock payment address (in real implementation, use CoinPayments API)
        const paymentAddress = generateMockAddress(order.cryptocurrency);
        
        // Calculate crypto amount based on USD total
        const cryptoAmount = calculateCryptoAmount(order.total_amount, order.cryptocurrency);

        // Update order with payment address
        db.run(
          'UPDATE orders SET payment_address = ? WHERE id = ?',
          [paymentAddress, orderId],
          (err) => {
            if (err) {
              console.error('Error updating order with payment address:', err);
              return res.status(500).json({ error: 'Failed to create payment' });
            }

            res.json({
              orderId,
              paymentAddress,
              cryptocurrency: order.cryptocurrency,
              amount: cryptoAmount,
              usdAmount: order.total_amount,
              expiresIn: 3600, // 1 hour
              qrCode: `${order.cryptocurrency}:${paymentAddress}?amount=${cryptoAmount}`,
              instructions: `Send exactly ${cryptoAmount} ${order.cryptocurrency} to the address above`
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Check payment status (mock implementation)
router.get('/status/:orderId', authenticateToken, (req, res) => {
  const { orderId } = req.params;
  const userId = req.user.userId;

  db.get(
    'SELECT * FROM orders WHERE id = ? AND user_id = ?',
    [orderId, userId],
    (err, order) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Mock payment verification (in real implementation, check CoinPayments API)
      // For demo purposes, randomly mark some payments as confirmed after creation
      if (order.payment_status === 'pending' && order.payment_address) {
        const shouldConfirm = Math.random() > 0.7; // 30% chance of confirmation
        
        if (shouldConfirm) {
          db.run(
            'UPDATE orders SET payment_status = ? WHERE id = ?',
            ['confirmed', orderId],
            (err) => {
              if (err) {
                console.error('Error updating payment status:', err);
              }
            }
          );
          
          return res.json({
            orderId,
            status: 'confirmed',
            confirmations: 3,
            message: 'Payment confirmed! Your order is being processed.'
          });
        }
      }

      res.json({
        orderId,
        status: order.payment_status,
        confirmations: order.payment_status === 'confirmed' ? 6 : 0,
        paymentAddress: order.payment_address
      });
    }
  );
});

// Webhook endpoint for payment notifications (mock)
router.post('/webhook', (req, res) => {
  try {
    // In a real implementation, verify the webhook signature
    const { order_id, status, confirmations } = req.body;

    if (status === 'confirmed' && confirmations >= 3) {
      db.run(
        'UPDATE orders SET payment_status = ? WHERE id = ?',
        ['confirmed', order_id],
        (err) => {
          if (err) {
            console.error('Error updating payment status via webhook:', err);
            return res.status(500).json({ error: 'Failed to update payment status' });
          }

          console.log(`Payment confirmed for order ${order_id}`);
          res.json({ status: 'ok' });
        }
      );
    } else {
      res.json({ status: 'ok' });
    }
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Helper functions
function generateMockAddress(cryptocurrency) {
  const prefixes = {
    'BTC': ['1', '3', 'bc1'],
    'ETH': '0x',
    'LTC': ['L', 'M', 'ltc1'],
    'DOGE': 'D',
    'XMR': '4'
  };

  const prefix = Array.isArray(prefixes[cryptocurrency]) 
    ? prefixes[cryptocurrency][Math.floor(Math.random() * prefixes[cryptocurrency].length)]
    : prefixes[cryptocurrency];

  const randomPart = crypto.randomBytes(16).toString('hex');
  return `${prefix}${randomPart}`;
}

function calculateCryptoAmount(usdAmount, cryptocurrency) {
  const rate = EXCHANGE_RATES[cryptocurrency];
  if (!rate) {
    throw new Error(`Unsupported cryptocurrency: ${cryptocurrency}`);
  }

  const cryptoAmount = usdAmount / rate;
  const decimals = SUPPORTED_CRYPTOS[cryptocurrency].decimals;
  
  return parseFloat(cryptoAmount.toFixed(Math.min(decimals, 8)));
}

module.exports = router;