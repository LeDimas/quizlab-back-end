const {Quiz , Question} = require('../models/Quiz');
const QuizNameDto = require('../dtos/QuizNameDto')
const ApiError = require('../exceptions/apiError')

class QuizService {

    async getAllById(id){

            const quizes = await Quiz.find({author:id});       
            if(!quizes) throw ApiError.BadRequest("no such collection");
            // if(length === 0) throw new Error("no quizes");  
            return quizes
    }

    async getUserQuizes(id){

        const quizes = await Quiz.find({author:id})
        const quizList = quizes.map(quiz => new QuizNameDto(quiz))
        return quizList
    }

    async create(name , description , author){

        const quizData = await Quiz.create({name,  description,  author });
        const quiz = new QuizNameDto(quizData)
        return quiz
    }

    async update(quizId , updateOps){
        return await Quiz.findByIdAndUpdate(quizId , {$set: updateOps} )
    }

   

    async getById(id){
        const quiz = await Quiz.findById(id).populate('Question');
        if(!quiz) throw ApiError.BadRequest(`No quiz with ${id} id is found`)
        return quiz
    }

    async removeById(quizId){
        const quiz = await Quiz.findByIdAndDelete(quizId);

        if(quiz.deletedCount === 0)
            return "Could not delete because nothing was deleted";
       
        return "Succesfully deleted";
    }

    async find(id){
        const quiz =  await Quiz.findById(id)
        if(!quiz) throw ApiError.BadRequest(`question with id ${id} is not found`);
        return quiz
    }



}

module.exports = new QuizService()