const {Schema , model} = require('mongoose')

const TokenSchema = new Schema({
    // ip
    // browser fingerprint

    user:{type:Schema.Types.ObjectId , ref:'User'},
    refreshToken : {type:String , required:true}
})

module.exports = model('Token' , TokenSchema)