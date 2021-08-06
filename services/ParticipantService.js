const { Quiz } = require('../models/Quiz');
const Game = require('../models/QGame');
const mongoose = require('mongoose');
const Participant = require('../models/Participant');
const User = require('../models/User');

class ParticipantService {


    async register(userData, roomId) {
        try {

            const game = await Game.findOne({ gameLink: roomId });
            const maxPlayers = game.get('participantMaxAmount');
            const currentPlayerCount = game.get('participants').length;

            // const isStarted = game.get('isStarted');
            // if(isStarted){
            //     socket.emit('too late');
            //     throw new Error('Game is already started')
            // }


            if (currentPlayerCount >= maxPlayers) return { success: false, response: 'participant max amount reached', args: null }
            const participantExists = await Participant.findOne({ userId: mongoose.Types.ObjectId(userData.userId) });
            if (participantExists) return { success: false, response: 'participant disqualifed', args: null }
            // const check = participantExists.get('leftGame');

            const participantData = { userId: mongoose.Types.ObjectId(usrId), gameId: roomId }
            const participant = new Participant(participantData);
            await participant.save();
            await Game.updateOne({ "gameLink": roomId }, { $push: { participants: participant.id } });

        } catch (error) {
            console.log(error);
            throw new Error(`Error occured ${error}`)
        }
    }

    async getAll(roomId) {
        try {
            const quizPlayers = await Game.aggregate([
                { $match: { gameLink: roomId } }
            ])
                .lookup({
                    from: "participants",
                    localField: 'participants',
                    foreignField: '_id',
                    as: 'thisGameParticipants'
                })
                .lookup({
                    from: "users",
                    localField: "thisGameParticipants.userId",
                    foreignField: "_id",
                    as: "participantData"
                })
                .group({ _id: '$participantData.username' })


            return quizPlayers[0]._id;
        } catch (error) {
            console.log(error);
        }
    }

    async getPlace(username) {
        const validUsername = username.userName
        const userId = await User.findOne({ username: validUsername }, { _id: 1 })
        const part = await Participant.findOne({ userId: userId._id }, { place: 1 })
        return part.place
    }


    async calculateResult(userAnwsers, usernameId, quizName, timeResult) {

            try{
            const questions = await Quiz.aggregate([
                { $match: { name: quizName } }
            ])
                .unwind('questions')
                .project({
                    "questions.description": 1,
                    "questions.alternatives": 1,
                })
                .project({
                    question: {
                        $map: {
                            "input": {
                                $filter: {
                                    "input": "$questions.alternatives",
                                    "as": "anwsersf",
                                    "cond": "$$anwsersf.isCorrect"
                                }
                            },
                            "as": "anwsersm",
                            "in": {
                                "correctAnwser": "$$anwsersm.text",
                            }
                        }
                    },
                    questionDescription: "$questions.description"
                })
                .project({
                    _id: 0,
                    questionData: {
                        questionDesc: "$questionDescription",
                        anwser: { $first: "$question.correctAnwser" }
                    }
                });

            let correctAnwsered = 0;

            questions.forEach(
                (question) => {
                    const description = question.questionData.questionDesc;
                    const anwser = question.questionData.anwser;
                    const usrAnwsr = userAnwsers.anwsers.find((ques) => ques.questionDesc === description);
                    if (usrAnwsr.anwserGiven === anwser) {
                        correctAnwsered++;
                        console.log(usrAnwsr.anwserGiven)
                        console.log(anwser)
                    }
                }
            )
            await Participant.findOneAndUpdate({ "userId": usernameId },
                { $set: { "finished": true, "correctAnwsers": correctAnwsered, "timeResultInSeconds": timeResult } }, { new: true });

            return correctAnwsered;
    } catch(error) {
        console.log(error);
    }
}
   async checkAllFinished(roomId){
    try {
        console.log(roomId)
        const aggregationResult = await Game.aggregate([
            {$match:{gameLink :roomId}}
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

        

}

module.exports = new ParticipantService()