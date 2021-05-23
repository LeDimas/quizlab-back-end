const { secret } = require("../jwt_config");
const jwt = require('jsonwebtoken');
const {Quiz} = require('../models/Quiz');

module.exports =async function (req,res,next){


try {
    const token = req.headers.authorization.split(' ')[1];

    if(!token)
        return res.status(403).json({message:"User is not authorized"});


    const {id} = jwt.verify(token,secret);
    
    const quizNameOrId = req.body.quizNameOrId;
    const quiz = await Quiz.findById(quizNameOrId);

    const authorId = quiz.get('author');

    if(id !== authorId)
        return res.status(403).json({message:"You are not owner of this quiz"});


        next();
} catch (error) {
    console.log(error);
    return res.status(400).json({message:"User is not authorized"})
}

}