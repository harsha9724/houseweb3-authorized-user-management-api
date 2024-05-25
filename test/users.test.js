const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const userRouter = require('../routes/user'); 
const User = require('../models/user');
const dotenv = require("dotenv");
dotenv.config()
const app = express();
app.use(express.json());
app.use('/api/v1', userRouter);

beforeAll(async () => {

  await mongoose.connect(`${process.env.TEST_DB_URL}/user_todo_test`);
});

afterAll(async () => {

  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
});

describe('User API', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/v1/user/register')
        .send({
          email: 'test@test.com',
          password: 'password123',
        });
  
      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toEqual('User registered successfully');
    });
  
    it('should not register a user with an existing email', async () => {
      await User.create({ email: 'test2@test.com', password: 'password' });
  
      const res = await request(app)
        .post('/api/v1/user/register')
        .send({
          email: 'test2@test.com',
          password: 'password123',
        });
  
      expect(res.statusCode).toEqual(403);
      expect(res.body.message).toEqual('User already exists');
    });
  
    it('should login a registered user', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      await User.create({ email: 'login@test.com', password: hashedPassword });
  
      const res = await request(app)
        .post('/api/v1/user/login')
        .send({
          email: 'login@test.com',
          password: 'password123',
        });
  
      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toEqual('Login successful');
      expect(res.body).toHaveProperty('token');
    });
  
    it('should not login with incorrect password', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      await User.create({ email: 'login1@test.com', password: hashedPassword });
  
      const res = await request(app)
        .post('/api/v1/user/login')
        .send({
          email: 'login1@test.com',
          password: 'wrongpassword',
        });
  
      expect(res.statusCode).toEqual(403);
      expect(res.body.message).toEqual('Invalid password');
    });
  
    it('should not login non-existent user', async () => {
      const res = await request(app)
        .post('/api/v1/user/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'password123',
        });
  
      expect(res.statusCode).toEqual(403);
      expect(res.body.message).toEqual('Invalid email/ Invalid user');
    });
  
    it('should not register user with invalid email', async () => {
      const res = await request(app)
        .post('/api/v1/user/register')
        .send({
          email: 'invalid-email',
          password: 'password123',
        });
  
      expect(res.statusCode).toEqual(400);
      expect(res.body.errors[0].msg).toEqual('Invalid value');
    });
  
    it('should not register user with short password', async () => {
      const res = await request(app)
        .post('/api/v1/user/register')
        .send({
          email: 'test2@test.com',
          password: 'short',
        });
  
      expect(res.statusCode).toEqual(400);
      expect(res.body.errors[0].msg).toEqual('Invalid value');
    });
  });

