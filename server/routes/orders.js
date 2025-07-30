const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../database/init');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Create new order
router.post('/', authenticateToken, (req, res) => {
  try {
    const { items, cryptocurrency } = req.body;
    const userId = req.user.userId;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items are required' });
    }

    if (!cryptocurrency) {
      return res.status(400).json({ error: 'Cryptocurrency selection required' });
    }

    const orderId = uuidv4();
    let totalAmount = 0;

    // Validate products and calculate total
    const productIds = items.map(item => item.productId);
    const placeholders = productIds.map(() => '?').join(',');
    
    db.all(
      `SELECT * FROM products WHERE id IN (${placeholders}) AND active = 1`,
      productIds,
      (err, products) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        if (products.length !== items.length) {
          return res.status(400).json({ error: 'Some products not found or inactive' });
        }

        // Calculate total and validate stock
        const orderItems = [];
        for (const item of items) {
          const product = products.find(p => p.id === item.productId);
          if (!product) {
            return res.status(400).json({ error: `Product ${item.productId} not found` });
          }

          if (product.stock < item.quantity) {
            return res.status(400).json({ 
              error: `Insufficient stock for ${product.name}. Available: ${product.stock}` 
            });
          }

          const itemTotal = product.price * item.quantity;
          totalAmount += itemTotal;
          orderItems.push({
            productId: item.productId,
            quantity: item.quantity,
            price: product.price
          });
        }

        // Set auto-delete time (72 hours after creation)
        const autoDeleteAt = new Date();
        autoDeleteAt.setHours(autoDeleteAt.getHours() + parseInt(process.env.ORDER_RETENTION_HOURS || 72));

        // Create order
        db.run(
          `INSERT INTO orders (id, user_id, total_amount, cryptocurrency, auto_delete_at) 
           VALUES (?, ?, ?, ?, ?)`,
          [orderId, userId, totalAmount, cryptocurrency, autoDeleteAt.toISOString()],
          function (err) {
            if (err) {
              console.error('Error creating order:', err);
              return res.status(500).json({ error: 'Failed to create order' });
            }

            // Insert order items
            const itemInsertPromises = orderItems.map(item => {
              return new Promise((resolve, reject) => {
                db.run(
                  'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                  [orderId, item.productId, item.quantity, item.price],
                  (err) => {
                    if (err) reject(err);
                    else resolve();
                  }
                );
              });
            });

            Promise.all(itemInsertPromises)
              .then(() => {
                // Update product stock
                const stockUpdatePromises = orderItems.map(item => {
                  return new Promise((resolve, reject) => {
                    db.run(
                      'UPDATE products SET stock = stock - ? WHERE id = ?',
                      [item.quantity, item.productId],
                      (err) => {
                        if (err) reject(err);
                        else resolve();
                      }
                    );
                  });
                });

                return Promise.all(stockUpdatePromises);
              })
              .then(() => {
                res.status(201).json({
                  orderId,
                  totalAmount,
                  cryptocurrency,
                  status: 'created',
                  message: 'Order created successfully. Proceed to payment.'
                });
              })
              .catch((err) => {
                console.error('Error processing order items:', err);
                res.status(500).json({ error: 'Failed to process order items' });
              });
          }
        );
      }
    );
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's orders
router.get('/', authenticateToken, (req, res) => {
  const userId = req.user.userId;

  db.all(
    `SELECT o.*, GROUP_CONCAT(
      json_object(
        'productId', oi.product_id,
        'quantity', oi.quantity,
        'price', oi.price,
        'productName', p.name
      )
    ) as items
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
    WHERE o.user_id = ?
    GROUP BY o.id
    ORDER BY o.created_at DESC`,
    [userId],
    (err, orders) => {
      if (err) {
        console.error('Error fetching orders:', err);
        return res.status(500).json({ error: 'Failed to fetch orders' });
      }

      // Parse the JSON items
      const formattedOrders = orders.map(order => ({
        ...order,
        items: order.items ? order.items.split(',').map(item => JSON.parse(item)) : []
      }));

      res.json(formattedOrders);
    }
  );
});

// Get specific order
router.get('/:orderId', authenticateToken, (req, res) => {
  const { orderId } = req.params;
  const userId = req.user.userId;

  db.get(
    'SELECT * FROM orders WHERE id = ? AND user_id = ?',
    [orderId, userId],
    (err, order) => {
      if (err) {
        console.error('Error fetching order:', err);
        return res.status(500).json({ error: 'Failed to fetch order' });
      }

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Get order items
      db.all(
        `SELECT oi.*, p.name as product_name 
         FROM order_items oi 
         JOIN products p ON oi.product_id = p.id 
         WHERE oi.order_id = ?`,
        [orderId],
        (err, items) => {
          if (err) {
            console.error('Error fetching order items:', err);
            return res.status(500).json({ error: 'Failed to fetch order items' });
          }

          res.json({
            ...order,
            items
          });
        }
      );
    }
  );
});

module.exports = router;