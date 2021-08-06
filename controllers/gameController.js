const GameService = require('../services/GameService')


class GameController {



    async joinGamePost(req,res , next){
        try {
            const invitationCode = req.body.invitationCode;
            const gameLink = req.params.gameLink;
            const response = await GameSerivce.joinPost(invitationCode , gameLink)
            return res.status(200).json(response);
        } catch (error) {
            console.log(error);
            next(error)
        }
    }
    
    async joinGameGet(req , res , next){

        try {
            const gameLink = req.params.gameLink;
            const game = await GameService.joinGet(gameLink)
            return res.status(200).json(game);
        } catch (e) {
            console.log(e);
            next(e)
        }

    }

     
    async createGame(req , res , next){

        try {
            const {maxParticipants , invitationCode , quizNameOrId } = req.body;
            const game = await GameService.create(maxParticipants , invitationCode , quizNameOrId )
            return res.status(200).json(game);
        } catch (e) {
            console.log(e);
            next(e)
        }

    }


}

module.exports = new GameController();