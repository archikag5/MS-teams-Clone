const socket = io('/')
const videoGrid = document.getElementById('video-grid');
// shows chat when clicked
const chat = document.querySelector("#chat");
// takes back to the main page
const backBtn = document.querySelector(".header__back");
// user video initialization
const myvideo = document.createElement('video')
// screen share video
const screenvideo = document.createElement('video')
//Ids of different video streams

var streams = []
var userss = []
var videostream;
var screenSharestream;
const peers = {}

myvideo.muted = true

const myPeer = new Peer(undefined,{
    host:'/',
    port:'3001'
})

backBtn.addEventListener("click", () => {
    document.querySelector(".main__left").style.display = "flex";
    document.querySelector(".main__left").style.flex = "1";
    document.querySelector(".main__right").style.display = "none";
    document.querySelector(".header__back").style.display = "none";
  });
  
chat.addEventListener("click", () => {
    document.querySelector(".main__right").style.display = "flex";
    document.querySelector(".main__right").style.flex = "1";
    document.querySelector(".main__left").style.display = "none";
    document.querySelector(".header__back").style.display = "block";
});

const user = prompt("Enter your name");

const iniCall = document.querySelector("#iniCall");
iniCall.addEventListener("click", (e) => {
    videocallinititate();
});

myPeer.on('open',id => {
    socket.emit('join-room',room_id,id,user)
})

function videocallinititate(){
    document.querySelector("#video-grid").style.display = "flex";
    document.querySelector(".receivecall__button").style.display = "none";
    document.querySelector(".endcall__button").style.display = "flex";
    document.querySelector(".options__left").style.display = "flex";
    document.querySelector(".main__left").style.flex = "2.8";
    document.querySelector(".main__right").style.flex = "1.2";
    navigator.mediaDevices.getUserMedia({
    video:true,
    audio:true
  }).then(stream => {
    //adds the video of the person who initiates the call
    videostream=stream;
    addVideoStream(myvideo,stream)
    //connects the user to the wholeroom
    socket.emit("onvc")
  })
}

//connects to new user
function connecttonewuser(userId,stream){
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    //connects user1 with user2
    call.on('stream',userVideoStream => {
        addVideoStream(video,userVideoStream)
    })
    call.on('close',()=>{
        video.remove()
    })
    peers[userId] = call
    if(userss.includes(userId))
    return
    userss.push(userId)
}

//Adds Video Stream
function addVideoStream(video,stream){
    if(streams.includes(stream.id))
    return;
    streams.push(stream.id)

    video.srcObject = stream
    video.addEventListener('loadedmetadata',() => {
        video.play()
    })
    videoGrid.append(video)
}

//adds text message 
let text = document.querySelector("#chat_message");
//emits the message to the whole room
let send = document.getElementById("send");
//adds the message
let messages = document.querySelector(".messages");

send.addEventListener("click", (e) => {
  if (text.value.length !== 0) {
    socket.emit("message", text.value);
    text.value = "";
  }
});

text.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && text.value.length !== 0) {
    socket.emit("message", text.value);
    text.value = "";
  }
});

//shows room link to invite friends
const inviteButton = document.querySelector("#inviteButton");
//enable and disable audio
const muteButton = document.querySelector("#muteButton");
//enable and disable video
const stopVideo = document.querySelector("#stopVideo");
//ends the call
const endCall = document.querySelector("#endCall");
//screen share to the whole room
const screenShare = document.querySelector("#screenshare");

muteButton.addEventListener("click", () => {
  const enabled = videostream.getAudioTracks()[0].enabled;
  if (enabled) {
    videostream.getAudioTracks()[0].enabled = false;
    html = `<i class="fas fa-microphone-slash"></i>`;
    muteButton.classList.toggle("background__red");
    muteButton.innerHTML = html;
  } else {
    videostream.getAudioTracks()[0].enabled = true;
    html = `<i class="fas fa-microphone"></i>`;
    muteButton.classList.toggle("background__red");
    muteButton.innerHTML = html;
  }
});

function screenSharing(){
  if(screenSharestream == null){
    navigator.mediaDevices.getDisplayMedia({
      video: {
        cursor: 'always'
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true
      }
    }).then(stream => {
      screenSharestream = stream

      addVideoStream(screenvideo,stream)
      userss.forEach(users => {
        console.log("ss")
        myPeer.call(users, stream, {
          metadata: { "type": "screenShare" }
      });
      });
    })
  }
  else
  {
      screenSharestream.getVideoTracks[0].enabled = false;
      screenvideo.setAttribute("style", "display:none");
      html = `<i class="fa fa-desktop"></i>`;
      screenShare.classList.toggle("background__red");
      screenShare.innerHTML = html;
      screenSharestream = undefined;
  }
  
}

screenShare.addEventListener("click", () => {
  screenSharing();
});

stopVideo.addEventListener("click", () => {
  const enabled = videostream.getVideoTracks()[0].enabled;
  if (enabled) {
    videostream.getVideoTracks()[0].enabled = false;
    html = `<i class="fas fa-video-slash"></i>`;
    stopVideo.classList.toggle("background__red");
    stopVideo.innerHTML = html;
  } else {
    videostream.getVideoTracks()[0].enabled = true;
    html = `<i class="fas fa-video"></i>`;
    stopVideo.classList.toggle("background__red");
    stopVideo.innerHTML = html;
  }
});

inviteButton.addEventListener("click", (e) => {
  prompt(
    "Copy this link and send it to people you want to mseet with",
    window.location.href
  );
});

socket.on('user-disconnected',userId => {
  console.log("disconnected")
  if(peers[userId]) peers[userId].close()
})

endCall.addEventListener("click", (e) => {
  document.querySelector(".receivecall__button").style.display = "flex";
  document.querySelector(".endcall__button").style.display = "none";
  document.querySelector(".options__left").style.display = "none";
  videostream.getTracks().forEach(track => track.stop());
  document.querySelector("#video-grid").style.display = "none";
  videostream =  undefined;
  socket.emit("callend")
})

socket.on("createMessage", (message, userName) => {
  messages.innerHTML =
    messages.innerHTML +
    `<div class="message">
        <b><i class="far fa-user-circle"></i> <span> ${
          userName === user ? "me" : userName
        }</span> </b>
        <span>${message}</span>
    </div>`;
});

socket.on('user-connected',userId => {
  myUserId = userId;
  console.log( "user is connected")
})

myPeer.on("call", call => {
  console.log("receiving call")
  // Answer the call, providing our mediaStream
  call.answer(videostream)
        const video = document.createElement('video')
        //connects user2 with user1
        call.on('stream',userVideoStream=>{
            addVideoStream(video,userVideoStream)
        })
  call.on("close",() => {
    video.remove();
    console.log("closed")
  })
})

socket.on("createVc", (userId) => {
  connecttonewuser(userId,videostream)
})

socket.on("ss", (userId) => {
  connecttonewuser(userId,screenSharestream)
})

//user1 user2