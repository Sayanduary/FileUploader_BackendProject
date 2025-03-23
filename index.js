const express = require('express');
require('dotenv').config(); // Load environment variables
const cookieParser = require('cookie-parser');
const connectToDb = require('./config/db.js');

const app = express();

// Connect to the database before starting the server
connectToDb()
  .then(() => {
    app.use(express.json());
    app.use(cookieParser());
    app.set('view engine', 'ejs');
    app.use(express.urlencoded({ extended: true }));

    const userRouter = require('./routes/user.Routes');
    const homeRouter = require('./routes/app.routes.js')

    
    app.use('/', homeRouter)
    app.use('/user', userRouter);


    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB. Server not started.", err);
  });
