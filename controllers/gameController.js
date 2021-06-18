const {Quiz , Question} = require('../models/Quiz');
const Game = require('../models/QGame');
const Participant = require('../models/Participant');


class GameController {



    async joinGamePost(req,res){
        try {

            const isAdmin = req.body.isAdmin;
            const usernameId = req.body.usernameId;
            const candidateInputInvitationCode = req.body.invitationCode;
    
            
    
            const gameId = req.params.gameId;
            const game = await Game.findOne({"_id":gameId});
    
            if(!game)
                return res.status(400).json({message:"No such game"})
    
            const validInvitationCode = game.get('invitationCode');
    
            if(validInvitationCode !== candidateInputInvitationCode)
                return res.status(400).json({message:"Incorrect invitation code"});
    
    
            const quizId = game.get('quiz');
            const quiz = await Quiz.findById(quizId);
            const duration = quiz.duration;
            const quizName = quiz.name;
    
            res.render('room',{layout:'index' , quizName:quizName , isAdmin:isAdmin , usernameId:usernameId , room:gameId , time:duration});
    
    
            // return res.status(200).json({message:"lessgo" , invitationCode:candidateInputInvitationCode , invitationCodeOfGame:validInvitationCode });
        } catch (error) {
            console.log(error);
            return res.status(400).json({message:"Bad request suka"});
        }
    }
    
    async joinGameGet(req , res){

        try {
        const gameId = req.params.gameId;
        const game = await Game.findOne({"_id":gameId}).populate({path:'participants' , populate:{path:'userId'}});

        // return res.status(200).json(game);
        res.render('enter_room' , {layout:'index'});
    
        } catch (e) {
            console.log(e);
            return res.status(500).json({"error":e});
        }

    }

    async assignGameResults(roomId){
        try {
            const aggregationResult =  await Participant.where({gameId:roomId})
            .sort({correctAnwsers:-1 , timeResultInSeconds:1});
            let placeInc = 0;

            aggregationResult.forEach(element => {
                placeInc++;
                Participant.findOneAndUpdate({'userId':mongoose.Types.ObjectId(element.userId)} ,
                {$set:{'place':placeInc}}).then((doc)=>doc.save());
                
            });


        } catch (error) {
            console.log(error);
        }
    }
    
    async createGame(req , res){

        try {
            const {maxParticipants , invitationCode , quizNameOrId } = req.body;

            const obj = {
                participantMaxAmount:maxParticipants,
                invitationCode:invitationCode,
                quiz:quizNameOrId,
                   
            }
        
            const game = await Game.findOne({"quiz":quizNameOrId});
            
        
            if(game){
                console.log('game already exists so i cant create another one');
                return res.status(400).json({"message":"only 1 game per quiz at the moment!"});
            }else{
                const gameToCreate = await Game.create(obj);
                return res.status(200).json(gameToCreate);
            }
        
    
        } catch (e) {
            console.log(e);
            return res.status(500).json({"error":e});
        }

    }


}

module.exports = new GameController();