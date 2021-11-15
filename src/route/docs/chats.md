## /chats

- 채팅 목록을 불러오는 기능을 지원하는 API.
- 하나의 채팅 기록은 아래와 같이 구성되어 있음.

Chat {
  author: String,
  text: String,
  time: Date,
}


### /:roomId (GET)

- 해당 번호에 해당하는 채팅방의 채팅 목록 제공.

#### URL Parameters

- roomId : 채팅방의 고유 번호
- page : number: n번째 페이지
- pageSize : number: 한 페이지의 사이즈

#### Response

{
    data: Chat[],
    page: Number,
    totalPage: Number,
    totalChats: Number,
}
- ex) 0~99번까지의 데이터가 있으면, page: 2, pageSize: 10 이면 10~19번 데이터가 전송됨.

- 채팅 내역이 없는 경우, 아래와 같은 응답이 전송됨.

{
    data: [],
    page: 0,
    totalPage: 0,
    totalChats: 0,
}


#### Errors

- 400 "wrong room id"
- 400 "Invalid page"
- 404 ""ID not exist"
- 500 "internal server error"