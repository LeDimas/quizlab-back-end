const express = require('express');
const path = require('path');
require('dotenv').config();
const connectToMongoDb = require('./database').connectToMongoDb;
const authRoutes = require('./routes/auth');
const quizRoutes = require('./routes/quiz_question');
const gameRoutes = require('./routes/game');
const stripeRoutes = require('./routes/stripe');
const cors = require('cors');
const http = require('http');
const cookieParser = require('cookie-parser')
const SocketService = require('./services/SocketService')
const socketio = require('socket.io');
const errorMiddleware = require('./middleware/errorMiddleware')


//Initialize express app
const app = express();


const server = http.createServer(app);
const io = socketio(server);

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser())
app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL
}));

app.use('/api/auth' , authRoutes);
app.use('/api/game' , gameRoutes);
app.use('/api' , quizRoutes);
app.use('/api/stripe' , stripeRoutes);
app.use(errorMiddleware)


app.use(express.static(path.join(__dirname,  '/public')));



 io.on('connection', socket => {
    const { roomId } = socket.handshake.query
    const socketService = new SocketService(roomId , socket)
  });


connectToMongoDb();

const PORT = process.env.PORT;

const start = () => {
    try {
        server.listen(PORT , () => console.log(`server started on port ${PORT}`));
    } catch (error) {
        console.log(error);
    }
}

start();




//#region legacy socket
// socket.on('joinQuizRoom', ({usernameId , roomId , username})=>{

//     socketHandler.registerNewParticipant( usernameId , roomId , socket);

//     socket.broadcast.to(roomId).emit('notifyOthersAboutNewConnectedPlayer', username.userName );
//     // io.in(roomId).emit('notifyOthersAboutNewConnectedPlayer' , username.userName );

//   socketHandler.getQuizPlayers(roomId).then( 
//     otherPlayers => socket.emit('retrieveOtherPlayers' ,otherPlayers)
//     );

// })


// socket.on('admin pressed countdown' , ({roomId}) => {

//     io.in(roomId).emit('begin countdown');
// })

// socket.on('request questions' , ({roomId , quizName})=>{
//      socketHandler.getQuestions(quizName).then(
//         (questions) =>{
//             io.in(roomId).emit('question supply' , questions);
//         }
//     )
// })

// socket.on('too late' , () =>{
//     //do something to reject user attempt to access quiz
// })

// socket.on('getPlace' , ({username}) =>{
//     console.log('GETING PKLACE')
//     socketHandler.getPlace(username).then((place)=>socket.emit('returnPlace' , place))
// })


// socket.on('player submit' , ({userAnwsers, usernameId , roomId , quizName , timeResult })=>{

//     socketHandler.calculatePlayerResult(userAnwsers ,usernameId,roomId, quizName ,timeResult  )
//         .then(
//             (correctAnwsered) =>{
//                 socket.emit('quiz points' , correctAnwsered);
                
//                 socketHandler.checkWhetherAllFinished(roomId).then((allFinished)=>
//                     {
//                         if(allFinished){
                          
//                             gameController.assignGameResults(roomId).then((result)=>{
//                                 io.in(roomId).emit('result' , result)});
//                         }
//                     }
//                 )
//             }
//         )
// })


// socket.on('finish' , ()=>{

// })




// socket.on('disconnect', () => {

//     console.log('bye')

//     // socketHandler.playerLeft(socket.id).then(
//     //     (usernameRoom) =>{
//     //         io.to(usernameRoom.gameId).emit('player left' , usernameRoom.name)
//     //     }
//     // )
// })
//#endregion