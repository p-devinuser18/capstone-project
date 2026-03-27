const express = require('express');
const app = express();

const ordersRouter = require('./src/routes/orders');

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Express server' });
});

app.use('/api/orders', ordersRouter);

module.exports = app;
