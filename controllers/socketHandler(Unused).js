// const {Quiz} = require('../models/Quiz');
// const Game = require('../models/QGame');
// const mongoose = require('mongoose');
// const Participant = require('../models/Participant');
// const User = require('../models/User');


// class SocketHandler  {


  

//     async registerNewParticipant(usernameId , roomId ){
//         try {

//             const game = await Game.findOne({gameLink:roomId});
//             const maxPlayers = game.get('participantMaxAmount');
//             const currentPlayerCount = game.get('participants').length;
            
            
       
//             // const isStarted = game.get('isStarted');
//             // if(isStarted){
//             //     socket.emit('too late');
//             //     throw new Error('Game is already started')
//             // }
     


          
                
                

            
            
//             const validUsrId = usernameId.userId
//             const participantExists = await Participant.findOne({userId:mongoose.Types.ObjectId(validUsrId) });
            

//             if(participantExists)
//                 {
//                     const check = participantExists.get('leftGame');
//                     socket.emit('participant disqualifed' , 'use this on client to reject user');
//                     // throw new Error('You have left game so you are disqualified');
//                 }else{
//                     const partOjb = {
//                         userId:mongoose.Types.ObjectId(validUsrId) ,
//                         gameId:roomId
//                     }
        
//                     const participant = new Participant(partOjb);
        
//                     await participant.save();
                    
//                     await Game.updateOne({"gameLink":roomId} ,{$push:{participants:participant.id}});
//                 }

            
           


//         } catch (error) {
//             console.log(error);
//         }
//     }

//     async getQuizPlayers(roomId){
//         try {

            
//            const quizPlayers =  await Game.aggregate([
//                 {$match:{gameLink : roomId}}
//             ])
//             .lookup({
//                 from:"participants",
//                 localField:'participants',
//                 foreignField:'_id',
//                 as:'thisGameParticipants'
//             })
//             .lookup({
//                 from:"users",
//                 localField:"thisGameParticipants.userId",
//                 foreignField:"_id",
//                 as:"myGuys"
//             })
//             .group({_id:'$myGuys.username'})  
            
                
//             return quizPlayers[0]._id;

            


//         } catch (error) {
//             console.log(error);
//         }
//     }

//     // async getNewParticipantName(usernameId){
//     //     try {
//     //         console.log('UserId' , usernameId)
//     //         const user = await User.findOne({"_id":usernameId} ,'username');
//     //         // console.log(user.username);
//     //         return user.username.toString();
//     //     } catch (error) {
//     //         console.log(error);
//     //     }
//     // }

//     // async playerLeft(socketId ){
//     //     try {   

//     //     await Participant.findOneAndUpdate({socketId:socketId} ,  {'leftGame':true})
             
//     //     const userGameIdData = await Participant.aggregate([
//     //         {$match:{socketId:socketId}}
//     //     ])
        
//     //     .lookup({
//     //         from:"users",
//     //         localField:"userId",
//     //         foreignField:"_id",
//     //         as:"result"
//     //     })
//     //     .unwind("result")
//     //     .group({_id:{name:"$result.username" , gameId:"$gameId" }});


//     //     return userGameIdData[0]._id.gameId;

//     //     } catch (error) {
//     //         console.log(error);
//     //     }
//     // }

//     async getQuestions(quizName) {

       

//         //not tested yet
//         Quiz.findOne({"name":quizName} , '_id').then((quiz)=>{
//             Game.findOneAndUpdate({"quiz":quiz._id} , {$set:{"isStarted":true}})
//         })
//         //not tested yet

        

//         const questions = await Quiz.aggregate([
//             {$match:{name:quizName}}
//         ])
//         .unwind('questions')
//         .group({
//             _id:{description:"$questions.description" , alternatives:"$questions.alternatives.text"}
//         })
//         .project({
//             _id:0,
//             questions:{
//                 description:"$_id.description",
//                 alternatives:"$_id.alternatives"
//             }
//         })
//         // .limit(maxQuestions);
//         //This can be used if quiz conain many questions(e.g. 100)
//         //and you want to give out only 20
        
//         return questions;
        
//         }


// // =====================

//         async checkWhetherAllFinished(roomId){
//             try {
//                 console.log(roomId)
//                 const aggregationResult = await Game.aggregate([
//                     {$match:{gameLink :roomId}}
//                 ])
//                 .lookup({
//                     from:"participants",
//                     localField:'participants',
//                     foreignField:'_id',
//                     as:'thisGameParticipants'
//                 })
//                 .project({
//                     "thisGameParticipants._id":1,
//                     "thisGameParticipants.finished":1,
//                 })
//                 .match(
//                     {"thisGameParticipants.finished":false}
//                 )
//                 .count("finished");

           
    
//                 return aggregationResult.length < 1 ? true : false;
//             } catch (error) {
//                 console.log(error)
//             }
            
//         }



//     async calculatePlayerResult(userAnwsers ,usernameId, quizAndRoomId ,quizName , timeResult ){

       
        
//         const questions = await Quiz.aggregate([
//             {$match:{name:quizName}}
//         ])
//         .unwind('questions')
//         .project({
//             "questions.description":1,
//             "questions.alternatives":1,
//         })
//         .project({
//             question:{
//                    $map:{
//                         "input":{
//                             $filter:{
//                                 "input":"$questions.alternatives",
//                                 "as":"anwsersf",
//                                 "cond":"$$anwsersf.isCorrect"
//                             }
//                         },
//                         "as": "anwsersm",
//                         "in": {
//                             "correctAnwser": "$$anwsersm.text",
//                         }
//                     }        
//             },
//             questionDescription:"$questions.description"
//         })
//         .project({
//             _id:0,
//             questionData:{
//                 questionDesc:"$questionDescription",
//                 anwser:{$first:"$question.correctAnwser"}
//             }
//         });





        
//         // const correctAnwsered = await calcCorrect(questions , userAnwsers);

//         let correctAnwsered = 0;

//         questions.forEach(
//             (question) =>{
//                 const description = question.questionData.questionDesc;
//                 const anwser = question.questionData.anwser;
//                 const usrAnwsr = userAnwsers.anwsers.find((ques)=>ques.questionDesc === description);
//                 if(usrAnwsr.anwserGiven === anwser) {
//                     correctAnwsered++;
//                     console.log(usrAnwsr.anwserGiven)
//                     console.log(anwser)
//                 }
//             }   
//         )

//         console.log(correctAnwsered);

//         const result = await Participant.findOneAndUpdate({"userId":usernameId} ,
//          {$set:{"finished":true , "correctAnwsers":correctAnwsered , "timeResultInSeconds":timeResult}} , {new:true});

//          console.log(result);

      
//          return correctAnwsered;

        

//     } catch (error) {
//         console.log(error);
//         }
    


    




// }

// module.exports = new SocketHandler();