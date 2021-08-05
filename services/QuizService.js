const {Quiz , Question} = require('../models/Quiz');
const QuizNameDto = require('../dtos/QuizNameDto')
const types = require('mongoose').Types

class QuizService {

    async getAllById(id){

            const quizes = await Quiz.find({author:id});

            const length = quizes.length;
            
            if(!quizes) throw new Error("no such collection");
    
            if(length === 0) throw new Error("no quizes");
                
            return quizes
    }

    async getUserQuizes(id){

        const quizes = await Quiz.find({author:id})
        const quizList = quizes.map(quiz => new QuizNameDto(quiz))
        return quizList
    }

    async createQuiz(name , description , author){

        const quizData = await Quiz.create({name,  description,  author });
        const quiz = new QuizNameDto(quizData)
        return quiz
    }

    async createQuiestion(quizId,alternatives,description ){
            
            const quiz = await Quiz.findById(quizId);
    
            if(!quiz)  throw new Error("No quiz with given id found");
            
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

}

module.exports = new QuizService()