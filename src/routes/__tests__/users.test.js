const request = require('supertest');
const app = require('../../app');

describe('GET /api/users', () => {
  it('should return a JSON array of users', async () => {
    const res = await request(app).get('/api/users');
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should return users with the correct shape', async () => {
    const res = await request(app).get('/api/users');
    res.body.forEach((user) => {
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('name');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('createdAt');
    });
  });
});

describe('GET /api/users/:id', () => {
  it('should return a single user by id', async () => {
    const res = await request(app).get('/api/users/1');
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(1);
    expect(res.body).toHaveProperty('name');
    expect(res.body).toHaveProperty('email');
  });

  it('should return 404 for non-existent user', async () => {
    const res = await request(app).get('/api/users/9999');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});

describe('GET /api/users/:id/orders', () => {
  it('should return orders for a specific user', async () => {
    const res = await request(app).get('/api/users/1/orders');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    res.body.forEach((order) => {
      expect(order.userId).toBe(1);
    });
  });

  it('should return 404 for non-existent user', async () => {
    const res = await request(app).get('/api/users/9999/orders');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});

describe('POST /api/users', () => {
  it('should create a new user and return 201', async () => {
    const res = await request(app).post('/api/users').send({
      name: 'Dave Wilson',
      email: 'dave@example.com'
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('Dave Wilson');
    expect(res.body.email).toBe('dave@example.com');
    expect(res.body).toHaveProperty('createdAt');
  });

  it('should return 400 when required fields are missing', async () => {
    const res = await request(app).post('/api/users').send({ name: 'Test' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should return 400 for empty name', async () => {
    const res = await request(app).post('/api/users').send({
      name: '',
      email: 'test@example.com'
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/Name/);
  });

  it('should return 400 for invalid email', async () => {
    const res = await request(app).post('/api/users').send({
      name: 'Test User',
      email: 'invalid-email'
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/Email/);
  });

  it('should return 400 for duplicate email', async () => {
    const res = await request(app).post('/api/users').send({
      name: 'Duplicate',
      email: 'alice@example.com'
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/already exists/);
  });
});

describe('PUT /api/users/:id', () => {
  it('should update an existing user', async () => {
    const res = await request(app)
      .put('/api/users/1')
      .send({ name: 'Alice Updated' });
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(1);
    expect(res.body.name).toBe('Alice Updated');
  });

  it('should return 404 for non-existent user', async () => {
    const res = await request(app)
      .put('/api/users/9999')
      .send({ name: 'Nobody' });
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  it('should return 400 for invalid email on update', async () => {
    const res = await request(app)
      .put('/api/users/1')
      .send({ email: 'bad-email' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/Email/);
  });

  it('should return 400 for duplicate email on update', async () => {
    const res = await request(app)
      .put('/api/users/1')
      .send({ email: 'bob@example.com' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/already exists/);
  });
});

describe('DELETE /api/users/:id', () => {
  it('should delete an existing user and return it', async () => {
    const res = await request(app).delete('/api/users/3');
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(3);
  });

  it('should return 404 for non-existent user', async () => {
    const res = await request(app).delete('/api/users/9999');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});
