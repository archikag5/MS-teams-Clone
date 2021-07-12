const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server,{
    cors: {
        origin: '*'
      }
})
const { v4: uuidV4 } = require('uuid')
const port = process.env.PORT || 3000
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.set('view engine','ejs')
app.use(express.static('public'))


app.get('/' , (req,res) => {
    res.redirect(`/${uuidV4()}`)
})
//creating rooms
app.get('/:room' , (req,res) => {
    res.render('room',{roomId:req.params.room})
})

io.on('connection',socket => {
    //joining room
    socket.on('join-room',(roomId,userId,userName) => {
        socket.join(roomId)
        socket.to(roomId).emit('user-connected',userId)
        //listening to new message to add it to the entire room chat
        socket.on("message", (message) => {
            io.to(roomId).emit("createMessage", message, userName);
          });
          //listening to new connection to make it connect to the entire room
          socket.on("onvc",()=> {
              io.to(roomId).emit("createVc", userId)
          })
          //listening to share screem to add it to the entire room
          socket.on("sharingscreen",()=> {
            io.to(roomId).emit("ss", userId)
        })
          //disconnecting user's audio and video from the room
        socket.on('callend',() => {
            io.to(roomId).emit('user-disconnected',userId)
        })
    })
})
server.listen(port);