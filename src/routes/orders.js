const express = require('express');
const router = express.Router();
const { orders, products } = require('../data/store');

let nextId = Math.max(...orders.map((o) => o.id)) + 1;

router.get('/', (req, res) => {
  res.json(orders);
});

router.post('/', (req, res) => {
  const { productId, quantity, totalPrice, status } = req.body;

  if (productId == null || quantity == null || totalPrice == null || status == null) {
    return res.status(400).json({ error: 'Missing required fields: productId, quantity, totalPrice, status' });
  }

  if (typeof quantity !== 'number' || quantity < 1) {
    return res.status(400).json({ error: 'Quantity must be a number greater than or equal to 1' });
  }

  const product = products.find((p) => p.id === productId);
  if (!product) {
    return res.status(400).json({ error: `Product with id ${productId} not found` });
  }

  if (quantity > product.stock) {
    return res.status(400).json({ error: `Order quantity (${quantity}) exceeds available product stock (${product.stock})` });
  }

  const validStatuses = ['pending', 'shipped', 'delivered'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  const order = {
    id: nextId++,
    productId,
    quantity,
    totalPrice,
    status,
    createdAt: new Date().toISOString()
  };

  orders.push(order);
  res.status(201).json(order);
});

router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = orders.findIndex((o) => o.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const { productId, quantity, totalPrice, status } = req.body;

  if (quantity != null && (typeof quantity !== 'number' || quantity < 1)) {
    return res.status(400).json({ error: 'Quantity must be a number greater than or equal to 1' });
  }

  if (quantity != null) {
    const resolvedProductId = productId != null ? productId : orders[index].productId;
    const product = products.find((p) => p.id === resolvedProductId);
    if (product && quantity > product.stock) {
      return res.status(400).json({ error: `Order quantity (${quantity}) exceeds available product stock (${product.stock})` });
    }
  }

  if (status != null) {
    const validStatuses = ['pending', 'shipped', 'delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }
  }

  if (productId != null) orders[index].productId = productId;
  if (quantity != null) orders[index].quantity = quantity;
  if (totalPrice != null) orders[index].totalPrice = totalPrice;
  if (status != null) orders[index].status = status;

  res.json(orders[index]);
});

router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = orders.findIndex((o) => o.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const deleted = orders.splice(index, 1)[0];
  res.json(deleted);
});

module.exports = router;
