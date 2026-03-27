const express = require('express');
const router = express.Router();
const products = require('../data/products');

router.get('/search', (req, res) => {
    const { q, category, minPrice, maxPrice } = req.query;

    let filtered = products;

    if (q) {
        const query = q.toLowerCase();
        filtered = filtered.filter(p =>
            p.productName.toLowerCase().includes(query)
        );
    }

    if (category) {
        const cat = category.toLowerCase();
        filtered = filtered.filter(p =>
            p.productCategory.toLowerCase() === cat
        );
    }

    if (minPrice !== undefined) {
        filtered = filtered.filter(p => p.productPrice >= Number(minPrice));
    }

    if (maxPrice !== undefined) {
        filtered = filtered.filter(p => p.productPrice <= Number(maxPrice));
    }

    const response = {
        results: {
            total: filtered.length,
            productsList: filtered.map(p => ({
                product: {
                    id: p.productId,
                    name: p.productName,
                    category: p.productCategory,
                    price: p.productPrice,
                },
            })),
        },
    };

    res.json(response);
});

module.exports = router;
