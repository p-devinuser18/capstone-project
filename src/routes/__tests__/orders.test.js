const request = require('supertest');
const app = require('../../app');
const orders = require('../../data/orders.json');

describe('GET /api/orders', () => {
  it('should return a JSON array of orders', async () => {
    const res = await request(app).get('/api/orders');
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should return 5 orders', async () => {
    const res = await request(app).get('/api/orders');
    expect(res.body).toHaveLength(5);
  });

  it('should return orders with the correct shape', async () => {
    const res = await request(app).get('/api/orders');
    res.body.forEach((order) => {
      expect(order).toHaveProperty('id');
      expect(order).toHaveProperty('productId');
      expect(order).toHaveProperty('quantity');
      expect(order).toHaveProperty('totalPrice');
      expect(order).toHaveProperty('status');
      expect(order).toHaveProperty('createdAt');
    });
  });

  it('should only contain valid status values', async () => {
    const validStatuses = ['pending', 'shipped', 'delivered'];
    const res = await request(app).get('/api/orders');
    res.body.forEach((order) => {
      expect(validStatuses).toContain(order.status);
    });
  });

  it('should match the orders data source', async () => {
    const res = await request(app).get('/api/orders');
    expect(res.body).toEqual(orders);
  });
});
