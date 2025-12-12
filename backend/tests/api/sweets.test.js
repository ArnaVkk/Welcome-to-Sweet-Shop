const request = require('supertest');
const app = require('../../src/app');
const { Sweet } = require('../../src/models');

describe('Sweets API', () => {
  let adminToken;
  let userToken;

  beforeEach(async () => {
    // Create admin user
    const adminRes = await request(app)
      .post('/api/auth/register')
      .send({ username: 'admin', password: 'password123', role: 'admin' });
    adminToken = adminRes.body.token;

    // Create regular user
    const userRes = await request(app)
      .post('/api/auth/register')
      .send({ username: 'user', password: 'password123' });
    userToken = userRes.body.token;
  });

  describe('GET /api/sweets', () => {
    it('should return empty array when no sweets exist', async () => {
      const res = await request(app).get('/api/sweets');

      expect(res.status).toBe(200);
      expect(res.body.sweets).toEqual([]);
      expect(res.body.count).toBe(0);
    });

    it('should return all sweets', async () => {
      // Create test sweets directly
      await Sweet.create([
        { name: 'Chocolate Bar', category: 'chocolate', price: 5, quantity: 10 },
        { name: 'Gummy Bears', category: 'candy', price: 3, quantity: 20 }
      ]);

      const res = await request(app).get('/api/sweets');

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(2);
      expect(res.body.sweets).toHaveLength(2);
    });

    it('should filter sweets by category', async () => {
      await Sweet.create([
        { name: 'Chocolate Bar', category: 'chocolate', price: 5, quantity: 10 },
        { name: 'Gummy Bears', category: 'candy', price: 3, quantity: 20 }
      ]);

      const res = await request(app).get('/api/sweets?category=chocolate');

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);
      expect(res.body.sweets[0].category).toBe('chocolate');
    });

    it('should search sweets by name', async () => {
      await Sweet.create([
        { name: 'Chocolate Bar', category: 'chocolate', price: 5, quantity: 10 },
        { name: 'Gummy Bears', category: 'candy', price: 3, quantity: 20 }
      ]);

      const res = await request(app).get('/api/sweets?search=Gummy');

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);
      expect(res.body.sweets[0].name).toBe('Gummy Bears');
    });

    it('should filter sweets in stock', async () => {
      await Sweet.create([
        { name: 'In Stock', category: 'candy', price: 5, quantity: 10 },
        { name: 'Out of Stock', category: 'candy', price: 3, quantity: 0 }
      ]);

      const res = await request(app).get('/api/sweets?inStock=true');

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);
      expect(res.body.sweets[0].name).toBe('In Stock');
    });
  });

  describe('GET /api/sweets/:id', () => {
    it('should return a sweet by ID', async () => {
      const sweet = await Sweet.create({
        name: 'Test Sweet',
        category: 'candy',
        price: 5,
        quantity: 10
      });

      const res = await request(app).get(`/api/sweets/${sweet._id}`);

      expect(res.status).toBe(200);
      expect(res.body.sweet.name).toBe('Test Sweet');
    });

    it('should return 404 for non-existent sweet', async () => {
      const res = await request(app).get('/api/sweets/507f1f77bcf86cd799439011');

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Sweet not found');
    });
  });

  describe('POST /api/sweets', () => {
    it('should create a new sweet as admin', async () => {
      const res = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'New Sweet',
          category: 'candy',
          price: 5,
          quantity: 10,
          description: 'A delicious candy'
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Sweet created successfully');
      expect(res.body.sweet.name).toBe('New Sweet');
    });

    it('should return 403 for non-admin user', async () => {
      const res = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'New Sweet',
          category: 'candy',
          price: 5
        });

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Access denied. Admin privileges required.');
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .post('/api/sweets')
        .send({
          name: 'New Sweet',
          category: 'candy',
          price: 5
        });

      expect(res.status).toBe(401);
    });

    it('should return 400 for invalid category', async () => {
      const res = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'New Sweet',
          category: 'invalid-category',
          price: 5
        });

      expect(res.status).toBe(400);
    });

    it('should return 400 for negative price', async () => {
      const res = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'New Sweet',
          category: 'candy',
          price: -5
        });

      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/sweets/:id', () => {
    let sweet;

    beforeEach(async () => {
      sweet = await Sweet.create({
        name: 'Original Sweet',
        category: 'candy',
        price: 5,
        quantity: 10
      });
    });

    it('should update a sweet as admin', async () => {
      const res = await request(app)
        .put(`/api/sweets/${sweet._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Sweet', price: 7 });

      expect(res.status).toBe(200);
      expect(res.body.sweet.name).toBe('Updated Sweet');
      expect(res.body.sweet.price).toBe(7);
    });

    it('should return 403 for non-admin user', async () => {
      const res = await request(app)
        .put(`/api/sweets/${sweet._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Updated Sweet' });

      expect(res.status).toBe(403);
    });

    it('should return 404 for non-existent sweet', async () => {
      const res = await request(app)
        .put('/api/sweets/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Sweet' });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/sweets/:id', () => {
    let sweet;

    beforeEach(async () => {
      sweet = await Sweet.create({
        name: 'To Delete',
        category: 'candy',
        price: 5,
        quantity: 10
      });
    });

    it('should delete a sweet as admin', async () => {
      const res = await request(app)
        .delete(`/api/sweets/${sweet._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Sweet deleted successfully');

      // Verify deletion
      const check = await Sweet.findById(sweet._id);
      expect(check).toBeNull();
    });

    it('should return 403 for non-admin user', async () => {
      const res = await request(app)
        .delete(`/api/sweets/${sweet._id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/sweets/:id/purchase', () => {
    let sweet;

    beforeEach(async () => {
      sweet = await Sweet.create({
        name: 'Purchasable',
        category: 'candy',
        price: 5,
        quantity: 10
      });
    });

    it('should allow authenticated user to purchase', async () => {
      const res = await request(app)
        .post(`/api/sweets/${sweet._id}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 2 });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Purchase successful');
      expect(res.body.sweet.quantity).toBe(8);
      expect(res.body.purchased).toBe(2);
    });

    it('should default to quantity of 1', async () => {
      const res = await request(app)
        .post(`/api/sweets/${sweet._id}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({});

      expect(res.status).toBe(200);
      expect(res.body.sweet.quantity).toBe(9);
    });

    it('should return 400 for insufficient stock', async () => {
      const res = await request(app)
        .post(`/api/sweets/${sweet._id}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 100 });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Insufficient stock');
      expect(res.body.available).toBe(10);
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .post(`/api/sweets/${sweet._id}/purchase`)
        .send({ quantity: 1 });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/sweets/:id/restock', () => {
    let sweet;

    beforeEach(async () => {
      sweet = await Sweet.create({
        name: 'To Restock',
        category: 'candy',
        price: 5,
        quantity: 5
      });
    });

    it('should allow admin to restock', async () => {
      const res = await request(app)
        .post(`/api/sweets/${sweet._id}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 10 });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Restock successful');
      expect(res.body.sweet.quantity).toBe(15);
      expect(res.body.added).toBe(10);
    });

    it('should return 403 for non-admin user', async () => {
      const res = await request(app)
        .post(`/api/sweets/${sweet._id}/restock`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 10 });

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Access denied. Admin privileges required.');
    });

    it('should return 400 for invalid quantity', async () => {
      const res = await request(app)
        .post(`/api/sweets/${sweet._id}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 0 });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Quantity must be at least 1');
    });
  });
});
