const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    email:{
        type:String,
        unique: true
    },
    password: String
},{timestamps: true});

const User = new mongoose.model('user',userSchema);

module.exports = User;