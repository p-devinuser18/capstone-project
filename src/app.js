const express = require('express');
const dashboardRouter = require('./routes/dashboard');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Express server' });
});

app.use('/api/dashboard', dashboardRouter);

module.exports = app;
