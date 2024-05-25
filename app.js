const express=require("express");
const app=express();
const cors = require('cors');
const dotenv = require("dotenv");
const mongoose=require("mongoose");
const user_routes = require('./routes/user.js');
const swaggerJSDoc=require("swagger-jsdoc");
const swaggerUI=require("swagger-ui-express");
const todo_routes = require('./routes/todo.js')

dotenv.config()

const port = process.env.PORT || 8000

app.use(cors({
    origin: 'http://localhost:8000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
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
                url:`http://localhost:${port}`
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

const mongoURL = process.env.NODE_ENV === 'test' ? `${process.env.TEST_DB_URL}/test_user_management` : `${process.env.MONGO_URL}/${process.env.DB_NAME}`;

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