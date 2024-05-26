const express = require("express");
const router = express.Router();
const Todo = require("../models/todo.js");
const { validateToken } = require("../middlewares/middleware");
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
const mongoose = require('mongoose')

/**
 * ******* swagger schema ********
 */
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     todo:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         completed:
 *           type: boolean
 *           default: false
 *     updatetodo:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         completed:
 *           type: boolean
 */

/**
 * ******** to get all todos available for the logged-in user***********
 */
/**
 * @swagger
 * /api/v1/todos:
 *   get:
 *     summary: To get all todos of the user from MongoDB
 *     description: This API is used to fetch the data from MongoDB
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         description: Bearer token for authorization
 *         schema:
 *           type: string
 *           example: Bearer <token>
 *     responses:
 *       200:
 *         description: Successfully fetched the data from MongoDB
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/todo"
 *       400:
 *         description: Bad request
 */
router.get('/todos', validateToken, async (req, res) => {
  try {
    const todos = await Todo.find({ user_id: req.user });
    res.status(200).send(todos);
  } catch (err) {
    res.status(400).send(err);
  }
});


// create todo

/**
 * @swagger
 * /api/v1/todos:
 *  post:
 *      summary: This api is  to create the todo from authorized user
 *      description: This api is to store data to database.
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: header
 *          name: Authorization
 *          required: true
 *          description: Bearer token for authorization
 *          schema:
 *           type: string
 *           example: Bearer <token>
 *      requestBody:
 *             required: true
 *             content:
 *                 application/json:
 *                      schema:
 *                          $ref: "#components/schemas/todo"
 *      responses:
 *          200:
 *              description: todo created successfully
 *          500:
 *              description: failed
 *
 */


router.post('/todos',validateToken, async (req, res) => {
    if(!req.body.title){
        res.status(400).send( {message:"Title is required"});
        return
    }
    const todo = new Todo({
      title: req.body.title,
      user_id: req.user
    });
    try {
      const savedTodo = await todo.save();
      res.status(201).send(savedTodo);
    } catch (err) {
      res.status(400).send(err?.message);
    }
  });


// update todo

/**
 * ****** update the products ********
 */

/**
 * @swagger
 * /api/v1/todos/{id}:
 *  put:
 *      summary: To update todo form the authorized user
 *      description: This api is used to update the data
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *          - in: header
 *            name: Authorization
 *            required: true
 *            description: Bearer token for authorization
 *            schema:
 *             type: string
 *             example: Bearer <token>
 *          - in: path
 *            name: id
 *            required: true
 *            description: todo id is required
 *            schema:
 *               type: string
 *      requestBody:
 *             required: true
 *             content:
 *                 application/json:
 *                      schema:
 *                          $ref: "#components/schemas/updatetodo"
 *      responses:
 *          200:
 *              description: updated successfully
 *          500:
 *              description: failed
 *
 */



router.put('/todos/:id',validateToken, async (req, res) => {
    try {
      // Check the valid format of id
      const { id } = req.params;
  
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send({ message:'Invalid ID format'});
      }
  
      // Check the existence and ownership
      const todo = await Todo.findOne({
        _id: id,
        user_id: req.user, // Assuming req.user holds the user_id
      });
  
      if (!todo) {
        return res.status(400).send({ message:'Todo not found'});
      }
  
      // Update todo
      todo.title = req.body.title || todo.title;
      todo.completed = req.body.completed || todo.completed;
  
      await todo.save();
  
      res.status(200).json(todo); 
    } catch (err) {
      res.status(400).send(err.message);
    }
  });
  
// delete todo

/**
 * @swagger
 * /api/v1/todos/{id}:
 *  delete:
 *      summary: This api is for delete todo from authorized user
 *      description: This api is used to delete the todo of the user
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *          - in: header
 *            name: Authorization
 *            required: true
 *            description: Bearer token for authorization
 *            schema:
 *             type: string
 *             example: Bearer <token>
 *          - in: path
 *            name: id
 *            required: true
 *            description: todo id is required
 *            schema:
 *               type: string
 *      responses:
 *          200:
 *              description: deleted successfully
 *          500:
 *              description: todo not found
 *
 */

  
router.delete('/todos/:id', validateToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({ message: 'Invalid ID format' });
    }

    const todo = await Todo.findOne({
      _id: id,
      user_id: req.user, 
    });

    if (!todo) {
      return res.status(400).json({ message: 'Todo not found' });
    }

    await Todo.findByIdAndDelete(id);
    res.status(200).send({ message: 'Todo deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

  


module.exports = router;
