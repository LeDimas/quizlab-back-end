const {Schema , model} = require('mongoose');

const quizGameSchema = new Schema({


    participantMaxAmount:{
        type:Number,
        required:true,
        default:2
    },
    scoreBoard:{
        type:Map,
        of:Schema.Types.ObjectId //change
    },
    invitationCode:{
        type:String,
        required:true
    },
    isStarted:{
        type:Boolean,
        default:false
    },
    participants:[{type:Schema.Types.ObjectId , ref:'Participant'}],
    quiz:{type:Schema.Types.ObjectId , ref:'Quiz' , required:true}

});

module.exports = model('Game' , quizGameSchema);