const express = require('express');
const router = express.Router();
const { users, orders } = require('../data/store');

let nextId = Math.max(...users.map((u) => u.id)) + 1;

router.get('/', (req, res) => {
  res.json(users);
});

router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const user = users.find((u) => u.id === id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json(user);
});

router.get('/:id/orders', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const user = users.find((u) => u.id === id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const userOrders = orders.filter((o) => o.userId === id);
  res.json(userOrders);
});

router.post('/', (req, res) => {
  const { name, email } = req.body;

  if (name == null || email == null) {
    return res.status(400).json({ error: 'Missing required fields: name, email' });
  }

  if (typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'Name must be a non-empty string' });
  }

  if (typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'Email must be a valid email address' });
  }

  const existing = users.find((u) => u.email === email);
  if (existing) {
    return res.status(400).json({ error: 'A user with this email already exists' });
  }

  const user = {
    id: nextId++,
    name: name.trim(),
    email: email.trim(),
    createdAt: new Date().toISOString()
  };

  users.push(user);
  res.status(201).json(user);
});

router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = users.findIndex((u) => u.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { name, email } = req.body;

  if (name != null && (typeof name !== 'string' || name.trim() === '')) {
    return res.status(400).json({ error: 'Name must be a non-empty string' });
  }

  if (email != null) {
    if (typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Email must be a valid email address' });
    }
    const existing = users.find((u) => u.email === email && u.id !== id);
    if (existing) {
      return res.status(400).json({ error: 'A user with this email already exists' });
    }
  }

  if (name != null) users[index].name = name.trim();
  if (email != null) users[index].email = email.trim();

  res.json(users[index]);
});

router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = users.findIndex((u) => u.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  const deleted = users.splice(index, 1)[0];
  res.json(deleted);
});

module.exports = router;
