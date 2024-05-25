const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");
const User = require("../models/user");
var jwt = require('jsonwebtoken');
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
const dotenv = require("dotenv");
dotenv.config()
const secret= process.env.SECRET 

/**
 * ********* swagger schema *******
 */
/**
 * @swagger
 *  components:
 *      schema:
 *          user:
 *              type: object
 *              properties:
 *                    email:
 *                          type: string
 *                    password:
 *                          type: string 
 */


/**
 * ************register************
 */

/**
 * @swagger
 * /api/v1/user/register:
 *  post:
 *      summary: This api is used to register the user
 *      description: This api is used to register the user
 *      requestBody:
 *             required: true
 *             content:
 *                 application/json:
 *                      schema:
 *                          $ref: "#components/schema/user"
 *      responses:
 *          200:
 *              description: user registered sucessfully
 *          403:
 *              description: user is already registered
 *          400:
 *              description: Not ok
 * 
 */

router.post(
  "/user/register",
  body("email").isEmail(),
  body("password").isLength({
    min: 6,
    max: 16,
  }),
  body("password").isAlphanumeric(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const {  email, password } = req.body;

      const user = await User.findOne({ email });
      if (user) {
        return res.status(403).json({
          status: "failed",
          message: "User already exists",
        });
      }

      bcrypt.hash(password, 10, async function (err, hash) {
        if (err) {
          return res
            .status(400)
            .json({ status: "Not Ok", message: err.message });
        }
        const user = await User.create({
          email,
          password: hash,
        });
        res.status(200).json({
          message: "User registered successfully",
        });
      });
    } catch (e) {
      res.status(400).json({
        message:"Failed to register",
      });
    }
  }
);

/**
 * ************login************
 */
/**
 * @swagger
 * /api/v1/user/login:
 *  post:
 *      summary: this api is used to login 
 *      description: this api will check whether the user is registerd or not
 *      requestBody:
 *             required: true
 *             content:
 *                 application/json:
 *                      schema:
 *                          $ref: "#components/schema/user"
 *      responses:
 *          200:
 *              description: login sucessfully
 *          403:
 *              description: Invalid email/ Invalid user
 *          400:
 *              description: Failed to login
 * 
 */


router.post("/user/login", body('email').isEmail(), async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const {email, password } = req.body;
        const user = await User.findOne({email});
        if(!user){
            return res.status(403).json({ 
                message: "Invalid email/ Invalid user"
            });
        }
        // Load hash from your password DB.
        bcrypt.compare(password, user.password, function(err, result) {
            if(err) {
                return res.status(403).json({ message: err.message});
            }
            if(result){
                const token = jwt.sign({
                    exp: Math.floor(Date.now() / 1000) + (60 * 60),
                    data: user._id
                  }, secret);

                res.status(200).json({
                    message: "Login successful",
                    token: token
                })
            }else{
                res.status(403).json({
                    message: "Invalid password"
                })
            }
        });

    } catch (e) {
        res.status(400).json({
            status: "Failed to login",
            message: e.message
            }
        )
    }

});


module.exports = router;
