const express=require("express");
const app=express();
const cors = require('cors');
const dotenv = require("dotenv");
const mongoose=require("mongoose");
const user_routes = require('./routes/user.js');
const swaggerJSDoc=require("swagger-jsdoc");
const swaggerUI=require("swagger-ui-express");
const todo_routes = require('./routes/todo.js')
const API_URL = 'https://houseweb3-authorized-user-management-api.onrender.com'
dotenv.config()

const port = process.env.PORT || 8000

app.use(cors());
app.use(express.json());

const options={
    definition:{
        openapi:"3.0.0",
        info:{
            title:"node js user management todo project",
            version:"1.0.0"
        },
        servers:[
            {
                url:API_URL
            }
        ]
    },
        components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                in: "header",
                scheme: 'bearer',
                bearerFormat: 'JWT',
            }
        }
    },
    security: [{
        bearerAuth: []
    }],
    apis:["./routes/user.js","./routes/todo.js"]
}
const swaggerSpec=swaggerJSDoc(options);
app.use("/api-doc",swaggerUI.serve,swaggerUI.setup(swaggerSpec));

const mongoURL = process.env.NODE_ENV === 'test' ? `${process.env.TEST_DB_URL}` : `${process.env.MONGO_URL}`;

mongoose.connect(`${mongoURL}`);
 
  const db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', () => {
    console.log('Connected to MongoDB');
  });

app.get('/',(req,res)=>{
    res.send("Server running successfully")
})

app.use('/api/v1',user_routes)
app.use('/api/v1',todo_routes)

app.get("*", (req, res) => {
    res.status(404).send("404 PAGE NOT FOUND")
})




const server = app.listen(port, () => {
    console.log(`server is running on port ${port}`);
  });

 module.exports = {server,app};