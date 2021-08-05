const {Quiz} = require('../models/Quiz');
const Game = require('../models/QGame');
const mongoose = require('mongoose');
const Participant = require('../models/Participant');
const User = require('../models/User');


class SocketHandler  {

    async registerNewParticipant(usernameId , roomId , socketId , socket){
        try {

            const game = await Game.findById(roomId);
            const maxPlayers = game.get('participantMaxAmount');
            const currentPlayerCount = game.get('participants').length;
            
            
            //not tested
            const isStarted = game.get('isStarted');
            if(isStarted){
                socket.emit('too late');
                throw new Error('Game is already started')
            }
            //not tested


            if(currentPlayerCount>=maxPlayers){
                socket.emit('participant max amount reached' , 'use this on client to reject user');
                throw new Error('max limit reached');
            }
                 
           

            const participantExists = await Participant.findOne({"userId":usernameId});
            

            if(participantExists)
                {
                    console.log(participantExists);
                    const check = participantExists.get('leftGame');
                    console.log(check);


                    socket.emit('participant disqualifed' , 'use this on client to reject user');
                    throw new Error('You have left game so you are disqualified');
                }

            
            const partOjb = {
                userId:usernameId,
                gameId:roomId
            }

            const participant = new Participant(partOjb);

            await participant.socketId.push(socketId);

            await participant.save();
            
            await Game.updateOne({"_id":roomId} ,{$push:{participants:participant.id}});


        } catch (error) {
            console.log(error);
        }
    }

    async getQuizPlayers(roomId){
        try {

            
         
            
           const ok =  await Game.aggregate([
                {$match:{_id : mongoose.Types.ObjectId(roomId)}}
            ])
            .lookup({
                from:"participants",
                localField:'participants',
                foreignField:'_id',
                as:'thisGameParticipants'
            })
            // .unwind({path:'$thisGameParticipants' , preserveNullAndEmptyArrays:true})
            .lookup({
                from:"users",
                localField:"thisGameParticipants.userId",
                foreignField:"_id",
                as:"myGuys"
            })
            .group({_id:'$myGuys.username'})  
            
                
            return ok[0]._id;

            


        } catch (error) {
            console.log(error);
        }
    }

    async getNewParticipantName(usernameId){
        try {
            const user = await User.findOne({"_id":usernameId} ,'username');
            // console.log(user.username);
            return user.username.toString();
        } catch (error) {
            console.log(error);
        }
    }

    async playerLeft(socketId ){
        try {   

        await Participant.findOneAndUpdate({socketId:socketId} ,  {'leftGame':true})
             
        const userGameIdData = await Participant.aggregate([
            {$match:{socketId:socketId}}
        ])
        
        .lookup({
            from:"users",
            localField:"userId",
            foreignField:"_id",
            as:"result"
        })
        .unwind("result")
        .group({_id:{name:"$result.username" , gameId:"$gameId" }});


        return userGameIdData[0]._id.gameId;

        } catch (error) {
            console.log(error);
        }
    }

    async getQuestions(quizName) {

        //not tested yet
        Quiz.findOne({"name":quizName} , '_id').then((quiz)=>{
            Game.findOneAndUpdate({"quiz":quiz._id} , {$set:{"isStarted":true}})
        })
        //not tested yet

        console.log('get questions triggered');

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
        // .limit(maxQuestions);
        //This can be used if quiz conain many questions(e.g. 100)
        //and you want to give out only 20
        
        return questions;
        
        }

        async checkWhetherAllFinished(roomId){
            try {
                const aggregationResult = await Game.aggregate([
                    {$match:{_id : mongoose.Types.ObjectId(roomId)}}
                ])
                .lookup({
                    from:"participants",
                    localField:'participants',
                    foreignField:'_id',
                    as:'thisGameParticipants'
                })
                .project({
                    "thisGameParticipants._id":1,
                    "thisGameParticipants.finished":1,
                })
                .match(
                    {"thisGameParticipants.finished":false}
                )
                .count("finished");
    
                return aggregationResult.length < 1 ? true : false;
            } catch (error) {
                console.log(error)
            }
            
        }


    async calculatePlayerResult(userAnwsers ,usernameId, quizAndRoomId ,quizName , timeResult ){

        console.log(`room(quiz(later is better to split quiz and room id)) name:${quizAndRoomId} \n usernameId:${usernameId} \n suppliedAnwsers:${userAnwsers} \n quiz name: ${quizName} \n timeResult:${timeResult}`);

        
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

        console.log(userAnwsers.anwsers.find((ques)=>ques.questionDesc === 'What is your name?'));



        
        // const correctAnwsered = await calcCorrect(questions , userAnwsers);

        let correctAnwsered = 0;

        questions.forEach(
            (question) =>{
                const description = question.questionData.questionDesc;
                const anwser = question.questionData.anwser;
                const usrAnwsr = userAnwsers.anwsers.find((ques)=>ques.questionDesc === description);
                if(usrAnwsr.anwserGiven === anwser) correctAnwsered++;
            }
        )

        console.log(correctAnwsered);

        const result = await Participant.findOneAndUpdate({"userId":usernameId} ,
         {$set:{"finished":true , "correctAnwsers":correctAnwsered , "timeResultInSeconds":timeResult}} , {new:true});

         console.log(result);

      
         return correctAnwsered;

        

    } catch (error) {
        console.log(error);
        }
    


    




}

module.exports = new SocketHandler();