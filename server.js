const express = require("express");
const app = express();
const bodyParser = require('body-parser');
var mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const crypto = require('crypto');
const FileStore = require('session-file-store')(session); // 세션을 파일에 저장
const cookieParser = require('cookie-parser');
const xlsx = require('xlsx');
const PORT = 3000;

const excelFile = xlsx.readFile('datas/서울시 채식 음식점 현황관리 리스트_202110291941.xlsx');
const sheetName = excelFile.SheetNames[0];      // 첫번째 시트 정보 추출
const firstSheet = excelFile.Sheets[sheetName]; // 시트의 제목 추출

var db = mongoose.connect('mongodb://yuki:1234@localhost:27017/yuki', (err) => {
	if (err) { console.log(err.message); } 
  	else { console.log('Succesfully Connected!'); }
});
const Users = require('./models/User');
const Boards = require('./models/Board');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));
app.use(express.static(path.join(__dirname + "/public")));

app.set('views', __dirname + '\\views');
app.set('view engine','ejs');

app.use(session({
	secret: 'yuki0331',
	resave: false,
	saveUninitialized: true,
	store : new FileStore()
}));

app.get("/", (req, res) => {
	console.log(req.session);
	if(req.session.is_logined == true) {
		res.render('index', { is_logined: req.session.is_logined, username: req.session.username });
	} else{ res.render('index',{ is_logined: false });
	}
 });
app.get("/signup", (req, res) => { res.render('signup'); });
app.get("/login", (req, res) => { res.render('login'); });
app.get('/logout',(req, res) => { req.session.destroy(function(err){ res.redirect('/'); });});
app.get("/board", (req, res) => { 
	if(req.session.is_logined == true) {
		res.render('board', { is_logined: req.session.is_logined, username: req.session.username });
	} else{ res.render('board',{ is_logined: false });
	}
 });
 app.get("/content", (req, res) => { 
	if(req.session.is_logined == true) {
		res.render('content', { is_logined: req.session.is_logined, username: req.session.username });
	} else{ res.render('content',{ is_logined: false });
	}
 });
 
app.post('/signup', (req, res) => {
	var new_user = new Users(req.body);

	new_user.save((err) => {
		if (err) return res.status(500).json({ message: '저장 실패!' });
		else {
			res.redirect('/login');
		}
	});
});

app.post("/login", (req, res) => { 
	Users.findOne({ username: req.body.username, password: req.body.password }, (err, user) => {
		if (err) return res.status(500).json({ message: '에러!' });
		else if (user) {
			req.session.is_logined = true;
			req.session.username = req.body.username;
			req.session.password = req.body.password;
			req.session.save(function(){ 
			res.render('index', { // 로그인 정보 전달
					username: req.body.username,
					password: req.body.password,
					is_logined : true
				});
			});
		}
		else return res.status(404).json({ message: '유저 없음!' });
	});
});

app.post('/vegan', (req, res) => {
	var Vegan = new Array();

	for (var i = 2; i < 974; i++) {
		var col = "D" + String(i);
		if (firstSheet[col].v !== "") {
			var data = new Object();
			data.phone = firstSheet[col].v;
			Vegan.push(data);
		}
	}
	
	var jsonData = JSON.stringify(Vegan);
	res.send(jsonData);
});

app.post('/vegan/theme', (req, res) => {
	var Vegan = new Array();

	for (var i = 2; i < 974; i++) {
		var colPhone = "D" + String(i);
		var colTheme = "C" + String(i);
		if (firstSheet[colTheme].v == req.body.theme) {
			var data = new Object();
			data.phone = firstSheet[colPhone].v;
			Vegan.push(data);
		}
	}
	
	var jsonData = JSON.stringify(Vegan);
	res.send(jsonData);
});

app.post('/vegan/menu', (req, res) => {
	var Vegan = new Array();

	for (var i = 2; i < 974; i++) {
		var colPhone = "D" + String(i);
		var colMenu = "G" + String(i);
		if (firstSheet[colPhone].v == req.body.phone) {
			var data = new Object();
			data.menu = firstSheet[colMenu].v;
			Vegan.push(data);
		}
	}
	
	var jsonData = JSON.stringify(Vegan);
	res.send(jsonData);
});

app.post('/like', (req, res) => {
	Users.findOne({ username: req.body.username }).select('likeList').exec(function(err,user){
		res.send(user.likeList);
 	});
});

app.post('/like/add', async (req, res) => {
	await Users.findOneAndUpdate(
		{ username: req.body.username },
		{ $addToSet : {likeList: req.body.phone }})
		.exec();
	Users.findOne({ username: req.body.username }).select('likeList').exec(function(err,user){
		res.send(user.likeList);
	});
});

app.post('/like/delete', async (req, res) => {
	await Users.findOneAndUpdate(
		{ username: req.body.username },
		{ $pull : {likeList: req.body.phone }})
		.exec();
	Users.findOne({ username: req.body.username }).select('likeList').exec(function(err,user){
		res.send(user.likeList);
	});
});

app.post('/board', async (req, res) => {
	Boards.find().exec(function(err,board){
		res.send(board);
	});
});

app.post('/board/tag', async (req, res) => {
	Boards.find({ tag: req.body.tag }).exec(function(err,board){
		res.send(board);
	});
});

app.post('/board/content', async (req, res) => {
	Boards.findOne({ _id: req.body._id }).exec(function(err,board){
		res.send(board);
 	});
});

app.post('/board/add', async (req, res) => {
	await Boards.insertMany({
		id: req.body.id,
		title: req.body.title,
		content: req.body.content,
		date: req.body.date,
		writer: req.body.writer,
		tag: req.body.tag
	}, function(err, res) {
		if (err) throw err;
	});
	Boards.find().exec(function(err,board){
		res.send(board);
	});
});

app.post('/board/delete', (req, res) => {
	Boards.deleteOne({ _id: req.body._id }, function(err, res) {
		if (err) throw err;
	});
	Boards.find().exec(function(err,board){
		res.send(board);
	});
});

app.post('/board/edit', async (req, res) => {
	await Boards.findOneAndUpdate(
		{ _id: req.body._id },
		{ title: req.body.title, content:req.body.content })
		.exec();
	Boards.findOne({ _id: req.body._id  }).exec(function(err,board){
		res.send(board);
	});
});

app.listen(PORT, () => { console.log(`Listen : ${PORT}`); });