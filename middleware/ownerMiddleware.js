
const jwt = require('jsonwebtoken');
const {Quiz} = require('../models/Quiz');
const ApiError = require('../exceptions/apiError')
const TokenService = require('../services/TokenService')

module.exports = async function (req,res,next){

    try {
        const token = req.headers.authorization.split(' ')[1];

        if(!token)  return next(ApiError.UnauthorizedError())


        const {id} = TokenService.validateAccessToken(token);
        
        //former quizNameOrId
        const quizId = req.body.quizId;
        const quiz = await Quiz.findById(quizId);

        const authorId = quiz.get('author');

        if(id !== authorId)
            return res.status(403).json({message:"You are not owner of this quiz"});


            next();
    } catch (error) {
        next(ApiError.UnauthorizedError())
    }

}