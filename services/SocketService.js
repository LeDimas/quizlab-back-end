const ParticipantService = require('./ParticipantService')
const QuestionService = require('./QuestionService')
const GameService = require('./GameService')

class SocketService {

    constructor(roomId , socket){
        // this.roomId = roomId
        this.socket = socket
        this.socket.roomId = roomId
        socket.join(roomId)

        await this.setSocketActions(socket)

    }

    async setSocketActions(socket){

        socket.on('joinQuiz' , ({userId , roomId , username}) => {
           const result =  await ParticipantService.register(userId , roomId)
           if(result.response && result.args) socket.emit(result.response , result.args);
           if(result.response && !result.args) socket.emit(result.response);

           socket.broadcast.to(roomId).emit('notifyOthersAboutNewConnectedPlayer', username.userName );
           const participants = await ParticipantService.getAll(roomId)
           socket.emit('retrieveOtherPlayers' ,participants)
        })

        socket.on('request questions' , ({roomId , quizName})=>{
            const questions = await QuestionService.getWithoutAnwsers(quizName)
            io.in(roomId).emit('question supply' , questions); })


        socket.on('admin pressed countdown' , ({roomId}) =>  io.in(roomId).emit('begin countdown'))

       

        
        socket.on('getPlace' , ({username}) =>{
            const place = await ParticipantService.getPlace(username)
            socket.emit('returnPlace' , place)
        })

    
    socket.on('player submit' , ({userAnwsers, usernameId , roomId , quizName , timeResult })=>{

        const correctAnwsers = await ParticipantService.calculateResult(userAnwsers ,usernameId,roomId, quizName ,timeResult  )
        socket.emit('quiz points' , correctAnwsers)
        const allFinished = await ParticipantService.checkAllFinished(roomId)
        if(allFinished){
            const results = await GameService.assignResults(roomId)
            io.in(roomId).emit('result' , results)
        }})

    }

            
    
}

module.exports = SocketService


