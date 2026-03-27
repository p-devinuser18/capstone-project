const express = require('express');
const router = express.Router();
let orders = require('../data/orders.json');

// GET /api/orders - Return unique product names sorted alphabetically
router.get('/', (req, res) => {
  const uniqueProducts = [...new Set(orders.map(order => order.productname))].sort();
  res.json(uniqueProducts);
});

// GET /api/orders/:orderid - Return a specific order by orderid
router.get('/:orderid', (req, res) => {
  const order = orders.find(o => o.orderid === req.params.orderid);
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }
  res.json(order);
});

// DELETE /api/orders/:orderid - Delete a specific order by orderid
router.delete('/:orderid', (req, res) => {
  const index = orders.findIndex(o => o.orderid === req.params.orderid);
  if (index === -1) {
    return res.status(404).json({ message: 'Order not found' });
  }
  const deleted = orders.splice(index, 1);
  res.json({ message: 'Order deleted', order: deleted[0] });
});

module.exports = router;
