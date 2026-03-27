const express = require('express');
const router = express.Router();
const products = require('../data/products');

/**
 * GET /api/search
 * Search and filter products from the catalog.
 *
 * @queryParam {string}  [q]        - Case-insensitive partial match on product name
 * @queryParam {string}  [category] - Case-insensitive exact match on product category
 * @queryParam {number}  [minPrice] - Minimum price filter (inclusive)
 * @queryParam {number}  [maxPrice] - Maximum price filter (inclusive)
 * @queryParam {number}  [page=1]   - Page number for pagination
 * @queryParam {number}  [limit=20] - Number of results per page (max 100)
 *
 * @returns {object} JSON response with matching products
 */
router.get('/search', (req, res) => {
    const { q, category, minPrice, maxPrice, page, limit } = req.query;

    // Validate numeric parameters
    if (minPrice !== undefined && minPrice !== '' && isNaN(Number(minPrice))) {
        return res.status(400).json({ error: 'minPrice must be a valid number' });
    }
    if (maxPrice !== undefined && maxPrice !== '' && isNaN(Number(maxPrice))) {
        return res.status(400).json({ error: 'maxPrice must be a valid number' });
    }
    if (page !== undefined && (isNaN(Number(page)) || Number(page) < 1 || !Number.isInteger(Number(page)))) {
        return res.status(400).json({ error: 'page must be a positive integer' });
    }
    if (limit !== undefined && (isNaN(Number(limit)) || Number(limit) < 1 || !Number.isInteger(Number(limit)))) {
        return res.status(400).json({ error: 'limit must be a positive integer' });
    }

    const parsedMinPrice = minPrice !== undefined && minPrice !== '' ? Number(minPrice) : null;
    const parsedMaxPrice = maxPrice !== undefined && maxPrice !== '' ? Number(maxPrice) : null;
    const queryLower = q ? q.toLowerCase() : null;
    const categoryLower = category ? category.toLowerCase() : null;

    // Single-pass filtering
    const filtered = products.filter(p => {
        if (queryLower && !p.productName.toLowerCase().includes(queryLower)) {
            return false;
        }
        if (categoryLower && p.productCategory.toLowerCase() !== categoryLower) {
            return false;
        }
        if (parsedMinPrice !== null && p.productPrice < parsedMinPrice) {
            return false;
        }
        if (parsedMaxPrice !== null && p.productPrice > parsedMaxPrice) {
            return false;
        }
        return true;
    });

    // Pagination
    const pageNum = page ? Number(page) : 1;
    const limitNum = Math.min(limit ? Number(limit) : 20, 100);
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedResults = filtered.slice(startIndex, startIndex + limitNum);

    const response = {
        results: {
            total: filtered.length,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(filtered.length / limitNum),
            productsList: paginatedResults.map(p => ({
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
