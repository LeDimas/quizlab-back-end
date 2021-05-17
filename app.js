const express = require('express');
const dotenv = require('dotenv').config();
const connectToMongoDb = require('./database').connectToMongoDb;
const authRoutes = require('./routes/auth');
const quizRoutes = require('./routes/quiz_question');
const cors = require('cors');

//Initialize express app
const app = express();

const PORT = process.env.PORT;

app.use(cors());





app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/api/auth' , authRoutes);
app.use('/api' , quizRoutes);

connectToMongoDb();

































const start = () => {
    try {
        app.listen(PORT , () => console.log(`server started on port ${PORT}`));
    } catch (error) {
        console.log(error);
    }
}

start();

