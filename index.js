const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 4270;

app.listen(port, () => {
   console.log(`Server is running on port ${port}`);
});

// Middleware
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL || 'mongodb://mongodb:27017/db_user')
   .then(() => {
       console.log('Connected to MongoDB');
   }).catch((error) => {
       console.error('Error connecting to MongoDB', error);
   });

// Routes
const userRoutes = require('./routes/userRoute');
app.use('/user', userRoutes);

// Test de la route
app.get('/', (req, res) => {
   res.send('Server is running');
});
