const express = require('express');
const app = express();

const productsRouter = require('./routes/products');
const ordersRouter = require('./routes/orders');

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Express server' });
});

app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);

module.exports = app;
