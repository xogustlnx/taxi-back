const { chatRoomModel } = require("../db/mongo");

// server: express server
// session: session middleware
const startSocketServer = (server, session) => {
  // FIXME: front server hard coded
  const io = require("socket.io")(server, {
    cors: {
      origin: ["http://localhost:3000"],
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  const ios = require('express-socket.io-session')
  io.use(
    ios(session, { autoSave: true })
  )

  io.on('connection', (socket) => {
    // const session = socket.request.session;
    console.log("a user connected!");
    console.log(socket.handshake.session)
    socket.handshake.session.userId = "asdf";
    console.log(socket.handshake.session)

    // roomId 를 인자로 받아, 해당 방에 참가시킨다.
    // ~님이 채팅방에 참여했습니다. 메시지 출력/기록
    socket.on('join', async (roomId) => {
      try {
        let result = await chatRoomModel.findOne({ "_id": roomId })
        if (!result) {
          result = await chatRoomModel.create({ "_id": roomId, "chats": [], "isSecret": false });
        }
        socket.username = socket.handshake.session.name;
        socket.join(roomId);
        const newUserChat = {
          author: socket.username,
          text: "님이 채팅방에 참여했습니다.",
          time: new Date(),
          chatType: "newUser"
        };
        await result.updateOne({ $push: { "chats": newUserChat } });
        // await chatRoomModel.updateOne({ "_id": socket.activeRoom }, {
        //   $push: {
        //     "chats": newUserChat
        //   }
        // })
        // FIXME: 보내는 정보 따로 없다. 아예 필요 없을수도?
        socket.emit("joined");
        socket.activeRoom = roomId;
        io.to(socket.activeRoom).emit('newUserChatEvent', newUserChat);
      } catch (e) {
        console.error(e);
      }
    })

    socket.on('chatEvent', (chat) => {
      // chat: { text: string, time: Date }
      console.log('chatEvent');
      chat.author = socket.username;
      chatRoomModel.updateOne({ "_id": socket.activeRoom }, {
        $push: {
          "chats": chat
        }
      }).exec();
      io.to(socket.activeRoom).emit('chatEvent', chat)
    })

    socket.on('disconnect', async (reason) => {
      console.log(reason);
      try {
        const chat = {
          author: socket.username,
          text: "님이 퇴장했습니다.",
          time: new Date(),
          chatType: "userExit"
        }
        const res = await chatRoomModel.updateOne({ "_id": socket.activeRoom }, {
          $push: {
            "chats": chat
          }
        })
        console.log(res);
        io.to(socket.activeRoom).emit('userExitChatEvent', chat);
      } catch (e) {
        console.error(e);
      }
    })
  });

  return io;
}


module.exports = startSocketServer;