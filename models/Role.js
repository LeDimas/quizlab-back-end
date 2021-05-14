 
const {Schema , model} = require('mongoose');

const RoleSchema = new Schema({
    value: {type: String , unique:true , default: "User"},
    
    // hash: String, salt: String
    
});



module.exports = model('Role' , RoleSchema);