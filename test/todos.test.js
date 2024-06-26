const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Todo = require('../models/todo');
const todoRouter = require('../routes/todo'); 
const User = require('../models/user');
const dotenv = require("dotenv");
const app = express();
app.use(express.json());
app.use('/api/v1', todoRouter);
dotenv.config()
const example_user_id = new mongoose.Types.ObjectId().toString();
const example_token = jwt.sign({ data: example_user_id }, 'houseweb3', { expiresIn: '1h' });

beforeAll(async () => {
  const dbUrl = process.env.TEST_DB_URL;

  if (!dbUrl) {
    throw new Error("Environment variable TEST_DB_URL is not set");
  }
  await mongoose.connect(dbUrl);

  // Create a mock user
  await User.create({ _id: example_user_id, email: 'test1@test.com', password: 'password' });
});

afterAll(async () => {
  if (mongoose.connection.db) {
    await mongoose.connection.db.dropDatabase();
  }
  await mongoose.disconnect();
});

// describe('Todo API', () => {
//     it('should get all todos', async () => {
//       const res = await request(app)
//         .get('/api/v1/todos')
//         .set('Authorization', `Bearer ${example_token}`);
  
//       expect(res.statusCode).toEqual(200);
//       expect(Array.isArray(res.body)).toBe(true);
//     });
  
//     it('should create a new todo', async () => {
//       const res = await request(app)
//         .post('/api/v1/todos')
//         .set('Authorization', `Bearer ${example_token}`)
//         .send({
//           title: 'Test Todo',
//         });
  
//       expect(res.statusCode).toEqual(201);
//       expect(res.body.title).toEqual('Test Todo');
//       expect(res.body.user_id).toEqual(example_user_id);
//     });
  
//     it('should not create a todo without a title', async () => {
//       const res = await request(app)
//         .post('/api/v1/todos')
//         .set('Authorization', `Bearer ${example_token}`)
//         .send({});
  
//       expect(res.statusCode).toEqual(400);
//       expect(res.body.message).toEqual('Title is required');
//     });
  
//     it('should update a todo', async () => {
//       const todo = await Todo.create({ title: 'Test Todo', user_id: example_user_id });
  
//       const res = await request(app)
//         .put(`/api/v1/todos/${todo._id}`)
//         .set('Authorization', `Bearer ${example_token}`)
//         .send({
//           title: 'Updated Todo',
//           completed: true,
//         });
  
//       expect(res.statusCode).toEqual(200);
//       expect(res.body.title).toEqual('Updated Todo');
//       expect(res.body.completed).toEqual(true);
//     });
  
//     it('should return error for updating non-existing todo', async () => {
//       const nonExistingId = new mongoose.Types.ObjectId();
  
//       const res = await request(app)
//         .put(`/api/v1/todos/${nonExistingId}`)
//         .set('Authorization', `Bearer ${example_token}`)
//         .send({
//           title: 'Updated Todo',
//           completed: true,
//         });
  
//       expect(res.statusCode).toEqual(400);
//       expect(res.body.message).toEqual('Todo not found');
//     });
  
  
//     it('should delete a todo', async () => {
//       const todo = await Todo.create({ title: 'Test Todo', user_id: example_user_id });
    
//       const res = await request(app)
//         .delete(`/api/v1/todos/${todo._id}`)
//         .set('Authorization', `Bearer ${example_token}`);
//       expect(res.statusCode).toEqual(200); // Check status first
//       expect(res.body.message).toEqual('Todo deleted successfully');
//     });

  
//     it('should return error for deleting non-existing todo', async () => {
//       const nonExistingId = new mongoose.Types.ObjectId();
  
//       const res = await request(app)
//         .delete(`/api/v1/todos/${nonExistingId}`)
//         .set('Authorization', `Bearer ${example_token}`);
  
//       expect(res.statusCode).toEqual(400);
//       expect(res.body.message).toEqual('Todo not found');
//     });
  
//   });

describe('Todo API', () => {
  describe('GET /api/v1/todos', () => {
    it('should get all todos', async () => {
      const res = await request(app)
        .get('/api/v1/todos')
        .set('Authorization', `Bearer ${example_token}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Array);
    });
  });

  describe('POST /api/v1/todos', () => {
    it('should create a new todo', async () => {
      const res = await request(app)
        .post('/api/v1/todos')
        .set('Authorization', `Bearer ${example_token}`)
        .send({ title: 'Test todo' });
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('title', 'Test todo');
      expect(res.body).toHaveProperty('user_id', example_user_id);
    });

    it('should return 400 if title is missing', async () => {
      const res = await request(app)
        .post('/api/v1/todos')
        .set('Authorization', `Bearer ${example_token}`)
        .send({});
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toBe('Title is required');
    });
  });

  describe('PUT /api/v1/todos/:id', () => {
    it('should update a todo by the given id', async () => {
      const todo = new Todo({
        title: 'Test todo',
        user_id: example_user_id,
      });
      await todo.save();

      const res = await request(app)
        .put(`/api/v1/todos/${todo.id}`)
        .set('Authorization', `Bearer ${example_token}`)
        .send({ title: 'Updated todo', completed: true });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('title', 'Updated todo');
      expect(res.body).toHaveProperty('completed', true);
    });

    it('should return 400 for invalid ObjectId', async () => {
      const res = await request(app)
        .put('/api/v1/todos/invalidObjectId')
        .set('Authorization', `Bearer ${example_token}`)
        .send({ title: 'Updated todo', completed: true });
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toBe('Invalid ID format');
    });

    // it('should return 400 if todo not found', async () => {
    //   const validObjectId = new mongoose.Types.ObjectId();
    //   const res = await request(app)
    //     .put(`/api/v1/todos/${validObjectId}`)
    //     .set('Authorization', `Bearer ${example_token}`)
    //     .send({ title: 'Updated todo', completed: true });
    //   expect(res.statusCode).toEqual(400);
    //   expect(res.body.message).toEqual('Todo not found');
    // });
  });

  // describe('DELETE /api/v1/todos/:id', () => {
  //   it('should delete a todo by the given id', async () => {
  //     const todo = new Todo({
  //       title: 'Test todo',
  //       user_id: example_user_id,
  //     });
  //     await todo.save();

  //     const res = await request(app)
  //       .delete(`/api/v1/todos/${todo.id}`)
  //       .set('Authorization', `Bearer ${example_token}`);
  //     expect(res.statusCode).toEqual(200);
  //     expect(res.body.message).toBe('Todo deleted successfully');
  //   });

  //   it('should return 400 for invalid ObjectId', async () => {
  //     const res = await request(app)
  //       .delete('/api/v1/todos/invalidObjectId')
  //       .set('Authorization', `Bearer ${example_token}`);
  //     expect(res.statusCode).toEqual(400);
  //     expect(res.body.message).toBe('Invalid ID format');
  //   });

  //   it('should return 400 if todo not found', async () => {
  //     const validObjectId = new mongoose.Types.ObjectId();
  //     const res = await request(app)
  //       .delete(`/api/v1/todos/${validObjectId}`)
  //       .set('Authorization', `Bearer ${example_token}`);
  //     expect(res.statusCode).toEqual(400);
  //     expect(res.body.message).toBe('Todo not found');
  //   });
  // });
});
