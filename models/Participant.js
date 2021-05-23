const {Schema,model} = require('mongoose');

const participantSchema = new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    correctAnwsers:{
        type:Number,
        default:0
    },
    socketId:[{
      type:String
    }],
    leftGame:{
        type:Boolean,
        default:false
    },
    finished:{
        type:Boolean,
        default:false
    },
    gameId:{
        type:String,
        required:true
    },
    timeResultInSeconds:{
        type:Number,
        default:0
        // hours:{
        //     type:Number,
        //     default:0
        // },
        // minutes:{
        //     type:Number,
        //     default:0
        // },
        // seconds:{
        //     type:Number,
        //     default:0
        // }
    },
    place:{
        type:Number,
        default:0
    }
})

module.exports = model('Participant' , participantSchema);