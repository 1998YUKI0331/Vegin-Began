const express = require("express");
const app = express();
const bodyParser = require('body-parser');
var mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const crypto = require('crypto'); // 유저 비밀번호 암호화
const FileStore = require('session-file-store')(session); // 세션을 파일에 저장
const cookieParser = require('cookie-parser');
const PORT = 3000;

var db = mongoose.connect('mongodb://yuki:1234@localhost:27017/yuki', (err) => {
	if (err) { console.log(err.message); } 
  	else { console.log('Succesfully Connected!'); }
});
const Users = require('./models/User');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));
app.use(express.static(path.join(__dirname + "/public")));

app.set('views', __dirname + '\\views');
app.set('view engine','ejs');

const BoardRouter = require('./routes/BoardRouter');
const LikeRouter = require('./routes/LikeRouter');
const VeganRouter = require('./routes/VeganRouter');

app.use('/board', BoardRouter);
app.use('/like', LikeRouter);
app.use('/vegan', VeganRouter);

app.use(session({
	secret: 'secretcode',
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
	crypto.randomBytes(64, (err, buf) => {
		const salt = buf.toString('base64');
		crypto.pbkdf2(req.body.password, salt, 100000, 64, 'sha512', (err, key) => {
			const hash = key.toString('base64');
			var new_user = new Users({ username: req.body.username, password: hash, salt: salt});

			new_user.save((err) => {
				if (err) return res.status(500).json({ message: '저장 실패!' });
				else {
					res.redirect('/login');
				}
			});
		})
	})
});

app.post("/login", (req, res) => { 
	Users.findOne({ username: req.body.username }, (err, user) => {
		if (err) return res.status(500).json({ message: '에러!' });
		else if (user) {
			crypto.pbkdf2(req.body.password, user.salt, 100000, 64, "sha512", (err, key) => {
				const hash = key.toString("base64");
				if (hash === user.password) {
					req.session.is_logined = true;
					req.session.username = req.body.username;
					req.session.save(function(){ 
						res.render('index', { // 로그인 정보 전달
							username: req.body.username,
							is_logined : true
						});
					});
				} else {
					return res.status(404).json({ message: '비밀번호 틀림!' });
				}
			});
		}
		else return res.status(404).json({ message: '유저 없음!' });
	});
});

app.listen(PORT, () => { console.log(`Listen : ${PORT}`); });