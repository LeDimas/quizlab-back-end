const {Schema,model} = require('mongoose');





const questionSchema = new Schema({
    
    description:{
        type:String,
        required:true
    },

    alternatives:[
        {
            text:{
                type:String,
                required:true
            },
            isCorrect:{
                type:Boolean,
                required:true,
                default:false
            }
        }
    ] , 
     
    //Remove in further
    quiz:{
        type: Schema.Types.ObjectId,
        required:true
    },
    
   
    isEnabled:{
        type:Boolean,
        default:true
    }
    
} , {timestamps:true});






const quizSchema = new Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    author:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true
    },
    isEnabled:{
        type:Boolean,
        default:true
    },
    questions:[questionSchema],

    duration:{
        hours:{
            type:Number,
            default:0
        },
        minutes:{
            type:Number,
            default:0
        },
        seconds:{
            type:Number,
            default:0
        }
    },
    private:{
        type:Boolean,
        default:false
    }

} , {timestamps:true});

module.exports.Quiz = model('Quiz' , quizSchema);
module.exports.Question = model('Question' , questionSchema);