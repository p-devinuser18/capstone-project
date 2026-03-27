const express = require('express');
const router = express.Router();
const { products } = require('../data/store');

let nextId = Math.max(...products.map((p) => p.id)) + 1;

router.get('/', (req, res) => {
  res.json(products);
});

router.post('/', (req, res) => {
  const { name, price, stock } = req.body;

  if (name == null || price == null || stock == null) {
    return res.status(400).json({ error: 'Missing required fields: name, price, stock' });
  }

  if (typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'Name must be a non-empty string' });
  }

  if (typeof price !== 'number' || price <= 0) {
    return res.status(400).json({ error: 'Price must be a number greater than 0' });
  }

  if (typeof stock !== 'number' || stock < 0 || !Number.isInteger(stock)) {
    return res.status(400).json({ error: 'Stock must be a non-negative integer' });
  }

  const product = {
    id: nextId++,
    name: name.trim(),
    price,
    stock
  };

  products.push(product);
  res.status(201).json(product);
});

router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = products.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const { name, price, stock } = req.body;

  if (name != null && (typeof name !== 'string' || name.trim() === '')) {
    return res.status(400).json({ error: 'Name must be a non-empty string' });
  }

  if (price != null && (typeof price !== 'number' || price <= 0)) {
    return res.status(400).json({ error: 'Price must be a number greater than 0' });
  }

  if (stock != null && (typeof stock !== 'number' || stock < 0 || !Number.isInteger(stock))) {
    return res.status(400).json({ error: 'Stock must be a non-negative integer' });
  }

  if (name != null) products[index].name = name.trim();
  if (price != null) products[index].price = price;
  if (stock != null) products[index].stock = stock;

  res.json(products[index]);
});

router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = products.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const deleted = products.splice(index, 1)[0];
  res.json(deleted);
});

module.exports = router;
