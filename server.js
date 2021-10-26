// 기본 설정
const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));

// 정적 파일 불러오기
app.use(express.static(__dirname + "/public"));

// 라우팅 정의
app.get("/", (req, res) => { res.sendFile(__dirname + "/index.html"); });
app.get("/login", (req, res) => { res.sendFile(__dirname + "/public/login.html"); });

app.post("/login", (req, res) => { 
  console.log(req.body.username);                                                                    
  res.send("<h1>WELCOME<h1>");
});

// 서버 실행
app.listen(PORT, () => {
  console.log(`Listen : ${PORT}`);
});