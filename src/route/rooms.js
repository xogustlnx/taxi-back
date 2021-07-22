const express = require('express');
const router = express.Router();
const loginCheckMiddleware = require('../middleware/logincheck')
//const taxiResponse = require('../taxiResponse')


module.exports = (mongo) => {
  router.get('/', function(_, _) {
    router.use(loginCheckMiddleware);
  });

  // TEST
  router.get('/getAllRoom', (_, res) => {
    console.log('/getAllRoom called');
    mongo.roomModel.find({})
    .then( 
      async (results) => {
        jsonResult = await JSON.parse(JSON.stringify(results));
        console.log(jsonResult)
        for (const result of jsonResult) {
          let fromLocation = await mongo.locationModel.findById( result.from );
          result.from = fromLocation.name;
          let toLocation = await mongo.locationModel.findById( result.to );
          result.to = toLocation.name;
        }
        // await jsonResult.map( async result => {
          
        // })
        res.send( jsonResult );
      }
    )
  })

  //TEST
  router.get('/removeAllRoom', async (req, res) => {
    console.log("DELETE ALL ROOM")
    mongo.roomModel.remove({}).exec()
    res.redirect("/rooms/getAllRoom")
  })

  // request JSON form
  // name : String
  // from : String
  // to : String
  // time : Date
  // part : Array
  router.post('/create', async (req, res) => {
    //console.log(req.body);
    if(!req.body.name || !req.body.from || !req.body.to || !req.body.time ){
      res.status(400).json({
        error : "Rooms/create : bad request"
      })
    }

    try {
      let from = await mongo.locationModel.findOneAndUpdate(
        {"name":req.body.from},
        {},
        {new : true, upsert : true}
      )
      let to = await mongo.locationModel.findOneAndUpdate(
        {"name":req.body.to},
        {},
        {new : true, upsert : true}
      )
      
      let room = new mongo.roomModel({
        'name':req.body.name,
        'from':from._id,
        'to':to._id,
        'time':req.body.time,
        'part':req.body.part,
        'madeat':Date.now()
      })
      await room.save()
      res.send(room);
    } catch(err) {
      console.log(err);
      res.status(500).json({
        error : 'Rooms/create : internal server error'
      })
    }
  });

  router.get('/:id/delete', async (req, res) => {
    try {
      let result;
      result = await mongo.roomModel.findByIdAndRemove( req.params.id )
      if(result) {
        res.send(true);
      } else {
        res.status(404).json({
          error : "Rooms/delete : ID does not exist"
        });
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({
        error : 'Rooms/create : internal server error'
      })
    }
    
    // catch는 반환값이 없을 경우(result == undefined일 때)는 처리하지 않는다.
  })

  // json으로 수정할 값들을 받는다
  // json 형식이 맞는지 검증해야 함
  // request JSON
  // name, from, to, time, part
  router.post('/:id/edit', async (req, res) => {
    if( !req.body.name || !req.body.from || !req.body.to || !req.body.time || !req.body.part ){
      res.status("400").json({
        error : "Rooms/edit : Bad request"
      })
    }
    let from = await mongo.locationModel.findOneAndUpdate(
      { "name" : req.body.from },
      {},
      { new : true, upsert : true }
    )
    let to = await mongo.locationModel.findOneAndUpdate(
      { "name" : req.body.to },
      {},
      { new : true, upsert : true }
    )
    changeJSON = {
      name: req.body.name,
      from: from,
      to: to,
      time: req.body.time,
      part: req.body.part,
    }
    
    try {
      let result = await mongo.roomModel.findByIdAndUpdate(req.params.id, {$set : changeJSON, new : true});
      console.log(result);
      if (result){
        res.send(changeJSON);
      } else {
        res.status(404).json({
          error : "Rooms/edit : id does not exist"
        });
      }
    } catch(err) {
      console.log(err);
      res.status(500).json({
        error : "Rooms/edit : internal server error"
      })
    }
  })

  // 특정 id 방 세부사항 보기
  router.get('/:id', async (req, res) => {
    try {
      let result = await mongo.roomModel.findById( req.params.id )
      if(result) {
        res.status(200).send( result );
      } else {
        res.status(404).json({
          error : "Rooms/info : id does not exist"
        });
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({
        error : "Rooms/info : internal server error"
      })
    }
  })

  // test method
  // requestJSON
  // { id : {id} }
  router.post('/roominfo', (req, res) => {
    if(!req.body.id) res.status("400").send("Room/roominfo : Bad request")
    mongo.roomModel.findById( req.body.id )
    .then( result => {
        if(result) {
          console.log(JSON.stringify(result))
          res.send(JSON.stringify(result));
        } else {
          console.log("room info error : id does not exist")
          res.status(400).send("such id does not exist");
        }
      })
    .catch( err => { console.log(err); throw err; })
  })

  // Request JSON form
  // { roomId : ObjectID,
  //   users : List[ObjectID] }
  router.post('/invite', async (req, res) => {
    // Request JSON Validation
    if( !req.body.roomId || !req.body.users ) res.status("400").json({
      error : "Room/invite : Bad request"
    })
    try {
      let room = await mongo.roomModel.findById( req.body.roomId )
      if ( !room ) res.status(404).json({
        error : "Room/invite : no corresponding room"
      })
      for( const userID of req.body.users ){
        if ( room.part.includes(userID) ) res.status("409").json({
          error : "Room/invite : "+ userID +" Already in room"
        })
      }
      for ( const userID of req.body.users ){
        room.part = room.part.concat(userID)
        await room.save()
        let user = await mongo.userModel.findById( userID )
        user.room = user.room.concat( req.body.roomId )
        user.save()
      }
      res.send(room);
    } catch ( error ) {
      console.log(error);
      res.status("500").json({
        error : "Room/invite : internal server error"
      })
    }
  })

  // Request JSON Form
  // {
  //   fromName : String,
  //   toName : String,
  //   startDate : Date,
  // }

  // fromName, toName은 필수
  // startDate는 선택
  router.post('/search', async (req, res) => {
    if ( !req.body.fromName && !req.body.toName ) {
      res.status("400").json({
        error : "Room/search : Bad request"
      })
    }
    // if ( req.body.roomName && ( req.body.fromName || req.body.toName || req.body.startDate )) {
    //   rres.status("400").send(JSON.stringify({
    //     error : true,
    //     message : "Room/search : Bad request, too many info"
    //   }))
    // }
    // if ( !req.body.roomName && (( req.body.fromName && !req.body.toName) || ( !req.body.fromName && req.body.toName ))){
    //   res.status("400").send(JSON.stringify({
    //     error : true,
    //     message : "Room/search : Bad request, from and to must be given together"
    //   }))
    // }

    try {
      // if ( req.body.roomName ){
      //   let rooms = await mongo.roomModel.find({ name : { $regex : req.body.roomName, $options : "i" }})
      //   if (!rooms) res.status("404").send(JSON.stringify({
      //     error : true,
      //     message : "Room/search : No corresponding room"
      //   }))
      //   res.status("200").send(JSON.stringify(rooms))
      // } else {
      let fromLocation;
      let fromLocationID;
      if( req.body.fromName ){
        fromLocation = await mongo.locationModel.findOne({ name : req.body.fromName })
      }
      
      let toLocation;
      let toLocationID;
      if( req.body.toName ){
        toLocation = await mongo.locationModel.findOne({ name : req.body.toName })
      }
      
      if(fromLocation && toLocation){
        fromLocationID = await fromLocation._id;
        toLocationID = await toLocation._id;
      } else {
        res.status("404").json({
          error: "Room/search : No corresponding location"
        })
      }
      
      let rooms;
      if ( fromLocationID && toLocationID ){
        if( !req.body.startDate ){
          rooms = await mongo.roomModel.find({
            from : fromLocationID,
            to : toLocationID
          })
        } else {
          rooms = await mongo.roomModel.find({
            from : fromLocationID,
            to : toLocationID,
            time : { $gte : new Date(req.body.startDate) }
          })
        }
      }
      // date form 2012-04-23T18:25:43.511Z
      
      res.send(rooms)
    } catch (error) {
      console.log(error);
      res.status("500").json({
        error : "Room/search : Internal server error"
      })
    }
  })
  
  return router;
}
