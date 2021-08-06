const {Quiz , Question} = require('../models/Quiz');
const QuizService = require('../services/QuizService')
const QuestionService = require('../services/QuestionService')

class QuizController {

    async getAllQuizes(req , res , next){

        try {
            const user_id = req.user.id;
            const quizes = await QuizService.getAllById(user_id)
            return res.status(200).json(quizes);   
        } catch (e) {
            console.log(e);
            next(e)
        }

    }

    async getQuizById(req , res , next){
        try {
            const quizId = req.params.quizId;
            const quiz = await QuizService.getById(quizId)
            return res.status(200).json(quiz);
        } catch (e) {
           next(e)
        }
    }

    async getAllQuestionsFromQuizById(req,res ,next){
        try {
            const quizId = req.params.quizId;
            const questions = await QuestionService.getAllById(quizId)
            return res.status(200).json(questions);
        } catch (err) {
            next(err)
        }
    }

    async getQuestionFromQuizById(req,res , next){
        try {
            const {questionId,quizId} = req.params;
            const question = await QuestionService.getById(quizId , questionId)
            return res.status(200).json(question);
        } catch (error) {
            console.log(error);
            next(error)
        }
    }

    async updateQuiz(req,res){
        try {
            const quizId = req.params.quizId;
            const updateOps = {};
            for(const ops of req.body)  updateOps[ops.propName] = ops.value;
            
            const quiz = await QuizService.update(quizId , updateOps)
            return res.status(200).json(quiz)  
            
        } catch (error) {
            console.log(error);
            return res.status(400).json(error);
        }
    }

    async createQuiz(req,res){
        try {
            const {quizName , description } = req.body;
            const user_id = req.user.id;        
            const quiz = await QuizService.create(quizName , description , user_id)
            return res.status(200).json(quiz);
        } catch (error) {
            console.log(error);
            return res.status(500).json({"error":error});
        }
    }

    async createQuestion(req,res , next){
        try {
            const quizId = req.params.quizId;
            const {alternatives , description } = req.body;
            const quiz = await QuestionService.create(quizId,alternatives,description )
            return res.status(200).json(quiz);
        } catch (error) {
            console.log(error);
            next(error)
        }
    }

    async updateQuestion(req,res){
        try {
            
            const quizId = req.params.quizId;
            const {description , alternatives , oldDescription} = req.body;
            const updatedQuiz = await QuestionService.update(quizId , description,alternatives , oldDescription)
            return res.status(200).json(updatedQuiz)
            
        } catch (error) {
            console.log(error);
            return res.status(400).json(error);
        }
    }

    async getUserQuizes(req,res){
        try{

        const {id} = req.user
        const quizes = await QuizService.getUserQuizes(id)
        return res.json(quizes)

        }catch(e){
            console.log(e)
            return res.status(400).json(e)
        }
    }

    async removeQuizById(req,res){
        try {
            const quizId = req.params.quizId;
            const response = await QuizService.removeById(quizId)
            return res.status(204).json({"message":response});
        } catch (error) {
            console.log(error);
            return res.status(500).json({"error":error});
        }
    }

    async removeQuestionFromQuizById(req,res , next){
        try {
            const {quizId,questionId} = req.params;
            await QuestionService.removeById(quizId);
            return res.status(204).json({"message":"Succesfully deleted question"});
    
        } catch (error) {
            next(error)
        }
    }

}

module.exports = new QuizController();