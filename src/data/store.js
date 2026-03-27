const seedProducts = require('./products.json');
const seedOrders = require('./orders.json');
const seedUsers = require('./users.json');

const products = [...seedProducts];
const orders = [...seedOrders];
const users = [...seedUsers];

module.exports = { products, orders, users };
