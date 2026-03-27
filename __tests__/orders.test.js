const request = require('supertest');
const app = require('../app');

describe('Orders API', () => {
  describe('GET /api/orders', () => {
    it('should return a JSON array of unique product names', async () => {
      const res = await request(app).get('/api/orders');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('statusCode', 200);
      expect(Array.isArray(res.body.data)).toBe(true);
      // All entries should be strings
      res.body.data.forEach(item => {
        expect(typeof item).toBe('string');
      });
    });

    it('should return unique product names (no duplicates)', async () => {
      const res = await request(app).get('/api/orders');
      const unique = [...new Set(res.body.data)];
      expect(res.body.data.length).toBe(unique.length);
    });

    it('should return product names sorted alphabetically', async () => {
      const res = await request(app).get('/api/orders');
      const sorted = [...res.body.data].sort();
      expect(res.body.data).toEqual(sorted);
    });
  });

  describe('GET /api/orders/:orderid', () => {
    it('should return a specific order by orderid', async () => {
      const res = await request(app).get('/api/orders/ORD001');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('statusCode', 200);
      expect(res.body.data).toHaveProperty('orderid', 'ORD001');
      expect(res.body.data).toHaveProperty('payeename');
      expect(res.body.data).toHaveProperty('productname');
      expect(res.body.data).toHaveProperty('productid');
    });

    it('should return 404 for a non-existent orderid', async () => {
      const res = await request(app).get('/api/orders/INVALID');
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('statusCode', 404);
      expect(res.body).toHaveProperty('message', 'Order not found');
    });
  });

  describe('PUT /api/orders/:orderid', () => {
    it('should update an existing order', async () => {
      const res = await request(app)
        .put('/api/orders/ORD001')
        .send({ payeename: 'Updated Name', productname: 'Updated Product' });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('statusCode', 200);
      expect(res.body).toHaveProperty('message', 'Order updated');
      expect(res.body.order).toHaveProperty('payeename', 'Updated Name');
      expect(res.body.order).toHaveProperty('productname', 'Updated Product');
    });

    it('should return 404 when updating a non-existent order', async () => {
      const res = await request(app)
        .put('/api/orders/INVALID')
        .send({ payeename: 'Test' });
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('statusCode', 404);
      expect(res.body).toHaveProperty('message', 'Order not found');
    });
  });

  describe('DELETE /api/orders/:orderid', () => {
    it('should delete an existing order', async () => {
      const res = await request(app).delete('/api/orders/ORD008');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('statusCode', 200);
      expect(res.body).toHaveProperty('message', 'Order deleted');
      expect(res.body.order).toHaveProperty('orderid', 'ORD008');
    });

    it('should return 404 when deleting a non-existent order', async () => {
      const res = await request(app).delete('/api/orders/INVALID');
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('statusCode', 404);
      expect(res.body).toHaveProperty('message', 'Order not found');
    });
  });
});
