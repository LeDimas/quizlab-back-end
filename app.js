const express = require('express');
const path = require('path');
const gameController = require('./controllers/gameController');
require('dotenv').config();
const connectToMongoDb = require('./database').connectToMongoDb;
const authRoutes = require('./routes/auth');
const quizRoutes = require('./routes/quiz_question');
const gameRoutes = require('./routes/game');
const stripeRoutes = require('./routes/stripe');
const cors = require('cors');
const exprshandlebars = require('express-handlebars');
const socketHandler = require('./controllers/socketHandler');
const http = require('http');
const cookieParser = require('cookie-parser')
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



/**
 * поиграться и поковыряться с сокетами
 */
io.on('connection', socket => {
   

    socket.on('joinQuizRoom', ({usernameId , roomId})=>{


        socketHandler.registerNewParticipant( usernameId , roomId ,socket.id ,socket);
       
        socket.join(roomId);

        socketHandler.getNewParticipantName(usernameId).then(
            (name) => {
                //Including the connected user by itself
                io.in(roomId).emit('notifyOthersAboutNewConnectedPlayer' , name );
            }
        )

    //проверить на разных комнатах(хотя механика не должна позволять больше одной комнаты так что мб и похуй)
      socketHandler.getQuizPlayers(roomId).then( 
        otherPlayers => socket.emit('retrieveOtherPlayers' ,otherPlayers)
        );

    })



    socket.on('admin pressed countdown' , ({roomId , quizName}) => {
        io.in(roomId).emit('begin countdown');
    })

    socket.on('request questions' , ({roomId , quizName})=>{
        socketHandler.getQuestions(quizName).then(
            (questions) =>{
                socket.broadcast.in(roomId).emit('question supply' , questions);
            }
        )
    })

    socket.on('too late' , () =>{
        //do something to reject user attempt to access quiz
    })

    
    socket.on('player submit' , ({userAnwsers, usernameId , roomId , quizName , timeResult })=>{

        socketHandler.calculatePlayerResult(userAnwsers ,usernameId,roomId, quizName ,timeResult  )
            .then(
                (correctAnwsered) =>{
                    socket.emit('quiz points' , correctAnwsered);
                    
                    socketHandler.checkWhetherAllFinished(roomId).then((allFinished)=>
                        {
                            if(allFinished)
                                gameController.assignGameResults(roomId).then((result)=>socket.emit('result' , result));
                        }
                    )
                }
            )
    })
    
    
    socket.on('finish' , ()=>{

    })

    
 

    socket.on('disconnect', () => {
        socketHandler.playerLeft(socket.id).then(
            (usernameRoom) =>{
                io.to(usernameRoom.gameId).emit('player left' , usernameRoom.name)
            }
        )
    })

    
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

