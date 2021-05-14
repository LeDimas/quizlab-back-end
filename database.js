const mongoose = require('mongoose');
require('dotenv').config();

const DB_CONNECTION_STRING = process.env.DB_CONNECTION_STRING;

const connectToMongoDb = async() => {
    try {

        
        const databaseConnection = await mongoose.connect(DB_CONNECTION_STRING , {
            useNewUrlParser:true,
            useUnifiedTopology:true,
            useFindAndModify:false
        });

        console.log(`Mongo succesfully connected on host ${databaseConnection.connection.host}`);

        return databaseConnection;
        
    } catch (err) {
        console.log(err);
    }
    
}

module.exports.connectToMongoDb = connectToMongoDb;











// Creates simple schema for a User.  The hash and salt are derived from the user's given password when they register
// const UserSchema = new mongoose.Schema({
//     username: String,
//     hash: String,
//     salt: String,
//     admin:Boolean
// });



// const User = connection.model('User', UserSchema);

// module.exports = connection;