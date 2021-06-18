
const {Schema , model} = require('mongoose');

const UserSchema = new Schema({
    username: {type: String , unique:true , required:true},
    email:{type:String , unique:true , required:true},
    password: {type: String , requried:true},
    roles: [{type: String , ref: 'Role'}]
    // hash: String, salt: String
    
    //implement rating?
    // rating:{type:Number, unique:true , required:true}
    
});



module.exports = model('User' , UserSchema);