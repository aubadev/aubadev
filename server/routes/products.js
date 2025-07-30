const express = require('express');
const { db } = require('../database/init');

const router = express.Router();

// Get all products
router.get('/', (req, res) => {
  const { category, search } = req.query;
  
  let query = 'SELECT * FROM products WHERE active = 1';
  const params = [];

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  if (search) {
    query += ' AND (name LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY created_at DESC';

  db.all(query, params, (err, products) => {
    if (err) {
      console.error('Error fetching products:', err);
      return res.status(500).json({ error: 'Failed to fetch products' });
    }

    res.json(products);
  });
});

// Get single product
router.get('/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM products WHERE id = ? AND active = 1', [id], (err, product) => {
    if (err) {
      console.error('Error fetching product:', err);
      return res.status(500).json({ error: 'Failed to fetch product' });
    }

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  });
});

// Get product categories
router.get('/categories/list', (req, res) => {
  db.all(
    'SELECT DISTINCT category FROM products WHERE active = 1 AND category IS NOT NULL',
    [],
    (err, rows) => {
      if (err) {
        console.error('Error fetching categories:', err);
        return res.status(500).json({ error: 'Failed to fetch categories' });
      }

      const categories = rows.map(row => row.category);
      res.json(categories);
    }
  );
});

module.exports = router;