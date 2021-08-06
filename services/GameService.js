const {Quiz , Question} = require('../models/Quiz');
const Game = require('../models/QGame');
const Participant = require('../models/Participant');
const ApiError = require('../exceptions/apiError')

class GameService {

    async joinPost(invitationCode , gameLink){

   
        const {id} = req.user

        const game = await Game.findOne({gameLink:gameLink});

        if(!game) throw ApiError.BadRequest(`Game with link ${gameLink} doesn't exist or is deleted`)

        const validInvitationCode = game.get('invitationCode');

        if(validInvitationCode !== invitationCode)
           throw ApiError.BadRequest("Incorrect invitation code");

        const quizId = game.get('quiz');
        const quiz = await Quiz.findById(quizId);
        const duration = quiz.duration;
        const author = quiz.author;
        let isAdmin = false;
        if(author === id) isAdmin = true
        const quizName = quiz.name;
        //make duration changable
        return {status:"OK" , quizName:quizName ,  isAdmin:isAdmin , duration:15 }

    }

    async joinGet(gameLink){
 
        const game = await Game.findOne({gameLink:gameLink} , {isStarted:1}).populate('quiz' , 'name description')
        if(!game) throw ApiError.BadRequest('No game found')
        return game
    
    }

    async create(maxParticipants , invitationCode , quizId){

        const gameData = {
            participantMaxAmount:maxParticipants,
            invitationCode:invitationCode,
            quiz:quizNameOrId,
        }
    
        const game = await Game.findOne({"quiz":quizNameOrId});
        
        //TODO:: consider making multiple games per quiz
        if(game) throw ApiError.BadRequest('only 1 game per quiz at the moment');
      
        //TODO:: ADD DTO
        return await Game.create(gameData);
         
       
    }

    //Not related to CRUD but to Socket Operations methods below

    async assignResults(roomId){
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

    async setStarted(quizName){
        const quiz =  await Quiz.findOne({"name":quizName} , '_id')
        await Game.findOneAndUpdate({"quiz":quiz._id} , {$set:{"isStarted":true}})
        }

    


}

module.exports = new GameService()