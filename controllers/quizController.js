const {Quiz , Question} = require('../models/Quiz');
const QuizService = require('../services/QuizService')

class QuizController {

    async getAllQuizes(req , res){

        try {
            const user_id = req.user.id;
            const quizes = await QuizService.getAllById(user_id)
            return res.status(200).json(quizes);   
        } catch (e) {
            console.log(e);
            return res.status(400).json({"Error":e});
        }

    }


    async getQuizById(req , res){
        try {

            const quizId = req.params.quizId;
            
            const quiz = await Quiz.findById(quizId).populate('Question');
            
            return res.status(200).json(quiz);
            
        } catch (e) {
            return res.status(500).json({"error":e});
        }
    }

    async getAllQuestionsFromQuizById(req,res){
        try {
            const quizId = req.params.quizId;
    
            const quiz = await Quiz.findById(quizId);
    
            if(!quiz)
                return res.status(404).json({message:`question with id ${_id} is not found`});
    
            const questions = quiz.questions;
    
            return res.status(200).json(questions);
    
        } catch (err) {
            return res.status(500).json({"error":err});
        }
    }

    async getQuestionFromQuizById(req,res){
        try {
            const questionId = req.params.questionId;
            
            const quizId = req.params.quizId;
    
            const quiz = await Quiz.findById(quizId);
    
            const concreteQuestion = await quiz.questions.id(questionId);
    
            return res.status(200).json(concreteQuestion);
    
        } catch (error) {
            console.log(error);
            return res.status(500).json({"error":error});
        }
    }

    async updateQuiz(req,res){
        try {
            const quizId = req.params.quizId;
            const updateOps = {};
            for(const ops of req.body){
                updateOps[ops.propName] = ops.value;
            }
        
            Quiz.findByIdAndUpdate(quizId , {$set: updateOps} )
            .exec()
            .then(quiz =>{return res.status(200).json(quiz);})
            .catch(e => console.log(e));
        
            
        } catch (error) {
            console.log(error);
            return res.status(400).json(error);
        }
    }

    async createQuiz(req,res){
        try {
            const {quizName , description } = req.body;
            const user_id = req.user.id;        
            const quiz = await QuizService.createQuiz(quizName , description , user_id)
           
            return res.status(200).json(quiz);
        } catch (error) {
            console.log(error);
            return res.status(500).json({"error":error});
        }
    }

    async createQuestion(req,res){
        try {
            const quizId = req.params.quizId;
            const {alternatives , description } = req.body;

            const quiz = await QuizService.createQuiestion(quizId,alternatives,description )

            return res.status(200).json(quiz);
            
        } catch (error) {
            console.log(error);
            return res.status(400).json({"error":error});
        }
    }

    async updateQuestion(req,res){
        try {
            
            const quizId = req.params.quizId;
            // const questionId = req.params.questionId;
    
            const {description , alternatives , oldDescription} = req.body;
    
            const newQuestion = {
                description:description,
                alternatives:alternatives
            }

    
            Quiz.findOneAndUpdate({"_id":quizId , "questions.description":oldDescription} ,
             {$set: 
                {"questions.$.description":description , "questions.$.alternatives":alternatives}})
             .then(
                doc => {
                    doc.save()
                    .then(refreshedDoc => res.status(200).json(refreshedDoc))
                    .catch(e => res.status(400).json(e));
                }
            ).catch(e => {
                console.log(e)
               return res.status(400).json(e)
            });      
            
            
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
    
            const quiz = await Quiz.findByIdAndDelete(quizId);
    
            if(quiz.deletedCount === 0)
                return res.status(404).json({"message":"Could not delete because nothing was deleted"});
           
    
            return res.status(204).json({"message":"Succesfully deleted"});
        } catch (error) {
    
            
            console.log(error);
            return res.status(500).json({"error":error});
        }
    }

    async removeQuestionFromQuizById(req,res){
        try {
            const quizId = req.params.quizId;
            const questionId = req.params.questionId;
    
            const quiz = await Quiz.findById(quizId);
    
            await quiz.questions.pull(questionId);
    
            await quiz.save();       
                
            return res.status(204).json({"message":"Succesfully deleted question"});
    
        } catch (error) {
    
            
            console.log(error);
            return res.status(500).json({"error":error});
        }
    }

}

module.exports = new QuizController();