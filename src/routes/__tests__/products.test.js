const request = require('supertest');
const app = require('../../app');

describe('GET /api/products', () => {
  it('should return a JSON array of products', async () => {
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should return products with the correct shape', async () => {
    const res = await request(app).get('/api/products');
    res.body.forEach((product) => {
      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('price');
      expect(product).toHaveProperty('stock');
    });
  });
});

describe('POST /api/products', () => {
  it('should create a new product and return 201', async () => {
    const res = await request(app).post('/api/products').send({
      name: 'Monitor',
      price: 299.99,
      stock: 15
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('Monitor');
    expect(res.body.price).toBe(299.99);
    expect(res.body.stock).toBe(15);
  });

  it('should return 400 when required fields are missing', async () => {
    const res = await request(app).post('/api/products').send({ name: 'Test' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should return 400 for empty name', async () => {
    const res = await request(app).post('/api/products').send({
      name: '',
      price: 10,
      stock: 5
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/Name/);
  });

  it('should return 400 for negative price', async () => {
    const res = await request(app).post('/api/products').send({
      name: 'Bad Product',
      price: -10,
      stock: 5
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/Price/);
  });

  it('should return 400 for negative stock', async () => {
    const res = await request(app).post('/api/products').send({
      name: 'Bad Product',
      price: 10,
      stock: -1
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/Stock/);
  });

  it('should return 400 for non-integer stock', async () => {
    const res = await request(app).post('/api/products').send({
      name: 'Bad Product',
      price: 10,
      stock: 5.5
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/Stock/);
  });
});

describe('PUT /api/products/:id', () => {
  it('should update an existing product', async () => {
    const res = await request(app)
      .put('/api/products/1')
      .send({ price: 899.99 });
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(1);
    expect(res.body.price).toBe(899.99);
  });

  it('should return 404 for non-existent product', async () => {
    const res = await request(app)
      .put('/api/products/9999')
      .send({ price: 10 });
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  it('should return 400 for invalid price on update', async () => {
    const res = await request(app)
      .put('/api/products/1')
      .send({ price: -5 });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/Price/);
  });

  it('should return 400 for invalid stock on update', async () => {
    const res = await request(app)
      .put('/api/products/1')
      .send({ stock: -1 });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/Stock/);
  });
});

describe('DELETE /api/products/:id', () => {
  it('should delete an existing product and return it', async () => {
    const res = await request(app).delete('/api/products/3');
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(3);
  });

  it('should return 404 for non-existent product', async () => {
    const res = await request(app).delete('/api/products/9999');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});
