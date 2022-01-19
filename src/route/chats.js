const express = require("express");
const { chatRoomModel, roomModel } = require("../db/mongo");
const login = require("../auth/login");

const chunkArray = require("../modules/chunkArray");
const router = express.Router();

router.get('/:roomId', async (req, res) => {
  const roomId = req.params.roomId;
  const userInfo = login.getLoginInfo(req);
  /*chatRoomModel.findOne({ _id: roomId }, (err, result) => {
    if(err){ res.status(400).send("wrong room id"); return; }
    if(!result){ res.status(400).send("wrong room id"); return; }
  });*/
  try {
    const room = await chatRoomModel.findOne({ "_id": roomId });
    const chats = room?.chats;
    if (!room) {
      const rooms = await chatRoomModel.find({});
      console.log(rooms);
      return res.status(404).send("ID not exist");
    }
    
    // 채팅창에 존재하는 인원인지 확인
    console.log(room)

    if (!chats || chats.length === 0) return res.send({
      data: [],
      page: 0,
      totalPage: 0,
      totalChats: 0
    });

    const chunkedArray = chunkArray(chats, req.query.pageSize);
    if (chunkedArray.length <= req.query.page) {
      return res.status(400).send("Invalid page")
    }
    res.send({
      data: chunkedArray[Number(req.query.page)],
      page: req.query.page,
      totalPage: chunkedArray.length - 1,
      totalChats: chats.length,
    });
  } catch (e) {
    console.error(e);
  }
})

module.exports = router;