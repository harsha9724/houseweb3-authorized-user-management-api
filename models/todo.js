const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const todoSchema = new Schema({
    title:{
        type:String,
        required: true
    },
    completed:{
        type:Boolean,
        default: false
    },
    user_id:{
        type: Schema.Types.ObjectId,
        ref:'user'
    }

},{timestamps:true});

const Todo = new mongoose.model('todos',todoSchema);

module.exports = Todo