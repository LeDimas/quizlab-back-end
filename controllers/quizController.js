const {Quiz , Question} = require('../models/Quiz');

class QuizController {

    async getAllQuizes(req , res){

        try {
            const user_id = req.user.id;
            const quizes = await Quiz.find({author:user_id});
    
            const length = quizes.length;
            
    
            if(!quizes)
                return res.status(500).json({"message":"no such collection"});
    
            if(length === 0)
                return res.status(200).json({"message":"no quizes"});
                
            
            return res.status(200).json(quizes);
    
        } catch (e) {
            console.log(e);
            return res.status(500).json({"error":e});
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

            const {name , description ,_id} = req.body;
            const user_id = req.user.id;
            
            const quizToCreate = await Quiz.create({
                name:name,
                description:description,
                author:user_id
            });
    
            
            return res.status(200).json(quizToCreate);
    
    
        } catch (error) {
            console.log(error);
            return res.status(500).json({"error":error});
        }
    }

    async createQuestion(req,res){
        try {

            const quizId = req.params.quizId;
            
            const {alternatives , description } = req.body;
            
            const quiz = await Quiz.findById(quizId);
    
            if(!quiz)
            return res.status(400).json({"error":"no quiz with given id found"});
            
            const questionObj = {
                description:description,
                alternatives:alternatives,
                quiz:quizId
            };
            
            const question = new Question(questionObj);
            
            await quiz.questions.push(question);
            
            const result = await quiz.save();
            
            return res.status(200).json(quiz);
            
            
        } catch (error) {
            console.log(error);
            return res.status(400).json({"error":error});
        }
    }

    async updateQuestion(req,res){
        try {
            const quizId = req.params.quizId;
            const questionId = req.params.questionId;
    
            const {description , alternatives} = req.body;
    
            const newQuestion = {
                description:description,
                alternatives:alternatives
            }
    
            Quiz.findOneAndUpdate({"_id":quizId , "questions._id":questionId} ,
             {$set: 
                {"questions.$.description":description , "questions.$.alternatives":alternatives}})
             .then(
                doc => {
                    doc.save()
                    .then(refreshedDoc => res.status(200).json(refreshedDoc))
                    .catch(e => res.status(400).json(e));
                }
            ).catch(e => res.status(400).json(e));      
            
            
        } catch (error) {
            console.log(error);
            return res.status(400).json(error);
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