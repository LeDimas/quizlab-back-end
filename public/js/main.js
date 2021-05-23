const chat_form = document.getElementById('chat-form');
const usernameId = document.getElementById('usernameId').value;
const roomId = document.getElementById('roomId').value;
const seconds = document.getElementById('seconds').value;
const minutes = document.getElementById('minutes').value;
const hours = document.getElementById('hours').value;
const quizName = document.getElementById('quizName').value;
const userList = document.getElementById('users');
const anwser_btn = document.getElementById('anwser-btn');
const submitBtn = document.getElementById('submit-btn');

let playerNames = [];
let userAnwsers = {anwsers:[

]};

const timeOutTime = (seconds * 1000) + (minutes * 60 * 1000) + (hours * 60 * 60 * 1000) ; 

let questions ;
let index = 0;

var startTimerTime, endTime;

function startTimer() {
  startTimerTime = new Date();
};

function endTimer() {
  endTime = new Date();
  var timeDiff = endTime - startTimerTime; //in ms
  // strip the ms
  timeDiff /= 1000;

  // get seconds 
  var seconds = Math.round(timeDiff);
  console.log(seconds + " seconds");
  return seconds;
}



const socket = io();


function markAsLeaved(users , leaver){

   
  }
    
function outputUsers(users) {
      userList.innerHTML = '';
      users.forEach((user) => {
        const li = document.createElement('li');
        li.innerText = user;
        userList.appendChild(li);
      });
    }
  
const startTimerQuizButton = document.getElementById('startQuiz');
if(startTimerQuizButton){
  startTimerQuizButton.addEventListener('click' , ()=>{
    console.log('clicked');
    console.log(quizName);
    // startTimerQuizButton.disabled = true;
    socket.emit('admin pressed countdown' , {roomId , quizName})
  })
}

function outputQuestion(question) {
  quizForm.innerHTML = '';
  const desc = document.createElement('h2');
  desc.innerHTML = question.description;
  quizForm.append(desc);

  question.alternatives.forEach((alternative) => {
    const variant = document.createElement('input');

    variant.setAttribute('type','radio');
    variant.setAttribute('id' , alternative);
    variant.setAttribute('value',alternative);
    variant.setAttribute('name' , question.description)

    const label = document.createElement('label')
    label.innerHTML = alternative
    label.setAttribute('for' , alternative);

    quizForm.appendChild(variant);
    quizForm.appendChild(label);
  });
}

function getAnwser(question) {
  const questionDesc = question.description;

  // const selectedVariant = document.querySelector('input[name='  + questionDesc + ']:checked').value;

  var ele = document.getElementsByTagName('input');
  var selectedVariant = "";
            
  for(i = 0; i < ele.length; i++) {
      if(ele[i].type="radio") {
          if(ele[i].checked)
              selectedVariant = ele[i].value;
             
      }
  }
  return {questionDesc:questionDesc, anwserGiven:selectedVariant};
  
}

anwser_btn.addEventListener('click' , (e) =>{

    
    
  const anwserObj = getAnwser(questions[index].questions);
  userAnwsers.anwsers.push(anwserObj);


  if(questions.length-1 > index){
      index++;
      console.log(questions[index].questions)
      outputQuestion(questions[index].questions)
  }else{
      console.log(userAnwsers);
      anwser_btn.disabled=true;
      submitBtn.disabled = false;
  }

})

submitBtn.addEventListener('click' , (e)=>{
  const timeResult = endTimer();
  socket.emit('player submit' , ({userAnwsers, usernameId , roomId , quizName , timeResult}))
})


  document.getElementById('leave-btn').addEventListener('click', () => {
   alert(players);
  });


  //#region sockets

  const countDownClock = (number = 100, format = 'seconds') => {
  
    const d = document;
    const hoursElement = d.querySelector('.hours');
    const minutesElement = d.querySelector('.minutes');
    const secondsElement = d.querySelector('.seconds');
    let countdown;
    convertFormat(format);
    
    
    function convertFormat(format) {
      switch(format) {
        case 'seconds':
          return timer(number);
        case 'minutes':
          return timer(number * 60);
          case 'hours':
          return timer(number * 60 * 60);           
      }
    }
  
    function timer(seconds) {
      const now = Date.now();
      const then = now + seconds * 1000;
  
      countdown = setInterval(() => {
        const secondsLeft = Math.round((then - Date.now()) / 1000);
  
        if(secondsLeft <= 0) {
          clearInterval(countdown);
          return;
        };
  
        displayTimeLeft(secondsLeft);
  
      },1000);
    }
  
    function displayTimeLeft(seconds) {
      hoursElement.textContent = Math.floor((seconds % 86400) / 3600);
      minutesElement.textContent = Math.floor((seconds % 86400) % 3600 / 60);
      secondsElement.textContent = seconds % 60 < 10 ? `0${seconds % 60}` : seconds % 60;
    }
    
    
    
  }


socket.emit('joinQuizRoom' ,{usernameId , roomId});

socket.on('notifyOthersAboutNewConnectedPlayer' , (name)=>{
    
    console.log(`${name} has joined game`);
    
    playerNames.push(name);
    outputUsers(playerNames);
})



socket.on('retrieveOtherPlayers' , (otherPlayers) =>{
    otherPlayers.forEach(
        player => {
            playerNames.push(player);
            outputUsers(playerNames);
        }
        
        )
    });



  socket.on('player left' , (leaverName) =>{
    console.log('арэвуар');
    const leaver = playerNames.find( name => name===leaverName);
    alert(`${leaver} а-ля ${leaverName} leaved ,lol`)
  })

  
  
  
  socket.on('participant max amount reachedd' , (arg) =>{
    console.log(arg);
  })
  
  
  socket.on('participant disqualifed' , (arg) =>{
    console.log(arg);
  })
  
  
  socket.on('begin countdown' , ()=> {
    socket.emit('request questions' , {roomId,quizName})
  });
  
  socket.on('question supply' , (supppliedQuestions) =>{
    
    questions = supppliedQuestions;

    outputQuestion(questions[index].questions)

    console.log(questions);

    startTimer();

    countDownClock(minutes,'minutes')
    
    setTimeout(() => {
      socket.emit('player submit' , ({userAnwsers, usernameId , roomId , quizName}))

      //test later
      socket.emit('finish' , quizName);
    }, timeOutTime);
  
  })
  
  //#endregion
  
  /*
    startTimer countdown
    enter number and format
    days, hours, minutes or seconds
  */
  