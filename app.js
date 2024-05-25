const express=require("express");
const app=express();
const cors = require('cors');
const dotenv = require("dotenv");
const mongoose=require("mongoose");


dotenv.config()

const port = process.env.PORT || 8000

app.use(cors())
app.use(express.json());


const mongoURL = process.env.NODE_ENV === 'test' ? `${process.env.TEST_DB_URL}/test_todos` : `${process.env.MONGO_URL}/${process.env.DB_NAME}`;

mongoose.connect(`${mongoURL}`);
  
  const db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', () => {
    console.log('Connected to MongoDB');
  });

app.get('/',(req,res)=>{
    res.send("Server running successfully")
})



app.get("*", (req, res) => {
    res.status(404).send("404 PAGE NOT FOUND")
})




const server = app.listen(port, () => {
    console.log(`server is running on port ${port}`);
  });

 module.exports = {server,app};