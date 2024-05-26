const mongoose = require('mongoose');

const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    const url  =  `${process.env.TEST_DB_URL}/test_user_management_todos` ;
    await mongoose.connect(url);
  }
};

const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
};

module.exports = { connectDB, disconnectDB };
