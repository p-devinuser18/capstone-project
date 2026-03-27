const request = require('supertest');
const app = require('../src/app');
const orders = require('../src/data/orders.json');

describe('GET /api/dashboard', () => {
  test('returns 200 status code', async () => {
    const res = await request(app).get('/api/dashboard');
    expect(res.statusCode).toBe(200);
  });

  test('response contains totalOrders matching orders.json count', async () => {
    const res = await request(app).get('/api/dashboard');
    expect(res.body.totalOrders).toBe(orders.length);
  });

  test('response contains OrderbyId with correct counts', async () => {
    const res = await request(app).get('/api/dashboard');
    expect(res.body.OrderbyId).toBeDefined();

    const orderIds = orders.map((order) => order.id);
    const keys = Object.keys(res.body.OrderbyId).map(Number);
    expect(keys.sort()).toEqual(orderIds.sort());
  });

  test('response contains timestamp in ISO format', async () => {
    const res = await request(app).get('/api/dashboard');
    expect(res.body.timestamp).toBeDefined();
    expect(typeof res.body.timestamp).toBe('string');

    const parsed = new Date(res.body.timestamp);
    expect(parsed.toISOString()).toBe(res.body.timestamp);
  });

  test('response shape matches expected structure', async () => {
    const res = await request(app).get('/api/dashboard');
    expect(res.body).toEqual(
      expect.objectContaining({
        totalOrders: expect.any(Number),
        OrderbyId: expect.any(Object),
        timestamp: expect.any(String),
      })
    );
  });
});
