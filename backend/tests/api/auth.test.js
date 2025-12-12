const request = require('supertest');
const app = require('../../src/app');
const { User } = require('../../src/models');

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          password: 'password123'
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('User registered successfully');
      expect(res.body.user).toHaveProperty('username', 'testuser');
      expect(res.body.user).toHaveProperty('role', 'user');
      expect(res.body.user).not.toHaveProperty('password');
      expect(res.body).toHaveProperty('token');
    });

    it('should register an admin user when role is specified', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'adminuser',
          password: 'password123',
          role: 'admin'
        });

      expect(res.status).toBe(201);
      expect(res.body.user).toHaveProperty('role', 'admin');
    });

    it('should return 400 for duplicate username', async () => {
      // Create first user
      await request(app)
        .post('/api/auth/register')
        .send({ username: 'duplicate', password: 'password123' });

      // Try to create duplicate
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'duplicate', password: 'password456' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Username already exists');
    });

    it('should return 400 for short username', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'ab', password: 'password123' });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    it('should return 400 for short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser', password: '12345' });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user before each login test
      await request(app)
        .post('/api/auth/register')
        .send({ username: 'logintest', password: 'password123' });
    });

    it('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'logintest', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Login successful');
      expect(res.body.user).toHaveProperty('username', 'logintest');
      expect(res.body).toHaveProperty('token');
    });

    it('should return 401 for wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'logintest', password: 'wrongpassword' });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid credentials');
    });

    it('should return 401 for non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'nonexistent', password: 'password123' });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid credentials');
    });
  });

  describe('GET /api/auth/me', () => {
    let token;

    beforeEach(async () => {
      // Create and login a user
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'profiletest', password: 'password123' });
      token = res.body.token;
    });

    it('should return user profile with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.user).toHaveProperty('username', 'profiletest');
      expect(res.body.user).not.toHaveProperty('password');
    });

    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Access denied. No token provided.');
    });

    it('should return 401 with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid token.');
    });
  });
});
