const express = require('express');
const path = require('path');
const router = express.Router();

router.get('/', (req, res) => {
  const orders = require(path.join(__dirname, '..', 'data', 'orders.json'));
  const totalOrders = orders.length;

  res.json({
    totalOrders,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
