#### <- 서버에게 보내기
#### -> 클라이언트에게 보내기

#### 연결 전 토큰을 받아온다
#### 서버에 연결 시 토큰을 보낸다. 그 토큰을 decode하여 유저 정보를 얻는다.

## `<- join`
### Parameter
roomId: number (ObjectId of a room)
### Response
기존에 방이 없으면 방을 만듦.  
DB에 "~~님이 채팅방에 참여했습니다" 채팅 등록  
소켓에 위 메시지 `-> newUserChatEvent` 로 뿌림  
 
## `<- chatEvent`
클라이언트에서 채팅을 서버에 보낼 때.
### Parameter
```
type Chat {
  text: string,
  time: Date
}
```
### Response
DB에 받은 채팅 등록
`-> chatEvent` 로 받은 채팅 뿌리기

## `<- disconnect`
DB에 '~님이 퇴장했습니다.`
소켓에 위 메시지 `-> userExitChatEvent`로 뿌림