const seedProducts = require('./products.json');
const seedOrders = require('./orders.json');

const products = [...seedProducts];
const orders = [...seedOrders];

module.exports = { products, orders };
