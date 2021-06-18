// const {Quiz , Question} = require('../models/Quiz');
const Game = require('../models/QGame');
const User = require('../models/User');
// const Participant = require('../models/Participant');
const authMiddleware = require('../middleware/authMiddleware');
const ownerMiddleware = require('../middleware/ownerMiddleware');
const router = require('express').Router();
const mongoose = require('mongoose');
const controller = require('../controllers/gameController');
const Participant = require('../models/Participant');






//add middleware
router.get('/joinGame/:gameId',  controller.joinGameGet)


router.post('/joinGame/:gameId', controller.joinGamePost)

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

router.get('/technicalGetParticipantFinishedCount' , async (req,res)=>{
 

    try {

      

        


        // const aggregationResult = await Participant.aggregate([
        //     {$match:{gameId :'60a6da09b479713ba49fcee9'}}
        // ])
        // .sort({correctAnwsers:-1 , timeResultInSeconds:1})
        // .project({'correctAnwsers':1,'timeResultInSeconds':1 , 'userId':1 , 'place':1})
        // .lookup({
        //     from:"users",
        //     localField:'userId',
        //     foreignField:'_id',
        //     as:'thisGameUser'
        // })
        // .project({
        //     'correctAnwsers':1,'timeResultInSeconds':1 , 'userId':1 , 'place':1,
        //     'thisGameUser.username':1
        // });

        


        // let scoreBoard = {};
        // aggregationResult.forEach(part =>{
        //     console.log(part);
        // })

        // const aggregationResult = await Game.aggregate([
        //     {$match:{_id : mongoose.Types.ObjectId('60a6da09b479713ba49fcee9')}}
        // ])
        // .lookup({
        //     from:"participants",
        //     localField:'participants',
        //     foreignField:'_id',
        //     as:'thisGameParticipants'
        // })
        // .project({
     
        //     'thisGameParticipants._id':1,
        //     'thisGameParticipants.correctAnwsers':1,
        //     'thisGameParticipants.timeResultInSeconds':1,
        //     'thisGameParticipants.userId':1
        // })
        // .sort({'thisGameParticipants.timeResultInSeconds':1});

        res.status(200).json(aggregationResult);
    } catch (error) {
        console.log(error);
    }


       

})
//#endregion

router.post('/createGame', [authMiddleware, ownerMiddleware] ,controller.createGame)



module.exports = router;