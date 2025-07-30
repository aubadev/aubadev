const cron = require('node-cron');
const { db } = require('../database/init');

// Cleanup job that runs every hour to delete expired data
const startCleanupJob = () => {
  console.log('🧹 Starting automatic data cleanup service');
  
  // Run every hour
  cron.schedule('0 * * * *', () => {
    performCleanup();
  });

  // Also run cleanup on startup
  setTimeout(performCleanup, 5000);
};

const performCleanup = () => {
  const now = new Date().toISOString();
  
  console.log('🧹 Running data cleanup...');

  // Delete expired orders and their items
  db.run(`
    DELETE FROM orders 
    WHERE (
      (shipping_status = 'shipped' AND shipped_at < datetime('now', '-24 hours'))
      OR 
      (payment_status = 'pending' AND created_at < datetime('now', '-24 hours'))
      OR
      (auto_delete_at IS NOT NULL AND auto_delete_at < datetime('now'))
    )
  `, (err) => {
    if (err) {
      console.error('Error during order cleanup:', err);
    } else {
      console.log('✓ Expired orders cleaned up');
    }
  });

  // Delete expired session tokens
  db.run(`
    DELETE FROM sessions 
    WHERE expires_at < datetime('now')
  `, (err) => {
    if (err) {
      console.error('Error during session cleanup:', err);
    } else {
      console.log('✓ Expired sessions cleaned up');
    }
  });

  // Log cleanup completion
  console.log(`🧹 Cleanup completed at ${new Date().toISOString()}`);
};

// Manual cleanup function for testing
const manualCleanup = () => {
  return new Promise((resolve, reject) => {
    performCleanup();
    setTimeout(() => {
      resolve();
    }, 1000);
  });
};

// Delete specific order (called after shipping confirmation)
const deleteOrderData = (orderId) => {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM orders WHERE id = ?', [orderId], function(err) {
      if (err) {
        console.error(`Error deleting order ${orderId}:`, err);
        reject(err);
      } else {
        console.log(`✓ Order ${orderId} data permanently deleted`);
        resolve();
      }
    });
  });
};

// Mark order as shipped and schedule for deletion
const markOrderShipped = (orderId) => {
  return new Promise((resolve, reject) => {
    const shippedAt = new Date().toISOString();
    
    db.run(
      'UPDATE orders SET shipping_status = ?, shipped_at = ? WHERE id = ?',
      ['shipped', shippedAt, orderId],
      function(err) {
        if (err) {
          console.error(`Error marking order ${orderId} as shipped:`, err);
          reject(err);
        } else {
          console.log(`✓ Order ${orderId} marked as shipped - will be auto-deleted in 24 hours`);
          resolve();
        }
      }
    );
  });
};

module.exports = {
  startCleanupJob,
  manualCleanup,
  deleteOrderData,
  markOrderShipped
};