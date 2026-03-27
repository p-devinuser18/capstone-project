const request = require('supertest');
const app = require('../app');

describe('Orders Integration Tests', () => {
  // Scenario 1: GET /api/orders returns 200 with all unique products
  it('should return 200 with all unique product names', async () => {
    const res = await request(app).get('/api/orders');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('statusCode', 200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    res.body.data.forEach(item => {
      expect(typeof item).toBe('string');
    });
  });

  // Scenario 2: GET /api/orders/:orderid returns specific order data
  it('should return only the requested order by orderid', async () => {
    const res = await request(app).get('/api/orders/ORD001');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('statusCode', 200);
    expect(res.body.data).toHaveProperty('orderid', 'ORD001');
    expect(res.body.data).toHaveProperty('payeename', 'Alice Johnson');
    expect(res.body.data).toHaveProperty('productname', 'Dell Laptop');
    expect(res.body.data).toHaveProperty('productid', 'PROD001');
  });

  // Scenario 3: PUT /api/orders/:orderid updates order correctly
  it('should update an order with PUT and return updated data', async () => {
    const updateData = {
      orderid: 'ORD002',
      payeename: 'Bob Updated',
      productname: 'Updated Mobile',
      productid: 'PROD999'
    };
    const res = await request(app)
      .put('/api/orders/ORD002')
      .send(updateData);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('statusCode', 200);
    expect(res.body).toHaveProperty('message', 'Order updated');
    expect(res.body.order).toHaveProperty('payeename', 'Bob Updated');
    expect(res.body.order).toHaveProperty('productname', 'Updated Mobile');
    expect(res.body.order).toHaveProperty('productid', 'PROD999');
  });

  // Scenario 4: GET /api/orders/:orderid with non-existent ID returns 404
  it('should return 404 for a non-existent order', async () => {
    const res = await request(app).get('/api/orders/NONEXISTENT');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('statusCode', 404);
    expect(res.body).toHaveProperty('message', 'Order not found');
  });

  // Scenario 5: Response shape validation - each order has required fields
  it('should return an order with correct shape {orderid, payeename, productname, productid}', async () => {
    const res = await request(app).get('/api/orders/ORD003');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('statusCode', 200);
    expect(res.body.data).toHaveProperty('orderid');
    expect(res.body.data).toHaveProperty('payeename');
    expect(res.body.data).toHaveProperty('productname');
    expect(res.body.data).toHaveProperty('productid');
    expect(Object.keys(res.body.data)).toEqual(
      expect.arrayContaining(['orderid', 'payeename', 'productname', 'productid'])
    );
  });

  // Scenario 6: Content-Type header is application/json
  it('should return Content-Type application/json', async () => {
    const res = await request(app).get('/api/orders');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  // Scenario 7: GET /api/orders returns products sorted alphabetically
  it('should return unique product names sorted alphabetically', async () => {
    const res = await request(app).get('/api/orders');
    expect(res.status).toBe(200);
    const sorted = [...res.body.data].sort();
    expect(res.body.data).toEqual(sorted);
  });
});
