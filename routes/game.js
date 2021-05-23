// const {Quiz , Question} = require('../models/Quiz');
// const Game = require('../models/QGame');
// const Participant = require('../models/Participant');
const authMiddleware = require('../middleware/authMiddleware');
const ownerMiddleware = require('../middleware/ownerMiddleware');
const router = require('express').Router();
const controller = require('../controllers/gameController')






//add middleware
router.get('/joinGame/:gameId', authMiddleware   , controller.joinGameGet)


router.post('/joinGame/:gameId', authMiddleware  , controller.joinGamePost)

//#region toDelete

router.post('/technicalCleanUp' , async (req,res) =>{
    try {
        
        Participant.remove({} , ()=>console.log("all participant docs wiped"));

        res.status(200).json({message:"ok"});
        
    } catch (error) {
        console.log(error);
        res.status(400).json({message:"wtf"})
    }
})

router.get('/technicalGetQuestion/:quizName' , async (req,res) => {
    try {
        const quizName = req.params.quizName;

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
        .limit(1);
       
   
        
        res.status(200).json(questions);

    } catch (error) {
        console.log(error);
        res.status(400).json({message:"bad request"});
    }
})

router.get('/gameinfo/:gameId' , async (req,res) => {

    try {
        const gameId = req.params.gameId;
        const game = await Game.findOne({"_id":gameId}).populate({path:'participants' , populate:{path:'userId'}});

        return res.status(200).json(game);
    } catch (error) {
        console.log(error);
        return res.status(400).json({message:error});
    }
})

router.post('/technicalGetQuestion/:quizName', async (req,res)=>{

    try {
        const userAnwsers = req.body.anwsers;
        const quizName = req.params.quizName;
        let correctAnwsered = 0; 

        const questions = await Quiz.aggregate([
            {$match:{name:quizName}}
        ])
        .unwind('questions')
        .project({
            "questions.description":1,
            "questions.alternatives":1,
        })
        .project({
            question:{
                   $map:{
                        "input":{
                            $filter:{
                                "input":"$questions.alternatives",
                                "as":"anwsersf",
                                "cond":"$$anwsersf.isCorrect"
                            }
                        },
                        "as": "anwsersm",
                        "in": {
                            "correctAnwser": "$$anwsersm.text",
                        }
                    }        
            },
            questionDescription:"$questions.description"
        })
        .project({
            _id:0,
            questionData:{
                questionDesc:"$questionDescription",
                anwser:{$first:"$question.correctAnwser"}
            }
        });

        questions.forEach(
            (question) =>{
                const description = question.questionData.questionDesc;
                const anwser = question.questionData.anwser;
                
                userAnwsers.forEach(
                    (userAnwser)=>{
                        if(userAnwser.questionDescription === description){
                           if(userAnwser.anwserGiven === anwser){
                            correctAnwsered++;
                           }
                        }
                    }
                )
            }
        )

        res.status(200).json({message:"OK"})

    } catch (error) {
        console.log(error);
        res.status(400).json({message:"bad request"});
    }


})
//#endregion

router.post('/createGame', [authMiddleware, ownerMiddleware] ,controller.createGame)



module.exports = router;