const { verify } = require('jsonwebtoken');
const User = require('../models/user');
const dotenv = require("dotenv");
dotenv.config()
const secret = process.env.SECRET 

const validateToken = async (req, res, next) => {

  const authHeader = req.headers['authorization'] || req.headers['Authorization'];

  const token = authHeader && authHeader.split(' ')[1];


  if (!token) {
    return res.status(400).json({ message: "User not Logged In" });
  }

  try {
    verify(token, secret, async (err, decode) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      const data = await User.findOne({ _id: decode.data });
      if (data) {
        req.user = data._id;
        next();
      } else {
        res.status(400).json({ message: "User not found" });
      }
    });
  } catch (err) {
    res.status(400).json({ message: err?.message });
  }
};


module.exports = { validateToken };
