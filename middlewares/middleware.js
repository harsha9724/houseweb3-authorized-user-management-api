const { verify } = require('jsonwebtoken')
const user = require('../models/user');
const secret=process.env.SECRET

const validateToken = (req, res, next) => {
    const accessToken = req.headers.auth;

    if (!accessToken) {
        return res.status(400).json({ message: "User not Logged In" })
    }

    try {
        verify(accessToken, secret, async (err, decode) => {
            if (err) {
                return res.status(400).json({ message: err.message })
            }
            const data = await user.findOne({ _id: decode.data })
            if (data) {
                req.user = data._id
                next()
            } else {
                res.status(400).json({ message: "User not found" })
            }

        });
    } catch (err) {
        res.status(400).json({ message: err?.message })
    }
}

module.exports = { validateToken };