const request = require('supertest');
const app = require('../server');

describe('GET /api/search', () => {

    // ==========================================
    // Response Structure Tests
    // ==========================================

    describe('Response Structure', () => {
        it('should return 200 status code', async () => {
            const res = await request(app).get('/api/search');
            expect(res.statusCode).toBe(200);
        });

        it('should return JSON content type', async () => {
            const res = await request(app).get('/api/search');
            expect(res.headers['content-type']).toMatch(/json/);
        });

        it('should have results object in response', async () => {
            const res = await request(app).get('/api/search');
            expect(res.body).toHaveProperty('results');
        });

        it('should have total, page, limit, totalPages and productsList inside results', async () => {
            const res = await request(app).get('/api/search');
            expect(res.body.results).toHaveProperty('total');
            expect(res.body.results).toHaveProperty('page');
            expect(res.body.results).toHaveProperty('limit');
            expect(res.body.results).toHaveProperty('totalPages');
            expect(res.body.results).toHaveProperty('productsList');
        });

        it('should have correct product shape inside productsList', async () => {
            const res = await request(app).get('/api/search');
            const firstItem = res.body.results.productsList[0];
            expect(firstItem).toHaveProperty('product');
            expect(firstItem.product).toHaveProperty('id');
            expect(firstItem.product).toHaveProperty('name');
            expect(firstItem.product).toHaveProperty('category');
            expect(firstItem.product).toHaveProperty('price');
        });

        it('should have total matching productsList length when not paginated', async () => {
            const res = await request(app).get('/api/search');
            expect(res.body.results.total).toBe(res.body.results.productsList.length);
        });

        it('should have default pagination values', async () => {
            const res = await request(app).get('/api/search');
            expect(res.body.results.page).toBe(1);
            expect(res.body.results.limit).toBe(20);
            expect(res.body.results.totalPages).toBe(1);
        });
    });

    // ==========================================
    // No Filters (Return All Products)
    // ==========================================

    describe('No Filters', () => {
        it('should return all 6 products when no query params are provided', async () => {
            const res = await request(app).get('/api/search');
            expect(res.body.results.total).toBe(6);
            expect(res.body.results.productsList).toHaveLength(6);
        });

        it('should return products in correct order (by id)', async () => {
            const res = await request(app).get('/api/search');
            const ids = res.body.results.productsList.map(item => item.product.id);
            expect(ids).toEqual([1, 2, 3, 4, 5, 6]);
        });

        it('should return correct data for each product', async () => {
            const res = await request(app).get('/api/search');
            const products = res.body.results.productsList.map(item => item.product);

            expect(products[0]).toEqual({ id: 1, name: 'Wireless Mouse', category: 'Electronics', price: 29.99 });
            expect(products[1]).toEqual({ id: 2, name: 'Bluetooth Headphones', category: 'Electronics', price: 79.99 });
            expect(products[2]).toEqual({ id: 3, name: 'Running Shoes', category: 'Clothing', price: 119.99 });
            expect(products[3]).toEqual({ id: 4, name: 'Denim Jacket', category: 'Clothing', price: 89.99 });
            expect(products[4]).toEqual({ id: 5, name: 'JavaScript: The Good Parts', category: 'Books', price: 25.49 });
            expect(products[5]).toEqual({ id: 6, name: 'Stainless Steel Water Bottle', category: 'Kitchen', price: 18.99 });
        });
    });

    // ==========================================
    // Search by Name (q parameter)
    // ==========================================

    describe('Filter by q (product name)', () => {
        it('should return matching product for exact name match', async () => {
            const res = await request(app).get('/api/search?q=Wireless Mouse');
            expect(res.body.results.total).toBe(1);
            expect(res.body.results.productsList[0].product.name).toBe('Wireless Mouse');
        });

        it('should return matching product for partial name match', async () => {
            const res = await request(app).get('/api/search?q=wireless');
            expect(res.body.results.total).toBe(1);
            expect(res.body.results.productsList[0].product.name).toBe('Wireless Mouse');
        });

        it('should be case-insensitive', async () => {
            const res = await request(app).get('/api/search?q=WIRELESS');
            expect(res.body.results.total).toBe(1);
            expect(res.body.results.productsList[0].product.name).toBe('Wireless Mouse');
        });

        it('should be case-insensitive with mixed case', async () => {
            const res = await request(app).get('/api/search?q=wIrElEsS');
            expect(res.body.results.total).toBe(1);
            expect(res.body.results.productsList[0].product.name).toBe('Wireless Mouse');
        });

        it('should return multiple products matching partial name', async () => {
            const res = await request(app).get('/api/search?q=blue');
            expect(res.body.results.total).toBe(1);
            expect(res.body.results.productsList[0].product.name).toBe('Bluetooth Headphones');
        });

        it('should match substring anywhere in name', async () => {
            const res = await request(app).get('/api/search?q=shoes');
            expect(res.body.results.total).toBe(1);
            expect(res.body.results.productsList[0].product.name).toBe('Running Shoes');
        });

        it('should return empty results for non-matching query', async () => {
            const res = await request(app).get('/api/search?q=nonexistent');
            expect(res.body.results.total).toBe(0);
            expect(res.body.results.productsList).toEqual([]);
        });

        it('should return all products when q is empty string', async () => {
            const res = await request(app).get('/api/search?q=');
            expect(res.body.results.total).toBe(6);
        });

        it('should match products with special characters in name', async () => {
            const res = await request(app).get('/api/search?q=JavaScript');
            expect(res.body.results.total).toBe(1);
            expect(res.body.results.productsList[0].product.name).toBe('JavaScript: The Good Parts');
        });

        it('should match multiple products with common substring', async () => {
            const res = await request(app).get('/api/search?q=e');
            expect(res.body.results.total).toBeGreaterThan(1);
        });

        it('should handle single character search', async () => {
            const res = await request(app).get('/api/search?q=j');
            const names = res.body.results.productsList.map(item => item.product.name);
            names.forEach(name => {
                expect(name.toLowerCase()).toContain('j');
            });
        });
    });

    // ==========================================
    // Filter by Category
    // ==========================================

    describe('Filter by category', () => {
        it('should return all Electronics products', async () => {
            const res = await request(app).get('/api/search?category=Electronics');
            expect(res.body.results.total).toBe(2);
            res.body.results.productsList.forEach(item => {
                expect(item.product.category).toBe('Electronics');
            });
        });

        it('should return all Clothing products', async () => {
            const res = await request(app).get('/api/search?category=Clothing');
            expect(res.body.results.total).toBe(2);
            res.body.results.productsList.forEach(item => {
                expect(item.product.category).toBe('Clothing');
            });
        });

        it('should return all Books products', async () => {
            const res = await request(app).get('/api/search?category=Books');
            expect(res.body.results.total).toBe(1);
            expect(res.body.results.productsList[0].product.name).toBe('JavaScript: The Good Parts');
        });

        it('should return all Kitchen products', async () => {
            const res = await request(app).get('/api/search?category=Kitchen');
            expect(res.body.results.total).toBe(1);
            expect(res.body.results.productsList[0].product.name).toBe('Stainless Steel Water Bottle');
        });

        it('should be case-insensitive for category', async () => {
            const res = await request(app).get('/api/search?category=electronics');
            expect(res.body.results.total).toBe(2);
            res.body.results.productsList.forEach(item => {
                expect(item.product.category).toBe('Electronics');
            });
        });

        it('should be case-insensitive with uppercase category', async () => {
            const res = await request(app).get('/api/search?category=CLOTHING');
            expect(res.body.results.total).toBe(2);
        });

        it('should return empty results for non-existing category', async () => {
            const res = await request(app).get('/api/search?category=Toys');
            expect(res.body.results.total).toBe(0);
            expect(res.body.results.productsList).toEqual([]);
        });

        it('should return all products when category is empty string', async () => {
            const res = await request(app).get('/api/search?category=');
            expect(res.body.results.total).toBe(6);
        });

        it('should do exact match not partial match on category', async () => {
            const res = await request(app).get('/api/search?category=Elect');
            expect(res.body.results.total).toBe(0);
        });
    });

    // ==========================================
    // Filter by Price Range
    // ==========================================

    describe('Filter by minPrice', () => {
        it('should return products with price >= minPrice', async () => {
            const res = await request(app).get('/api/search?minPrice=80');
            expect(res.body.results.total).toBe(2);
            res.body.results.productsList.forEach(item => {
                expect(item.product.price).toBeGreaterThanOrEqual(80);
            });
        });

        it('should include product with exact minPrice', async () => {
            const res = await request(app).get('/api/search?minPrice=29.99');
            const prices = res.body.results.productsList.map(item => item.product.price);
            expect(prices).toContain(29.99);
        });

        it('should return all products when minPrice is 0', async () => {
            const res = await request(app).get('/api/search?minPrice=0');
            expect(res.body.results.total).toBe(6);
        });

        it('should return no products when minPrice is very high', async () => {
            const res = await request(app).get('/api/search?minPrice=1000');
            expect(res.body.results.total).toBe(0);
            expect(res.body.results.productsList).toEqual([]);
        });
    });

    describe('Filter by maxPrice', () => {
        it('should return products with price <= maxPrice', async () => {
            const res = await request(app).get('/api/search?maxPrice=30');
            expect(res.body.results.total).toBe(3);
            res.body.results.productsList.forEach(item => {
                expect(item.product.price).toBeLessThanOrEqual(30);
            });
        });

        it('should include product with exact maxPrice', async () => {
            const res = await request(app).get('/api/search?maxPrice=29.99');
            const prices = res.body.results.productsList.map(item => item.product.price);
            expect(prices).toContain(29.99);
        });

        it('should return no products when maxPrice is very low', async () => {
            const res = await request(app).get('/api/search?maxPrice=1');
            expect(res.body.results.total).toBe(0);
            expect(res.body.results.productsList).toEqual([]);
        });

        it('should return all products when maxPrice is very high', async () => {
            const res = await request(app).get('/api/search?maxPrice=10000');
            expect(res.body.results.total).toBe(6);
        });
    });

    describe('Filter by minPrice and maxPrice combined', () => {
        it('should return products within price range', async () => {
            const res = await request(app).get('/api/search?minPrice=20&maxPrice=30');
            expect(res.body.results.total).toBe(2);
            res.body.results.productsList.forEach(item => {
                expect(item.product.price).toBeGreaterThanOrEqual(20);
                expect(item.product.price).toBeLessThanOrEqual(30);
            });
        });

        it('should return single product for tight price range', async () => {
            const res = await request(app).get('/api/search?minPrice=29&maxPrice=30');
            expect(res.body.results.total).toBe(1);
            expect(res.body.results.productsList[0].product.name).toBe('Wireless Mouse');
        });

        it('should return product when minPrice equals maxPrice (exact price)', async () => {
            const res = await request(app).get('/api/search?minPrice=29.99&maxPrice=29.99');
            expect(res.body.results.total).toBe(1);
            expect(res.body.results.productsList[0].product.price).toBe(29.99);
        });

        it('should return no products when minPrice > maxPrice (inverted range)', async () => {
            const res = await request(app).get('/api/search?minPrice=100&maxPrice=10');
            expect(res.body.results.total).toBe(0);
            expect(res.body.results.productsList).toEqual([]);
        });

        it('should return all products for full price range', async () => {
            const res = await request(app).get('/api/search?minPrice=0&maxPrice=1000');
            expect(res.body.results.total).toBe(6);
        });
    });

    // ==========================================
    // Combined Filters (AND Logic)
    // ==========================================

    describe('Combined filters (AND logic)', () => {
        it('should combine q and category', async () => {
            const res = await request(app).get('/api/search?q=mouse&category=electronics');
            expect(res.body.results.total).toBe(1);
            expect(res.body.results.productsList[0].product.name).toBe('Wireless Mouse');
        });

        it('should return empty when q matches but category does not', async () => {
            const res = await request(app).get('/api/search?q=mouse&category=clothing');
            expect(res.body.results.total).toBe(0);
            expect(res.body.results.productsList).toEqual([]);
        });

        it('should combine q and minPrice', async () => {
            const res = await request(app).get('/api/search?q=e&minPrice=80');
            res.body.results.productsList.forEach(item => {
                expect(item.product.name.toLowerCase()).toContain('e');
                expect(item.product.price).toBeGreaterThanOrEqual(80);
            });
        });

        it('should combine q and maxPrice', async () => {
            const res = await request(app).get('/api/search?q=e&maxPrice=30');
            res.body.results.productsList.forEach(item => {
                expect(item.product.name.toLowerCase()).toContain('e');
                expect(item.product.price).toBeLessThanOrEqual(30);
            });
        });

        it('should combine category and price range', async () => {
            const res = await request(app).get('/api/search?category=electronics&minPrice=50&maxPrice=100');
            expect(res.body.results.total).toBe(1);
            expect(res.body.results.productsList[0].product.name).toBe('Bluetooth Headphones');
        });

        it('should combine category and price range returning no results', async () => {
            const res = await request(app).get('/api/search?category=electronics&minPrice=100');
            expect(res.body.results.total).toBe(0);
        });

        it('should combine all four parameters', async () => {
            const res = await request(app).get('/api/search?q=mouse&category=electronics&minPrice=10&maxPrice=50');
            expect(res.body.results.total).toBe(1);
            expect(res.body.results.productsList[0].product.name).toBe('Wireless Mouse');
            expect(res.body.results.productsList[0].product.price).toBe(29.99);
        });

        it('should return empty when all four params match nothing', async () => {
            const res = await request(app).get('/api/search?q=mouse&category=books&minPrice=10&maxPrice=50');
            expect(res.body.results.total).toBe(0);
            expect(res.body.results.productsList).toEqual([]);
        });

        it('should combine q with price range narrowing results', async () => {
            const res = await request(app).get('/api/search?q=shoes&minPrice=50&maxPrice=150');
            expect(res.body.results.total).toBe(1);
            expect(res.body.results.productsList[0].product.name).toBe('Running Shoes');
        });

        it('should combine q with price range excluding matching name', async () => {
            const res = await request(app).get('/api/search?q=shoes&minPrice=200');
            expect(res.body.results.total).toBe(0);
        });
    });

    // ==========================================
    // Edge Cases
    // ==========================================

    describe('Edge Cases', () => {
        it('should handle whitespace in q parameter', async () => {
            const res = await request(app).get('/api/search?q=%20');
            // space is present in many product names (e.g. "Wireless Mouse")
            expect(res.body.results.total).toBeGreaterThan(0);
        });

        it('should handle special characters in q parameter', async () => {
            const res = await request(app).get('/api/search?q=:');
            // "JavaScript: The Good Parts" contains a colon
            expect(res.body.results.total).toBe(1);
            expect(res.body.results.productsList[0].product.name).toBe('JavaScript: The Good Parts');
        });

        it('should handle decimal minPrice', async () => {
            const res = await request(app).get('/api/search?minPrice=25.50');
            res.body.results.productsList.forEach(item => {
                expect(item.product.price).toBeGreaterThanOrEqual(25.50);
            });
            // Should exclude JS book at 25.49
            const prices = res.body.results.productsList.map(item => item.product.price);
            expect(prices).not.toContain(25.49);
        });

        it('should handle decimal maxPrice', async () => {
            const res = await request(app).get('/api/search?maxPrice=25.48');
            // Should exclude JS book at 25.49
            res.body.results.productsList.forEach(item => {
                expect(item.product.price).toBeLessThanOrEqual(25.48);
            });
            expect(res.body.results.total).toBe(1);
            expect(res.body.results.productsList[0].product.name).toBe('Stainless Steel Water Bottle');
        });

        it('should handle negative minPrice', async () => {
            const res = await request(app).get('/api/search?minPrice=-10');
            expect(res.body.results.total).toBe(6);
        });

        it('should handle unknown query parameters gracefully', async () => {
            const res = await request(app).get('/api/search?unknown=value&foo=bar');
            expect(res.statusCode).toBe(200);
            expect(res.body.results.total).toBe(6);
        });

        it('should handle mixed valid and unknown query parameters', async () => {
            const res = await request(app).get('/api/search?q=mouse&unknown=value');
            expect(res.body.results.total).toBe(1);
            expect(res.body.results.productsList[0].product.name).toBe('Wireless Mouse');
        });

        it('should return numeric types for id and price fields', async () => {
            const res = await request(app).get('/api/search');
            res.body.results.productsList.forEach(item => {
                expect(typeof item.product.id).toBe('number');
                expect(typeof item.product.price).toBe('number');
            });
        });

        it('should return string types for name and category fields', async () => {
            const res = await request(app).get('/api/search');
            res.body.results.productsList.forEach(item => {
                expect(typeof item.product.name).toBe('string');
                expect(typeof item.product.category).toBe('string');
            });
        });
    });

    // ==========================================
    // Input Validation
    // ==========================================

    describe('Input Validation', () => {
        it('should return 400 for invalid minPrice', async () => {
            const res = await request(app).get('/api/search?minPrice=abc');
            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBe('minPrice must be a valid number');
        });

        it('should return 400 for invalid maxPrice', async () => {
            const res = await request(app).get('/api/search?maxPrice=xyz');
            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBe('maxPrice must be a valid number');
        });

        it('should return 400 for invalid page parameter', async () => {
            const res = await request(app).get('/api/search?page=abc');
            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBe('page must be a positive integer');
        });

        it('should return 400 for negative page parameter', async () => {
            const res = await request(app).get('/api/search?page=-1');
            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBe('page must be a positive integer');
        });

        it('should return 400 for zero page parameter', async () => {
            const res = await request(app).get('/api/search?page=0');
            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBe('page must be a positive integer');
        });

        it('should return 400 for decimal page parameter', async () => {
            const res = await request(app).get('/api/search?page=1.5');
            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBe('page must be a positive integer');
        });

        it('should return 400 for invalid limit parameter', async () => {
            const res = await request(app).get('/api/search?limit=abc');
            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBe('limit must be a positive integer');
        });

        it('should return 400 for zero limit parameter', async () => {
            const res = await request(app).get('/api/search?limit=0');
            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBe('limit must be a positive integer');
        });

        it('should accept valid minPrice as string number', async () => {
            const res = await request(app).get('/api/search?minPrice=25');
            expect(res.statusCode).toBe(200);
        });

        it('should accept empty minPrice (ignored)', async () => {
            const res = await request(app).get('/api/search?minPrice=');
            expect(res.statusCode).toBe(200);
            expect(res.body.results.total).toBe(6);
        });

        it('should accept empty maxPrice (ignored)', async () => {
            const res = await request(app).get('/api/search?maxPrice=');
            expect(res.statusCode).toBe(200);
            expect(res.body.results.total).toBe(6);
        });
    });

    // ==========================================
    // Pagination
    // ==========================================

    describe('Pagination', () => {
        it('should return limited results with limit parameter', async () => {
            const res = await request(app).get('/api/search?limit=2');
            expect(res.body.results.productsList).toHaveLength(2);
            expect(res.body.results.total).toBe(6);
            expect(res.body.results.totalPages).toBe(3);
        });

        it('should return second page of results', async () => {
            const res = await request(app).get('/api/search?page=2&limit=2');
            expect(res.body.results.productsList).toHaveLength(2);
            expect(res.body.results.page).toBe(2);
            expect(res.body.results.productsList[0].product.id).toBe(3);
            expect(res.body.results.productsList[1].product.id).toBe(4);
        });

        it('should return last page with remaining results', async () => {
            const res = await request(app).get('/api/search?page=3&limit=2');
            expect(res.body.results.productsList).toHaveLength(2);
            expect(res.body.results.page).toBe(3);
            expect(res.body.results.productsList[0].product.id).toBe(5);
            expect(res.body.results.productsList[1].product.id).toBe(6);
        });

        it('should return empty list for page beyond total pages', async () => {
            const res = await request(app).get('/api/search?page=10&limit=2');
            expect(res.body.results.productsList).toHaveLength(0);
            expect(res.body.results.total).toBe(6);
        });

        it('should cap limit at 100', async () => {
            const res = await request(app).get('/api/search?limit=200');
            expect(res.body.results.limit).toBe(100);
        });

        it('should combine pagination with filters', async () => {
            const res = await request(app).get('/api/search?category=electronics&limit=1');
            expect(res.body.results.total).toBe(2);
            expect(res.body.results.productsList).toHaveLength(1);
            expect(res.body.results.totalPages).toBe(2);
        });
    });

    // ==========================================
    // HTTP Method Verification
    // ==========================================

    describe('HTTP Method Verification', () => {
        it('should return 404 or 405 for POST /api/search', async () => {
            const res = await request(app).post('/api/search');
            expect(res.statusCode).toBeGreaterThanOrEqual(400);
        });

        it('should return 404 or 405 for PUT /api/search', async () => {
            const res = await request(app).put('/api/search');
            expect(res.statusCode).toBeGreaterThanOrEqual(400);
        });

        it('should return 404 or 405 for DELETE /api/search', async () => {
            const res = await request(app).delete('/api/search');
            expect(res.statusCode).toBeGreaterThanOrEqual(400);
        });
    });
});
