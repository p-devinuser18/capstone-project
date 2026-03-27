const Product = require('../models/Product');

const products = [
    new Product(1, 'Wireless Mouse', 'Electronics', 29.99),
    new Product(2, 'Bluetooth Headphones', 'Electronics', 79.99),
    new Product(3, 'Running Shoes', 'Clothing', 119.99),
    new Product(4, 'Denim Jacket', 'Clothing', 89.99),
    new Product(5, 'JavaScript: The Good Parts', 'Books', 25.49),
    new Product(6, 'Stainless Steel Water Bottle', 'Kitchen', 18.99),
];

module.exports = products;
