const express = require("express");
const app = express();
const bodyParser = require('body-parser');
var mongoose = require('mongoose');
const PORT = 3000;

var db = mongoose.connect('mongodb://yuki:1234@localhost:27017/yuki', (err) => {
	if (err) { console.log(err.message); } 
  else { console.log('Succesfully Connected!'); }
});

const Users = require('./models/User');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({imit: '1gb', extended : true}));

app.use(express.static(__dirname + "/"));

app.get("/", (req, res) => { res.sendFile(__dirname + "/public/index.html"); });
app.get("/login", (req, res) => { res.sendFile(__dirname + "/public/login.html"); });
app.get("/signup", (req, res) => { res.sendFile(__dirname + "/public/signup.html"); });

app.post('/signup', (req, res) => {
	var new_user = new Users(req.body);

	new_user.save((err) => {
		if (err) return res.status(500).json({ message: '저장 실패!' });
		else return res.status(200).json({ message: '저장 성공!', data: new_user });
	});
});

app.post("/login", (req, res) => { 
  Users.findOne({ username: req.body.username, password: req.body.password }, (err, user) => {
		if (err) return res.status(500).json({ message: '에러!' });
		else if (user) return res.status(200).json({ message: '유저 찾음!', data: user });
		else return res.status(404).json({ message: '유저 없음!' });
	});
});

app.listen(PORT, () => {
  console.log(`Listen : ${PORT}`);
});