const request = require('supertest');
const fs = require('fs');
const app = require('../../../app');

describe('Health Check Endpoints', () => {
    describe('GET /health', () => {
        it('should return 200 with status ok', async () => {
            const res = await request(app).get('/health');
            expect(res.status).toBe(200);
            expect(res.body).toEqual({ status: 'ok' });
        });
    });

    describe('GET /health/ready', () => {
        it('should return 200 when all dependencies are available', async () => {
            const res = await request(app).get('/health/ready');
            expect(res.status).toBe(200);
            expect(res.body).toEqual({
                status: 'ready',
                checks: {
                    products: 'ok',
                    orders: 'ok'
                }
            });
        });

        it('should return 503 when products.json is not accessible', async () => {
            const originalReadFileSync = fs.readFileSync;
            fs.readFileSync = jest.fn((filePath, encoding) => {
                if (filePath.includes('products.json')) {
                    throw new Error('EACCES: permission denied');
                }
                return originalReadFileSync(filePath, encoding);
            });

            const res = await request(app).get('/health/ready');
            expect(res.status).toBe(503);
            expect(res.body).toEqual({
                status: 'not ready',
                checks: {
                    products: 'fail',
                    orders: 'ok'
                }
            });

            fs.readFileSync = originalReadFileSync;
        });

        it('should return 503 when orders.json has a non-ENOENT error', async () => {
            const originalReadFileSync = fs.readFileSync;
            fs.readFileSync = jest.fn((filePath, encoding) => {
                if (filePath.includes('orders.json')) {
                    const err = new Error('EACCES: permission denied');
                    err.code = 'EACCES';
                    throw err;
                }
                return originalReadFileSync(filePath, encoding);
            });

            const res = await request(app).get('/health/ready');
            expect(res.status).toBe(503);
            expect(res.body).toEqual({
                status: 'not ready',
                checks: {
                    products: 'ok',
                    orders: 'fail'
                }
            });

            fs.readFileSync = originalReadFileSync;
        });

        it('should return ok for orders when orders.json does not exist', async () => {
            // orders.json doesn't exist by default, so this should pass gracefully
            const res = await request(app).get('/health/ready');
            expect(res.status).toBe(200);
            expect(res.body.checks.orders).toBe('ok');
        });
    });
});
