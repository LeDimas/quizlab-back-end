const {Quiz , Question} = require('../models/Quiz');
const ApiError = require('../exceptions/apiError')
const QuizService = require('../services/QuizService');
const GameService = require('./GameService');

class QuestionService {



    async create(quizId,alternatives,description ){
            
        const quiz = await QuizService.find(quizId);
        
        //remove quiz id in further
        const questionObj = {
            description:description,
            alternatives:alternatives,
            quiz:quizId
        };
        
        const question = new Question(questionObj);
        await quiz.questions.push(question);
        await quiz.save();
        
        return quiz
}

  async getAllById(quizId){
    const quiz = await QuizService.find(quizId);
    return quiz.questions;
  }

  async getById(quizId , questionId){
    const quiz = await QuizService.find(quizId);
    const question = await quiz.questions.id(questionId);
    if(!question) throw ApiError.BadRequest(`question with id ${id} is not found`);
    return question
  }

  async update(quizId , description , alternatives , oldDescription){

   const quiz = await Quiz.findOneAndUpdate({"_id":quizId , "questions.description":oldDescription} ,
     {$set: 
        {"questions.$.description":description , "questions.$.alternatives":alternatives}})
        // perhaps operation below is excessive 
    return await quiz.save()

  }

  async removeById(quizId , questionId){
    const quiz = await QuizService.find(quizId);
    await quiz.questions.pull(questionId);
    await quiz.save(); 
  }

  //used when game starts
  async getWithoutAnwsers(quizName) {

    //not tested yet
    //used when game starts
    await GameService.setStarted(quizName)
    //not tested yet

    

    const questions = await Quiz.aggregate([
        {$match:{name:quizName}}
    ])
    .unwind('questions')
    .group({
        _id:{description:"$questions.description" , alternatives:"$questions.alternatives.text"}
    })
    .project({
        _id:0,
        questions:{
            description:"$_id.description",
            alternatives:"$_id.alternatives"
        }
    })
   
    
    return questions;
    
    }
 


}

module.exports = new QuestionService()