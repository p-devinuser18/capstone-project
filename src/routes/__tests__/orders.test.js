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

  it('should return orders with the correct shape', async () => {
    const res = await request(app).get('/api/orders');
    res.body.forEach((order) => {
      expect(order).toHaveProperty('id');
      expect(order).toHaveProperty('userId');
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
});

describe('POST /api/orders', () => {
  it('should create a new order and return 201', async () => {
    const newOrder = {
      userId: 1,
      productId: 3,
      quantity: 2,
      totalPrice: 119.98,
      status: 'pending'
    };
    const res = await request(app).post('/api/orders').send(newOrder);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.userId).toBe(1);
    expect(res.body.productId).toBe(3);
    expect(res.body.quantity).toBe(2);
    expect(res.body.totalPrice).toBe(119.98);
    expect(res.body.status).toBe('pending');
    expect(res.body).toHaveProperty('createdAt');
  });

  it('should return 400 when required fields are missing', async () => {
    const res = await request(app).post('/api/orders').send({ productId: 1 });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should return 400 for invalid status', async () => {
    const res = await request(app).post('/api/orders').send({
      userId: 1,
      productId: 1,
      quantity: 1,
      totalPrice: 10,
      status: 'cancelled'
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/Invalid status/);
  });

  it('should return 400 when quantity is 0', async () => {
    const res = await request(app).post('/api/orders').send({
      userId: 1,
      productId: 1,
      quantity: 0,
      totalPrice: 10,
      status: 'pending'
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/Quantity/);
  });

  it('should return 400 when quantity is negative', async () => {
    const res = await request(app).post('/api/orders').send({
      userId: 1,
      productId: 1,
      quantity: -5,
      totalPrice: 10,
      status: 'pending'
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/Quantity/);
  });

  it('should return 400 when order quantity exceeds product stock', async () => {
    const res = await request(app).post('/api/orders').send({
      userId: 1,
      productId: 1,
      quantity: 999,
      totalPrice: 10,
      status: 'pending'
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/exceeds available product stock/);
  });

  it('should return 400 for non-existent productId', async () => {
    const res = await request(app).post('/api/orders').send({
      userId: 1,
      productId: 999,
      quantity: 1,
      totalPrice: 10,
      status: 'pending'
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/not found/);
  });

  it('should return 400 for non-existent userId', async () => {
    const res = await request(app).post('/api/orders').send({
      userId: 999,
      productId: 1,
      quantity: 1,
      totalPrice: 10,
      status: 'pending'
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/User.*not found/);
  });
});

describe('PUT /api/orders/:id', () => {
  it('should update an existing order', async () => {
    const res = await request(app)
      .put('/api/orders/1')
      .send({ status: 'shipped' });
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(1);
    expect(res.body.status).toBe('shipped');
  });

  it('should return 404 for non-existent order', async () => {
    const res = await request(app)
      .put('/api/orders/9999')
      .send({ status: 'pending' });
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  it('should return 400 for invalid status on update', async () => {
    const res = await request(app)
      .put('/api/orders/1')
      .send({ status: 'cancelled' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/Invalid status/);
  });

  it('should return 400 when updating quantity to 0', async () => {
    const res = await request(app)
      .put('/api/orders/1')
      .send({ quantity: 0 });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/Quantity/);
  });

  it('should return 400 when updating quantity to negative', async () => {
    const res = await request(app)
      .put('/api/orders/1')
      .send({ quantity: -3 });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/Quantity/);
  });

  it('should return 400 when updating quantity beyond product stock', async () => {
    const res = await request(app)
      .put('/api/orders/1')
      .send({ quantity: 999 });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/exceeds available product stock/);
  });

  it('should return 400 when updating with non-existent userId', async () => {
    const res = await request(app)
      .put('/api/orders/1')
      .send({ userId: 999 });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/User.*not found/);
  });
});

describe('DELETE /api/orders/:id', () => {
  it('should delete an existing order and return it', async () => {
    const res = await request(app).delete('/api/orders/2');
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(2);
  });

  it('should return 404 for non-existent order', async () => {
    const res = await request(app).delete('/api/orders/9999');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});
