const socket = io('/')
const videoGrid = document.getElementById('video-grid');
const chat = document.querySelector("#chat");
const backBtn = document.querySelector(".header__back");
const myvideo = document.createElement('video')
var streams=[]
var disusers=[]
var myUserId=""
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
var videostream;
var screenSharestream;
const peers = {}
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
    console.log(videostream)
    addVideoStream(myvideo,stream)
    //connects the user to the wholeroom
    socket.emit("onvc")
  })
}

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
}
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
let text = document.querySelector("#chat_message");
let send = document.getElementById("send");
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

const inviteButton = document.querySelector("#inviteButton");
const muteButton = document.querySelector("#muteButton");
const stopVideo = document.querySelector("#stopVideo");
const endCall = document.querySelector("#endCall");
// const screenShare = document.querySelector("#screenshare");
const record = document.querySelector("#record");

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
// const screen = document.getElementById('screen-container');
// function screenSharing(){
//   navigator.mediaDevices.getDisplayMedia({
//     video: {
//       cursor: 'always'
//     },
//     audio: {
//       echoCancellation: true,
//       noiseSuppression: true
//     }
//   }).then(stream => {
//     screenSharestream = stream
//     screen.srcObject = screenSharestream
//     addVideoStream(screensharevideo,stream)
//      myPeer.call(userId, screenSharestream);
//   })
// }
// screenShare.addEventListener("click", () => {
//   screenSharing();
// });

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
  myvideo.remove()
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
  console.log(
    "user is connected"
  )
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
})
socket.on("createVc", (userId) => {
  connecttonewuser(userId,videostream)
})

//user1 user2